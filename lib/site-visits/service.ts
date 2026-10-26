import "server-only";
import { randomBytes, randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import type { Database } from "@/lib/db";
import { siteVisits, type SiteVisitStatus } from "@/lib/db/schema";
import { sendEmail, type EmailResult } from "@/lib/email";
import { siteVisitNotificationEmail } from "@/lib/email/templates";
import { findStaticProject } from "@/lib/projects";
import { absoluteUrl } from "@/lib/site";
import type { SiteVisitData } from "@/lib/validation/site-visit";
import { formatVisitDate, timeSlotLabel } from "@/lib/validation/site-visit-options";

const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I

export function generateVisitReference(): string {
  let ref = "GSV-";
  for (const b of randomBytes(6)) ref += REF_ALPHABET[b % REF_ALPHABET.length];
  return ref;
}

export interface CreateSiteVisitMeta {
  submissionId: string;
  sourcePath?: string;
  ipHash?: string;
  now?: Date;
}

export interface CreatedSiteVisit {
  id: string;
  reference: string;
  /** Always "pending": a website request is never a confirmed booking. */
  status: SiteVisitStatus;
  duplicate: boolean;
}

/**
 * Stores a validated site-visit request with status "pending". Idempotent per
 * submissionId, so a double click or retry returns the original reference.
 */
export async function createSiteVisit(db: Database, data: SiteVisitData, meta: CreateSiteVisitMeta): Promise<CreatedSiteVisit> {
  const select = { id: siteVisits.id, reference: siteVisits.reference, status: siteVisits.status };
  const existing = await db.select(select).from(siteVisits).where(eq(siteVisits.submissionId, meta.submissionId)).get();
  if (existing) return { ...existing, duplicate: true };

  const now = meta.now ?? new Date();
  const id = randomUUID();
  for (let attempt = 0; attempt < 3; attempt++) {
    const reference = generateVisitReference();
    try {
      await db.insert(siteVisits).values({
        id,
        reference,
        submissionId: meta.submissionId,
        projectSlug: data.project,
        preferredDate: data.date,
        timeSlot: data.timeSlot,
        visitors: data.visitors,
        name: data.name,
        phone: data.phone,
        email: data.email ?? null,
        message: data.message ?? null,
        sourcePath: meta.sourcePath ?? null,
        consentAt: now,
        status: "pending",
        emailStatus: "pending",
        ipHash: meta.ipHash ?? null,
        createdAt: now,
        updatedAt: now,
      });
      return { id, reference, status: "pending", duplicate: false };
    } catch (error) {
      const text = error instanceof Error ? `${error.message} ${String(error.cause ?? "")}` : String(error);
      if (/UNIQUE/i.test(text) && /submission_id/i.test(text)) {
        const row = await db.select(select).from(siteVisits).where(eq(siteVisits.submissionId, meta.submissionId)).get();
        if (row) return { ...row, duplicate: true };
      }
      if (/UNIQUE/i.test(text) && /reference/i.test(text)) continue;
      throw error;
    }
  }
  throw new Error("Could not allocate a unique site visit reference");
}

/** Sends the staff notification and records the real outcome. Never throws. */
export async function deliverSiteVisitNotification(db: Database, visitId: string): Promise<EmailResult> {
  const row = await db.select().from(siteVisits).where(eq(siteVisits.id, visitId)).get();
  if (!row) return { status: "failed", error: "Site visit not found" };

  let result: EmailResult;
  try {
    result = await sendEmail(
      siteVisitNotificationEmail({
        reference: row.reference,
        projectName: findStaticProject(row.projectSlug)?.name ?? row.projectSlug,
        preferredDate: formatVisitDate(row.preferredDate),
        timeSlot: timeSlotLabel(row.timeSlot),
        visitors: row.visitors,
        name: row.name,
        phone: row.phone,
        email: row.email,
        message: row.message,
        createdAt: row.createdAt,
        adminUrl: absoluteUrl(`/admin/site-visits/${row.id}`),
      }),
    );
  } catch (error) {
    result = { status: "failed", error: error instanceof Error ? error.message : "Unknown error" };
  }

  await db
    .update(siteVisits)
    .set({
      emailStatus: result.status,
      emailError: result.status === "failed" ? result.error : result.status === "skipped" ? result.reason : null,
      emailProviderId: result.status === "sent" ? (result.providerId ?? null) : null,
      updatedAt: new Date(),
    })
    .where(eq(siteVisits.id, visitId));

  if (result.status === "failed") console.error(`[site-visit] notification failed for ${row.reference}: ${result.error}`);
  return result;
}
