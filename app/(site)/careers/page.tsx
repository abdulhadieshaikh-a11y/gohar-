import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Briefcase, FileCheck2, FileUp, Inbox, MapPin, PhoneCall } from "lucide-react";
import { company } from "@/data/company";
import { vacancies } from "@/data/careers";
import { getContactSettings, getProjects } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { ButtonLink, buttonClasses } from "@/components/ui/button";
import { ImageKindBadge } from "@/components/ui/image-kind-badge";
import { PageHero } from "@/components/ui/page-hero";
import { SectionIntro } from "@/components/ui/section-intro";
import { SplitWords } from "@/components/ui/split-words";
import { CareerForm } from "@/components/forms/career-form";

export const metadata: Metadata = pageMetadata({
  title: "Careers",
  description:
    "Careers at Gohar Group of Companies, a Karachi-based real estate developer and builder. See current openings and send your CV for future opportunities.",
  path: "/careers",
});

const steps = [
  { icon: FileUp, title: "Send your details", body: "Complete the form and attach your CV (PDF or Word, up to 4 MB)." },
  { icon: Inbox, title: "We keep them on file", body: "Your application is stored securely and reviewed by our team when a suitable role opens." },
  { icon: PhoneCall, title: "We get in touch", body: "If your experience matches an opening, we'll contact you by phone or email to discuss next steps." },
];

