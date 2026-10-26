import Image from "next/image";
import Link from "next/link";
import { cacheLife } from "next/cache";
import { ArrowUpRight, CalendarCheck, Clock, Mail, MapPin, Phone } from "lucide-react";
import { company, socialLinks } from "@/data/company";
import { getContactSettings } from "@/lib/content";
import { allProjects } from "@/lib/projects";
import { mainNav } from "@/lib/site";
import { CATEGORY_LABELS, type ProjectCategory } from "@/types/project";
import { buttonClasses } from "@/components/ui/button";
import { SplitWords } from "@/components/ui/split-words";
import { BackToTop } from "./back-to-top";

async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

const categoryOrder: ProjectCategory[] = ["residential", "commercial", "mixed-use", "community"];
const linkClass = "link-line text-stone transition-colors duration-300 hover:text-ivory";

export async function SiteFooter() {
  const contact = await getContactSettings();

  return (
    <footer className="grain relative isolate overflow-hidden bg-ink text-stone">
      
      <div aria-hidden="true" className="arch-grid pointer-events-none absolute inset-0 -z-10" />
      <div aria-hidden="true" className="ambient-glow" />

      {/* Statement + call to action */}
      <div className="container-site pb-20 pt-24 lg:pb-28 lg:pt-32">
        <p className="eyebrow flex items-center gap-4 text-brass-light" data-reveal="fade">
          <span className="brand-dot" aria-hidden="true" />
          {company.name}
        </p>
        <p className="display-xl mt-8 max-w-5xl text-ivory" data-reveal="words">
          <SplitWords text="Let's build your" /> <SplitWords text="next chapter." em start={3} className="text-ivory/40" />
        </p>
        <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:flex-wrap" data-reveal>
          <Link href="/site-visit" data-magnetic="" className={buttonClasses("solid-light", "lg", "transition-transform")}>
            <CalendarCheck aria-hidden="true" className="size-4" /> Request a site visit
          </Link>
          <Link href="/contact" className={buttonClasses("ghost-light", "lg")}>
            Contact our team <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
          <a href={contact.phoneHref} className={buttonClasses("ghost-light", "lg")}>
            <Phone aria-hidden="true" className="size-4" /> {contact.phoneDisplay}
          </a>
        </div>
      </div>

      <div className="container-site">
        <div className="h-px bg-ivory/12" data-reveal="line" aria-hidden="true" />
      </div>

      {/* Columns */}
      <div className="container-site grid gap-14 py-16 lg:grid-cols-12 lg:gap-8 lg:py-20">
        <div className="lg:col-span-4">
          <Link href="/" className="relative block h-[58px] w-[183px]" aria-label="Gohar Group of Companies, home">
            <Image quality={85} src="/images/brand/gohar-logo-light-trim.png" alt="" fill sizes="183px" className="object-contain object-left" />
          </Link>
          <p className="mt-7 font-display text-[1.6rem] leading-[1.1] text-ivory">{company.tagline}</p>
          <p className="mt-4 max-w-sm text-[0.9rem] leading-relaxed text-stone-ink">{company.introduction}</p>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-5">
          <div>
            <h2 className="eyebrow font-sans text-ivory">Explore</h2>
            <ul className="mt-6 space-y-3 text-[0.9rem]">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/site-visit" className={linkClass}>
                  Request a site visit
                </Link>
              </li>
              <li>
                <Link href="/privacy" className={linkClass}>
                  Privacy Policy
                </Link>
              </li>
            </ul>
            <h2 className="eyebrow mt-10 font-sans text-ivory">Categories</h2>
            <ul className="mt-6 space-y-3 text-[0.9rem]">
              {categoryOrder.map((c) => (
                <li key={c}>
                  <Link href={`/projects?category=${c}`} className={linkClass}>
                    {CATEGORY_LABELS[c]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="sm:col-span-2">
            <h2 className="eyebrow font-sans text-ivory">Projects</h2>
            <ul className="mt-6 grid gap-x-6 gap-y-3 text-[0.9rem] sm:grid-cols-2">
              {allProjects.map((p) => (
                <li key={p.slug}>
                  <Link href={`/projects/${p.slug}`} className={linkClass}>
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="lg:col-span-3">
          <h2 className="eyebrow font-sans text-ivory">Head office</h2>
          <address className="mt-6 space-y-4 text-[0.9rem] not-italic leading-relaxed">
            <a href={contact.mapUrl} target="_blank" rel="noopener noreferrer" className="group flex gap-3">
              <MapPin aria-hidden="true" className="mt-1 size-4 shrink-0 text-brass-light" />
              <span className="transition-colors group-hover:text-ivory">
                {contact.addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
                <span className="sr-only">(opens Google Maps in a new tab)</span>
              </span>
            </a>
            <p className="flex gap-3">
              <Phone aria-hidden="true" className="mt-1 size-4 shrink-0 text-brass-light" />
              <a href={contact.phoneHref} className={linkClass}>
                {contact.phoneDisplay}
              </a>
            </p>
            <p className="flex gap-3">
              <Mail aria-hidden="true" className="mt-1 size-4 shrink-0 text-brass-light" />
              <a href={`mailto:${contact.email}`} className={linkClass}>
                {contact.email}
              </a>
            </p>
            <p className="flex gap-3">
              <Clock aria-hidden="true" className="mt-1 size-4 shrink-0 text-brass-light" />
              <span>
                {contact.hours}
                <span className="block text-stone-ink">{contact.closed}</span>
              </span>
            </p>
          </address>
          {socialLinks.length > 0 ? (
            <ul className="mt-6 flex flex-wrap gap-4 text-[0.85rem]">
              {socialLinks.map((s) => (
                <li key={s.href}>
                  <a href={s.href} rel="noopener noreferrer" target="_blank" className="inline-flex items-center gap-1 hover:text-ivory">
                    {s.label}
                    <ArrowUpRight aria-hidden="true" className="size-3.5" />
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      {/* Oversized official logo as the closing signature */}
      <div className="container-site" aria-hidden="true">
        <div className="relative mx-auto aspect-[1748/556] w-full max-w-[64rem] opacity-[0.09]" data-reveal="fade">
          <Image quality={85} src="/images/brand/gohar-logo-light-trim.png" alt="" fill sizes="(min-width: 1024px) 64rem, 100vw" className="object-contain" />
        </div>
      </div>

      <div className="border-t border-ivory/10">
        <div className="container-site flex flex-col gap-4 py-7 text-[0.78rem] text-stone-ink sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; <CurrentYear /> {company.name}. All rights reserved.
          </p>
          <p className="max-w-md">Architectural renders are artist&rsquo;s impressions and may differ from the completed buildings.</p>
          <BackToTop />
        </div>
      </div>
    </footer>
  );
}
