import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import { buildFaqs } from "@/data/faqs";
import { getContactSettings } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { projectOptions } from "@/lib/projects";
import { whatsappHref, whatsappMessage } from "@/lib/site";
import { ButtonLink } from "@/components/ui/button";
import { PageHero } from "@/components/ui/page-hero";
import { FaqAccordion } from "@/components/ui/faq-accordion";
import { SectionIntro } from "@/components/ui/section-intro";
import { SplitWords } from "@/components/ui/split-words";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { EnquiryForm } from "@/components/forms/enquiry-form";
import { OfficeMap } from "@/components/contact/office-map";
import { SiteVisitCta } from "@/components/site-visit/site-visit-cta";

export const metadata: Metadata = pageMetadata({
  title: "Contact Us",
  description:
    "Call +92 21 111 000 061, email info@gohargoc.com or visit Gohar Chamber, Shahra-e-Faisal, Karachi. Open Monday to Saturday, 11 AM to 8 PM.",
  path: "/contact",
});

export default async function ContactPage() {
  const contact = await getContactSettings();
  const wa = whatsappHref(whatsappMessage());

  const channels = [
    { icon: Phone, label: "Call us (UAN)", value: contact.phoneDisplay, href: contact.phoneHref, note: contact.hours },
    { icon: Mail, label: "Email", value: contact.email, href: `mailto:${contact.email}`, note: "We reply during office hours" },
    ...(wa ? [{ icon: null, label: "WhatsApp", value: "Chat with our team", href: wa, note: "Opens WhatsApp", external: true }] : []),
    { icon: MapPin, label: "Head office", value: "Gohar Chamber, Shahra-e-Faisal", href: contact.mapUrl, note: "Karachi · Get directions", external: true },
  ];

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's talk about"
        accent="your next move."
        image={{ src: "/images/projects/gohar-golf-vista/exterior.webp" }}
        crumbs={[{ label: "Home", href: "/" }, { label: "Contact", href: "/contact" }]}
        lead={<p>Ask about a project, request current pricing or arrange a site visit. Our team is available {contact.hours}.</p>}
      />

      {/* Channels */}
      <section aria-label="Ways to reach us" className="theme-light relative z-10 -mt-px bg-ink pt-12 pb-16 lg:pt-16 lg:pb-24">
        <div className="container-site">
        <ul className={`grid gap-px overflow-hidden rounded-[1.5rem] border border-ivory/10 bg-ivory/10 sm:grid-cols-2 ${channels.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`} data-reveal="stagger">
          {channels.map((c) => (
            <li key={c.label}>
              <a
                href={c.href}
                {...("external" in c && c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="spotlight press group flex h-full flex-col bg-paper p-7 text-ivory transition-colors duration-500 hover:bg-ink-3 lg:p-9"
              >
                <span className="flex items-center justify-between">
                  <span className={`grid size-12 place-items-center rounded-full border transition-colors duration-500 ${c.icon ? "border-ivory/15 text-ivory group-hover:border-ivory group-hover:bg-ivory group-hover:text-ink" : "border-whatsapp/60 text-whatsapp group-hover:bg-whatsapp group-hover:text-ivory"}`}>
                    {c.icon ? <c.icon aria-hidden="true" className="size-5" strokeWidth={1.5} /> : <WhatsAppIcon className="size-5" />}
                  </span>
                  <ArrowUpRight aria-hidden="true" className="size-5 text-stone transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ivory" />
                </span>
                <span className="eyebrow mt-8 text-stone">{c.label}</span>
                <span className="mt-2 font-display text-[1.4rem] leading-tight [overflow-wrap:anywhere] sm:text-[1.6rem]">{c.value}</span>
                <span className="mt-2 text-[0.82rem] text-stone-ink">{c.note}</span>
              </a>
            </li>
          ))}
        </ul>
        </div>
      </section>

      {/* Form + office */}
      <section aria-labelledby="form-title" className="container-site py-20 lg:py-28">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="min-w-0 lg:col-span-7">
            <SectionIntro eyebrow="Send an enquiry" title="Tell us how we can help" id="form-title">
              <p>Fields marked * are required. We only use your details to respond to your enquiry.</p>
            </SectionIntro>
            <div className="relative mt-10 overflow-hidden rounded-[1.5rem] border border-line bg-paper p-6 shadow-[0_40px_80px_-50px_rgb(15_14_13/0.45)] sm:p-10" data-reveal>
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-ink" />
              <EnquiryForm
                projects={projectOptions}
                defaultType="general"
                phone={{ display: contact.phoneDisplay, href: contact.phoneHref }}
                email={contact.email}
              />
            </div>
          </div>
          <aside className="lg:col-span-5" aria-labelledby="office-title">
            <div className="lg:sticky lg:top-32">
              <h2 id="office-title" className="display-md">
                Head office
              </h2>
              <address className="mt-6 flex gap-3 text-[1.02rem] not-italic leading-relaxed text-muted">
                <MapPin aria-hidden="true" className="mt-1 size-5 shrink-0 text-gohar" />
                <span>
                  {contact.addressLines.map((l) => (
                    <span key={l} className="block">
                      {l}
                    </span>
                  ))}
                </span>
              </address>
              <p className="mt-4 flex gap-3 text-[1.02rem] text-muted">
                <Clock aria-hidden="true" className="mt-1 size-5 shrink-0 text-brass-deep" />
                <span>
                  {contact.hours}
                  <span className="block">{contact.closed}</span>
                </span>
              </p>
              <div className="mt-8">
                <OfficeMap query="Gohar Chamber, Shahra-e-Faisal, Kathiawar Society Block 7/8, Karachi" mapUrl={contact.mapUrl} />
              </div>
            </div>
          </aside>
        </div>
      </section>

      <SiteVisitCta
        id="contact-visit"
        title="Would you like to visit a project?"
        image={{ src: "/images/projects/gohar-gateway/courtyard.jpg", alt: "" }}
      />

      {/* FAQ */}
      <section aria-labelledby="faq-title" className="border-t border-line bg-paper py-20 lg:py-28">
        <div className="container-site grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionIntro eyebrow="Questions" title="Frequently asked" id="faq-title" />
          </div>
          <div className="lg:col-span-8">
            <FaqAccordion items={buildFaqs(contact)} structuredData />
          </div>
        </div>
      </section>

      <section className="grain relative isolate overflow-hidden bg-ink py-24 text-center text-ivory lg:py-32">
        <div className="absolute inset-x-0 -top-[10%] -z-20 h-[120%]" suppressHydrationWarning data-parallax="0.08">
          <Image src="/images/projects/kn-gohar-green-city/view-3.jpg" alt="" fill sizes="100vw" quality={50} className="object-cover opacity-30" />
        </div>
        <div className="container-site">
          <h2 className="display-lg mx-auto max-w-3xl" data-reveal="words">
            <SplitWords text="Prefer to see the" /> <SplitWords text="projects first?" em start={4} className="text-brass-light" />
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-stone">Browse all ten Gohar developments across Karachi and Hyderabad.</p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/projects" variant="solid-light" size="lg">
              Explore our projects
            </ButtonLink>
            <ButtonLink href="/gohar-stories" variant="ghost-light" size="lg">
              Read Gohar Stories
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
