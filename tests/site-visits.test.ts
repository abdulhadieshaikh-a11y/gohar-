import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { createDatabase, createNodeSqliteExecutor, type Database } from "@/lib/db";
import { siteVisits } from "@/lib/db/schema";
import { createSiteVisit, deliverSiteVisitNotification, generateVisitReference } from "@/lib/site-visits/service";
import { fieldErrors, siteVisitRequestSchema, siteVisitSchema } from "@/lib/validation/site-visit";
import {
  availableSlots,
  dateProblem,
  formatVisitDate,
  pakistanNow,
  upcomingVisitDates,
} from "@/lib/validation/site-visit-options";
import { siteVisitHref } from "@/lib/site-visits/href";

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

// Thursday 22 October 2026, 10:00 in Karachi (05:00 UTC).
const NOW = new Date("2026-10-22T05:00:00Z");

const valid = {
  project: "gohar-golf-vista",
  date: "2026-10-24", // Saturday
  timeSlot: "15-17",
  visitors: 2,
  name: "Ayesha Khan",
  phone: "0300 1234567",
  email: "",
  message: "",
  consent: true,
};

describe("site visit dates and time windows", () => {
  it("reads the date and hour in Pakistan time", () => {
    expect(pakistanNow(NOW)).toEqual({ date: "2026-10-22", hour: 10 });
    // 20:30 UTC on 22 Oct is already 23 Oct in Karachi.
    expect(pakistanNow(new Date("2026-10-22T20:30:00Z")).date).toBe("2026-10-23");
  });

  it("rejects past dates, Sundays and dates too far ahead", () => {
    expect(dateProblem("2026-10-21", NOW)).toMatch(/today or a future date/);
    expect(dateProblem("2026-10-25", NOW)).toMatch(/closed on Sundays/);
    expect(dateProblem("2027-02-01", NOW)).toMatch(/within the next/);
    expect(dateProblem("2026-02-30", NOW)).toMatch(/choose a date/);
    expect(dateProblem("2026-10-22", NOW)).toBeNull();
    expect(dateProblem("2026-10-24", NOW)).toBeNull();
  });

  it("closes time windows that have already started today", () => {
    expect(availableSlots("2026-10-22", NOW)).toEqual(["11-13", "13-15", "15-17", "17-19"]);
    const afternoon = new Date("2026-10-22T09:30:00Z"); // 14:30 PKT
    expect(availableSlots("2026-10-22", afternoon)).toEqual(["15-17", "17-19"]);
    expect(availableSlots("2026-10-23", afternoon)).toHaveLength(4);
    const evening = new Date("2026-10-22T13:00:00Z"); // 18:00 PKT, no windows left
    expect(dateProblem("2026-10-22", evening)).toMatch(/visiting hours have passed/);
  });

  it("lists upcoming open days without Sundays", () => {
    const dates = upcomingVisitDates(7, NOW);
    expect(dates[0]).toBe("2026-10-22");
    expect(dates).not.toContain("2026-10-25");
    expect(dates).toHaveLength(7);
    expect(formatVisitDate("2026-10-24")).toBe("Saturday, 24 October 2026");
  });
});

describe("site visit validation", () => {
  it("accepts a complete request and normalises the phone number", () => {
    const parsed = siteVisitSchema(NOW).parse(valid);
    expect(parsed).toMatchObject({ project: "gohar-golf-vista", phone: "+923001234567", visitors: 2, email: undefined });
  });

  it("reports clear field errors", () => {
    const result = siteVisitSchema(NOW).safeParse({
      ...valid,
      project: "not-a-project",
      date: "2026-10-25",
      timeSlot: "09-11",
      visitors: 40,
      phone: "12",
      email: "nope",
      consent: false,
    });
    expect(result.success).toBe(false);
    const errors = fieldErrors(result.error!);
    expect(Object.keys(errors).sort()).toEqual(["consent", "date", "email", "phone", "project", "timeSlot", "visitors"].sort());
    expect(errors.date).toMatch(/Sundays/);
  });

  it("rejects a window that has already passed today", () => {
    const afternoon = new Date("2026-10-22T09:30:00Z"); // 14:30 PKT
    const result = siteVisitSchema(afternoon).safeParse({ ...valid, date: "2026-10-22", timeSlot: "11-13" });
    expect(result.success).toBe(false);
    expect(fieldErrors(result.error!).timeSlot).toMatch(/already passed/);
  });

  it("requires the anti-spam fields on the API and rejects a filled honeypot", () => {
    const base = { ...valid, submissionId: crypto.randomUUID(), startedAt: Date.now() };
    expect(siteVisitRequestSchema(NOW).safeParse(base).success).toBe(true);
    expect(siteVisitRequestSchema(NOW).safeParse({ ...base, website: "spam" }).success).toBe(false);
    expect(siteVisitRequestSchema(NOW).safeParse({ ...base, submissionId: "x" }).success).toBe(false);
  });

  it("builds booking links that pre-select a project", () => {
    expect(siteVisitHref()).toBe("/site-visit");
    expect(siteVisitHref({ project: "gohar-gateway" })).toBe("/site-visit?project=gohar-gateway");
    expect(siteVisitHref({ from: "some-story" })).toBe("/site-visit?from=some-story");
  });
});

describe("site visit service", () => {
  let db: Database;
  const envBackup = { ...process.env };
  beforeEach(async () => {
    db = await freshDb();
  });
  afterEach(() => {
    process.env = { ...envBackup };
  });

  it("generates readable references", () => {
    expect(generateVisitReference()).toMatch(/^GSV-[A-HJ-NP-Z2-9]{6}$/);
  });

  it("stores a request as PENDING (never confirmed) and is idempotent per submission", async () => {
    const data = siteVisitSchema(NOW).parse(valid);
    const submissionId = crypto.randomUUID();
    const created = await createSiteVisit(db, data, { submissionId, sourcePath: "/site-visit?project=gohar-golf-vista" });
    expect(created).toMatchObject({ status: "pending", duplicate: false });

    const row = await db.select().from(siteVisits).where(eq(siteVisits.id, created.id)).get();
    expect(row).toMatchObject({
      projectSlug: "gohar-golf-vista",
      preferredDate: "2026-10-24",
      timeSlot: "15-17",
      visitors: 2,
      phone: "+923001234567",
      email: null,
      status: "pending",
      confirmedDate: null,
      emailStatus: "pending",
    });

    const again = await createSiteVisit(db, data, { submissionId });
    expect(again).toMatchObject({ id: created.id, reference: created.reference, duplicate: true });
    expect((await db.select().from(siteVisits).all()).length).toBe(1);
  });

  it("records a skipped notification truthfully when email is not configured", async () => {
    process.env.EMAIL_PROVIDER = "none";
    const created = await createSiteVisit(db, siteVisitSchema(NOW).parse(valid), { submissionId: crypto.randomUUID() });
    const result = await deliverSiteVisitNotification(db, created.id);
    expect(result.status).toBe("skipped");
    const row = await db.select().from(siteVisits).where(eq(siteVisits.id, created.id)).get();
    expect(row!.emailStatus).toBe("skipped");
  });
});
