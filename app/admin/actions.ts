"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { z } from "zod";
import { CONTACT_SETTINGS_KEY, PROJECTS_TAG, SETTINGS_TAG } from "@/lib/content";
import { getDb } from "@/lib/db";
import {
  adminUsers,
  APPLICATION_STATUSES,
  auditLog,
  careerApplications,
  careerCvs,
  enquiries,
  ENQUIRY_STATUSES,
  projectOverrides,
  siteSettings,
  SITE_VISIT_STATUSES,
  siteVisits,
} from "@/lib/db/schema";
import { deliverSiteVisitNotification } from "@/lib/site-visits/service";
import { isValidIsoDate } from "@/lib/validation/site-visit-options";
import { createSession, destroySession, requireAdmin } from "@/lib/auth/session";
import { deliverEnquiryNotification } from "@/lib/enquiries/service";
import { findStaticProject } from "@/lib/projects";
import { getDummyHash, verifyPassword } from "@/lib/security/password";
import { consumeRateLimit, resetRateLimit } from "@/lib/security/rate-limit";
import { clientIp, hashIdentifier } from "@/lib/security/request";

async function audit(userId: string, action: string, entity: string, entityId?: string) {
  try {
    await getDb().insert(auditLog).values({ userId, action, entity, entityId: entityId ?? null, createdAt: new Date() });
  } catch (error) {
    console.error(`[admin] audit log write failed: ${error instanceof Error ? error.message : error}`);
  }
}

/* ------------------------------------------------------------------ */
/* Authentication                                                      */
/* ------------------------------------------------------------------ */

export interface LoginState {
  error?: string;
  email?: string;
}

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().max(254).pipe(z.email()),
  password: z.string().min(1).max(200),
});

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  const email = String(formData.get("email") ?? "").slice(0, 254);
  if (!parsed.success) return { error: "Enter your email address and password.", email };

  let db;
  try {
    db = getDb();
  } catch {
    return { error: "Sign-in is unavailable: the database is not configured.", email };
  }

  const ip = hashIdentifier(clientIp(await headers()));
  const ipLimit = await consumeRateLimit(db, `login-ip:${ip}`, 20, 15 * 60 * 1000);
  const accountKey = `login:${hashIdentifier(parsed.data.email)}`;
  const accountLimit = await consumeRateLimit(db, accountKey, 5, 15 * 60 * 1000);
  if (!ipLimit.allowed || !accountLimit.allowed) {
    return { error: "Too many sign-in attempts. Please wait 15 minutes and try again.", email };
  }

  const user = await db.select().from(adminUsers).where(eq(adminUsers.email, parsed.data.email)).get();
  // Always run a hash comparison so response time doesn't reveal whether the email exists.
  const valid = await verifyPassword(parsed.data.password, user?.passwordHash ?? (await getDummyHash()));
  if (!user || !valid || user.disabled) {
    return { error: "The email or password is incorrect.", email };
  }

  await resetRateLimit(db, accountKey);
  await db.update(adminUsers).set({ lastLoginAt: new Date() }).where(eq(adminUsers.id, user.id));
  await createSession(user.id);
  await audit(user.id, "login", "admin_user", user.id);
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

/* ------------------------------------------------------------------ */
/* Enquiries                                                           */
/* ------------------------------------------------------------------ */

const enquiryUpdateSchema = z.object({
  id: z.uuid(),
  status: z.enum(ENQUIRY_STATUSES),
  notes: z.string().max(4000).optional().transform((v) => v?.trim() || null),
});

export async function updateEnquiryAction(formData: FormData) {
  const user = await requireAdmin();
  const parsed = enquiryUpdateSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
    notes: formData.get("notes") ?? undefined,
  });
  if (!parsed.success) redirect(`/admin/enquiries?error=invalid`);
  const { id, status, notes } = parsed.data;
  await getDb().update(enquiries).set({ status, notes, updatedAt: new Date() }).where(eq(enquiries.id, id));
  await audit(user.id, `enquiry.status:${status}`, "enquiry", id);
  redirect(`/admin/enquiries/${id}?saved=1`);
}

export async function retryEnquiryEmailAction(formData: FormData) {
  const user = await requireAdmin();
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) redirect("/admin/enquiries?error=invalid");
  const result = await deliverEnquiryNotification(getDb(), id.data);
  await audit(user.id, `enquiry.email_retry:${result.status}`, "enquiry", id.data);
  redirect(`/admin/enquiries/${id.data}?email=${result.status}`);
}

