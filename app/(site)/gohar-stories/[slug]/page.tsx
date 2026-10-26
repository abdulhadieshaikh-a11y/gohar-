import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CalendarCheck, Info } from "lucide-react";
import { getProjects } from "@/lib/content";
import { toCardData } from "@/lib/projects";
import { absoluteUrl, whatsappHref, whatsappMessage } from "@/lib/site";
import {
  findStory,
  formatStoryDate,
  readingMinutes,
  relatedStories,
  storyOutline,
  storySlugs,
  toStoryCard,
  plainText,
} from "@/lib/stories";
import { STORY_CATEGORY_LABELS } from "@/types/story";
import type { Project } from "@/types/project";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { buttonClasses } from "@/components/ui/button";
import { SectionIntro } from "@/components/ui/section-intro";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { JsonLd } from "@/components/seo/json-ld";
import { ProjectCard } from "@/components/projects/project-card";
import { SiteVisitCta, siteVisitHref } from "@/components/site-visit/site-visit-cta";
import { ShareActions } from "@/components/stories/share-actions";
import { StoryBody } from "@/components/stories/story-body";
import { StoryCard } from "@/components/stories/story-card";
import { SplitWords } from "@/components/ui/split-words";

export function generateStaticParams() {
  return storySlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/gohar-stories/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const story = findStory(slug);
  if (!story) return { title: "Story not found", robots: { index: false } };
  const url = `/gohar-stories/${story.slug}`;
  const description = story.excerpt.length > 160 ? `${story.excerpt.slice(0, 157).trimEnd()}…` : story.excerpt;
  return {
    title: { absolute: `${story.title} | Gohar Stories` },
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: story.title,
      description,
      publishedTime: story.publishedAt,
      section: STORY_CATEGORY_LABELS[story.category],
      siteName: "Gohar Group of Companies",
      images: [{ url: story.cover.src, width: story.cover.width, height: story.cover.height, alt: story.cover.alt }],
    },
    twitter: { card: "summary_large_image", title: story.title, description, images: [story.cover.src] },
  };
}

