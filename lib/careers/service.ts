import "server-only";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { vacancies } from "@/data/careers";
import type { Database } from "@/lib/db";
import { careerApplications, careerCvs } from "@/lib/db/schema";
import { sendEmail, type EmailResult } from "@/lib/email";
import { generateReference } from "@/lib/enquiries/service";
import { absoluteUrl } from "@/lib/site";
import type { CareerData } from "@/lib/validation/career";
import { formatPhone } from "@/lib/validation/phone";

export interface StoredCv {
  filename: string;
  mime: string;
  bytes: Uint8Array;
}

/** Saves an application and its CV. Idempotent per submissionId. */
export async function createApplication(
  db: Database,
  data: CareerData,
  cv: StoredCv,
  meta: { submissionId: string; ipHash?: string; now?: Date },
): Promise<{ id: string; reference: string; duplicate: boolean }> {
  const existing = await db
    .select({ id: careerApplications.id, reference: careerApplications.reference })
    .from(careerApplications)
    .where(eq(careerApplications.submissionId, meta.submissionId))
    .get();
  if (existing) return { ...existing, duplicate: true };

  const now = meta.now ?? new Date();
  const id = randomUUID();
  const reference = generateReference().replace("GGC-", "GGC-C");

  await db.insert(careerApplications).values({
    id,
    reference,
    submissionId: meta.submissionId,
    vacancyId: data.vacancyId ?? null,
    name: data.name,
    email: data.email,
    phone: data.phone,
    city: data.city ?? null,
    roleInterest: data.roleInterest ?? null,
    profileUrl: data.profileUrl ?? null,
    message: data.message ?? null,
    cvFilename: cv.filename,
    cvMime: cv.mime,
    cvSize: cv.bytes.byteLength,
    consentAt: now,
    status: "new",
    emailStatus: "pending",
    ipHash: meta.ipHash ?? null,
    createdAt: now,
    updatedAt: now,
  });
  try {
    await db.insert(careerCvs).values({ applicationId: id, dataBase64: Buffer.from(cv.bytes).toString("base64") });
  } catch (error) {
    // Never leave an application without its CV.
    await db.delete(careerApplications).where(eq(careerApplications.id, id));
    throw error;
  }
  return { id, reference, duplicate: false };
}

/** Notifies staff (no attachment: the CV stays in the protected admin area). */
export async function deliverApplicationNotification(db: Database, id: string): Promise<EmailResult> {
  const row = await db.select().from(careerApplications).where(eq(careerApplications.id, id)).get();
  if (!row) return { status: "failed", error: "Application not found" };
  const vacancy = row.vacancyId ? vacancies.find((v) => v.id === row.vacancyId)?.title : undefined;
  const lines = [
    `Reference: ${row.reference}`,
    `Applying for: ${vacancy ?? row.roleInterest ?? "General expression of interest"}`,
    `Name: ${row.name}`,
    `Email: ${row.email}`,
    `Phone: ${formatPhone(row.phone)}`,
    `City: ${row.city ?? "Not given"}`,
    `CV: ${row.cvFilename} (${Math.round(row.cvSize / 1024)} KB)`,
    "",
    `Review in admin: ${absoluteUrl(`/admin/applications/${row.id}`)}`,
  ];
  let result: EmailResult;
  try {
    result = await sendEmail({
      subject: `New careers application ${row.reference}`,
      text: lines.join("\n"),
      html: `<pre style="font-family:Arial,Helvetica,sans-serif;font-size:14px;white-space:pre-wrap">${lines
        .join("\n")
        .replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!)}</pre>`,
      replyTo: row.email,
    });
  } catch (error) {
    result = { status: "failed", error: error instanceof Error ? error.message : "Unknown error" };
  }
  await db
    .update(careerApplications)
    .set({
      emailStatus: result.status,
      emailError: result.status === "failed" ? result.error : result.status === "skipped" ? result.reason : null,
      updatedAt: new Date(),
    })
    .where(eq(careerApplications.id, id));
  if (result.status === "failed") console.error(`[careers] notification failed for ${row.reference}: ${result.error}`);
  return result;
}