export async function deleteEnquiryAction(formData: FormData) {
  const user = await requireAdmin("admin");
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success || formData.get("confirm") !== "DELETE") {
    redirect(`/admin/enquiries/${String(formData.get("id") ?? "")}?error=confirm`);
  }
  await getDb().delete(enquiries).where(eq(enquiries.id, id.data));
  await audit(user.id, "enquiry.delete", "enquiry", id.data);
  redirect("/admin/enquiries?deleted=1");
}

/* ------------------------------------------------------------------ */
/* Site visits                                                         */
/* ------------------------------------------------------------------ */

const siteVisitUpdateSchema = z
  .object({
    id: z.uuid(),
    status: z.enum(SITE_VISIT_STATUSES),
    confirmedDate: z
      .string()
      .trim()
      .optional()
      .transform((v) => v || null)
      .refine((v) => v === null || isValidIsoDate(v), "Invalid date"),
    confirmedTime: z
      .string()
      .trim()
      .optional()
      .transform((v) => v || null)
      .refine((v) => v === null || /^([01]\d|2[0-3]):[0-5]\d$/.test(v), "Invalid time"),
    notes: z.string().max(4000).optional().transform((v) => v?.trim() || null),
  })
  // A visit can only be marked confirmed/rescheduled with the agreed date and time.
  .refine((v) => !["confirmed", "rescheduled"].includes(v.status) || (v.confirmedDate && v.confirmedTime), {
    message: "date-required",
    path: ["confirmedDate"],
  });

export async function updateSiteVisitAction(formData: FormData) {
  const user = await requireAdmin();
  const parsed = siteVisitUpdateSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
    confirmedDate: formData.get("confirmedDate") ?? undefined,
    confirmedTime: formData.get("confirmedTime") ?? undefined,
    notes: formData.get("notes") ?? undefined,
  });
  const rawId = String(formData.get("id") ?? "");
  if (!parsed.success) {
    const dateMissing = parsed.error.issues.some((i) => i.message === "date-required");
    redirect(`/admin/site-visits/${encodeURIComponent(rawId)}?error=${dateMissing ? "date" : "invalid"}`);
  }
  const { id, status, confirmedDate, confirmedTime, notes } = parsed.data;
  await getDb()
    .update(siteVisits)
    .set({ status, confirmedDate, confirmedTime, notes, updatedAt: new Date() })
    .where(eq(siteVisits.id, id));
  await audit(user.id, `site_visit.status:${status}`, "site_visit", id);
  redirect(`/admin/site-visits/${id}?saved=1`);
}

export async function retrySiteVisitEmailAction(formData: FormData) {
  const user = await requireAdmin();
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) redirect("/admin/site-visits?error=invalid");
  const result = await deliverSiteVisitNotification(getDb(), id.data);
  await audit(user.id, `site_visit.email_retry:${result.status}`, "site_visit", id.data);
  redirect(`/admin/site-visits/${id.data}?email=${result.status}`);
}

export async function deleteSiteVisitAction(formData: FormData) {
  const user = await requireAdmin("admin");
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success || formData.get("confirm") !== "DELETE") {
    redirect(`/admin/site-visits/${String(formData.get("id") ?? "")}?error=confirm`);
  }
  await getDb().delete(siteVisits).where(eq(siteVisits.id, id.data));
  await audit(user.id, "site_visit.delete", "site_visit", id.data);
  redirect("/admin/site-visits?deleted=1");
}

/* ------------------------------------------------------------------ */
/* Careers applications                                                */
/* ------------------------------------------------------------------ */

export async function updateApplicationAction(formData: FormData) {
  const user = await requireAdmin();
  const parsed = z
    .object({
      id: z.uuid(),
      status: z.enum(APPLICATION_STATUSES),
      notes: z.string().max(4000).optional().transform((v) => v?.trim() || null),
    })
    .safeParse({ id: formData.get("id"), status: formData.get("status"), notes: formData.get("notes") ?? undefined });
  if (!parsed.success) redirect("/admin/applications");
  const { id, status, notes } = parsed.data;
  await getDb().update(careerApplications).set({ status, notes, updatedAt: new Date() }).where(eq(careerApplications.id, id));
  await audit(user.id, `application.status:${status}`, "career_application", id);
  redirect(`/admin/applications/${id}?saved=1`);
}

export async function deleteApplicationAction(formData: FormData) {
  const user = await requireAdmin("admin");
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success || formData.get("confirm") !== "DELETE") {
    redirect(`/admin/applications/${String(formData.get("id") ?? "")}?error=confirm`);
  }
  // The CV row is removed by ON DELETE CASCADE; delete explicitly as well in case foreign keys are off.
  await getDb().delete(careerCvs).where(eq(careerCvs.applicationId, id.data));
  await getDb().delete(careerApplications).where(eq(careerApplications.id, id.data));
  await audit(user.id, "application.delete", "career_application", id.data);
  redirect("/admin/applications?deleted=1");
}

