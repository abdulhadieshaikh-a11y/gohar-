import type { Metadata } from "next";
import { Suspense } from "react";
import { CalendarCheck, Clock, MapPin, PhoneCall } from "lucide-react";
import { getContactSettings } from "@/lib/content";
import { allProjects } from "@/lib/projects";
import { pageMetadata } from "@/lib/metadata";
import { whatsappNumber } from "@/lib/site";
import { allStories } from "@/lib/stories";
import { PageHero } from "@/components/ui/page-hero";
import { SiteVisitForm, SiteVisitFormFallback } from "@/components/site-visit/site-visit-form";

export const metadata: Metadata = pageMetadata({
  title: "Schedule a Site Visit | Gohar Group",
  absoluteTitle: true,
  description:
    "Request a site visit to a Gohar Group development in Karachi or Hyderabad. Choose a project, preferred date and time, and our team will call you to confirm.",
  path: "/site-visit",
});

export default async function SiteVisitPage() {
  const contact = await getContactSettings();
  const projects = allProjects.map((p) => ({
    slug: p.slug,
    name: p.name,
    area: p.location.area,
    city: p.location.city,
    image: { src: p.heroImage.src, alt: p.heroImage.alt },
  }));
  const storyProjects = Object.fromEntries(allStories.map((s) => [s.slug, { title: s.title, projects: s.relatedProjects }]));
  const steps = [
    { icon: CalendarCheck, title: "Send a request", text: "Choose a project, a preferred day and a time window." },
    { icon: PhoneCall, title: "We call to confirm", text: "Our team checks availability and agrees the visit with you." },
    { icon: MapPin, title: "Visit the site", text: "Meet our team at the project, at the time you agreed." },
  ];

  return (
    <>
      <PageHero
        eyebrow="Site visits"
        title="See a Gohar development"
        accent="in person."
        image={{ src: "/images/projects/141-broadway-heights/dusk.jpg" }}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Request a site visit", href: "/site-visit" },
        ]}
        lead={
          <p>
            Tell us which project you&rsquo;d like to see and when suits you. This is a request: our team will call you to
            confirm a time before your visit.
          </p>
        }
        footer={
          <ol className="grid gap-px overflow-hidden rounded-[1.25rem] border border-ivory/12 bg-ivory/12 sm:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="flex gap-4 bg-ink/60 p-5 backdrop-blur-md lg:p-6">
                <span className="font-display text-4xl leading-none text-brass-light">{i + 1}</span>
                <span>
                  <span className="flex items-center gap-2 font-semibold">
                    <s.icon aria-hidden="true" className="size-4 text-brass-light" />
                    {s.title}
                  </span>
                  <span className="mt-1 block text-[0.88rem] text-stone">{s.text}</span>
                </span>
              </li>
            ))}
          </ol>
        }
      />

      <section aria-label="Site visit request form" className="bg-ivory-2 py-16 lg:py-24">
        <div className="container-site grid gap-12 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-8">
            <Suspense fallback={<SiteVisitFormFallback />}>
              <SiteVisitForm
                projects={projects}
                storyProjects={storyProjects}
                phone={{ display: contact.phoneDisplay, href: contact.phoneHref }}
                whatsappNumber={whatsappNumber || null}
              />
            </Suspense>
          </div>
          <aside className="space-y-8 lg:col-span-4" aria-label="Visiting information">
            <div className="rounded-[1.5rem] border border-line bg-paper p-7">
              <h2 className="eyebrow font-sans text-brass-deep">Visiting hours</h2>
              <p className="mt-4 flex gap-3 text-[0.95rem]">
                <Clock aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brass-deep" />
                <span>
                  {contact.hours}
                  <span className="block text-muted">{contact.closed}</span>
                </span>
              </p>
              <p className="mt-5 text-[0.88rem] leading-relaxed text-muted">
                Time windows are preferences within office hours. We don&rsquo;t show live availability, so every visit is
                confirmed by phone.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-line bg-paper p-7">
              <h2 className="eyebrow font-sans text-brass-deep">Prefer to talk?</h2>
              <a href={contact.phoneHref} className="mt-4 block font-display text-[1.7rem] leading-tight hover:text-brass-deep">
                {contact.phoneDisplay}
              </a>
              <p className="mt-2 text-[0.88rem] text-muted">Call our office to arrange a visit directly.</p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
