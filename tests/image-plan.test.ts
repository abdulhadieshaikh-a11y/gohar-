import { describe, expect, it } from "vitest";
import { projects } from "@/data/projects";
import { planHome } from "@/lib/image-plan";

describe("homepage image plan", () => {
  const plan = planHome(projects);
  const srcs = (section: string) => plan.record.filter((r) => r.section === section).map((r) => r.src);

  it("never shows the same image in the hero and the featured panels that follow it", () => {
    const hero = new Set(srcs("hero"));
    for (const src of srcs("signature")) expect(hero.has(src), src).toBe(false);
  });

  it("uses a different image for every hero slide and every featured panel", () => {
    expect(new Set(srcs("hero")).size).toBe(srcs("hero").length);
    expect(new Set(srcs("signature")).size).toBe(srcs("signature").length);
  });

  it("gives multi-image projects a fresh image in the collection", () => {
    for (const r of plan.record.filter((x) => x.section === "collection")) {
      const p = projects.find((x) => x.slug === r.project)!;
      const earlier = plan.record.filter((x) => (x.section === "hero" || x.section === "signature") && x.project === r.project).map((x) => x.src);
      const unusedAvailable = p.gallery.some((g) => !earlier.includes(g.src));
      if (unusedAvailable) expect(earlier, r.project).not.toContain(r.src);
    }
  });

  it("only repeats images when a project has run out of unused authentic images", () => {
    for (const src of plan.repeats) {
      const p = projects.find((x) => x.gallery.some((g) => g.src === src))!;
      const usedSrcs = new Set(plan.record.filter((r) => r.project === p.slug).map((r) => r.src));
      expect(usedSrcs.size, p.slug).toBe(p.gallery.length);
    }
  });
});