/* ------------------------------------------------------------------ */
/* Projects                                                            */
/* ------------------------------------------------------------------ */

const projectSchema = z.object({
  slug: z.string().max(100),
  summary: z.string().trim().max(400),
  overview: z.string().trim().max(5000),
  heroImageSrc: z.string().max(300),
  seoTitle: z.string().trim().max(120),
  seoDescription: z.string().trim().max(300),
});

export async function saveProjectAction(formData: FormData) {
  const user = await requireAdmin();
  const parsed = projectSchema.safeParse(Object.fromEntries(formData));
  const slug = String(formData.get("slug") ?? "");
  const project = findStaticProject(slug);
  if (!parsed.success || !project) redirect(`/admin/projects/${encodeURIComponent(slug)}?error=invalid`);

  const d = parsed.data;
  // The hero image must be one of the project's verified gallery images.
  if (d.heroImageSrc && !project.gallery.some((g) => g.src === d.heroImageSrc)) {
    redirect(`/admin/projects/${slug}?error=image`);
  }
  if (d.summary && d.summary.length < 20) redirect(`/admin/projects/${slug}?error=summary`);

  const values = {
    summary: d.summary || null,
    overview: d.overview || null,
    heroImageSrc: d.heroImageSrc && d.heroImageSrc !== project.heroImage.src ? d.heroImageSrc : null,
    seoTitle: d.seoTitle || null,
    seoDescription: d.seoDescription || null,
    updatedAt: new Date(),
    updatedBy: user.email,
  };
  await getDb()
    .insert(projectOverrides)
    .values({ projectSlug: slug, ...values })
    .onConflictDoUpdate({ target: projectOverrides.projectSlug, set: values });
  updateTag(PROJECTS_TAG);
  await audit(user.id, "project.update", "project", slug);
  redirect(`/admin/projects/${slug}?saved=1`);
}

export async function resetProjectAction(formData: FormData) {
  const user = await requireAdmin();
  const slug = String(formData.get("slug") ?? "");
  if (!findStaticProject(slug)) redirect("/admin/projects?error=invalid");
  await getDb().delete(projectOverrides).where(eq(projectOverrides.projectSlug, slug));
  updateTag(PROJECTS_TAG);
  await audit(user.id, "project.reset", "project", slug);
  redirect(`/admin/projects/${slug}?reset=1`);
}

/* ------------------------------------------------------------------ */
/* Settings (admin role only)                                          */
/* ------------------------------------------------------------------ */

const settingsSchema = z.object({
  phoneDisplay: z.string().trim().min(5).max(40),
  phoneHref: z
    .string()
    .trim()
    .regex(/^tel:\+?[0-9]{6,16}$/, "Phone link must look like tel:+9221111000061"),
  email: z.string().trim().toLowerCase().pipe(z.email()),
  address: z.string().trim().min(10).max(400),
  hours: z.string().trim().min(5).max(120),
  closed: z.string().trim().max(120),
  mapUrl: z
    .string()
    .trim()
    .url()
    .refine((u) => /^https:\/\/(maps\.google\.com|www\.google\.com\/maps|maps\.app\.goo\.gl)/.test(u), "Use a Google Maps link"),
});

export async function saveSettingsAction(formData: FormData) {
  const user = await requireAdmin("admin");
  const parsed = settingsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const field = String(parsed.error.issues[0]?.path[0] ?? "form");
    redirect(`/admin/settings?error=${encodeURIComponent(field)}`);
  }
  const { address, ...rest } = parsed.data;
  const value = JSON.stringify({
    ...rest,
    addressLines: address
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean),
  });
  const now = new Date();
  await getDb()
    .insert(siteSettings)
    .values({ key: CONTACT_SETTINGS_KEY, value, updatedAt: now, updatedBy: user.email })
    .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedAt: now, updatedBy: user.email } });
  updateTag(SETTINGS_TAG);
  await audit(user.id, "settings.contact.update", "site_settings", CONTACT_SETTINGS_KEY);
  redirect("/admin/settings?saved=1");
}

export async function resetSettingsAction() {
  const user = await requireAdmin("admin");
  await getDb().delete(siteSettings).where(eq(siteSettings.key, CONTACT_SETTINGS_KEY));
  updateTag(SETTINGS_TAG);
  await audit(user.id, "settings.contact.reset", "site_settings", CONTACT_SETTINGS_KEY);
  redirect("/admin/settings?reset=1");
}