export default async function CareersPage() {
  const [contact, projects] = await Promise.all([getContactSettings(), getProjects()]);
  const by = (slug: string) => projects.find((p) => p.slug === slug)!;
  const imageOf = (slug: string, file: string) => {
    const p = by(slug);
    return p.gallery.find((g) => g.src.endsWith(file)) ?? p.heroImage;
  };
  // The kinds of work the group does (from the verified portfolio), each linking to a real project.
  const work = [
    { label: "Homes", text: "Apartment towers and family residences.", slug: "gohar-golf-vista", image: imageOf("gohar-golf-vista", "balconies.webp") },
    { label: "Commerce", text: "Shopping centres, shops and offices.", slug: "gohar-green-corner-shopping-center", image: imageOf("gohar-green-corner-shopping-center", "street-view.jpg") },
    { label: "Communities", text: "Gated, master-planned neighbourhoods.", slug: "kn-gohar-green-city", image: imageOf("kn-gohar-green-city", "photo-garden-walk.jpg") },
  ];

  return (
    <>
      <PageHero
        eyebrow="Careers at Gohar"
        title="Build what Karachi"
        accent="calls home."
        image={{ src: "/images/projects/gohar-residencia-shopping-mall/render-001.webp" }}
        crumbs={[{ label: "Home", href: "/" }, { label: "Careers", href: "/careers" }]}
        lead={
          <p>
            Join a team developing apartments, shopping centres and communities across Karachi and Hyderabad, where
            relationships come first: with customers and with each other.
          </p>
        }
      >
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
          <a href="#apply" className={buttonClasses("solid-light", "lg")}>
            Send your CV <ArrowDown aria-hidden="true" className="size-4" />
          </a>
          <a href="#openings" className={buttonClasses("ghost-light", "lg")}>
            View openings
          </a>
        </div>
      </PageHero>

      {/* Values */}
      <section aria-labelledby="why-title" className="container-site py-28 lg:py-36">
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionIntro eyebrow="Working at Gohar" title="A team shaped by our values" index={1} id="why-title">
              <p>{company.introduction}</p>
              <p className="mt-4">{company.valuesIntro}</p>
            </SectionIntro>
          </div>
          <ol className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
            {company.values.map((v, i) => (
              <li
                key={v.title}
                className="spotlight group relative overflow-hidden rounded-[1.5rem] border border-line bg-paper p-8 transition-[border-color,transform,box-shadow] duration-500 hover:-translate-y-1 hover:border-ink/25 hover:shadow-[0_30px_60px_-40px_rgb(0_0_0/0.35)] lg:p-9"
                data-reveal
                style={{ ["--reveal-delay" as string]: `${i * 80}ms` }}
              >
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-gohar transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100" />
                <span className="font-display text-6xl text-ink/20 transition-colors duration-500 group-hover:text-ink">{v.number}</span>
                <h3 className="mt-6 text-[1.9rem] leading-tight">{v.title}</h3>
                <p className="mt-3 leading-relaxed text-muted">{v.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* The work */}
      <section aria-labelledby="work-title" className="pb-28 lg:pb-36">
        <div className="container-site">
          <SectionIntro eyebrow="The work" title="What our teams deliver" index={2} id="work-title">
            <p>Every role at Gohar contributes to buildings people live, shop and work in.</p>
          </SectionIntro>
          <ul className="mt-14 grid gap-5 md:grid-cols-3">
            {work.map((w, i) => (
              <li key={w.label} data-reveal style={{ ["--reveal-delay" as string]: `${i * 110}ms` }}>
                <Link href={`/projects/${w.slug}`} className="press group relative block aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-ink-3 text-ivory" data-cursor="View">
                  <span className="zoom-media absolute inset-0">
                    <Image quality={85} src={w.image.src} alt={w.image.alt} fill sizes="(min-width: 768px) 32vw, 100vw" className="object-cover" />
                  </span>
                  <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent transition-opacity duration-700 group-hover:opacity-90" />
                  <span aria-hidden="true" className="absolute inset-x-6 bottom-[7.5rem] h-px origin-left scale-x-0 bg-gohar transition-transform duration-700 group-hover:scale-x-100" />
                  <span className="absolute inset-x-6 bottom-6">
                    <span className="num text-[0.72rem] text-gohar">{String(i + 1).padStart(2, "0")}</span>
                    <span className="mt-2 block font-display text-[2.6rem] leading-none">{w.label}</span>
                    <span className="mt-2 flex items-center justify-between gap-3 text-[0.9rem] text-stone">
                      {w.text}
                      <ArrowUpRight aria-hidden="true" className="size-4 shrink-0 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  </span>
                  <ImageKindBadge kind={w.image.kind} className="absolute left-5 top-5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Openings */}
      <section id="openings" aria-labelledby="openings-title" className="scroll-mt-24 bg-ink py-28 text-ivory lg:py-36">
        <div className="container-site">
          <SectionIntro eyebrow="Current openings" title="Opportunities at Gohar" tone="dark" index={3} id="openings-title" />
          {vacancies.length === 0 ? (
            <div
              className="surface-red spotlight group mt-14 overflow-hidden rounded-[2rem] p-8 shadow-[0_50px_100px_-50px_rgb(0_0_0/0.6)] sm:p-12 lg:p-16"
              style={{ ["--spot" as string]: "rgb(255 210 200 / 0.14)" }}
              data-reveal="mask"
            >
              <div aria-hidden="true" className="arch-grid pointer-events-none absolute inset-0 -z-10 opacity-60" />
              <span aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full border border-ivory/10 transition-transform duration-[1400ms] group-hover:scale-110" />
              <div className="grid gap-10 lg:grid-cols-[auto_1fr_auto] lg:items-center">
                <span className="grid size-20 place-items-center rounded-full border border-ivory/30 bg-ivory/10 transition-transform duration-700 group-hover:rotate-[-8deg] group-hover:scale-105">
                  <Briefcase aria-hidden="true" className="size-8" strokeWidth={1.3} />
                </span>
                <div>
                  <p className="eyebrow text-ivory/75">General application</p>
                  <h3 className="mt-3 font-display text-[clamp(2.2rem,4vw,3.4rem)] leading-[1.04]">No open positions right now</h3>
                  <p className="mt-4 max-w-xl leading-relaxed text-ivory/80">
                    There are no vacancies advertised at the moment. New roles are published here as soon as they are approved.
                    In the meantime, send us your CV and we&rsquo;ll keep it on file for future opportunities.
                  </p>
                </div>
                <a href="#apply" data-magnetic="" className={buttonClasses("on-red", "lg", "transition-transform")}>
                  <FileUp aria-hidden="true" className="size-4" /> Send your CV
                </a>
              </div>
            </div>
          ) : (
            <ul className="mt-14 grid gap-5 md:grid-cols-2">
              {vacancies.map((v) => (
                <li
                  key={v.id}
                  className="spotlight group relative overflow-hidden rounded-[1.5rem] border border-ivory/15 bg-ink-2 p-8 transition-[border-color,transform] duration-500 hover:-translate-y-1 hover:border-ivory/40 lg:p-10"
                  style={{ ["--spot" as string]: "rgb(231 46 52 / 0.18)" }}
                  data-reveal
                >
                  <span aria-hidden="true" className="absolute inset-y-0 left-0 w-[3px] origin-top scale-y-0 bg-gohar transition-transform duration-700 group-hover:scale-y-100" />
                  <p className="flex flex-wrap items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-brass-light">
                    <span className="rounded-full bg-ivory px-3 py-1 text-ink">{v.type}</span>
                    {v.department}
                    <span className="flex items-center gap-1 text-stone">
                      <MapPin aria-hidden="true" className="size-3.5 text-gohar" /> {v.location}
                    </span>
                  </p>
                  <h3 className="mt-5 font-display text-[2.2rem] leading-tight">{v.title}</h3>
                  <p className="mt-3 text-stone">{v.summary}</p>
                  <details className="mt-6 border-t border-ivory/10 pt-4">
                    <summary className="cursor-pointer text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-brass-light">
                      Responsibilities and requirements
                    </summary>
                    <div className="mt-4 grid gap-6 sm:grid-cols-2">
                      <ul className="list-disc space-y-1 pl-5 text-[0.92rem] text-stone">
                        {v.responsibilities.map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                      <ul className="list-disc space-y-1 pl-5 text-[0.92rem] text-stone">
                        {v.requirements.map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  </details>
                  <a href="#apply" className={buttonClasses("primary", "md", "mt-7")}>
                    Apply for this role <ArrowUpRight aria-hidden="true" className="size-4" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Process: a red line draws through the three steps */}
      <section aria-labelledby="process-title" className="container-site py-28 lg:py-36">
        <SectionIntro eyebrow="How it works" title="The application process" index={4} id="process-title" />
        <div className="relative mt-16">
          <span aria-hidden="true" className="absolute left-0 right-0 top-7 hidden h-px bg-line md:block" />
          <span aria-hidden="true" className="absolute left-0 right-0 top-7 hidden h-px origin-left bg-gohar md:block" data-reveal="line" />
          <ol className="grid gap-12 md:grid-cols-3 md:gap-8" data-reveal="stagger">
            {steps.map((s, i) => (
              <li key={s.title} className="relative">
                <span className="relative z-10 grid size-14 place-items-center rounded-full border border-ink/15 bg-ivory text-ink">
                  <s.icon aria-hidden="true" className="size-5" strokeWidth={1.5} />
                </span>
                <span className="num mt-8 block text-[0.72rem] text-brass-deep">Step {String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-2 text-[2rem] leading-tight">{s.title}</h3>
                <p className="mt-3 max-w-sm leading-relaxed text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Apply */}
      <section id="apply" aria-labelledby="apply-title" className="scroll-mt-24 bg-ivory-2 py-28 lg:py-36">
        <div className="container-site grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <SectionIntro eyebrow="Send your CV" title="Send us your details" index={5} id="apply-title">
                <p>
                  {vacancies.length === 0
                    ? "Register your interest for future roles. Fields marked * are required."
                    : "Apply for an advertised role or register your interest. Fields marked * are required."}
                </p>
              </SectionIntro>
              <div className="mt-10 rounded-[1.25rem] border border-line bg-paper p-6" data-reveal>
                <p className="flex items-center gap-3 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-ink">
                  <FileCheck2 aria-hidden="true" className="size-4" /> Your CV
                </p>
                <ul className="mt-4 space-y-2 text-[0.92rem] text-ink">
                  <li>PDF, DOC or DOCX</li>
                  <li>Up to 4 MB</li>
                  <li>Stored securely; only our team can open it</li>
                </ul>
              </div>
              <p className="mt-8 text-[0.88rem] leading-relaxed text-muted" data-reveal>
                Questions about careers? Email{" "}
                <a href={`mailto:${contact.email}?subject=${encodeURIComponent("Careers enquiry")}`} className="font-medium text-ink underline underline-offset-2">
                  {contact.email}
                </a>{" "}
                or call {contact.phoneDisplay}.
              </p>
            </div>
          </div>
          <div className="relative min-w-0 overflow-hidden rounded-[1.5rem] border border-line bg-paper p-6 shadow-[0_40px_80px_-50px_rgb(15_14_13/0.45)] sm:p-10 lg:col-span-8" data-reveal>
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-ink" />
            <CareerForm vacancies={vacancies.map((v) => ({ id: v.id, title: v.title }))} email={contact.email} />
          </div>
        </div>
      </section>

      <section className="container-site py-24 text-center lg:py-28">
        <h2 className="display-lg mx-auto max-w-3xl" data-reveal="words">
          <SplitWords text="Curious about" /> <SplitWords text="our work?" em start={2} className="text-brass-deep" />
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-muted" data-reveal>
          Explore the developments our teams have delivered and are building today.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row" data-reveal>
          <ButtonLink href="/projects" size="lg">
            Explore projects
          </ButtonLink>
          <ButtonLink href="/about" size="lg" variant="secondary">
            About Gohar
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
