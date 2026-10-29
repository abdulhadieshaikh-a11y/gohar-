import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { ArrowUpRight, CalendarCheck, Clock, Mail, MapPin, Phone } from "lucide-react";
import { company } from "@/data/company";
import { pageMetadata } from "@/lib/metadata";
import { getContactSettings, getProjects } from "@/lib/content";
import { locationLabel, toCardData } from "@/lib/projects";
import { siteVisitHref } from "@/lib/site-visits/href";
import { allStories, toStoryCard } from "@/lib/stories";
import { STORY_CATEGORY_LABELS } from "@/types/story";
import { planHome } from "@/lib/image-plan";
import { buttonClasses } from "@/components/ui/button";
import { CountUp } from "@/components/ui/count-up";
import { ImageKindBadge } from "@/components/ui/image-kind-badge";
import { SectionIntro } from "@/components/ui/section-intro";
import { SplitWords } from "@/components/ui/split-words";
import { ApproachList } from "@/components/home/approach-list";
import { CollectionShowcase } from "@/components/home/collection-showcase";
import { HeroShowcase, type HeroSlide } from "@/components/home/hero-showcase";
import { ScrollMarquee } from "@/components/home/scroll-marquee";
import { ProjectIndex } from "@/components/home/project-index";
import { PortfolioExplorer } from "@/components/about/portfolio-explorer";
import { portfolioGroups } from "@/lib/portfolio";

export const metadata: Metadata = pageMetadata({
  title: "Gohar Group of Companies | Real Estate Developer in Karachi & Hyderabad",
  absoluteTitle: true,
  description:
    "Apartments, commercial centres, mixed-use developments and gated communities in Karachi and Hyderabad. Where Relationships Come First.",
  path: "/",
});


