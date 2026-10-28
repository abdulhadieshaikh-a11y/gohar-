import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, CalendarCheck, Info, MapPin, Navigation } from "lucide-react";
import { getContactSettings, getProject, getProjects } from "@/lib/content";
import { locationLabel, projectSlugs, toCardData } from "@/lib/projects";
import { absoluteUrl, whatsappHref, whatsappMessage } from "@/lib/site";
import { storiesForProject, toStoryCard } from "@/lib/stories";
import { SiteVisitCta, siteVisitHref } from "@/components/site-visit/site-visit-cta";
import { StoryCard } from "@/components/stories/story-card";
import type { Project } from "@/types/project";
import { buttonClasses } from "@/components/ui/button";
import { SectionIntro } from "@/components/ui/section-intro";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { EnquirySection } from "@/components/forms/enquiry-section";
import { AmenityIcon } from "@/components/projects/amenity-icon";
import { MobileActionBar } from "@/components/projects/mobile-action-bar";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectGallery } from "@/components/projects/project-gallery";
import { ProjectHero } from "@/components/projects/project-hero";
import { ProjectPager } from "@/components/projects/project-pager";
import { SectionNav } from "@/components/projects/section-nav";
import { JsonLd } from "@/components/seo/json-ld";

export function generateStaticParams() {
  return projectSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Project not found", robots: { index: false } };
  const url = `/projects/${project.slug}`;
  return {
    title: { absolute: `${project.seo.title} | Gohar Group` },
    description: project.seo.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: project.seo.title,
      description: project.seo.description,
      images: [
        {
          url: project.heroImage.src,
          width: project.heroImage.width,
          height: project.heroImage.height,
          alt: project.heroImage.alt,
        },
      ],
    },
    twitter: { card: "summary_large_image", title: project.seo.title, description: project.seo.description },
  };
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const [all, contact] = await Promise.all([getProjects(), getContactSettings()]);
  const index = all.findIndex((p) => p.slug === project.slug);
  const prev = all[(index - 1 + all.length) % all.length]!;
  const next = all[(index + 1) % all.length]!;
  const related = project.relatedSlugs
    .map((s) => all.find((p) => p.slug === s))
    .filter((p): p is Project => !!p)
    .slice(0, 3);

  const stories = storiesForProject(project.slug).map(toStoryCard);
  const floorPlans = project.floorPlans ?? [];
  const plansAreMasterplans = floorPlans.length > 0 && floorPlans.every((p) => p.kind === "masterplan");

  const sections = [
    { id: "overview", label: "Overview" },
    ...(project.unitTypes?.length ? [{ id: "layouts", label: "Layouts" }] : []),
    ...(floorPlans.length ? [{ id: "plans", label: plansAreMasterplans ? "Masterplans" : "Floor plans" }] : []),
    ...(project.amenities?.length ? [{ id: "amenities", label: "Amenities" }] : []),
    { id: "gallery", label: "Gallery" },
    ...(project.payment ? [{ id: "payment", label: "Payment plans" }] : []),
    { id: "location", label: "Location" },
    { id: "visit", label: "Site visit" },
    { id: "enquire", label: "Enquire" },
    ...(stories.length ? [{ id: "stories", label: "Stories" }] : []),
  ];

  const mapHref =
    project.location.mapUrl ??
    (project.location.address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(project.location.address)}`
      : undefined);
  const wa = whatsappHref(whatsappMessage(project.name));

  // Key details strip: verified fields only.
  const keyDetails = [
    { label: "Category", value: project.categoryLabel },
    { label: "Location", value: locationLabel(project) },
    ...(project.status ? [{ label: "Status", value: project.status }] : []),
    ...project.facts.slice(0, project.status ? 2 : 3),
  ];

  return (
    <>
      <ProjectHero project={project} />

      {/* Key details (the full-bleed hero already shows them in its glass strip) */}
      {(project.heroLayout ?? "full") !== "full" ? (
      <section aria-label="Key details" className="border-b border-line bg-paper">
        <dl className={`container-site grid grid-cols-2 ${keyDetails.length >= 5 ? "lg:grid-cols-5" : keyDetails.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
          {keyDetails.map((d, i) => (
            <div key={d.label} className={`border-line py-6 pr-4 lg:px-6 lg:first:pl-0 ${i > 0 ? "lg:border-l" : ""} ${i >= 2 ? "border-t lg:border-t-0" : ""}`}>
              <dt className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-brass-deep">{d.label}</dt>
              <dd className="mt-2 text-[0.98rem] font-medium leading-snug">{d.value}</dd>
            </div>
          ))}
        </dl>
      </section>
      ) : null}

      <SectionNav sections={sections} label={`${project.name} sections`} />

      {/* Overview + key facts */}
      <section id="overview" aria-labelledby="overview-title" className="container-site scroll-mt-40 py-20 lg:py-28">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="min-w-0 lg:col-span-7">
            <SectionIntro
              eyebrow={project.storyTitle ? "Project story" : "Overview"}
              title={project.storyTitle ?? project.summary}
              id="overview-title"
            />
            <div className="prose-site mt-8 max-w-2xl text-[1.08rem] leading-[1.8] text-muted" data-reveal>
              {project.overview.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
          <aside className="min-w-0 lg:col-span-5" aria-labelledby="facts-title" data-reveal>
            <div className="sticky top-32 rounded-[1.5rem] border border-line bg-paper p-7 shadow-[0_40px_80px_-50px_rgb(15_14_13/0.45)] sm:p-9">
              <h2 id="facts-title" className="eyebrow font-sans text-brass-deep">
                Project specifications
              </h2>
              <dl className="mt-6 divide-y divide-line">
                {project.facts.map((f) => (
                  <div key={f.label} className="grid gap-1 py-3.5 sm:grid-cols-[8.5rem_1fr] sm:gap-4">
                    <dt className="text-[0.82rem] text-muted">{f.label}</dt>
                    <dd className="text-[0.95rem] font-medium">{f.value}</dd>
                  </div>
                ))}
                {project.paymentPlan ? (
                  <div className="grid gap-1 py-3.5 sm:grid-cols-[8.5rem_1fr] sm:gap-4">
                    <dt className="text-[0.82rem] text-muted">Payment</dt>
                    <dd className="text-[0.95rem] font-medium">{project.paymentPlan}</dd>
                  </div>
                ) : null}
                <div className="grid gap-1 py-3.5 sm:grid-cols-[8.5rem_1fr] sm:gap-4">
                  <dt className="text-[0.82rem] text-muted">Pricing</dt>
                  <dd className="text-[0.95rem] font-medium">
                    {project.payment ? (
                      <a href="#payment" className="underline decoration-brass underline-offset-4 hover:text-brass-deep">
                        Published plans below; confirm current prices
                      </a>
                    ) : (
                      "On request"
                    )}
                  </dd>
                </div>
              </dl>
              <div className="mt-7 flex flex-col gap-3">
                <Link href={siteVisitHref({ project: project.slug })} className={buttonClasses("primary", "md")}>
                  <CalendarCheck aria-hidden="true" className="size-4" /> Request a site visit
                </Link>
                <a href="#enquire" className={buttonClasses("secondary", "md")}>
                  Request current pricing
                </a>
                {wa ? (
                  <a href={wa} target="_blank" rel="noopener noreferrer" className={buttonClasses("secondary", "md")}>
                    <WhatsAppIcon className="size-4" /> Ask on WhatsApp
                  </a>
                ) : (
                  <a href={contact.phoneHref} className={buttonClasses("secondary", "md")}>
                    Call {contact.phoneDisplay}
                  </a>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Layouts / unit types */}
      {project.unitTypes?.length ? (
        <section id="layouts" aria-labelledby="layouts-title" className="theme-light relative isolate scroll-mt-40 overflow-hidden border-y border-line bg-ivory-2 py-20 text-ivory lg:py-28">
          <div className="container-site">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <SectionIntro eyebrow="Layouts" title={project.unitTypesHeading ?? "Layouts"} id="layouts-title" />
              <p className="max-w-sm text-[0.88rem] text-stone-ink" data-reveal>
                Contact our team for detailed layouts and current availability.
              </p>
            </div>
            <ul className="mt-12 grid gap-px overflow-hidden rounded-[1.5rem] border border-ivory/10 bg-ivory/10 sm:grid-cols-2 lg:grid-cols-3">
              {project.unitTypes.map((u, i) => (
                <li
                  key={u.name}
                  className="group bg-ink p-8 transition-colors duration-500 hover:bg-ink-3 lg:p-10"
                  data-reveal
                  style={{ ["--reveal-delay" as string]: `${i * 90}ms` }}
                >
                  <p className="font-display text-6xl text-brass-light/80 transition-colors group-hover:text-brass-light">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-8 text-[2rem] leading-tight">{u.name}</h3>
                  <p className="mt-3 text-stone">{u.description}</p>
                  {u.detail ? <p className="eyebrow mt-5 text-brass-light">{u.detail}</p> : null}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* Floor plans / masterplans from official material */}
      {floorPlans.length ? (
        <section id="plans" aria-labelledby="plans-title" className="scroll-mt-40 border-b border-line py-20 lg:py-28">
          <div className="container-site">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <SectionIntro
                eyebrow={plansAreMasterplans ? "Masterplans" : "Plans"}
                title={plansAreMasterplans ? "How the community is laid out" : "Floor plans"}
                id="plans-title"
              />
              <p className="max-w-sm text-[0.85rem] text-muted" data-reveal>
                From the official {project.brochure ? project.brochure.label.toLowerCase() : "project material"}. Select a plan
                to view it full screen. Layouts may change; ask our team for the latest plans.
              </p>
            </div>
            <div className="mt-12" data-reveal>
              <ProjectGallery
                projectName={`${project.name} plans`}
                images={floorPlans.map(({ src, alt, kind, width, height }) => ({ src, alt, kind, width, height }))}
                fit="contain"
              />
            </div>
          </div>
        </section>
      ) : null}

      {/* Amenities */}
      {project.amenities?.length ? (
        <section id="amenities" aria-labelledby="amenities-title" className="container-site scroll-mt-40 py-20 lg:py-28">
          <SectionIntro eyebrow="Amenities" title="Shared spaces and facilities" id="amenities-title">
            {project.amenitiesNote ? <p className="text-[0.9rem]">{project.amenitiesNote}</p> : null}
          </SectionIntro>
          <ul className="mt-12 grid gap-px overflow-hidden rounded-[1.5rem] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {project.amenities.map((a, i) => (
              <li
                key={a}
                className="group flex flex-col gap-8 bg-ivory p-7 transition-colors duration-500 hover:bg-paper"
                data-reveal
                style={{ ["--reveal-delay" as string]: `${i * 70}ms` }}
              >
                <span className="grid size-14 place-items-center rounded-full border border-brass/40 text-brass-deep transition-colors duration-500 group-hover:bg-ink group-hover:text-brass-light">
                  <AmenityIcon label={a} className="size-6" />
                </span>
                <span className="font-display text-[1.6rem] leading-tight">{a}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Gallery */}
      <section
        id="gallery"
        aria-labelledby="gallery-title"
        className={`scroll-mt-40 py-20 lg:py-28 ${project.amenities?.length ? "bg-paper" : ""}`}
      >
        <div className="container-site">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionIntro eyebrow="Gallery" title={`Inside ${project.name}`} id="gallery-title" />
            <p className="max-w-sm text-[0.85rem] text-muted" data-reveal>
              {project.gallery.length} {project.gallery.length === 1 ? "image" : "images"}. Each is labelled as a photograph or an
              architectural render. Renders are artist&rsquo;s impressions and may differ from the completed building.
            </p>
          </div>
          <div className="mt-12" data-reveal>
            <ProjectGallery
              projectName={project.name}
              images={project.gallery.map(({ src, alt, kind, width, height }) => ({ src, alt, kind, width, height }))}
            />
          </div>
        </div>
      </section>

      {/* Published payment plans */}
      {project.payment ? (
        <section id="payment" aria-labelledby="payment-title" className="theme-light relative isolate scroll-mt-40 overflow-hidden border-y border-line bg-ivory-2 py-20 text-ivory lg:py-28">
          <div className="container-site">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <SectionIntro eyebrow="Payment plans" title="Published prices & instalments" id="payment-title" />
              <p className="max-w-md text-[0.88rem] leading-relaxed text-stone" data-reveal>
                As published on the official Gohar website (read on{" "}
                {new Date(`${project.payment.retrievedOn}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                ). Prices and terms can change: please confirm current figures and availability with our sales team before
                booking.
              </p>
            </div>
            <ul className="mt-12 grid gap-px overflow-hidden rounded-[1.5rem] border border-ivory/10 bg-ivory/10 md:grid-cols-2 xl:grid-cols-3">
              {project.payment.options.map((o, i) => (
                <li key={`${o.name}-${o.description}-${i}`} className="flex flex-col bg-ink p-7 lg:p-8" data-reveal style={{ ["--reveal-delay" as string]: `${(i % 3) * 80}ms` }}>
                  <p className="eyebrow text-brass-light">{o.name}</p>
                  {o.description ? <p className="mt-2 text-[0.95rem] capitalize text-stone">{o.description}</p> : null}
                  <p className="mt-6 font-display text-[1.9rem] leading-tight">{o.total}</p>
                  <p className="text-[0.7rem] uppercase tracking-[0.12em] text-stone-ink">Total, as published</p>
                  {o.terms ? <p className="mt-5 border-t border-ivory/10 pt-5 text-[0.88rem] leading-relaxed text-stone">{o.terms}</p> : null}
                </li>
              ))}
            </ul>
            {project.payment.notes?.length ? (
              <ul className="mt-8 space-y-2">
                {project.payment.notes.map((n) => (
                  <li key={n} className="flex gap-3 text-[0.88rem] text-stone">
                    <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brass-light" />
                    {n}
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a href="#enquire" className={buttonClasses("solid-light", "lg")}>
                Confirm current pricing
              </a>
              {wa ? (
                <a href={wa} target="_blank" rel="noopener noreferrer" className={buttonClasses("ghost-light", "lg")}>
                  <WhatsAppIcon className="size-4" /> Ask on WhatsApp
                </a>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {/* Location */}
      <section id="location" aria-labelledby="location-title" className="scroll-mt-40 border-t border-line py-20 lg:py-28">
        <div className="container-site grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionIntro eyebrow="Location" title={locationLabel(project)} id="location-title" />
            {project.location.address ? (
              <address className="mt-8 flex gap-3 text-[1.05rem] not-italic leading-relaxed text-muted" data-reveal>
                <MapPin aria-hidden="true" className="mt-1 size-5 shrink-0 text-gohar" />
                {project.location.address}
              </address>
            ) : null}
            {mapHref ? (
              <a href={mapHref} target="_blank" rel="noopener noreferrer" className={buttonClasses("secondary", "lg", "mt-8")}>
                <Navigation aria-hidden="true" className="size-4" />
                {project.location.mapUrl ? "Get directions" : "Find on Google Maps"}
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            ) : null}
          </div>
          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-7" data-reveal>
            {project.location.landmarks?.length ? (
              <div>
                <h3 className="eyebrow font-sans text-brass-deep">Nearby</h3>
                <ul className="mt-5">
                  {project.location.landmarks.map((l) => (
                    <li key={l} className="flex gap-3 border-b border-line py-3.5">
                      <span className="mt-2 size-1.5 shrink-0 bg-gohar" aria-hidden="true" />
                      {l}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {project.location.connectivity?.length ? (
              <div>
                <h3 className="eyebrow font-sans text-brass-deep">Road access</h3>
                <ul className="mt-5">
                  {project.location.connectivity.map((l) => (
                    <li key={l} className="flex gap-3 border-b border-line py-3.5">
                      <Navigation aria-hidden="true" className="mt-1 size-4 shrink-0 text-brass" />
                      {l}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {!project.location.landmarks?.length && !project.location.connectivity?.length ? (
              <p className="text-muted sm:col-span-2">
                For directions and a site visit, contact our team. We&rsquo;ll be glad to arrange a viewing.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <SiteVisitCta
        id="visit"
        projectSlug={project.slug}
        projectName={project.name}
        image={{ src: (project.gallery[1] ?? project.heroImage).src, alt: "" }}
      />

      <EnquirySection
        eyebrow="Enquire"
        title={`Enquire about ${project.name}`}
        intro="Ask about availability, current pricing or payment plans. Our team will contact you during office hours."
        projectSlug={project.slug}
        projectName={project.name}
        defaultType={project.enquiry.defaultType}
      />

      {stories.length > 0 ? (
        <section id="stories" aria-labelledby="stories-title" className="scroll-mt-40 border-b border-line bg-paper py-20 lg:py-28">
          <div className="container-site">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <SectionIntro eyebrow="Gohar Stories" title={`News & stories about ${project.name}`} id="stories-title" />
              <Link href="/gohar-stories" className={buttonClasses("text")}>
                All stories <ArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
            <ul className="mt-12 grid gap-x-8 gap-y-12 md:grid-cols-3">
              {stories.slice(0, 3).map((s) => (
                <li key={s.slug}>
                  <StoryCard story={s} sizes="(min-width: 768px) 30vw, 100vw" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section aria-labelledby="related-title" className="container-site py-20 lg:py-28">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionIntro eyebrow="Continue exploring" title="Related projects" id="related-title" />
            <Link href="/projects" className={buttonClasses("text")}>
              All projects <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
          <ul className="mt-12 grid gap-x-8 gap-y-12 md:grid-cols-3">
            {related.map((p) => (
              <li key={p.slug}>
                <ProjectCard project={toCardData(p)} sizes="(min-width: 768px) 30vw, 100vw" />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <ProjectPager prev={prev} next={next} />
      <div className="h-14 lg:hidden" aria-hidden="true" />
      <MobileActionBar
        projectName={project.name}
        projectSlug={project.slug}
        phone={{ display: contact.phoneDisplay, href: contact.phoneHref }}
      />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Place",
          name: project.name,
          description: project.summary,
          url: absoluteUrl(`/projects/${project.slug}`),
          image: project.gallery.map((g) => absoluteUrl(g.src)),
          address: {
            "@type": "PostalAddress",
            streetAddress: project.location.address,
            addressLocality: project.location.city,
            addressCountry: "PK",
          },
          ...(project.location.mapUrl ? { hasMap: project.location.mapUrl } : {}),
        }}
      />
    </>
  );
}
