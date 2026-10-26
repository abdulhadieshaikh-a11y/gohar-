import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowUpRight, Building2, CalendarCheck, Clock, Handshake, Mail, MapPin, MessageSquare, Phone, Search } from "lucide-react";
import { company } from "@/data/company";
import { getContactSettings, getProjects } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { CATEGORY_LABELS } from "@/types/project";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ScrollWords } from "@/components/ui/scroll-words";
import { SplitWords } from "@/components/ui/split-words";
import { buttonClasses } from "@/components/ui/button";
import { CountUp } from "@/components/ui/count-up";
import { ImageKindBadge } from "@/components/ui/image-kind-badge";
import { SectionIntro } from "@/components/ui/section-intro";
import { ScrollMarquee } from "@/components/home/scroll-marquee";
import { ValuesPanels } from "@/components/about/values-panels";
import { ImagePlanner } from "@/lib/image-plan";

export const metadata: Metadata = pageMetadata({
  title: "About Gohar Group",
  description:
    "Gohar Group of Companies is a Karachi-based real estate developer and builder. Our purpose, mission and the values behind every Gohar development.",
  path: "/about",
});

const journey = [
  { icon: Search, title: "Explore", body: "Browse the portfolio or tell us what you need: a family home, a shop, an office or a plot." },
  { icon: MessageSquare, title: "Speak with our team", body: "Ask about current pricing, payment plans and availability by phone, email or the enquiry form." },
  { icon: CalendarCheck, title: "Visit", body: "Arrange a site visit and see the location, the plans and the progress for yourself." },
  { icon: Handshake, title: "Stay connected", body: "Transparent communication from booking to handover, and a relationship that continues after it." },
];