export default async function HomePage() {
  const [projects, contact] = await Promise.all([getProjects(), getContactSettings()]);
  const bySlug = (slug: string) => projects.find((p) => p.slug === slug)!;
  // Image allocation for the whole page (see lib/image-plan.ts): no photograph repeats
  // in nearby sections; projects with a single published image are the only exceptions.
  const plan = planHome(projects);
  const slides: HeroSlide[] = plan.hero.map(({ project: p, image: img }) => ({
    slug: p.slug,
    name: p.name,
    location: locationLabel(p),
    category: p.categoryLabel,
    image: { src: img.src, alt: img.alt, kind: img.kind },
  }));

  // Headline figures come straight from the verified project facts.
  const factOf = (slug: string, label: string) => bySlug(slug).facts.find((f) => f.label === label)?.value;
  const cities = new Set(projects.map((p) => p.location.city));
  const stats = [
    { value: String(projects.length), label: "Developments", note: "in the Gohar portfolio" },
    { value: String(cities.size), label: "Cities", note: "Karachi and Hyderabad" },
    { value: factOf("gohar-residencia-shopping-mall", "Apartments"), label: "Apartments", note: "at Gohar Residencia" },
    { value: factOf("gohar-green-corner-shopping-center", "Shops"), label: "Shops", note: "at Gohar Green Corner" },
  ].filter((s): s is { value: string; label: string; note: string } => !!s.value);

  const featured = plan.signature;
  const cards = plan.collection.map(({ project, image }) => ({
    ...toCardData(project),
    image: { src: image.src, alt: image.alt, kind: image.kind, width: image.width, height: image.height },
  }));

  const captions = ["Gohar Towers, Gulshan-e-Iqbal", "141 Broadway Heights, DHA Phase 1", "Gohar Golf Vista, Gulshan-e-Roomi", "KN Gohar Green City, Malir"];
  const approach = company.values.map((v, i) => {
    const img = plan.approach[i]!;
    return { ...v, image: { src: img.src, alt: img.alt, kind: img.kind, caption: captions[i]! } };
  });

  const areasByCity = (city: string) =>
    Array.from(new Set(projects.filter((p) => p.location.city === city).map((p) => p.location.area))).filter((a) => a !== city);
  const cityPanels = [
    {
      city: "Karachi",
      count: projects.filter((p) => p.location.city === "Karachi").length,
      image: plan.places.karachi.src,
      areas: areasByCity("Karachi"),
    },
    {
      city: "Hyderabad",
      count: projects.filter((p) => p.location.city === "Hyderabad").length,
      image: plan.places.hyderabad.src,
      areas: projects.filter((p) => p.location.city === "Hyderabad").map((p) => p.name),
    },
  ];
  const placeNames = Array.from(new Set(projects.map((p) => p.location.area)));

  const [leadStory, ...moreStories] = allStories.slice(0, 4).map(toStoryCard);
  const visitPicks = plan.visit;

  return (
    <>
      <HeroShowcase slides={slides} tagline={company.tagline} />

      {/* Running band: what and where Gohar builds */}
      <div className="theme-light border-y border-line bg-ink py-5 text-ivory sm:py-6">
        <ScrollMarquee
          size="md"
          speed={0.035}
          items={["Residential", "Karachi", "Commercial", "Hyderabad", "Mixed-use", `${projects.length} developments`, "Communities"]}
        />
      </div>

      {/* (01) About Gohar: statement, figures, the portfolio by type, and the company's purpose */}
      <section id="intro" aria-labelledby="intro-title" className="scroll-mt-24 py-28 lg:py-40">
        <div className="container-site">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-14">
            <div className="lg:col-span-8">
              <p className="eyebrow flex items-center gap-4 text-brass-deep" data-reveal="fade">
                <span className="num tracking-[0.1em] text-gohar">(01)</span>
                <span className="block h-px w-10 origin-left bg-gohar" aria-hidden="true" data-reveal="line" />
                About Gohar Group
              </p>
              <h2 id="intro-title" className="display-xl mt-7" data-reveal="words">
                <SplitWords text="Homes, workplaces and communities," />{" "}
                <SplitWords text="built on trust." em start={4} className="text-brass-deep" />
              </h2>
            </div>
            <div className="lg:col-span-4" data-reveal>
              <p className="text-[1.08rem] leading-relaxed text-muted">{company.introduction}</p>
              <Link href="/about" data-magnetic="" className={buttonClasses("primary", "lg", "mt-8 transition-transform")}>
                Discover our story <ArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
          </div>

          {/* Figures from the verified project data */}
          <dl className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-[1.75rem] border border-line bg-line lg:mt-20 lg:grid-cols-4" data-reveal="stagger">
            {stats.map((s) => (
              <div key={s.label} className="group relative bg-paper p-6 transition-colors duration-500 hover:bg-ink hover:text-ivory sm:p-8">
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-gohar transition-transform duration-700 group-hover:scale-x-100" />
                <dt className="sr-only">{`${s.label} ${s.note}`}</dt>
                <dd>
                  <CountUp value={s.value} className="block font-display text-[clamp(2.8rem,5.5vw,5.2rem)] leading-none" />
                  <span className="mt-4 block text-[0.95rem] font-semibold">{s.label}</span>
                  <span className="mt-1 block text-[0.85rem] text-muted transition-colors duration-500 group-hover:text-stone">{s.note}</span>
                </dd>
              </div>
            ))}
          </dl>

          {/* What we build: interactive */}
          <div className="mt-24 lg:mt-32">
            <p className="eyebrow mb-10 flex items-center gap-4 text-brass-deep" data-reveal="fade">
              <span className="block h-px w-10 origin-left bg-gohar" aria-hidden="true" data-reveal="line" />
              What we build
            </p>
            <div data-reveal>
              <PortfolioExplorer groups={portfolioGroups(projects)} />
            </div>
          </div>

          {/* Purpose */}
          <figure className="theme-light relative mt-24 grid overflow-hidden rounded-[2rem] border border-line bg-ivory-2 text-ivory lg:mt-32 lg:grid-cols-12" data-reveal>
            <div className="theme-dark relative min-h-72 lg:col-span-5">
              <Image quality={85} src={plan.intro.src} alt={plan.intro.alt} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
              <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-ink/40" />
              <span className="absolute bottom-5 left-5 flex items-center gap-2 text-[0.8rem] text-ivory/85">
                <span className="brand-dot" aria-hidden="true" /> KN Gohar Green City, Malir · Photograph
              </span>
            </div>
            <blockquote className="relative flex flex-col justify-center p-8 sm:p-12 lg:col-span-7 lg:p-16">
              <span aria-hidden="true" className="pointer-events-none absolute -top-6 right-8 select-none font-display text-[12rem] leading-none text-ivory/[0.06]">&rdquo;</span>
              <p className="eyebrow flex items-center gap-3 text-ivory/60">
                <span className="block h-px w-10 bg-gohar" aria-hidden="true" /> Our purpose
              </p>
              <p className="mt-6 font-display text-[clamp(1.7rem,3vw,2.8rem)] font-semibold leading-[1.12]">{company.purpose}</p>
              <figcaption className="mt-8 text-[0.95rem] text-stone">{company.tagline}</figcaption>
            </blockquote>
          </figure>
        </div>
      </section>

      {/* Interactive index: hover a name to preview the development */}
      <section aria-labelledby="index-title" className="pb-28 lg:pb-40">
        <div className="container-site">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionIntro eyebrow="The portfolio" title="Explore every development" id="index-title" size="lg">
              <p>Move across the list to preview each project. Tap any name to open it.</p>
            </SectionIntro>
            <Link href="/projects" data-magnetic="" className={buttonClasses("secondary", "lg", "self-start lg:self-auto")}>
              Search &amp; filter <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
          <div className="mt-14" data-reveal="fade">
            <ProjectIndex
              projects={projects.map((p) => ({
                slug: p.slug,
                name: p.name,
                category: p.categoryLabel,
                location: locationLabel(p),
                // Prefer a photograph/render other than the hero, so the preview doesn't repeat the slideshow.
                image: (() => {
                  const alt = [...p.gallery].reverse().find((g) => g.src !== p.heroImage.src && (g.kind === "photograph" || g.kind === "render")) ?? p.heroImage;
                  return { src: alt.src, alt: alt.alt };
                })(),
              }))}
            />
          </div>
        </div>
      </section>

      {/* (02) Signature developments: full-screen panels that stack as you scroll */}
      <section aria-labelledby="signature-title" className="bg-ink text-ivory">
        <div className="theme-light bg-ink"><div className="container-site flex flex-col gap-8 pb-16 pt-28 lg:flex-row lg:items-end lg:justify-between lg:pt-36">
          <SectionIntro eyebrow="Signature developments" title="Architecture with a sense of place" index={2} id="signature-title" size="lg" />
          <p className="max-w-sm text-[0.95rem] leading-relaxed text-stone" data-reveal>
            {featured.length} landmark projects, from a golf-course residence in Karachi to a mixed-use address in Hyderabad.
          </p>
        </div></div>
        <div className="relative">
          {featured.map(({ project: p, image: img }, i) => (
            <Fragment key={p.slug}>
            {/* A transparent pause: the pinned panel stays fully visible before the next slides over it. */}
            {i > 0 ? <div aria-hidden="true" className="h-[55svh]" /> : null}
            <article
              className="sticky top-0 isolate h-[100svh] min-h-[620px] overflow-hidden bg-ink"
              style={{ zIndex: i + 1 }}
              aria-labelledby={`sig-${p.slug}`}
            >
              <div className="absolute inset-x-0 -top-[8%] -z-20 h-[116%]" suppressHydrationWarning data-parallax="0.08">
                <Image src={img.src} alt={img.alt} fill sizes="100vw" quality={85} className="object-cover" />
              </div>
              <span aria-hidden="true" className="pointer-events-none absolute right-[-0.04em] top-[8%] -z-10 select-none font-display text-[clamp(10rem,30vw,28rem)] leading-none text-transparent opacity-60 [-webkit-text-stroke:1px_rgb(243_238_230/0.22)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/35 to-ink/10" />
              <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/70 via-transparent to-transparent" />
              <div className="container-site flex h-full flex-col justify-end pb-14 lg:pb-20">
                <div className="grid items-end gap-10 lg:grid-cols-12">
                  <div className="lg:col-span-7">
                    <p className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-brass-light">
                      <span className="num text-ivory">
                        {String(i + 1).padStart(2, "0")} — {String(featured.length).padStart(2, "0")}
                      </span>
                      <span className="h-px w-8 bg-gohar" aria-hidden="true" />
                      {p.categoryLabel}
                      {p.status ? <span className="rounded-full bg-ivory px-3 py-1 text-ink">{p.status}</span> : null}
                    </p>
                    <h3 id={`sig-${p.slug}`} className="display-xl mt-6" data-reveal="words">
                      <Link href={`/projects/${p.slug}`} className="transition-colors duration-500 hover:text-brass-light">
                        <SplitWords text={p.name} />
                      </Link>
                    </h3>
                    <p className="mt-6 flex items-center gap-2 text-[0.8rem] uppercase tracking-[0.12em] text-stone">
                      <MapPin aria-hidden="true" className="size-4 text-gohar" />
                      {locationLabel(p)}
                    </p>
                  </div>
                  <div className="lg:col-span-5" data-reveal>
                    <p className="text-[1.02rem] leading-relaxed text-stone">{p.summary}</p>
                    <dl className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-ivory/15 bg-ivory/15">
                      {p.facts.slice(0, 2).map((f) => (
                        <div key={f.label} className="bg-ink/60 p-4 backdrop-blur-md">
                          <dt className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-brass-light">{f.label}</dt>
                          <dd className="mt-1.5 text-[0.9rem] leading-snug">{f.value}</dd>
                        </div>
                      ))}
                    </dl>
                    <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                      <Link href={`/projects/${p.slug}`} className={buttonClasses("solid-light", "md")}>
                        Discover the project <ArrowUpRight aria-hidden="true" className="size-4" />
                      </Link>
                      <Link href={siteVisitHref({ project: p.slug })} className={buttonClasses("ghost-light", "md")}>
                        <CalendarCheck aria-hidden="true" className="size-4" /> Request a visit
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <ImageKindBadge kind={img.kind} className="absolute right-5 top-28 lg:top-32" />
            </article>
            </Fragment>
          ))}
        </div>
      </section>

      {/* (03) The collection */}
      <section aria-labelledby="collection-title" className="overflow-hidden py-28 lg:py-36">
        <div className="container-site">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionIntro eyebrow="The collection" title="Every Gohar development" index={3} id="collection-title" size="lg">
              <p>Homes, shopping centres, offices and communities. Filter by type, drag through the collection, and open any project.</p>
            </SectionIntro>
            <Link href="/projects" className={buttonClasses("secondary", "lg", "self-start lg:self-auto")}>
              Search all projects <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
          <div className="mt-14">
            <CollectionShowcase projects={cards} />
          </div>
        </div>
      </section>

      {/* Places: scroll-linked marquee + city panels */}
      <section aria-labelledby="places-title" className="border-t border-line pb-28 pt-16 lg:pb-36">
        <ScrollMarquee items={placeNames} className="text-ink" />
        <div className="container-site mt-20">
          <SectionIntro eyebrow="Where we build" title="Two cities, one standard" id="places-title">
            <p>Each area links to its developments.</p>
          </SectionIntro>
          <div className="mt-14 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
            {cityPanels.map((c) => (
              <div key={c.city} className="group relative isolate flex min-h-[30rem] flex-col justify-end overflow-hidden rounded-[1.75rem] bg-ink p-8 text-ivory sm:p-10" data-reveal="mask" data-tilt="4">
                <span aria-hidden="true" className="tilt-glare" />
                <div className="absolute inset-x-0 -top-[10%] -z-20 h-[120%]" suppressHydrationWarning data-parallax="0.06">
                  <Image src={c.image} alt="" fill sizes="(min-width: 1024px) 55vw, 100vw" quality={85} className="object-cover transition-transform duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105" />
                </div>
                <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/45 to-ink/10" />
                <p className="num text-[0.75rem] text-brass-light">
                  {String(c.count).padStart(2, "0")} {c.count === 1 ? "development" : "developments"}
                </p>
                <h3 className="mt-3 font-display text-[clamp(3rem,6vw,5.5rem)] leading-none">{c.city}</h3>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {c.areas.map((a) => (
                    <li key={a}>
                      <Link
                        href={c.city === "Hyderabad" ? `/projects?location=Hyderabad` : `/projects?location=${encodeURIComponent(a)}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-ivory/25 bg-ink/30 px-4 py-2 text-[0.8rem] backdrop-blur-md transition-colors duration-500 hover:border-ivory hover:bg-ivory hover:text-ink"
                      >
                        {a}
                        <ArrowUpRight aria-hidden="true" className="size-3.5" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* (04) Approach and values */}
      <section aria-labelledby="approach-title" className="theme-light relative isolate overflow-hidden border-t border-line bg-ivory-2 py-28 text-ivory lg:py-36">
        <div className="container-site">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionIntro eyebrow="Our foundation" title="Values behind every development" index={4} id="approach-title" size="lg" />
            <p className="max-w-md text-[0.98rem] leading-relaxed text-stone" data-reveal>
              {company.valuesIntro}
            </p>
          </div>
          <div className="mt-16">
            <ApproachList items={approach} />
          </div>
          <p className="mt-16 max-w-3xl border-l border-gohar pl-6 text-[1rem] leading-relaxed text-stone" data-reveal>
            <span className="eyebrow mb-2 block text-brass-light">Our mission</span>
            {company.mission}
          </p>
        </div>
      </section>

      {/* (05) Gohar Stories */}
      {leadStory ? (
        <section aria-labelledby="home-stories-title" className="py-28 lg:py-36">
          <div className="container-site">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <SectionIntro eyebrow="Gohar Stories" title="News, project stories & buying guides" index={5} id="home-stories-title" />
              <Link href="/gohar-stories" className={buttonClasses("secondary", "lg", "self-start lg:self-auto")}>
                All stories <ArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
            <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-14">
              <article className="group relative lg:col-span-7" data-cursor="Read">
                <div className="zoom-media relative aspect-[16/11] overflow-hidden rounded-[1.5rem] bg-ink-3" data-reveal="mask">
                  <Image quality={85} src={leadStory.cover.src} alt={leadStory.cover.alt} fill sizes="(min-width: 1024px) 56vw, 100vw" className="object-cover" />
                </div>
                <p className="mt-6 flex flex-wrap items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted">
                  <span className="text-brass-deep">{STORY_CATEGORY_LABELS[leadStory.category]}</span>
                  <span aria-hidden="true">·</span>
                  <time dateTime={leadStory.publishedAt}>{leadStory.dateLabel}</time>
                  <span aria-hidden="true">·</span>
                  {leadStory.minutes} min read
                </p>
                <h3 className="display-sm mt-4 max-w-2xl">
                  <Link href={`/gohar-stories/${leadStory.slug}`} className="after:absolute after:inset-0 after:content-['']">
                    <span className="link-line">{leadStory.title}</span>
                  </Link>
                </h3>
                <p className="mt-4 max-w-2xl leading-relaxed text-muted">{leadStory.excerpt}</p>
              </article>
              <ol className="border-t border-line lg:col-span-5">
                {moreStories.map((s, i) => (
                  <li key={s.slug} className="border-b border-line" data-reveal style={{ ["--reveal-delay" as string]: `${i * 90}ms` }}>
                    <Link href={`/gohar-stories/${s.slug}`} className="group grid grid-cols-[6.5rem_1fr] gap-5 py-6 sm:grid-cols-[8rem_1fr]">
                      <span className="zoom-media relative block aspect-square overflow-hidden rounded-xl bg-ink-3">
                        <Image quality={85} src={s.cover.src} alt="" fill sizes="128px" className="object-cover" />
                      </span>
                      <span>
                        <span className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-brass-deep">
                          {STORY_CATEGORY_LABELS[s.category]} · <time dateTime={s.publishedAt}>{s.dateLabel}</time>
                        </span>
                        <span className="mt-2 block font-display text-[1.45rem] leading-[1.12] transition-colors duration-300 group-hover:text-brass-deep">
                          {s.title}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      ) : null}

      {/* (06) Request a site visit: the dark feature surface */}
      <section aria-labelledby="home-visit-title" className="theme-light relative isolate overflow-hidden border-y border-line bg-ivory-2 py-28 text-ivory lg:py-36">
        <div className="container-site grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="eyebrow flex items-center gap-4 text-ivory/80" data-reveal="fade">
              <span className="num tracking-[0.1em]">(06)</span>
              <span className="h-px w-10 bg-gohar" aria-hidden="true" />
              Request a site visit
            </p>
            <h2 id="home-visit-title" className="display-lg mt-6" data-reveal="words">
              <SplitWords text="Walk the site." /> <SplitWords text="Meet the people behind it." em start={3} className="text-brass-deep" />
            </h2>
            <p className="mt-6 max-w-md leading-relaxed text-ivory/80" data-reveal>
              Choose a development and a time that suits you. This sends a request: our team calls you to confirm before
              your visit.
            </p>
            <ol className="mt-10 space-y-4" data-reveal="stagger">
              {["Choose a project, a preferred day and a time window", "Our team calls to confirm availability", "Meet us on site at the agreed time"].map((step, i) => (
                <li key={step} className="flex items-baseline gap-5 border-b border-ivory/15 pb-4">
                  <span className="font-display text-[2.2rem] leading-none text-ivory/70">{i + 1}</span>
                  <span className="text-[1rem]">{step}</span>
                </li>
              ))}
            </ol>
            <Link href="/site-visit" data-magnetic="" className={buttonClasses("solid-light", "lg", "mt-10 transition-transform")}>
              <CalendarCheck aria-hidden="true" className="size-4" /> Request a site visit
            </Link>
          </div>
          <div className="lg:col-span-7">
            <p className="eyebrow text-ivory/70" data-reveal="fade">
              Or start with a development
            </p>
            <ul className="mt-5 grid grid-cols-2 gap-3 sm:gap-4">
              {visitPicks.map(({ project: p, image: img }, i) => (
                <li key={p.slug} data-reveal style={{ ["--reveal-delay" as string]: `${(i % 2) * 90 + Math.floor(i / 2) * 60}ms` }}>
                  <Link
                    href={siteVisitHref({ project: p.slug })}
                    className="theme-dark press group relative block aspect-[5/4] overflow-hidden rounded-[1.1rem] bg-gohar-ink text-ivory ring-1 ring-ivory/15 transition-[box-shadow] duration-500 hover:ring-ivory/60"
                    data-tilt="7"
                    data-cursor="Visit"
                  >
                    <span className="zoom-media absolute inset-0">
                      <Image quality={85} src={img.src} alt="" fill sizes="(min-width: 1024px) 28vw, 48vw" className="object-cover opacity-80 transition-opacity duration-700 group-hover:opacity-100" />
                    </span>
                    <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-gohar-ink via-gohar-ink/20 to-transparent" />
                    <span aria-hidden="true" className="tilt-glare" />
                    <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5">
                      <span>
                        <span className="block font-display text-[1.2rem] leading-tight sm:text-[1.55rem]">{p.name}</span>
                        <span className="mt-1 block text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-ivory/70">Request a visit</span>
                      </span>
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ivory text-ink transition-transform duration-500 group-hover:rotate-45 sm:size-10">
                        <ArrowUpRight aria-hidden="true" className="size-4" />
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section aria-labelledby="home-contact-title" className="py-28 lg:py-36">
        <div className="container-site">
          <p className="eyebrow flex items-center gap-4 text-brass-deep" data-reveal="fade">
            <span className="h-px w-10 bg-current opacity-60" aria-hidden="true" />
            Speak with us
          </p>
          <h2 id="home-contact-title" className="display-lg mt-6 max-w-4xl" data-reveal="words">
            <SplitWords text="Every relationship starts with a" /> <SplitWords text="conversation." em start={5} className="text-brass-deep" />
          </h2>
          <div className="mt-16 grid gap-px overflow-hidden rounded-[1.5rem] border border-line bg-line md:grid-cols-2 lg:grid-cols-4" data-reveal="stagger">
            {[
              { icon: Phone, label: "Call us", value: contact.phoneDisplay, href: contact.phoneHref },
              { icon: Mail, label: "Email", value: contact.email, href: `mailto:${contact.email}` },
              { icon: MapPin, label: "Head office", value: "Gohar Chamber, Shahra-e-Faisal, Karachi", href: contact.mapUrl, external: true },
              { icon: Clock, label: "Office hours", value: contact.hours, note: contact.closed },
            ].map((c) => {
              const inner = (
                <>
                  <span className="flex items-center justify-between">
                    <c.icon aria-hidden="true" className="size-5 text-brass-deep" strokeWidth={1.5} />
                    {c.href ? <ArrowUpRight aria-hidden="true" className="size-4 text-muted transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" /> : null}
                  </span>
                  <span className="eyebrow mt-10 block text-muted">{c.label}</span>
                  <span className="mt-2 block font-display text-[1.55rem] leading-tight [overflow-wrap:anywhere]">{c.value}</span>
                  {c.note ? <span className="mt-1 block text-[0.85rem] text-muted">{c.note}</span> : null}
                </>
              );
              return c.href ? (
                <a
                  key={c.label}
                  href={c.href}
                  {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="group block bg-paper p-7 transition-colors duration-500 hover:bg-ivory lg:p-8"
                >
                  {inner}
                </a>
              ) : (
                <div key={c.label} className="bg-paper p-7 lg:p-8">
                  {inner}
                </div>
              );
            })}
          </div>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row" data-reveal>
            <Link href="/contact" className={buttonClasses("primary", "lg")}>
              Send an enquiry <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
            <Link href="/site-visit" className={buttonClasses("secondary", "lg")}>
              <CalendarCheck aria-hidden="true" className="size-4" /> Request a site visit
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
