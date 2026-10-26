/**
 * Gohar Stories content model.
 *
 * Articles are migrated from the official website. Text keeps the published
 * wording; `source` records where and when it was published. Inline text may
 * use two tiny markups: **bold** and [link text](/internal/path).
 */

export type StoryCategory = "buying" | "news-updates";

export const STORY_CATEGORY_LABELS: Record<StoryCategory, string> = {
  buying: "Buying",
  "news-updates": "News & Updates",
};

export interface StoryImage {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
  /** e.g. "Image: Gohar Group of Companies" */
  credit: string;
}

export type StoryBlock =
  | { type: "p"; text: string; lead?: boolean }
  | { type: "h2"; text: string; id: string }
  | { type: "h3"; text: string }
  | { type: "list"; items: string[] }
  | { type: "tip"; number: number; title: string; text: string; id: string }
  | { type: "image"; image: StoryImage }
  | { type: "contact"; title: string; lines: string[] };

export interface Story {
  slug: string;
  title: string;
  category: StoryCategory;
  /** Original publication date (ISO 8601, from the source). */
  publishedAt: string;
  excerpt: string;
  cover: StoryImage;
  blocks: StoryBlock[];
  /** Projects this article is about or links to (slugs). */
  relatedProjects: string[];
  /** Shown above the article when it needs context (e.g. older announcements). */
  contextNote?: string;
  tags?: string[];
  source: {
    url: string;
    publisher: string;
    retrievedOn: string;
    /** Migration notes for the content owner (not shown publicly). */
    notes?: string[];
  };
}
