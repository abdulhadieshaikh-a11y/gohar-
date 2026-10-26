import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { getContactSettings } from "@/lib/content";
import { projectOptions } from "@/lib/projects";
import type { EnquiryType } from "@/lib/validation/enquiry";
import { SectionIntro } from "@/components/ui/section-intro";
import { EnquiryForm } from "./enquiry-form";

interface EnquirySectionProps {
  eyebrow?: string;
  title?: string;
  intro?: string;
  projectSlug?: string;
  projectName?: string;
  defaultType?: EnquiryType;
  id?: string;
}

/** Two-column enquiry block: contact details + form. Used on home, project and contact pages. */
export async function EnquirySection({
  eyebrow = "Enquire",
  title = "Speak with our team",
  intro = "Tell us what you are looking for. A member of our team will contact you during office hours.",
  projectSlug,
  projectName,
  defaultType = "sales",
  id = "enquire",
}: EnquirySectionProps) {
  const contact = await getContactSettings();
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="bg-ivory-2 py-20 lg:py-28">
      <div className="container-site grid gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="min-w-0 lg:col-span-5">
          <SectionIntro eyebrow={eyebrow} title={title} id={`${id}-title`}>
            <p>{intro}</p>
          </SectionIntro>
          <dl className="mt-10 space-y-6 border-t border-stone pt-8 text-[0.95rem]" data-reveal>
            <div className="flex gap-4">
              <dt>
                <Phone aria-hidden="true" className="mt-0.5 size-5 text-brass-deep" />
                <span className="sr-only">Telephone</span>
              </dt>
              <dd>
                <a href={contact.phoneHref} className="font-semibold hover:text-brass-deep">
                  {contact.phoneDisplay}
                </a>
              </dd>
            </div>
            <div className="flex gap-4">
              <dt>
                <Mail aria-hidden="true" className="mt-0.5 size-5 text-brass-deep" />
                <span className="sr-only">Email</span>
              </dt>
              <dd>
                <a href={`mailto:${contact.email}`} className="font-semibold hover:text-brass-deep">
                  {contact.email}
                </a>
              </dd>
            </div>
            <div className="flex gap-4">
              <dt>
                <Clock aria-hidden="true" className="mt-0.5 size-5 text-brass-deep" />
                <span className="sr-only">Office hours</span>
              </dt>
              <dd className="text-muted">
                {contact.hours}
                <span className="block">{contact.closed}</span>
              </dd>
            </div>
            <div className="flex gap-4">
              <dt>
                <MapPin aria-hidden="true" className="mt-0.5 size-5 text-brass-deep" />
                <span className="sr-only">Head office</span>
              </dt>
              <dd className="text-muted">
                {contact.addressLines.map((l) => (
                  <span key={l} className="block">
                    {l}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
        </div>
        <div className="min-w-0 lg:col-span-7" data-reveal>
          <div className="bg-paper p-6 shadow-[0_30px_60px_-40px_rgb(27_26_23/0.35)] sm:p-10">
            <EnquiryForm
              projects={projectOptions}
              defaultProject={projectSlug}
              lockedProjectName={projectName}
              defaultType={defaultType}
              phone={{ display: contact.phoneDisplay, href: contact.phoneHref }}
              email={contact.email}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
