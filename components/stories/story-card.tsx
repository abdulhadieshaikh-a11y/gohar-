import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { StoryCardData } from "@/lib/stories";
import { STORY_CATEGORY_LABELS } from "@/types/story";

interface StoryCardProps {
  story: StoryCardData;
  variant?: "default" | "featured";
  headingLevel?: "h2" | "h3";
  sizes?: string;
  /** Loads the image eagerly (above the fold). */
  priority?: boolean;
}

function Meta({ story, tone = "light" }: { story: StoryCardData; tone?: "light" | "dark" }) {
  return (
    <p className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.72rem] font-medium uppercase tracking-[0.12em] ${tone === "dark" ? "text-stone" : "text-muted"}`}>
      <span className={tone === "dark" ? "text-gohar" : "text-gohar-deep"}>{STORY_CATEGORY_LABELS[story.category]}</span>
      <span aria-hidden="true" className="size-1 rounded-full bg-current opacity-50" />
      <time dateTime={story.publishedAt}>{story.dateLabel}</time>
      <span aria-hidden="true" className="size-1 rounded-full bg-current opacity-50" />
      <span>{story.minutes} min read</span>
    </p>
  );
}

/** Editorial article card. The whole card is clickable through the title link. */
export function StoryCard({ story, variant = "default", headingLevel: Heading = "h3", sizes, priority }: StoryCardProps) {
  if (variant === "featured") {
    return (
      <article className="group relative grid overflow-hidden rounded-[2rem] bg-ink text-ivory lg:grid-cols-12" data-cursor="Read">
        <div className="zoom-media relative aspect-[16/10] overflow-hidden lg:col-span-7 lg:aspect-auto lg:min-h-[32rem]">
          <Image quality={85}
            src={story.cover.src}
            alt={story.cover.alt}
            fill
            sizes={sizes ?? "(min-width: 1024px) 58vw, 100vw"}
            className="object-cover"
            preload={priority}
          />
        </div>
        <div className="flex flex-col justify-between gap-10 p-7 sm:p-10 lg:col-span-5 lg:p-12">
          <div>
            <p className="eyebrow flex items-center gap-3 text-gohar">
              <span className="block h-px w-10 bg-gohar" aria-hidden="true" />
              Featured story
            </p>
            <Heading className="mt-6 text-[2.1rem] leading-[1.06] sm:text-[2.6rem] lg:text-[2.9rem]">
              <Link href={`/gohar-stories/${story.slug}`} className="after:absolute after:inset-0 after:content-['']">
                {story.title}
              </Link>
            </Heading>
            <p className="mt-5 leading-relaxed text-stone">{story.excerpt}</p>
          </div>
          <div className="flex flex-col gap-6">
            <Meta story={story} tone="dark" />
            <span
              aria-hidden="true"
              className="inline-flex items-center gap-3 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-brass-light transition-colors group-hover:text-ivory"
            >
              Read the story
              <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex h-full flex-col" data-cursor="Read">
      <div className="zoom-media relative aspect-[3/2] overflow-hidden rounded-[1.25rem] bg-ink-3">
        <Image quality={85}
          src={story.cover.src}
          alt={story.cover.alt}
          fill
          sizes={sizes ?? "(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw"}
          className="object-cover"
          preload={priority}
        />
        <span className="absolute left-4 top-4 rounded-full bg-ivory/95 px-3 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-ink">
          {STORY_CATEGORY_LABELS[story.category]}
        </span>
      </div>
      <div className="flex flex-1 flex-col border-b border-line pb-6 pt-5">
        <p className="flex flex-wrap items-center gap-x-3 text-[0.72rem] font-medium uppercase tracking-[0.12em] text-muted">
          <time dateTime={story.publishedAt}>{story.dateLabel}</time>
          <span aria-hidden="true" className="size-1 rounded-full bg-current opacity-50" />
          <span>{story.minutes} min read</span>
        </p>
        <Heading className="mt-3 text-[1.9rem] leading-[1.08] transition-colors group-hover:text-gohar-deep">
          <Link href={`/gohar-stories/${story.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {story.title}
          </Link>
        </Heading>
        <p className="mt-3 line-clamp-3 text-[0.95rem] leading-relaxed text-muted">{story.excerpt}</p>
        <span
          aria-hidden="true"
          className="mt-auto inline-flex items-center gap-2 pt-5 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-gohar-deep transition-colors group-hover:text-ink"
        >
          Read story
          <span className="h-px w-8 bg-current transition-all duration-500 group-hover:w-14" />
        </span>
      </div>
    </article>
  );
}
