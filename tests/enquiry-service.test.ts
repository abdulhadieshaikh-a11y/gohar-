import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import { createDatabase, createNodeSqliteExecutor, type Database } from "@/lib/db";
import { enquiries } from "@/lib/db/schema";
import { createEnquiry, deliverEnquiryNotification, generateReference } from "@/lib/enquiries/service";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { enquirySchema } from "@/lib/validation/enquiry";

/** Fresh in-memory SQLite database with all migrations applied. */
async function freshDb(): Promise<Database> {
  const exec = createNodeSqliteExecutor(":memory:");
  const dir = path.resolve(import.meta.dirname, "..", "drizzle");
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
    for (const stmt of readFileSync(path.join(dir, file), "utf8").split("--> statement-breakpoint")) {
      if (stmt.trim()) await exec(stmt, [], "run");
    }
  }
  return createDatabase(exec);
}

const data = enquirySchema.parse({
  enquiryType: "site-visit",
  name: "Bilal Ahmed",
  email: "bilal@example.com",
  phone: "03211234567",
  project: "gohar-villas",
  message: "Could I visit Phase 3 next week?",
  consent: true,
});

const envBackup = { ...process.env };

describe("enquiry service", () => {
  let db: Database;
  beforeEach(async () => {
    db = await freshDb();
  });
  afterEach(() => {
    process.env = { ...envBackup };
    vi.unstubAllGlobals();
  });

  it("generates readable references", () => {
    expect(generateReference()).toMatch(/^GGC-[A-HJ-NP-Z2-9]{6}$/);
  });

  it("stores an enquiry with status 'new' and email 'pending'", async () => {
    const created = await createEnquiry(db, data, { submissionId: crypto.randomUUID(), sourcePath: "/projects/gohar-villas" });
    expect(created.duplicate).toBe(false);
    const row = await db.select().from(enquiries).where(eq(enquiries.id, created.id)).get();
    expect(row).toMatchObject({
      reference: created.reference,
      projectSlug: "gohar-villas",
      phone: "+923211234567",
      status: "new",
      emailStatus: "pending",
    });
    expect(row!.createdAt).toBeInstanceOf(Date);
  });

  it("is idempotent for the same submission id", async () => {
    const submissionId = crypto.randomUUID();
    const a = await createEnquiry(db, data, { submissionId });
    const b = await createEnquiry(db, data, { submissionId });
    expect(b.duplicate).toBe(true);
    expect(b.reference).toBe(a.reference);
    expect(await db.select().from(enquiries).all()).toHaveLength(1);
  });

  it("records 'skipped' (not 'sent') when no email provider is configured", async () => {
    process.env.EMAIL_PROVIDER = "none";
    const { id } = await createEnquiry(db, data, { submissionId: crypto.randomUUID() });
    const result = await deliverEnquiryNotification(db, id);
    expect(result.status).toBe("skipped");
    const row = await db.select().from(enquiries).where(eq(enquiries.id, id)).get();
    expect(row!.emailStatus).toBe("skipped");
  });

  it("records 'failed' and keeps the enquiry when the provider rejects the email", async () => {
    Object.assign(process.env, {
      EMAIL_PROVIDER: "resend",
      RESEND_API_KEY: "test-key",
      EMAIL_FROM: "Website <web@example.com>",
      ENQUIRY_NOTIFY_TO: "sales@example.com",
    });
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ message: "Invalid API key" }), { status: 401 })));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { id } = await createEnquiry(db, data, { submissionId: crypto.randomUUID() });
    const result = await deliverEnquiryNotification(db, id);
    expect(result.status).toBe("failed");
    const row = await db.select().from(enquiries).where(eq(enquiries.id, id)).get();
    expect(row).toMatchObject({ emailStatus: "failed" });
    expect(row!.emailError).toMatch(/401/);
  });

  it("records 'sent' only when the provider confirms", async () => {
    Object.assign(process.env, {
      EMAIL_PROVIDER: "resend",
      RESEND_API_KEY: "test-key",
      EMAIL_FROM: "Website <web@example.com>",
      ENQUIRY_NOTIFY_TO: "sales@example.com",
    });
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ id: "email_123" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const { id } = await createEnquiry(db, data, { submissionId: crypto.randomUUID() });
    const result = await deliverEnquiryNotification(db, id);
    expect(result).toEqual({ status: "sent", providerId: "email_123" });
    const body = JSON.parse((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body as string);
    expect(body.to).toEqual(["sales@example.com"]);
    expect(body.reply_to).toBe("bilal@example.com");
    expect(body.subject).toContain("Gohar Villas");
  });

  it("reports misconfiguration as a failure instead of pretending to send", async () => {
    Object.assign(process.env, { EMAIL_PROVIDER: "smtp" });
    delete process.env.SMTP_HOST;
    const { id } = await createEnquiry(db, data, { submissionId: crypto.randomUUID() });
    const result = await deliverEnquiryNotification(db, id);
    expect(result.status).toBe("failed");
  });
});

describe("rate limiter", () => {
  it("allows up to the limit within a window, then blocks, then resets", async () => {
    const db = await freshDb();
    const t0 = 1_000_000;
    for (let i = 0; i < 3; i++) expect((await consumeRateLimit(db, "k", 3, 60_000, t0 + i)).allowed).toBe(true);
    const blocked = await consumeRateLimit(db, "k", 3, 60_000, t0 + 10);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    expect((await consumeRateLimit(db, "k", 3, 60_000, t0 + 60_001)).allowed).toBe(true);
    expect((await consumeRateLimit(db, "other", 3, 60_000, t0)).allowed).toBe(true);
  });
});
