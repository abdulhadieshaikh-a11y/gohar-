import { describe, expect, it } from "vitest";
import { defaultContact } from "@/data/company";
import { applyOverride, parseContactSettings } from "@/lib/content";
import { findStaticProject } from "@/lib/projects";

const base = findStaticProject("gohar-residencia-shopping-mall")!;
const row = (patch: Record<string, unknown>) => ({
  projectSlug: base.slug,
  summary: null,
  overview: null,
  heroImageSrc: null,
  seoTitle: null,
  seoDescription: null,
  updatedAt: new Date(),
  updatedBy: "test",
  ...patch,
});

describe("applyOverride", () => {
  it("returns verified defaults when there is no override", () => {
    expect(applyOverride(base, undefined)).toBe(base);
  });

  it("applies text edits and splits paragraphs on blank lines", () => {
    const p = applyOverride(base, row({ summary: "A new summary for the project page.", overview: "One.\n\nTwo." }));
    expect(p.summary).toBe("A new summary for the project page.");
    expect(p.overview).toEqual(["One.", "Two."]);
    expect(p.facts).toEqual(base.facts); // verified facts are never overridden
  });

  it("only accepts a hero image from the project's verified gallery", () => {
    const ok = applyOverride(base, row({ heroImageSrc: base.gallery[2]!.src }));
    expect(ok.heroImage.src).toBe(base.gallery[2]!.src);
    const bad = applyOverride(base, row({ heroImageSrc: "/images/someone-elses-building.jpg" }));
    expect(bad.heroImage.src).toBe(base.heroImage.src);
  });
});

describe("parseContactSettings", () => {
  it("falls back to verified defaults", () => {
    expect(parseContactSettings(undefined)).toEqual(defaultContact);
    expect(parseContactSettings("not json")).toEqual(defaultContact);
  });

  it("uses the confirmed email by default", () => {
    expect(defaultContact.email).toBe("info@gohargoc.com");
  });

  it("merges saved values and ignores blanks", () => {
    const s = parseContactSettings(JSON.stringify({ hours: "Mon–Sat, 10–7", email: "" }));
    expect(s.hours).toBe("Mon–Sat, 10–7");
    expect(s.email).toBe(defaultContact.email);
  });
});
