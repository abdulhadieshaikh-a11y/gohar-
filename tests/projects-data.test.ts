import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { projects } from "@/data/projects";
import { legacyRedirects } from "@/data/redirects";

const publicDir = path.resolve(import.meta.dirname, "..", "public");

const REQUIRED = [
  ["141-broadway-heights", "141 Broadway Heights"],
  ["gohar-complex-shopping-mall", "Gohar Complex & Shopping Mall"],
  ["gohar-gateway", "Gohar Gateway"],
  ["gohar-golf-vista", "Gohar Golf Vista"],
  ["gohar-green-corner-shopping-center", "Gohar Green Corner & Shopping Center"],
  ["gohar-rabi-center", "Gohar Rabi Center"],
  ["gohar-residencia-shopping-mall", "Gohar Residencia & Shopping Mall"],
  ["gohar-towers", "Gohar Towers"],
  ["gohar-villas", "Gohar Villas"],
  ["kn-gohar-green-city", "KN Gohar Green City"],
] as const;

describe("project data", () => {
  it("contains exactly the ten required projects with their official names and routes", () => {
    expect(projects).toHaveLength(10);
    for (const [slug, name] of REQUIRED) {
      const p = projects.find((x) => x.slug === slug);
      expect(p, slug).toBeDefined();
      expect(p!.name).toBe(name);
    }
  });

  it("has unique ids, slugs and sort orders", () => {
    expect(new Set(projects.map((p) => p.id)).size).toBe(projects.length);
    expect(new Set(projects.map((p) => p.slug)).size).toBe(projects.length);
    expect(new Set(projects.map((p) => p.order)).size).toBe(projects.length);
  });

  it.each(projects.map((p) => [p.slug, p] as const))("%s: every image file exists and is described", (_slug, p) => {
    expect(p.gallery.length).toBeGreaterThan(0);
    expect(p.gallery.some((g) => g.src === p.heroImage.src)).toBe(true);
    for (const img of [p.heroImage, ...p.gallery]) {
      expect(img.src.startsWith(`/images/projects/${p.slug}/`), img.src).toBe(true);
      expect(existsSync(path.join(publicDir, img.src)), img.src).toBe(true);
      expect(img.alt.length).toBeGreaterThan(20);
      // Official website files, or files the client supplied directly (recorded with the date).
      expect(img.source).toMatch(/^(https:\/\/gohargoc\.com\/|Supplied by the client)/);
      expect(img.width).toBeGreaterThan(0);
      expect(img.height).toBeGreaterThan(0);
    }
  });

  it.each(projects.map((p) => [p.slug, p] as const))("%s: related projects and brochure resolve", (_slug, p) => {
    for (const r of p.relatedSlugs) {
      expect(r).not.toBe(p.slug);
      expect(projects.some((x) => x.slug === r), r).toBe(true);
    }
    if (p.brochure && p.brochure.href.startsWith("/")) {
      expect(existsSync(path.join(publicDir, p.brochure.href)), p.brochure.href).toBe(true);
    }
  });

  it.each(projects.map((p) => [p.slug, p] as const))("%s: SEO text is present and sensibly sized", (_slug, p) => {
    expect(p.seo.title.length).toBeGreaterThan(15);
    expect(p.seo.title.length).toBeLessThanOrEqual(90);
    expect(p.seo.description.length).toBeGreaterThan(50);
    expect(p.seo.description.length).toBeLessThanOrEqual(170);
  });

  it("shows prices only inside a sourced, dated payment section, and no testimonials or ratings", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const withoutPayment = JSON.stringify(projects.map(({ payment: _payment, ...rest }) => rest));
    expect(withoutPayment).not.toMatch(/\bPKR\b|\bRs\.?\s?\d|\bprice[sd]? from\b|\blakh|\bcrore/i);
    expect(JSON.stringify(projects)).not.toMatch(/testimonial|★|rating/i);
    for (const p of projects.filter((x) => x.payment)) {
      expect(p.payment!.source, p.slug).toMatch(/^https:\/\/gohargoc\.com\/projects\//);
      expect(p.payment!.retrievedOn, p.slug).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(p.payment!.options.length, p.slug).toBeGreaterThan(0);
      for (const o of p.payment!.options) expect(o.total, `${p.slug} ${o.name}`).toMatch(/^PKR [\d,]+( to [\d,]+)?$/);
    }
  });

  it.each(projects.filter((p) => p.floorPlans?.length).map((p) => [p.slug, p] as const))(
    "%s: floor plan files exist and are described",
    (_slug, p) => {
      for (const img of p.floorPlans!) {
        expect(existsSync(path.join(publicDir, img.src)), img.src).toBe(true);
        expect(img.alt.length, img.src).toBeGreaterThan(20);
        expect(["floor-plan", "masterplan"]).toContain(img.kind);
      }
    },
  );

  it("has no garbled (mis-encoded) characters", () => {
    expect(JSON.stringify(projects)).not.toMatch(/Â|â€/);
  });

  it("aims for three or more images per project, and documents the shortfall otherwise", () => {
    for (const p of projects) {
      if (p.gallery.length < 3) {
        expect(p.provenance.notes.join(" "), p.slug).toMatch(/image/i);
      }
    }
  });

  it("legacy redirects point at real project routes", () => {
    for (const r of legacyRedirects) {
      if (r.destination.startsWith("/projects/")) {
        expect(projects.some((p) => `/projects/${p.slug}` === r.destination), r.destination).toBe(true);
      }
    }
  });
});