export default async function StoryPage({ params }: PageProps<"/gohar-stories/[slug]">) {
  const { slug } = await params;
  const story = findStory(slug);
  if (!story) notFound();

  const projects = await getProjects();
  const relatedProjects = story.relatedProjects
    .map((s) => projects.find((p) => p.slug === s))
    .filter((p): p is Project => !!p);
  const primaryProject = relatedProjects.length === 1 ? relatedProjects[0] : undefined;
  const outline = storyOutline(story);
  const related = relatedStories(story).map(toStoryCard);
  const minutes = readingMinutes(story);
  const date = formatStoryDate(story.publishedAt);
  const url = absoluteUrl(`/gohar-stories/${story.slug}`);
  const wa = whatsappHref(
    primaryProject
      ? whatsappMessage(primaryProject.name)
      : `Hi, I just read "${plainText(story.title)}" on the Gohar Group website. Please share the available options, prices, and payment plans.`,
  );

  return (
    <>
      <article aria-labelledby="story-title">
        {/* Header */}
        <header className="border-b border-line bg-ivory pb-12 pt-36 lg:pt-44">
          <div className="container-site">
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Gohar Stories", href: "/gohar-stories" },
                { label: story.title, href: `/gohar-stories/${story.slug}` },
              ]}
            />
            <div className="mx-auto mt-12 max-w-4xl text-center">
              <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted">
                <Link href={`/gohar-stories?category=${story.category}#all-stories`} className="text-brass-deep hover:text-ink">
                  {STORY_CATEGORY_LABELS[story.category]}
                </Link>
                <span aria-hidden="true" className="size-1 rounded-full bg-current opacity-50" />
                <time dateTime={story.publishedAt}>{date}</time>
                <span aria-hidden="true" className="size-1 rounded-full bg-current opacity-50" />
                <span>{minutes} min read</span>
              </p>
              <h1 id="story-title" className="display-lg hero-words mt-7 text-balance">
                <SplitWords text={story.title} />
              </h1>
              <p className="mx-auto mt-7 max-w-2xl text-[1.12rem] leading-relaxed text-muted">{story.excerpt}</p>
              <p className="mt-6 text-[0.8rem] text-muted">
                By <span className="font-semibold text-ink">{story.source.publisher}</span>
              </p>
            </div>
          </div>
        </header>

        {/* Hero image */}
        <figure className="container-site -mt-px pt-10">
          <div className="hero-clip relative aspect-[16/10] overflow-hidden rounded-[2rem] bg-ink-3 sm:aspect-[16/8]" style={{ ["--d" as string]: "250ms" }}>
            <Image quality={85}
              src={story.cover.src}
              alt={story.cover.alt}
              fill
              preload
              sizes="(min-width: 1440px) 84rem, 100vw"
              className="page-hero-image object-cover"
            />
          </div>
          <figcaption className="mt-3 flex flex-col gap-1 text-[0.82rem] text-muted sm:flex-row sm:justify-between">
            <span>{story.cover.caption}</span>
            <span className="text-[0.72rem] uppercase tracking-[0.12em]">{story.cover.credit}</span>
          </figcaption>
        </figure>

        {/* Body */}
        <div className="container-site grid gap-12 py-16 lg:grid-cols-12 lg:gap-10 lg:py-20">
          <aside className="order-2 lg:order-1 lg:col-span-3" aria-label="Article tools">
            <div className="space-y-10 lg:sticky lg:top-32">
              {outline.length >= 3 ? (
                <nav aria-labelledby="toc-title" className="hidden lg:block">
                  <p id="toc-title" className="eyebrow text-brass-deep">
                    In this story
                  </p>
                  <ol className="mt-4 space-y-2.5 border-l border-line">
                    {outline.map((o) => (
                      <li key={o.id}>
                        <a
                          href={`#${o.id}`}
                          className="-ml-px block border-l border-transparent pl-4 text-[0.88rem] leading-snug text-muted transition-colors hover:border-brass hover:text-ink"
                        >
                          {o.label}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              ) : null}
              <ShareActions url={url} title={story.title} layout="column" />
              <Link href="/gohar-stories" className={buttonClasses("text")}>
                <ArrowLeft aria-hidden="true" className="size-4" /> Back to Gohar Stories
              </Link>
            </div>
          </aside>

          <div className="order-1 min-w-0 lg:order-2 lg:col-span-7 lg:col-start-4">
            {outline.length >= 3 ? (
              <details className="mb-10 border border-line bg-paper p-5 lg:hidden">
                <summary className="cursor-pointer text-[0.78rem] font-semibold uppercase tracking-[0.12em]">In this story</summary>
                <ol className="mt-4 space-y-2">
                  {outline.map((o) => (
                    <li key={o.id}>
                      <a href={`#${o.id}`} className="text-[0.95rem] text-muted underline-offset-4 hover:text-ink hover:underline">
                        {o.label}
                      </a>
                    </li>
                  ))}
                </ol>
              </details>
            ) : null}

            {story.contextNote ? (
              <p className="mb-10 flex gap-3 border-l-2 border-brass bg-paper p-5 text-[0.9rem] leading-relaxed text-muted">
                <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brass-deep" />
                <span>{story.contextNote}</span>
              </p>
            ) : null}

            <StoryBody blocks={story.blocks} />

            {story.tags?.length ? (
              <ul className="mt-12 flex flex-wrap gap-2" aria-label="Tags">
                {story.tags.map((t) => (
                  <li key={t} className="border border-line px-3 py-1 text-[0.75rem] text-muted">
                    #{t}
                  </li>
                ))}
              </ul>
            ) : null}

            {/* In-article actions */}
            <div className="mt-14 grid gap-px overflow-hidden rounded-[1.5rem] border border-line bg-line sm:grid-cols-2">
              <Link href={siteVisitHref({ project: primaryProject?.slug, from: story.slug })} className="group flex flex-col gap-3 bg-paper p-6 transition-colors hover:bg-ivory">
                <CalendarCheck aria-hidden="true" className="size-5 text-brass-deep" />
                <span className="font-display text-[1.45rem] leading-tight">
                  Request a site visit{primaryProject ? ` to ${primaryProject.name}` : ""}
                </span>
                <span className="text-[0.88rem] text-muted">Request a preferred date and time; our team confirms by phone.</span>
              </Link>
              {wa ? (
                <a href={wa} target="_blank" rel="noopener noreferrer" className="group flex flex-col gap-3 bg-paper p-6 transition-colors hover:bg-ivory">
                  <WhatsAppIcon className="size-5 text-whatsapp-deep" />
                  <span className="font-display text-[1.45rem] leading-tight">Ask us on WhatsApp</span>
                  <span className="text-[0.88rem] text-muted">Chat with our sales team about prices, payment plans and availability.</span>
                </a>
              ) : null}
            </div>

            <p className="mt-10 border-t border-line pt-6 text-[0.82rem] leading-relaxed text-muted">
              Originally published by {story.source.publisher} on {date} on gohargoc.com, the group&rsquo;s previous website. Images
              are official Gohar Group material; renders are artist&rsquo;s impressions.
            </p>
          </div>
        </div>
      </article>

      {relatedProjects.length ? (
        <section aria-labelledby="story-projects-title" className="border-t border-line bg-paper py-20 lg:py-24">
          <div className="container-site">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <SectionIntro
                eyebrow="Projects in this story"
                title={relatedProjects.length === 1 ? "Explore the project" : "Explore the projects"}
                id="story-projects-title"
              />
              <Link href="/projects" className={buttonClasses("text")}>
                All projects <ArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
            <ul className={`mt-12 grid gap-x-8 gap-y-12 ${relatedProjects.length === 1 ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
              {relatedProjects.map((p) => (
                <li key={p.slug}>
                  <ProjectCard project={toCardData(p)} sizes="(min-width: 768px) 30vw, 100vw" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <SiteVisitCta
        id="story-visit"
        projectSlug={primaryProject?.slug}
        projectName={primaryProject?.name}
        from={story.slug}
        image={primaryProject ? { src: primaryProject.heroImage.src, alt: "" } : undefined}
      />

      {related.length ? (
        <section aria-labelledby="related-stories-title" className="container-site py-20 lg:py-28">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionIntro eyebrow="Keep reading" title="Related stories" id="related-stories-title" />
            <Link href="/gohar-stories" className={buttonClasses("text")}>
              <ArrowLeft aria-hidden="true" className="size-4" /> Back to Gohar Stories
            </Link>
          </div>
          <ul className="mt-12 grid gap-x-8 gap-y-14 md:grid-cols-3">
            {related.map((s) => (
              <li key={s.slug}>
                <StoryCard story={s} sizes="(min-width: 768px) 30vw, 100vw" />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: story.title,
          description: story.excerpt,
          datePublished: story.publishedAt,
          image: absoluteUrl(story.cover.src),
          url,
          mainEntityOfPage: url,
          articleSection: STORY_CATEGORY_LABELS[story.category],
          author: { "@type": "Organization", name: story.source.publisher },
          publisher: {
            "@type": "Organization",
            name: story.source.publisher,
            logo: { "@type": "ImageObject", url: absoluteUrl("/images/brand/gohar-logo-dark.png") },
          },
        }}
      />
    </>
  );
}
