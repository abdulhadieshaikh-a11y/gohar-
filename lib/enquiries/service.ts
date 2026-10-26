import "server-only";
import { randomBytes, randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import type { Database } from "@/lib/db";
import { enquiries } from "@/lib/db/schema";
import { sendEmail, type EmailResult } from "@/lib/email";
import { enquiryNotificationEmail } from "@/lib/email/templates";
import { findStaticProject } from "@/lib/projects";
import { absoluteUrl } from "@/lib/site";
import { ENQUIRY_TYPES, NO_PROJECT, type EnquiryData } from "@/lib/validation/enquiry";

const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I

export function generateReference(): string {
  const bytes = randomBytes(6);
  let ref = "GGC-";
  for (const b of bytes) ref += REF_ALPHABET[b % REF_ALPHABET.length];
  return ref;
}

export interface CreateEnquiryMeta {
  submissionId: string;
  sourcePath?: string;
  ipHash?: string;
  now?: Date;
}

export interface CreatedEnquiry {
  id: string;
  reference: string;
  /** True when this submissionId was already stored (double click / retry). */
  duplicate: boolean;
}

/**
 * Stores a validated enquiry. Idempotent per submissionId: a repeated request
 * returns the original reference instead of creating a second record.
 */
export async function createEnquiry(db: Database, data: EnquiryData, meta: CreateEnquiryMeta): Promise<CreatedEnquiry> {
  const existing = await db
    .select({ id: enquiries.id, reference: enquiries.reference })
    .from(enquiries)
    .where(eq(enquiries.submissionId, meta.submissionId))
    .get();
  if (existing) return { ...existing, duplicate: true };

  const now = meta.now ?? new Date();
  const id = randomUUID();

  for (let attempt = 0; attempt < 3; attempt++) {
    const reference = generateReference();
    try {
      await db.insert(enquiries).values({
        id,
        reference,
        submissionId: meta.submissionId,
        enquiryType: data.enquiryType,
        name: data.name,
        email: data.email,
        phone: data.phone,
        city: data.city ?? null,
        projectSlug: data.project === NO_PROJECT ? null : data.project,
        message: data.message,
        sourcePath: meta.sourcePath ?? null,
        consentAt: now,
        status: "new",
        emailStatus: "pending",
        ipHash: meta.ipHash ?? null,
        createdAt: now,
        updatedAt: now,
      });
      return { id, reference, duplicate: false };
    } catch (error) {
      const text = error instanceof Error ? `${error.message} ${String(error.cause ?? "")}` : String(error);
      if (/UNIQUE/i.test(text) && /submission_id/i.test(text)) {
        // A concurrent duplicate won the race; return the stored record.
        const row = await db
          .select({ id: enquiries.id, reference: enquiries.reference })
          .from(enquiries)
          .where(eq(enquiries.submissionId, meta.submissionId))
          .get();
        if (row) return { ...row, duplicate: true };
      }
      if (/UNIQUE/i.test(text) && /reference/i.test(text)) continue; // extremely unlikely collision; retry
      throw error;
    }
  }
  throw new Error("Could not allocate a unique enquiry reference");
}

/**
 * Sends the staff notification for an enquiry and records the real outcome.
 * Never throws: the enquiry is already safely stored.
 */
export async function deliverEnquiryNotification(db: Database, enquiryId: string): Promise<EmailResult> {
  const row = await db.select().from(enquiries).where(eq(enquiries.id, enquiryId)).get();
  if (!row) return { status: "failed", error: "Enquiry not found" };

  let result: EmailResult;
  try {
    const email = enquiryNotificationEmail({
      reference: row.reference,
      enquiryTypeLabel: ENQUIRY_TYPES.find((t) => t.value === row.enquiryType)?.label ?? row.enquiryType,
      name: row.name,
      email: row.email,
      phone: row.phone,
      city: row.city,
      projectName: row.projectSlug ? (findStaticProject(row.projectSlug)?.name ?? row.projectSlug) : null,
      message: row.message,
      createdAt: row.createdAt,
      adminUrl: absoluteUrl(`/admin/enquiries/${row.id}`),
    });
    result = await sendEmail(email);
  } catch (error) {
    result = { status: "failed", error: error instanceof Error ? error.message : "Unknown error" };
  }

  await db
    .update(enquiries)
    .set({
      emailStatus: result.status,
      emailError: result.status === "failed" ? result.error : result.status === "skipped" ? result.reason : null,
      emailProviderId: result.status === "sent" ? (result.providerId ?? null) : null,
      updatedAt: new Date(),
    })
    .where(eq(enquiries.id, enquiryId));

  if (result.status === "failed") {
    // Log the reference only: no customer personal data in logs.
    console.error(`[enquiry] notification failed for enquiry ${row.reference}: ${result.error}`);
  }
  return result;
}
