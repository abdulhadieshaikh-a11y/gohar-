import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowUpRight } from "lucide-react";
import { allStories, storyCategories, toStoryCard } from "@/lib/stories";
import { pageMetadata } from "@/lib/metadata";
import { absoluteUrl } from "@/lib/site";
import { STORY_CATEGORY_LABELS } from "@/types/story";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { buttonClasses } from "@/components/ui/button";
import { SectionIntro } from "@/components/ui/section-intro";
import { JsonLd } from "@/components/seo/json-ld";
import { SiteVisitCta } from "@/components/site-visit/site-visit-cta";
import { StoryCard } from "@/components/stories/story-card";
import { SplitWords } from "@/components/ui/split-words";
import { StoryExplorer, StoryGridFallback } from "@/components/stories/story-explorer";

export const metadata: Metadata = pageMetadata({
  title: "Gohar Stories: News, Project Stories & Buying Guides | Gohar Group",
  absoluteTitle: true,
  description:
    "News and updates from Gohar Group of Companies, project stories and practical buying guides for property in Karachi and Hyderabad.",
  path: "/gohar-stories",
  image: {
    url: "/images/stories/meezan-bank-mou.jpg",
    width: 1500,
    height: 844,
    alt: "Gohar Group and Meezan Bank representatives at the MoU signing",
  },
});

export default function GoharStoriesPage() {
  const cards = allStories.map(toStoryCard);
  const [featured, ...rest] = cards;
  const categories = storyCategories();
  const latestTwo = rest.slice(0, 2);

  return (
    <>
      {/* Editorial masthead */}
      <section className="relative overflow-hidden border-b border-line bg-ivory pb-14 pt-36 lg:pb-20 lg:pt-48">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-8 top-24 select-none font-display text-[16rem] leading-none text-ivory-2 lg:text-[24rem]"
        >
          S
        </span>
        <div className="container-site relative">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Gohar Stories", href: "/gohar-stories" },
            ]}
          />
          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <p className="eyebrow flex items-center gap-3 text-brass-deep">
                <span className="rule-brass" aria-hidden="true" />
                The Gohar journal
              </p>
              <h1 className="display-2xl hero-words mt-6">
                <SplitWords text="Gohar" /> <SplitWords text="Stories" em start={1} className="text-brass-deep" />
              </h1>
            </div>
            <div className="lg:col-span-4">
              <p className="text-[1.08rem] leading-relaxed text-muted">
                Announcements from the group, the stories behind our developments, and practical guidance for buying property
                with confidence.
              </p>
              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[0.72rem] font-semibold uppercase tracking-[0.12em]">
                {categories.map((c) => (
                  <li key={c}>
                    <Link href={`/gohar-stories?category=${c}#all-stories`} className="text-ink hover:text-brass-deep">
                      {STORY_CATEGORY_LABELS[c]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Featured + latest */}
      {featured ? (
        <section aria-label="Featured story" className="container-site py-16 lg:py-20">
          <StoryCard story={featured} variant="featured" headingLevel="h2" priority />
          {latestTwo.length ? (
            <ul className="mt-14 grid gap-x-8 gap-y-14 md:grid-cols-2">
              {latestTwo.map((s) => (
                <li key={s.slug} data-reveal>
                  <StoryCard story={s} headingLevel="h2" sizes="(min-width: 768px) 45vw, 100vw" />
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      {/* All stories with category filters */}
      <section id="all-stories" aria-labelledby="all-stories-title" className="scroll-mt-28 border-t border-line bg-paper py-20 lg:py-28">
        <div className="container-site">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionIntro eyebrow="Explore all articles" title="Every story, in one place" id="all-stories-title" />
            <p className="max-w-sm text-[0.9rem] text-muted" data-reveal>
              {cards.length} articles published by Gohar Group of Companies, newest first. Filter by topic.
            </p>
          </div>
          <div className="mt-12">
            <Suspense fallback={<StoryGridFallback stories={cards} />}>
              <StoryExplorer stories={cards} categories={categories} />
            </Suspense>
          </div>
        </div>
      </section>

      <SiteVisitCta
        id="stories-visit"
        eyebrow="From story to site"
        title="Ready to see a development for yourself?"
        image={{ src: "/images/projects/gohar-gateway/aerial-courtyard.webp", alt: "" }}
      />

      <section className="container-site flex flex-col items-start justify-between gap-6 py-16 sm:flex-row sm:items-center">
        <p className="max-w-xl text-[1.05rem] text-muted">
          Have a question about a project, a payment plan or a story you read here? Our team replies during office hours.
        </p>
        <Link href="/contact" className={buttonClasses("secondary", "lg")}>
          Send an enquiry <ArrowUpRight aria-hidden="true" className="size-4" />
        </Link>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "Gohar Stories",
          url: absoluteUrl("/gohar-stories"),
          publisher: { "@type": "Organization", name: "Gohar Group of Companies" },
          blogPost: allStories.map((s) => ({
            "@type": "BlogPosting",
            headline: s.title,
            datePublished: s.publishedAt,
            url: absoluteUrl(`/gohar-stories/${s.slug}`),
          })),
        }}
      />
    </>
  );
}
