import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { createDatabase, createNodeSqliteExecutor, type Database } from "@/lib/db";
import { careerApplications, careerCvs } from "@/lib/db/schema";
import { createApplication } from "@/lib/careers/service";
import { detectCv, safeFilename } from "@/lib/security/file-signature";
import { careerSchema, cvProblem } from "@/lib/validation/career";

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

const pdf = new TextEncoder().encode("%PDF-1.7\n1 0 obj\n<<>>\nendobj\n%%EOF");
const doc = new Uint8Array([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1, 0, 0, 0, 0]);
const docx = new Uint8Array([0x50, 0x4b, 0x03, 0x04, ...new TextEncoder().encode("....[Content_Types].xml....word/document.xml")]);
const exe = new Uint8Array([0x4d, 0x5a, 0x90, 0x00]); // "MZ" Windows executable

describe("CV file checks", () => {
  it("accepts real PDF, DOC and DOCX signatures with matching extensions", () => {
    expect(detectCv(pdf, "cv.pdf")?.mime).toBe("application/pdf");
    expect(detectCv(doc, "cv.doc")?.ext).toBe(".doc");
    expect(detectCv(docx, "My CV.DOCX")?.ext).toBe(".docx");
  });

  it("rejects renamed or mismatched files", () => {
    expect(detectCv(exe, "cv.pdf")).toBeNull();
    expect(detectCv(pdf, "cv.docx")).toBeNull();
    expect(detectCv(new Uint8Array([0x50, 0x4b, 0x03, 0x04, 1, 2, 3]), "cv.docx")).toBeNull(); // zip, not Word
  });

  it("sanitises filenames", () => {
    expect(safeFilename("../../etc/passwd<script>.pdf", ".pdf")).toBe("etcpasswdscript.pdf");
    expect(safeFilename("???.pdf", ".pdf")).toBe("cv.pdf");
  });

  it("checks size and type in the browser before upload", () => {
    expect(cvProblem(null)).toMatch(/attach/);
    expect(cvProblem({ name: "cv.png", size: 100 })).toMatch(/PDF or Word/);
    expect(cvProblem({ name: "cv.pdf", size: 5 * 1024 * 1024 })).toMatch(/4 MB/);
    expect(cvProblem({ name: "cv.pdf", size: 1000 })).toBeNull();
  });
});

describe("career form validation", () => {
  const valid = { name: "Sara Ali", email: "Sara@Example.com", phone: "0321 7654321", consent: true };
  it("accepts minimal valid details and normalises them", () => {
    const r = careerSchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.email).toBe("sara@example.com");
      expect(r.data.phone).toBe("+923217654321");
    }
  });
  it("rejects unlisted vacancies, non-https links and missing consent", () => {
    expect(careerSchema.safeParse({ ...valid, vacancyId: "made-up-job" }).success).toBe(false);
    expect(careerSchema.safeParse({ ...valid, profileUrl: "javascript:alert(1)" }).success).toBe(false);
    expect(careerSchema.safeParse({ ...valid, consent: false }).success).toBe(false);
  });
});

describe("career application storage", () => {
  it("stores the application and CV, idempotently", async () => {
    const db = await freshDb();
    const data = careerSchema.parse({ name: "Sara Ali", email: "sara@example.com", phone: "03217654321", consent: true });
    const submissionId = crypto.randomUUID();
    const a = await createApplication(db, data, { filename: "cv.pdf", mime: "application/pdf", bytes: pdf }, { submissionId });
    const b = await createApplication(db, data, { filename: "cv.pdf", mime: "application/pdf", bytes: pdf }, { submissionId });
    expect(b.duplicate).toBe(true);
    expect(b.reference).toBe(a.reference);
    expect(await db.select().from(careerApplications).all()).toHaveLength(1);
    const cv = await db.select().from(careerCvs).where(eq(careerCvs.applicationId, a.id)).get();
    expect(Buffer.from(cv!.dataBase64, "base64").equals(Buffer.from(pdf))).toBe(true);
  });
});
