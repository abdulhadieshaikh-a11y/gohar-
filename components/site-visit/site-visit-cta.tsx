import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CalendarCheck } from "lucide-react";
import { whatsappHref, whatsappMessage } from "@/lib/site";
import { siteVisitHref } from "@/lib/site-visits/href";
import { buttonClasses } from "@/components/ui/button";
import { SplitWords } from "@/components/ui/split-words";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";

export { siteVisitHref };

interface SiteVisitCtaProps {
  projectSlug?: string;
  projectName?: string;
  /** Story slug, when the CTA sits inside an article. */
  from?: string;
  eyebrow?: string;
  title?: string;
  text?: string;
  image?: { src: string; alt: string };
  id?: string;
}

const STEPS = ["Request a date and time", "We call to confirm", "Meet us on site"];

/**
 * Signature Gohar-red card inviting the visitor to request a site visit.
 * The project photograph is blended into the red as a duotone; a light
 * follows the pointer; the calendar mark turns on hover.
 */
export function SiteVisitCta({
  projectSlug,
  projectName,
  from,
  eyebrow = "Request a site visit",
  title,
  text = "Choose a project, a preferred date and a time window. Our team will call you to confirm availability. Visits are confirmed only once we have spoken to you.",
  image,
  id,
}: SiteVisitCtaProps) {
  const wa = whatsappHref(whatsappMessage(projectName));
  const heading = title ?? (projectName ? `See ${projectName} in person` : "See our developments in person");
  return (
    <section id={id} aria-labelledby={id ? `${id}-title` : undefined} className="scroll-mt-28 py-10 lg:py-14">
      <div className="container-site">
        <div
          className="theme-light spotlight group relative isolate overflow-hidden rounded-[2rem] border border-line bg-ivory-2 text-ivory shadow-[0_40px_80px_-50px_rgb(0_0_0/0.25)]"
          style={{ ["--spot" as string]: "rgb(231 46 52 / 0.06)" }}
          data-reveal="mask"
        >
          {image ? (
            <div className="absolute inset-x-0 -top-[12%] -z-10 h-[124%] mix-blend-luminosity" suppressHydrationWarning data-parallax="0.07">
              <Image src={image.src} alt={image.alt} fill sizes="(min-width: 1440px) 85rem, 100vw" quality={55} className="object-cover opacity-[0.08]" />
            </div>
          ) : null}
          <span aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full border border-ivory/10 transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110" />
          <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 size-52 rounded-full border border-ivory/10 transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-125" />

          <div className="grid gap-12 p-8 sm:p-12 lg:grid-cols-12 lg:items-end lg:p-16">
            <div className="lg:col-span-7">
              <p className="flex items-center gap-4 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-ivory/80">
                <span className="grid size-12 place-items-center rounded-full border border-ivory/30 bg-ivory/10 text-ivory transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-[-8deg] group-hover:scale-110">
                  <CalendarCheck aria-hidden="true" className="size-5" strokeWidth={1.5} />
                </span>
                {eyebrow}
              </p>
              <h2 id={id ? `${id}-title` : undefined} className="display-lg mt-7" data-reveal="words">
                <SplitWords text={heading} />
              </h2>
              <p className="mt-6 max-w-xl leading-relaxed text-ivory/80">{text}</p>
            </div>
            <div className="lg:col-span-5">
              <ol className="mb-8 grid gap-px overflow-hidden rounded-2xl border border-ivory/15 bg-ivory/15 sm:grid-cols-3 lg:grid-cols-1">
                {STEPS.map((s, i) => (
                  <li key={s} className="flex items-center gap-4 bg-gohar-ink/40 px-5 py-3.5 text-[0.9rem] backdrop-blur-sm">
                    <span className="font-display text-[1.6rem] leading-none text-ivory/70">{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                <Link href={siteVisitHref({ project: projectSlug, from })} data-magnetic="" className={buttonClasses("on-red", "lg", "transition-transform")}>
                  <CalendarCheck aria-hidden="true" className="size-4" />
                  Request a site visit
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </Link>
                {wa ? (
                  <a href={wa} target="_blank" rel="noopener noreferrer" className={buttonClasses("ghost-light", "lg")}>
                    <WhatsAppIcon className="size-4" /> WhatsApp
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
