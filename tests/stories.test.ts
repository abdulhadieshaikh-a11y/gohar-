import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { stories } from "@/data/stories";
import { projects } from "@/data/projects";
import { legacyRedirects } from "@/data/redirects";
import {
  allStories,
  findStory,
  formatStoryDate,
  plainText,
  readingMinutes,
  relatedStories,
  storiesForProject,
  storyOutline,
} from "@/lib/stories";

const publicDir = path.resolve(import.meta.dirname, "..", "public");
const projectSlugs = new Set(projects.map((p) => p.slug));

describe("Gohar Stories data", () => {
  it("contains the migrated official articles, including the client's buying article and the Gohar Gateway story", () => {
    expect(stories.length).toBeGreaterThanOrEqual(4);
    const tips = findStory("5-essential-tips-before-buying-your-dream-property");
    expect(tips?.title).toBe("5 Essential Tips Before Buying Your Dream Property");
    expect(tips?.category).toBe("buying");
    expect(formatStoryDate(tips!.publishedAt)).toBe("16 June 2026");
    expect(storyOutline(tips!).map((o) => o.label)).toEqual([
      "1. Define Your Budget",
      "2. The Importance of Location",
      "3. Verify Legal Documents",
      "4. Consider Future Development",
      "5. Choose a Trustworthy Partner",
      "Conclusion",
    ]);
    expect(storiesForProject("gohar-gateway").length).toBeGreaterThanOrEqual(2);
  });

  it("has unique slugs and valid ISO dates", () => {
    expect(new Set(stories.map((s) => s.slug)).size).toBe(stories.length);
    for (const s of stories) {
      expect(s.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(Number.isNaN(new Date(s.publishedAt).getTime()), s.slug).toBe(false);
    }
  });

  it("is sorted newest first", () => {
    const dates = allStories.map((s) => s.publishedAt);
    expect([...dates].sort().reverse()).toEqual(dates);
  });

  it.each(stories.map((s) => [s.slug, s] as const))("%s: images exist, have alt text and credits", (_slug, s) => {
    const images = [s.cover, ...s.blocks.flatMap((b) => (b.type === "image" ? [b.image] : []))];
    for (const img of images) {
      expect(existsSync(path.join(publicDir, img.src)), img.src).toBe(true);
      expect(img.alt.length, img.src).toBeGreaterThan(20);
      expect(img.credit, img.src).toBeTruthy();
    }
  });

  it.each(stories.map((s) => [s.slug, s] as const))("%s: links and related projects point to real pages", (_slug, s) => {
    for (const slug of s.relatedProjects) expect(projectSlugs.has(slug), slug).toBe(true);
    const text = JSON.stringify(s.blocks);
    for (const [, href] of text.matchAll(/\]\((\/[^)]*)\)/g)) {
      const project = /^\/projects\/(.+)$/.exec(href!)?.[1];
      if (project) expect(projectSlugs.has(project), href).toBe(true);
      else expect(["/about", "/contact", "/projects", "/gohar-stories"]).toContain(href);
    }
  });

  it("never contains raw HTML or scripts from the source site", () => {
    // Everything that is rendered publicly (internal migration notes excluded).
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const text = JSON.stringify(stories.map(({ source: _source, ...publicPart }) => publicPart));
    expect(text).not.toMatch(/<script|<\/?[a-z][^>]*>|javascript:|ohhhhhmoney/i);
  });

  it("calculates reading time and related stories", () => {
    for (const s of allStories) expect(readingMinutes(s)).toBeGreaterThanOrEqual(1);
    const gateway = findStory("gohar-gateway-a-new-benchmark-for-luxury-living-in-hyderabad")!;
    const related = relatedStories(gateway);
    expect(related.map((r) => r.slug)).not.toContain(gateway.slug);
    // Shares the Gohar Gateway project, so the REIT story ranks first.
    expect(related[0]!.slug).toBe("a-new-era-for-hyderabad-pakistans-first-shariah-compliant-green-hotel-reit");
  });

  it("strips inline markup for plain text", () => {
    expect(plainText("Visit **[Gohar Gateway](/projects/gohar-gateway)** today")).toBe("Visit Gohar Gateway today");
  });

  it("redirects the old WordPress post URLs to the new article pages", () => {
    for (const s of stories) {
      expect(legacyRedirects).toContainEqual({ source: `/${s.slug}`, destination: `/gohar-stories/${s.slug}` });
    }
  });
});
