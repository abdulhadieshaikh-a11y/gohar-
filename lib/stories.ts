import { stories } from "@/data/stories";
import type { Story, StoryBlock, StoryCategory } from "@/types/story";

/** Pure helpers over the Gohar Stories data. Safe on client and server. */

export const allStories: readonly Story[] = [...stories].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

export const storySlugs = allStories.map((s) => s.slug);

export function findStory(slug: string): Story | undefined {
  return allStories.find((s) => s.slug === slug);
}

/** Categories that actually have articles, in display order. */
export function storyCategories(): StoryCategory[] {
  const order: StoryCategory[] = ["buying", "news-updates"];
  return order.filter((c) => allStories.some((s) => s.category === c));
}

/** Strips the inline markup used in story text (**bold**, [text](href)). */
export function plainText(text: string): string {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*/g, "");
}

function blockText(b: StoryBlock): string {
  switch (b.type) {
    case "p":
    case "h2":
    case "h3":
      return b.text;
    case "tip":
      return `${b.title} ${b.text}`;
    case "list":
      return b.items.join(" ");
    case "contact":
      return b.lines.join(" ");
    default:
      return "";
  }
}

export function wordCount(story: Story): number {
  return story.blocks.map((b) => plainText(blockText(b))).join(" ").split(/\s+/).filter(Boolean).length;
}

/** Reading time at 200 words per minute, at least one minute. */
export function readingMinutes(story: Story): number {
  return Math.max(1, Math.round(wordCount(story) / 200));
}

/** Formats an ISO date as "16 June 2026" (Pakistan time). */
export function formatStoryDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Karachi" }).format(
    new Date(iso),
  );
}

/** Other stories, preferring ones that share a project, then a category. */
export function relatedStories(story: Story, limit = 3): Story[] {
  const score = (s: Story) =>
    (s.relatedProjects.some((p) => story.relatedProjects.includes(p)) ? 2 : 0) + (s.category === story.category ? 1 : 0);
  return allStories
    .filter((s) => s.slug !== story.slug)
    .map((s) => ({ s, score: score(s) }))
    .sort((a, b) => b.score - a.score || b.s.publishedAt.localeCompare(a.s.publishedAt))
    .slice(0, limit)
    .map((x) => x.s);
}

export function storiesForProject(projectSlug: string): Story[] {
  return allStories.filter((s) => s.relatedProjects.includes(projectSlug));
}

/** Headings used for the table of contents. */
export function storyOutline(story: Story): { id: string; label: string }[] {
  return story.blocks.flatMap((b) =>
    b.type === "h2" ? [{ id: b.id, label: b.text }] : b.type === "tip" ? [{ id: b.id, label: `${b.number}. ${b.title}` }] : [],
  );
}

/** Card-sized data for client components (no article body). */
export interface StoryCardData {
  slug: string;
  title: string;
  category: StoryCategory;
  publishedAt: string;
  dateLabel: string;
  excerpt: string;
  minutes: number;
  cover: Story["cover"];
}

export function toStoryCard(story: Story): StoryCardData {
  return {
    slug: story.slug,
    title: story.title,
    category: story.category,
    publishedAt: story.publishedAt,
    dateLabel: formatStoryDate(story.publishedAt),
    excerpt: story.excerpt,
    minutes: readingMinutes(story),
    cover: story.cover,
  };
}
