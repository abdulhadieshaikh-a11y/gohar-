import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Database schema (SQLite / libSQL dialect).
 * Local development uses a SQLite file; production should use a persistent
 * libSQL database (e.g. Turso) with the same schema. See README → Database.
 */

export const ENQUIRY_STATUSES = ["new", "contacted", "in_progress", "closed", "spam"] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export const EMAIL_STATUSES = ["pending", "sent", "failed", "skipped"] as const;
export type EmailStatus = (typeof EMAIL_STATUSES)[number];

export const ADMIN_ROLES = ["admin", "editor"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export const enquiries = sqliteTable(
  "enquiries",
  {
    id: text("id").primaryKey(),
    reference: text("reference").notNull().unique(),
    /** Client-generated id; makes double submissions idempotent. */
    submissionId: text("submission_id").notNull().unique(),
    enquiryType: text("enquiry_type").notNull(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    city: text("city"),
    projectSlug: text("project_slug"),
    message: text("message").notNull(),
    sourcePath: text("source_path"),
    consentAt: integer("consent_at", { mode: "timestamp_ms" }).notNull(),
    status: text("status", { enum: ENQUIRY_STATUSES }).notNull().default("new"),
    notes: text("notes"),
    emailStatus: text("email_status", { enum: EMAIL_STATUSES }).notNull().default("pending"),
    emailError: text("email_error"),
    emailProviderId: text("email_provider_id"),
    /** Salted hash of the sender IP (never the raw IP). Used for abuse investigation only. */
    ipHash: text("ip_hash"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [
    index("enquiries_created_idx").on(t.createdAt),
    index("enquiries_status_idx").on(t.status),
    index("enquiries_project_idx").on(t.projectSlug),
  ],
);

export const SITE_VISIT_STATUSES = ["pending", "confirmed", "rescheduled", "cancelled", "completed"] as const;
export type SiteVisitStatus = (typeof SITE_VISIT_STATUSES)[number];

/**
 * Site visit requests. A visitor submits a *preferred* date and time window;
 * nothing is confirmed until staff speak to them and set status "confirmed"
 * (with the agreed date/time) in the admin dashboard.
 */
export const siteVisits = sqliteTable(
  "site_visits",
  {
    id: text("id").primaryKey(),
    reference: text("reference").notNull().unique(),
    submissionId: text("submission_id").notNull().unique(),
    projectSlug: text("project_slug").notNull(),
    /** Preferred date as YYYY-MM-DD (Pakistan time). */
    preferredDate: text("preferred_date").notNull(),
    /** Preferred time window id, see lib/validation/site-visit.ts. */
    timeSlot: text("time_slot").notNull(),
    visitors: integer("visitors").notNull().default(1),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    message: text("message"),
    sourcePath: text("source_path"),
    consentAt: integer("consent_at", { mode: "timestamp_ms" }).notNull(),
    status: text("status", { enum: SITE_VISIT_STATUSES }).notNull().default("pending"),
    /** Agreed date/time, set by staff when confirming or rescheduling. */
    confirmedDate: text("confirmed_date"),
    confirmedTime: text("confirmed_time"),
    notes: text("notes"),
    emailStatus: text("email_status", { enum: EMAIL_STATUSES }).notNull().default("pending"),
    emailError: text("email_error"),
    emailProviderId: text("email_provider_id"),
    ipHash: text("ip_hash"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [
    index("site_visits_created_idx").on(t.createdAt),
    index("site_visits_status_idx").on(t.status),
    index("site_visits_date_idx").on(t.preferredDate),
  ],
);

export const APPLICATION_STATUSES = ["new", "reviewed", "shortlisted", "archived"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

/** Expressions of interest / job applications from the Careers page. */
export const careerApplications = sqliteTable(
  "career_applications",
  {
    id: text("id").primaryKey(),
    reference: text("reference").notNull().unique(),
    submissionId: text("submission_id").notNull().unique(),
    vacancyId: text("vacancy_id"),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    city: text("city"),
    roleInterest: text("role_interest"),
    profileUrl: text("profile_url"),
    message: text("message"),
    cvFilename: text("cv_filename").notNull(),
    cvMime: text("cv_mime").notNull(),
    cvSize: integer("cv_size").notNull(),
    consentAt: integer("consent_at", { mode: "timestamp_ms" }).notNull(),
    status: text("status", { enum: APPLICATION_STATUSES }).notNull().default("new"),
    notes: text("notes"),
    emailStatus: text("email_status", { enum: EMAIL_STATUSES }).notNull().default("pending"),
    emailError: text("email_error"),
    ipHash: text("ip_hash"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [index("applications_created_idx").on(t.createdAt), index("applications_status_idx").on(t.status)],
);

/** CV files, kept apart so listing applications never loads file data. Stored base64 (driver-neutral). */
export const careerCvs = sqliteTable("career_cvs", {
  applicationId: text("application_id")
    .primaryKey()
    .references(() => careerApplications.id, { onDelete: "cascade" }),
  dataBase64: text("data_base64").notNull(),
});

export const adminUsers = sqliteTable("admin_users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role", { enum: ADMIN_ROLES }).notNull().default("editor"),
  passwordHash: text("password_hash").notNull(),
  disabled: integer("disabled", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  lastLoginAt: integer("last_login_at", { mode: "timestamp_ms" }),
});

export const adminSessions = sqliteTable(
  "admin_sessions",
  {
    /** SHA-256 of the session token. The raw token only lives in the user's cookie. */
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => adminUsers.id, { onDelete: "cascade" }),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [index("admin_sessions_user_idx").on(t.userId)],
);

export const rateLimits = sqliteTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  windowStart: integer("window_start").notNull(),
});

/** Admin edits layered over the verified defaults in data/projects.ts. */
export const projectOverrides = sqliteTable("project_overrides", {
  projectSlug: text("project_slug").primaryKey(),
  summary: text("summary"),
  overview: text("overview"),
  heroImageSrc: text("hero_image_src"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  updatedBy: text("updated_by"),
});

export const siteSettings = sqliteTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  updatedBy: text("updated_by"),
});

export const auditLog = sqliteTable(
  "audit_log",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id"),
    action: text("action").notNull(),
    entity: text("entity").notNull(),
    entityId: text("entity_id"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [index("audit_created_idx").on(t.createdAt)],
);