export default async function AboutPage() {
  const [projects, contact] = await Promise.all([getProjects(), getContactSettings()]);
  const by = (slug: string) => projects.find((p) => p.slug === slug)!;
  const pick = (...slugs: string[]) => slugs.map(by);
  // One image plan for the page, in page order, so no photograph repeats (lib/image-plan.ts).
  const plan = new ImagePlanner(projects);
  const heroBg = plan.pick("gohar-golf-vista", "hero", "towers-aerial.webp");
  const glance = plan.pick("gohar-gateway", "hero", "courtyard.jpg");
  const band = plan.pick("gohar-residencia-shopping-mall", "band", "render-008.webp");
  const img = (slug: string, prefer?: string) => {
    const g = plan.pick(slug, "chapters", prefer);
    return { src: g.src, alt: g.alt, kind: g.kind };
  };
  const chapters = [
    {
      eyebrow: "Homes",
      title: "Apartments for families",
      body: "Completed towers in Gulshan-e-Iqbal, golf-course views beside ACACIA, and spacious 3 and 4-room apartments in DHA Phase 1.",
      image: img("gohar-towers"),
      inset: img("141-broadway-heights", "living.jpg"),
      projects: pick("gohar-towers", "gohar-golf-vista", "141-broadway-heights"),
    },
    {
      eyebrow: "Commerce",
      title: "Places to do business",
      body: "Shops and offices next to Rabi Centre on Tariq Road, 411 shops on Korangi Link Road, and retail podiums beneath our residential towers.",
      image: img("gohar-rabi-center"),
      inset: img("gohar-green-corner-shopping-center", "brochure-exterior.jpg"),
      projects: pick("gohar-rabi-center", "gohar-green-corner-shopping-center", "gohar-complex-shopping-mall"),
    },
    {
      eyebrow: "Communities",
      title: "Neighbourhoods, not just buildings",
      body: "A gated, master-planned community near Malir, plot communities in three phases at Taiser Town, and Gohar Gateway's homes, retail, banquet and dining in Hyderabad.",
      image: img("kn-gohar-green-city", "photo-lawn.jpg"),
      inset: img("gohar-villas", "park.jpg"),
      projects: pick("kn-gohar-green-city", "gohar-villas", "gohar-gateway"),
    },
  ];
  const valueImages = [
    plan.pick("gohar-towers", "values"),
    plan.pick("141-broadway-heights", "values", "terrace.jpg"),
    plan.pick("gohar-golf-vista", "values", "facade-detail.webp"),
    plan.pick("kn-gohar-green-city", "values", "photo-garden-walk.jpg"),
  ];
  const values = company.values.map((v, i) => ({ ...v, image: { src: valueImages[i]!.src, alt: valueImages[i]!.alt } }));
  const mosaic = pick(
    "gohar-gateway",
    "gohar-golf-vista",
    "gohar-villas",
    "gohar-residencia-shopping-mall",
    "141-broadway-heights",
    "kn-gohar-green-city",
  ).map((p) => ({ ...p, tile: plan.pick(p.slug, "mosaic") }));

  const cities = Array.from(new Set(projects.map((p) => p.location.city)));
  const areas = cities.map((city) => ({
    city,
    count: projects.filter((p) => p.location.city === city).length,
    list: Array.from(new Set(projects.filter((p) => p.location.city === city).map((p) => p.location.area))),
  }));
  const types = Array.from(new Set(projects.map((p) => p.category)));
  const areaCount = new Set(projects.map((p) => `${p.location.city}/${p.location.area}`)).size;
  const figures = [
    { value: String(projects.length), label: "Developments" },
    { value: String(cities.length), label: "Cities" },
    { value: String(types.length), label: "Property types" },
    { value: String(areaCount), label: "Neighbourhoods" },
  ];
  const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

  return (
    <>
      {/* Hero: full-bleed photograph, monumental headline, figures */}
      <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-ink text-ivory">
        <div className="absolute inset-x-0 -top-[10%] -z-20 h-[120%]" suppressHydrationWarning data-parallax="0.12">
          <Image src={heroBg.src} alt={heroBg.alt} fill preload sizes="100vw" quality={85} className="page-hero-image object-cover" />
        </div>
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/40 to-ink/40" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/80 via-ink/30 to-transparent" />

        <div className="container-site flex flex-1 flex-col justify-end pb-10 pt-36 lg:pb-14">
          <div className="hero-fade" style={d(0)}>
            <Breadcrumbs tone="dark" items={[{ label: "Home", href: "/" }, { label: "About", href: "/about" }]} />
          </div>
          <p className="eyebrow hero-fade mt-10 flex items-center gap-3 text-ivory/80" style={d(80)}>
            <span className="brand-dot" aria-hidden="true" /> About {company.name}
          </p>
          <h1 className="display-2xl hero-words mt-6 max-w-[12ch]">
            <SplitWords text="Where relationships" /> <SplitWords text="come first." em start={2} className="text-ivory/45" />
          </h1>
          <div className="hero-fade mt-10 grid gap-8 lg:grid-cols-12 lg:items-end" style={d(250)}>
            <p className="max-w-xl text-[1.08rem] leading-relaxed text-stone lg:col-span-6">{company.introduction}</p>
            <div className="flex flex-col gap-3 sm:flex-row lg:col-span-6 lg:justify-end">
              <Link href="/projects" data-magnetic="" className={buttonClasses("solid-light", "lg", "transition-transform")}>
                Explore our projects <ArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
              <Link href="/contact" className={buttonClasses("ghost-light", "lg")}>
                Speak with our team
              </Link>
            </div>
          </div>
          <dl className="hero-fade mt-12 grid grid-cols-2 border-t border-ivory/20 sm:grid-cols-4" style={d(400)}>
            {figures.map((f, i) => (
              <div key={f.label} className={`pt-6 ${i % 2 === 1 ? "border-l border-ivory/15 pl-6" : ""} ${i === 2 ? "sm:border-l sm:border-ivory/15 sm:pl-6" : ""}`}>
                <dt className="sr-only">{f.label}</dt>
                <dd>
                  <CountUp value={f.value} className="block font-display text-[clamp(2.4rem,4.5vw,4rem)] leading-none" />
                  <span className="mt-2 block text-[0.9rem] text-stone">{f.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Who we are: statement + company at a glance */}
      <section aria-labelledby="who-title" className="py-28 lg:py-40">
        <div className="container-site grid gap-16 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <p className="eyebrow flex items-center gap-4 text-brass-deep" data-reveal="fade">
              <span className="num tracking-[0.1em] text-gohar">(01)</span>
              <span className="block h-px w-10 origin-left bg-gohar" aria-hidden="true" data-reveal="line" />
              <span id="who-title">Who we are</span>
            </p>
            <ScrollWords
              text="We build for the long term: safe, legally sound communities where trust is the foundation and the relationship with every family continues long after the keys are handed over."
              className="mt-10 font-display text-[clamp(2rem,3.8vw,3.6rem)] font-semibold leading-[1.08] text-ink"
            />
          </div>

          <aside className="lg:col-span-5" aria-label="Company at a glance" data-reveal>
            <div className="overflow-hidden rounded-[1.75rem] border border-line bg-paper shadow-[0_40px_80px_-60px_rgb(0_0_0/0.45)] lg:sticky lg:top-28">
              <div className="relative aspect-[16/9]">
                <Image quality={85} src={glance.src} alt={glance.alt} fill sizes="(min-width: 1024px) 38vw, 100vw" className="object-cover" />
                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
                <span className="absolute bottom-4 left-5 flex items-center gap-2 text-ivory">
                  <Building2 aria-hidden="true" className="size-4" />
                  <span className="text-[0.95rem] font-semibold">At a glance</span>
                </span>
              </div>
              <dl className="divide-y divide-line px-6 text-[0.95rem] sm:px-7">
                {[
                  { k: "Company", v: company.name },
                  { k: "Head office", v: contact.addressLines.join(", ") },
                  { k: "Cities", v: cities.join(" & ") },
                  { k: "Portfolio", v: `${projects.length} developments` },
                  { k: "What we build", v: types.map((t) => CATEGORY_LABELS[t]).join(" · ") },
                  { k: "Office hours", v: `${contact.hours} · ${contact.closed}` },
                ].map((row) => (
                  <div key={row.k} className="grid grid-cols-[7.5rem_1fr] gap-4 py-4">
                    <dt className="text-muted">{row.k}</dt>
                    <dd className="font-medium">{row.v}</dd>
                  </div>
                ))}
              </dl>
              <div className="flex flex-wrap gap-2 border-t border-line p-5 sm:px-7">
                <a href={contact.phoneHref} className={buttonClasses("primary", "md", "flex-1")}>
                  <Phone aria-hidden="true" className="size-4" /> Call
                </a>
                <a href={`mailto:${contact.email}`} className={buttonClasses("secondary", "md", "flex-1")}>
                  <Mail aria-hidden="true" className="size-4" /> Email
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Image band with the tagline running across it */}
      <section aria-label={company.tagline} className="relative isolate h-[80svh] min-h-[30rem] overflow-hidden bg-ink text-ivory">
        <div className="absolute inset-x-0 -top-[15%] -z-10 h-[130%]" suppressHydrationWarning data-parallax="0.14">
          <Image quality={85} src={band.src} alt={band.alt} fill sizes="100vw" className="object-cover" />
        </div>
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/85 via-ink/20 to-ink/30" />
        <div className="flex h-full flex-col justify-between py-10">
          <ScrollMarquee items={["Where relationships", "come first"]} speed={0.03} />
          <div className="container-site flex flex-wrap items-end justify-between gap-4">
            <p>
              <span className="block font-display text-2xl sm:text-3xl">Gohar Residencia &amp; Shopping Mall</span>
              <span className="mt-1 block text-[0.9rem] text-stone">Gulshan-e-Maymar · 1,033 apartments · 301 shops</span>
            </p>
            <Link href="/projects/gohar-residencia-shopping-mall" className={buttonClasses("ghost-light", "md")}>
              View project <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </div>
        <ImageKindBadge kind="render" className="absolute right-4 top-4" />
      </section>

      {/* What we build: alternating chapters */}
      <section aria-labelledby="build-title" className="py-28 lg:py-36">
        <div className="container-site">
          <SectionIntro eyebrow="What we build" title="Homes, workplaces and communities" id="build-title" index={2} size="lg" />
          <div className="mt-20 space-y-24 lg:space-y-32">
            {chapters.map((ch, i) => (
              <article key={ch.title} className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
                <div className={`relative lg:col-span-7 ${i % 2 === 1 ? "lg:order-2" : ""}`}>
                  <span aria-hidden="true" className={`pointer-events-none absolute -top-16 z-10 select-none font-display text-[clamp(5rem,10vw,9rem)] leading-none text-ink/[0.07] ${i % 2 === 1 ? "right-0" : "left-0"}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="relative aspect-[16/11] overflow-hidden rounded-[1.75rem] bg-ink-3" data-reveal="mask">
                    <div className="zoom-media group absolute inset-0" data-tilt="3">
                      <Image quality={85} src={ch.image.src} alt={ch.image.alt} fill sizes="(min-width: 1024px) 56vw, 100vw" className="object-cover" />
                      <span aria-hidden="true" className="tilt-glare" />
                    </div>
                    <ImageKindBadge kind={ch.image.kind} className="absolute bottom-4 left-4" />
                  </div>
                  <div
                    className={`absolute -bottom-10 hidden aspect-[4/3] w-[38%] overflow-hidden rounded-[1.25rem] border-[6px] border-ivory bg-ink-3 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.55)] md:block ${i % 2 === 1 ? "-left-6" : "-right-6"}`}
                    suppressHydrationWarning
                    data-parallax="0.06"
                  >
                    <Image quality={85} src={ch.inset.src} alt={ch.inset.alt} fill sizes="22vw" className="object-cover" />
                  </div>
                </div>
                <div className={`lg:col-span-5 ${i % 2 === 1 ? "lg:order-1" : ""}`} data-reveal>
                  <p className="eyebrow flex items-center gap-3 text-brass-deep">
                    <span className="h-px w-8 bg-gohar" aria-hidden="true" />
                    {ch.eyebrow}
                  </p>
                  <h3 className="display-md mt-5">{ch.title}</h3>
                  <p className="mt-5 text-[1.05rem] leading-relaxed text-muted">{ch.body}</p>
                  <ul className="mt-8 border-t border-line">
                    {ch.projects.map((p) => (
                      <li key={p.slug}>
                        <Link href={`/projects/${p.slug}`} className="group relative flex items-center justify-between gap-4 border-b border-line py-4">
                          <span aria-hidden="true" className="absolute inset-x-0 -bottom-px h-px origin-left scale-x-0 bg-gohar transition-transform duration-700 group-hover:scale-x-100" />
                          <span className="font-display text-[1.3rem] transition-transform duration-500 group-hover:translate-x-1.5">{p.name}</span>
                          <span className="flex items-center gap-2 text-[0.85rem] text-muted">
                            <span className="hidden sm:inline">{p.location.area}</span>
                            <span className="grid size-10 place-items-center rounded-full border border-ink/15 text-ink transition-colors duration-300 group-hover:border-ink group-hover:bg-ink group-hover:text-ivory">
                              <ArrowUpRight aria-hidden="true" className="size-4" />
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Purpose, mission, promise: cards that stack as you scroll */}
      <section aria-labelledby="purpose-title" className="relative isolate overflow-clip bg-ink py-28 text-ivory lg:py-36">
        <div aria-hidden="true" className="ambient-glow" />
        <div className="container-site">
          <SectionIntro eyebrow="Purpose & mission" title="What we stand for" tone="dark" id="purpose-title" index={3} size="lg" />
          <div className="mt-16 space-y-6">
            {[
              { label: "Our purpose", text: company.purpose },
              { label: "Our mission", text: company.mission },
              { label: "Our promise", text: `${company.tagline} ${company.valuesIntro}` },
            ].map((s, i) => (
              <article
                key={s.label}
                className="sticky overflow-hidden rounded-[2rem] border border-ivory/10 bg-ink-2 p-8 shadow-[0_-30px_60px_-40px_rgb(0_0_0/0.9)] sm:p-12 lg:p-16"
                style={{ top: `${6 + i * 1.5}rem` }}
              >
                <div className="grid gap-8 lg:grid-cols-12">
                  <p className="flex items-center gap-4 lg:col-span-3">
                    <span className="font-display text-[3.5rem] leading-none text-gohar">{String(i + 1).padStart(2, "0")}</span>
                    <span className="eyebrow text-ivory/60">{s.label}</span>
                  </p>
                  <p className="font-display text-[clamp(1.6rem,3vw,2.8rem)] font-semibold leading-[1.12] lg:col-span-9">{s.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Values: expanding panels */}
      <section aria-labelledby="values-title" className="py-28 lg:py-36">
        <div className="container-site">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionIntro eyebrow="Our foundation" title="The values behind every development" id="values-title" index={4} size="lg" />
            <p className="max-w-sm text-[1.02rem] leading-relaxed text-muted" data-reveal>
              {company.valuesIntro}
            </p>
          </div>
          <div className="mt-14" data-reveal>
            <ValuesPanels items={values} />
          </div>
        </div>
      </section>

      {/* Where we build */}
      <section aria-labelledby="where-title" className="pb-28 lg:pb-36">
        <div className="container-site">
          <SectionIntro eyebrow="Where we build" title="Across Karachi and Hyderabad" id="where-title" index={5} size="lg">
            <p>Each neighbourhood links to the developments there.</p>
          </SectionIntro>
          <div className="mt-14 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            {areas.map((c, i) => (
              <div
                key={c.city}
                className="group relative isolate flex min-h-[26rem] flex-col justify-end overflow-hidden rounded-[1.75rem] bg-ink p-8 text-ivory sm:p-10"
                data-tilt="4"
                data-reveal="up"
                style={{ ["--reveal-delay" as string]: `${i * 120}ms` }}
              >
                <Image
                  src={i === 0 ? "/images/projects/gohar-villas/masterplan.jpg" : "/images/projects/gohar-gateway/aerial-courtyard.webp"}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  quality={60}
                  className="-z-20 object-cover opacity-60 transition-transform duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                />
                <span aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/50 to-ink/10" />
                <span aria-hidden="true" className="tilt-glare" />
                <p className="flex items-center gap-2 text-[0.9rem] text-stone">
                  <MapPin aria-hidden="true" className="size-4 text-gohar" />
                  {c.count} {c.count === 1 ? "development" : "developments"}
                </p>
                <h3 className="mt-3 font-display text-[clamp(3rem,6vw,5.5rem)] leading-none">{c.city}</h3>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {c.list.map((a) => (
                    <li key={a}>
                      <Link
                        href={`/projects?location=${encodeURIComponent(a)}`}
                        className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-ivory/25 bg-ink/30 px-4 text-[0.88rem] backdrop-blur-md transition-colors duration-500 hover:border-ivory hover:bg-ivory hover:text-ink"
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

      {/* Working with us: a line that draws through four steps */}
      <section aria-labelledby="journey-title" className="bg-ivory-2 py-28 lg:py-36">
        <div className="container-site">
          <SectionIntro eyebrow="Working with us" title="From first enquiry to long after handover" id="journey-title" index={6} size="lg" />
          <ol className="relative mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            <span aria-hidden="true" className="absolute left-0 right-0 top-7 hidden h-px origin-left bg-ink/20 lg:block" data-reveal="line" />
            {journey.map((s, i) => (
              <li key={s.title} className="group relative" data-reveal style={{ ["--reveal-delay" as string]: `${i * 120}ms` }}>
                <span className="relative z-10 grid size-14 place-items-center rounded-full border border-ink/15 bg-ivory-2 text-ink transition-colors duration-500 group-hover:border-ink group-hover:bg-ink group-hover:text-ivory">
                  <s.icon aria-hidden="true" className="size-5" strokeWidth={1.75} />
                </span>
                <span className="num mt-7 block text-[0.8rem] font-semibold text-gohar">Step {String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-2 text-[1.7rem] leading-tight">{s.title}</h3>
                <p className="mt-3 leading-relaxed text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Portfolio mosaic */}
      <section aria-labelledby="work-title" className="py-28 lg:py-36">
        <div className="container-site">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionIntro eyebrow="Our work" title="A selection from the portfolio" id="work-title" index={7} size="lg" />
            <Link href="/projects" className={buttonClasses("secondary", "lg", "self-start lg:self-auto")}>
              All projects <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
          <ul className="mt-14 grid auto-rows-[11rem] grid-cols-2 gap-3 sm:auto-rows-[14rem] lg:grid-cols-4">
            {mosaic.map((p, i) => (
              <li key={p.slug} className={i === 0 ? "col-span-2 row-span-2" : i === 3 ? "lg:col-span-2" : ""} data-reveal style={{ ["--reveal-delay" as string]: `${i * 60}ms` }}>
                <Link href={`/projects/${p.slug}`} className="group relative block h-full overflow-hidden rounded-[1.25rem] bg-ink-3" data-cursor="View" data-tilt="5">
                  <span className="zoom-media absolute inset-0">
                    <Image quality={85} src={p.tile.src} alt={p.tile.alt} fill sizes={i === 0 ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"} className="object-cover" />
                  </span>
                  <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent opacity-80 transition-opacity group-hover:opacity-100" />
                  <span aria-hidden="true" className="tilt-glare" />
                  <span className="absolute inset-x-0 bottom-0 p-4 text-ivory sm:p-5">
                    <span className="block font-display text-lg leading-tight sm:text-2xl">{p.name}</span>
                    <span className="mt-1 block text-[0.8rem] text-stone">{p.location.area}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Closing call to action */}
      <section className="border-t border-line py-28 text-center lg:py-36">
        <div className="container-site">
          <h2 className="display-xl mx-auto max-w-4xl" data-reveal="words">
            <SplitWords text="Have a question about a" /> <SplitWords text="Gohar project?" em start={5} className="text-brass-deep" />
          </h2>
          <p className="mx-auto mt-6 flex max-w-xl flex-wrap items-center justify-center gap-x-3 gap-y-1 text-muted" data-reveal>
            <Clock aria-hidden="true" className="size-4" /> {contact.hours} · {contact.phoneDisplay}
          </p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row" data-reveal>
            <Link href="/contact" data-magnetic="" className={buttonClasses("primary", "lg", "transition-transform")}>
              Contact our team <ArrowUpRight aria-hidden="true" className="size-4" />
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
