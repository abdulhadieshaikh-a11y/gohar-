"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import type { StoryCardData } from "@/lib/stories";
import { STORY_CATEGORY_LABELS, type StoryCategory } from "@/types/story";
import { Button } from "@/components/ui/button";
import { StoryCard } from "./story-card";

const PAGE_SIZE = 6;

interface StoryExplorerProps {
  stories: StoryCardData[];
  categories: StoryCategory[];
}

/** Category filter (kept in the URL as ?category=) + responsive grid + "Load more". */
export function StoryExplorer({ stories, categories }: StoryExplorerProps) {
  const searchParams = useSearchParams();
  const fromUrl = searchParams.get("category");
  const initial = categories.includes(fromUrl as StoryCategory) ? (fromUrl as StoryCategory) : "all";
  const [category, setCategory] = useState<StoryCategory | "all">(initial);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = category === "all" ? stories : stories.filter((s) => s.category === category);
  const shown = filtered.slice(0, visible);

  const choose = (next: StoryCategory | "all") => {
    setCategory(next);
    setVisible(PAGE_SIZE);
    const params = new URLSearchParams(window.location.search);
    if (next === "all") params.delete("category");
    else params.set("category", next);
    const search = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${search ? `?${search}` : ""}`);
  };

  const options: { value: StoryCategory | "all"; label: string; count: number }[] = [
    { value: "all", label: "All stories", count: stories.length },
    ...categories.map((c) => ({ value: c, label: STORY_CATEGORY_LABELS[c], count: stories.filter((s) => s.category === c).length })),
  ];

  return (
    <div>
      <div role="group" aria-label="Filter stories by category" className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = category === o.value;
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={active}
              onClick={() => choose(o.value)}
              className={`inline-flex items-center gap-2.5 border px-4 py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.12em] transition-colors duration-300 ${
                active ? "border-ink bg-ink text-ivory" : "border-line bg-paper text-ink hover:border-ink"
              }`}
            >
              {o.label}
              <span className={`tabular-nums ${active ? "text-brass-light" : "text-muted"}`}>{o.count}</span>
            </button>
          );
        })}
      </div>

      <p className="sr-only" aria-live="polite">
        Showing {shown.length} of {filtered.length} stories
      </p>

      {shown.length > 0 ? (
        <ul className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((s) => (
            <li key={s.slug} className="animate-fade-in">
              <StoryCard story={s} headingLevel="h3" />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-10 border border-dashed border-line p-10 text-center text-muted">No stories in this category yet.</p>
      )}

      {visible < filtered.length ? (
        <div className="mt-14 flex justify-center">
          <Button variant="secondary" size="lg" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
            Load more stories
          </Button>
        </div>
      ) : null}
    </div>
  );
}

/** Server-rendered fallback (all stories, no filter state) while search params load. */
export function StoryGridFallback({ stories }: { stories: StoryCardData[] }) {
  return (
    <ul className="mt-[4.25rem] grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
      {stories.slice(0, PAGE_SIZE).map((s) => (
        <li key={s.slug}>
          <StoryCard story={s} headingLevel="h3" />
        </li>
      ))}
    </ul>
  );
}
