import { describe, expect, it } from "vitest";
import { enquiryRequestSchema, enquirySchema, fieldErrors } from "@/lib/validation/enquiry";

const valid = {
  enquiryType: "sales",
  name: "Ayesha Khan",
  email: "  Ayesha@Example.COM ",
  phone: "0300 1234567",
  city: "Karachi",
  project: "gohar-towers",
  message: "I would like to know more about the apartments.",
  consent: true,
};

describe("enquirySchema", () => {
  it("accepts a valid enquiry and normalises email and phone", () => {
    const result = enquirySchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("ayesha@example.com");
      expect(result.data.phone).toBe("+923001234567");
    }
  });

  it("allows no specific project and no city", () => {
    const result = enquirySchema.safeParse({ ...valid, project: "none", city: "" });
    expect(result.success).toBe(true);
  });

  it("rejects a project that is not in the portfolio", () => {
    const result = enquirySchema.safeParse({ ...valid, project: "some-other-developer-tower" });
    expect(result.success).toBe(false);
    if (!result.success) expect(fieldErrors(result.error).project).toBeDefined();
  });

  it("requires consent", () => {
    const result = enquirySchema.safeParse({ ...valid, consent: false });
    expect(result.success).toBe(false);
    if (!result.success) expect(fieldErrors(result.error).consent).toMatch(/confirm/);
  });

  it("reports one clear message per invalid field", () => {
    const result = enquirySchema.safeParse({ ...valid, name: "A", email: "bad", phone: "1", message: "hi" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = fieldErrors(result.error);
      expect(Object.keys(errors).sort()).toEqual(["email", "message", "name", "phone"]);
    }
  });

  it("rejects unknown enquiry types and cities", () => {
    expect(enquirySchema.safeParse({ ...valid, enquiryType: "complaint-hack" }).success).toBe(false);
    expect(enquirySchema.safeParse({ ...valid, city: "Atlantis" }).success).toBe(false);
  });

  it("rejects markup characters in names", () => {
    expect(enquirySchema.safeParse({ ...valid, name: "<script>alert(1)</script>" }).success).toBe(false);
  });
});

describe("enquiryRequestSchema", () => {
  const request = { ...valid, submissionId: "8b1c1f7e-2d4a-4c3b-9f0e-1a2b3c4d5e6f", startedAt: Date.now() };

  it("accepts the API envelope", () => {
    expect(enquiryRequestSchema.safeParse(request).success).toBe(true);
  });

  it("rejects a filled honeypot", () => {
    expect(enquiryRequestSchema.safeParse({ ...request, website: "spam" }).success).toBe(false);
  });

  it("rejects a malformed submission id", () => {
    expect(enquiryRequestSchema.safeParse({ ...request, submissionId: "123" }).success).toBe(false);
  });
});
