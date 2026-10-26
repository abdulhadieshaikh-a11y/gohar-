import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { CalendarCheck, Download, MapPin } from "lucide-react";
import { siteVisitHref } from "@/lib/site-visits/href";
import { locationLabel } from "@/lib/projects";
import { whatsappHref, whatsappMessage } from "@/lib/site";
import type { Project } from "@/types/project";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { buttonClasses } from "@/components/ui/button";
import { ImageKindBadge } from "@/components/ui/image-kind-badge";
import { SplitWords } from "@/components/ui/split-words";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/**
 * Project hero in one of three compositions (see Project.heroLayout):
 *  full   – cinematic full-bleed photograph with parallax and a glass facts strip
 *  split  – text beside a framed image (for square or lower-resolution imagery)
 *  framed – dark heading band above a large rounded image
 */
export function ProjectHero({ project }: { project: Project }) {
  const layout = project.heroLayout ?? "full";
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/projects" },
    { label: project.name, href: `/projects/${project.slug}` },
  ];
  const wa = whatsappHref(whatsappMessage(project.name));
  const strip = [
    { label: "Category", value: project.categoryLabel },
    { label: "Location", value: locationLabel(project) },
    ...(project.status ? [{ label: "Status", value: project.status }] : []),
    ...project.facts.filter((f) => f.label !== "City").slice(0, project.status ? 1 : 2),
  ];

  const badges = (tone: "light" | "dark") => (
    <p className={`hero-fade flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.7rem] font-semibold uppercase tracking-[0.12em] ${tone === "dark" ? "text-brass-light" : "text-brass-deep"}`} style={d(150)}>
      <span className="brand-dot" aria-hidden="true" />
      {project.categoryLabel}
      {project.status ? (
        <span className={`rounded-full px-3 py-1 ${tone === "dark" ? "bg-ivory/10 text-ivory" : "bg-ink text-ivory"}`}>{project.status}</span>
      ) : null}
    </p>
  );

  const textLink = "group inline-flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.12em] transition-colors";
  const actions = (tone: "light" | "dark") => (
    <div className="hero-fade" style={d(900)}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href={siteVisitHref({ project: project.slug })}
          data-magnetic=""
          className={buttonClasses(tone === "dark" ? "solid-light" : "primary", "lg", "transition-transform")}
        >
          <CalendarCheck aria-hidden="true" className="size-4" />
          Request a site visit
        </Link>
        <a href="#enquire" className={buttonClasses(tone === "dark" ? "ghost-light" : "secondary", "lg")}>
          Enquire
        </a>
      </div>
      {wa || project.brochure ? (
        <div className={`mt-5 flex flex-wrap gap-x-7 gap-y-3 ${tone === "dark" ? "text-stone" : "text-muted"}`}>
          {wa ? (
            <a href={wa} target="_blank" rel="noopener noreferrer" className={`${textLink} ${tone === "dark" ? "hover:text-ivory" : "hover:text-ink"}`}>
              <WhatsAppIcon className="size-4" /> <span className="link-line">WhatsApp our team</span>
            </a>
          ) : null}
          {project.brochure ? (
            <a href={project.brochure.href} download className={`${textLink} ${tone === "dark" ? "hover:text-ivory" : "hover:text-ink"}`}>
              <Download aria-hidden="true" className="size-4" />
              <span className="link-line">{project.brochure.label}</span>
              {project.brochure.sizeLabel ? <span className="font-medium normal-case tracking-normal opacity-70">({project.brochure.sizeLabel})</span> : null}
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  const title = (size: "xl" | "lg") => (
    <>
      <h1 className={`${size === "xl" ? "display-xl" : "display-lg"} hero-words mt-6`}>
        <SplitWords text={project.name} />
      </h1>
      <p className="hero-fade mt-6 flex items-center gap-2 text-[0.8rem] font-medium uppercase tracking-[0.12em] opacity-80" style={d(600)}>
        <MapPin aria-hidden="true" className="size-4 text-gohar" />
        {locationLabel(project)}
      </p>
      {project.tagline ? (
        <p className="hero-fade mt-5 max-w-xl font-display text-[1.7rem] leading-snug opacity-90" style={d(700)}>
          {project.tagline}
        </p>
      ) : null}
    </>
  );

  if (layout === "split") {
    return (
      <section className="bg-ivory pt-28 lg:pt-36">
        <div className="container-site grid gap-12 pb-14 lg:grid-cols-12 lg:items-center lg:gap-16 lg:pb-20">
          <div className="lg:col-span-5">
            <div className="hero-fade" style={d(50)}>
              <Breadcrumbs items={crumbs} />
            </div>
            <div className="mt-10">{badges("light")}</div>
            {title("lg")}
            <div className="mt-10">{actions("light")}</div>
          </div>
          <div className="relative isolate lg:col-span-7">
            <div className="hero-clip relative z-10 aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-ink-3 lg:aspect-[5/4]" style={d(200)}>
              <Image quality={85} src={project.heroImage.src} alt={project.heroImage.alt} fill preload sizes="(min-width: 1024px) 58vw, 100vw" className="page-hero-image object-cover" />
              <ImageKindBadge kind={project.heroImage.kind} className="absolute bottom-4 left-4" />
            </div>
            <span aria-hidden="true" className="hero-fade absolute -bottom-5 -right-5 z-0 hidden h-2/3 w-2/3 rounded-[1.75rem] border border-brass/50 lg:block" style={d(900)} />
          </div>
        </div>
      </section>
    );
  }

  if (layout === "framed") {
    return (
      <section className="grain relative isolate bg-ink pt-28 text-ivory lg:pt-36">
        <div aria-hidden="true" className="arch-grid pointer-events-none absolute inset-0 -z-10" />
        <div className="container-site">
          <div className="hero-fade" style={d(50)}>
            <Breadcrumbs items={crumbs} tone="dark" />
          </div>
          <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              {badges("dark")}
              {title("xl")}
            </div>
            <div className="lg:col-span-4 lg:justify-self-end">{actions("dark")}</div>
          </div>
        </div>
        <div className="container-site mt-12">
          <div className="hero-clip relative aspect-[16/10] overflow-hidden rounded-t-[1.75rem] bg-ink-3 sm:aspect-[16/9] lg:aspect-[21/9]" style={d(300)}>
            <Image quality={85} src={project.heroImage.src} alt={project.heroImage.alt} fill preload sizes="(min-width: 1440px) 85rem, 100vw" className="page-hero-image object-cover" />
            <ImageKindBadge kind={project.heroImage.kind} className="absolute bottom-4 right-4" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="grain relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden bg-ink text-ivory">
      <div className="absolute inset-x-0 -top-[10%] -z-20 h-[120%]" suppressHydrationWarning data-parallax="0.12">
        <Image src={project.heroImage.src} alt={project.heroImage.alt} fill preload sizes="100vw" quality={85} className="page-hero-image object-cover" />
      </div>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/35 to-ink/45" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/75 via-ink/20 to-transparent" />
      <div aria-hidden="true" className="arch-grid hero-fade pointer-events-none absolute inset-0 -z-10" style={d(200)} />
      <div className="container-site pb-10 pt-40 lg:pb-14">
        <div className="hero-fade" style={d(50)}>
          <Breadcrumbs items={crumbs} tone="dark" />
        </div>
        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            {badges("dark")}
            {title("xl")}
          </div>
          <div className="lg:col-span-4 lg:justify-self-end">{actions("dark")}</div>
        </div>
        <dl className="hero-fade mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-[1.25rem] border border-ivory/12 bg-ivory/12 lg:mt-16 lg:grid-cols-4" style={d(1100)}>
          {strip.map((s) => (
            <div key={s.label} className="bg-ink/55 px-5 py-4 backdrop-blur-md">
              <dt className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-brass-light">{s.label}</dt>
              <dd className="mt-1.5 text-[0.92rem] leading-snug">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <ImageKindBadge kind={project.heroImage.kind} className="absolute right-5 top-28 lg:top-32" />
    </section>
  );
}
