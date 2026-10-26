import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";
import { company } from "@/data/company";
import { getContactSettings } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: "How Gohar Group of Companies collects, uses and protects personal information submitted through this website.",
  path: "/privacy",
});

/**
 * DRAFT. This policy describes what the website actually does (see
 * lib/validation/enquiry.ts, app/api/enquiries/route.ts, lib/db/schema.ts).
 * It must be reviewed by a qualified lawyer before publication.
 */
export default async function PrivacyPage() {
  const contact = await getContactSettings();
  const sections = [
    {
      id: "who-we-are",
      title: "1. Who we are",
      body: (
        <>
          <p>
            This website is operated by {company.name} (&ldquo;Gohar Group&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;), whose head
            office is at {contact.addressLines.join(", ")}.
          </p>
          <p>
            For any question about this policy or your personal information, email{" "}
            <a href={`mailto:${contact.email}`} className="underline underline-offset-2">
              {contact.email}
            </a>{" "}
            or call {contact.phoneDisplay}.
          </p>
        </>
      ),
    },
    {
      id: "what-we-collect",
      title: "2. Information we collect",
      body: (
        <>
          <p>When you send an enquiry through this website, we collect:</p>
          <ul>
            <li>your name, email address and telephone number;</li>
            <li>your city (optional), the project you are interested in, the type of enquiry and your message;</li>
            <li>the date and time you gave consent and the page you sent the enquiry from;</li>
            <li>
              a one-way, salted hash of your internet (IP) address. We use it only to prevent spam and abuse, and we do
              not store the address itself.
            </li>
          </ul>
          <p>
            When you request a site visit, we collect your name, telephone number, email address (optional), the project,
            your preferred date and time, the number of visitors, any message, and the time you gave consent. We use them
            only to arrange and confirm the visit, and keep them for the same period as enquiries.
          </p>
          <p>
            When you send your details through the Careers page, we collect your name, email address, telephone number,
            city (optional), the role you are interested in, an optional profile link and note, and your CV file. CVs are
            stored in our database and can only be opened by authorised staff.
          </p>
          <p>
            We do not use advertising or analytics cookies, and we do not track you across other websites. The website
            sets a cookie only when our staff sign in to the administration area.
          </p>
        </>
      ),
    },
    {
      id: "how-we-use",
      title: "3. How we use your information",
      body: (
        <ul>
          <li>to respond to your enquiry and provide the information you asked for, such as project details, pricing or a site visit;</li>
          <li>to keep a record of our communication with you;</li>
          <li>to protect the website against spam, fraud and misuse.</li>
        </ul>
      ),
    },
    {
      id: "legal-basis",
      title: "4. Why we may use it",
      body: (
        <p>
          We process enquiry information because you asked us to contact you and gave your consent when you submitted the
          form. You can withdraw your consent at any time by contacting us. This does not affect communication that took
          place before you withdrew it.
        </p>
      ),
    },
    {
      id: "sharing",
      title: "5. Who we share it with",
      body: (
        <>
          <p>We do not sell your personal information. We share it only with:</p>
          <ul>
            <li>authorised Gohar Group staff who handle enquiries;</li>
            <li>
              service providers that host the website and its database and deliver our internal email notifications. They
              process the information only on our instructions;
            </li>
            <li>authorities, where the law requires us to.</li>
          </ul>
        </>
      ),
    },
    {
      id: "third-party",
      title: "6. Maps and external links",
      body: (
        <p>
          The map on our contact page is provided by Google and loads only if you choose to view it. Google&rsquo;s own
          privacy policy then applies. Links to Google Maps for directions open Google&rsquo;s website.
        </p>
      ),
    },
    {
      id: "retention",
      title: "7. How long we keep it",
      body: (
        <p>
          We keep enquiry records for as long as we need them to respond to you and maintain our customer records, and in
          any case no longer than two years after your last contact with us, unless the law requires us to keep them
          longer. Enquiries marked as spam are deleted sooner. Careers applications and CVs are kept for up to one year so
          we can consider you for future roles, unless you ask us to delete them earlier.
        </p>
      ),
    },
    {
      id: "security",
      title: "8. How we protect it",
      body: (
        <p>
          Information is sent to us over an encrypted connection (HTTPS). Access to the administration area is restricted
          to authorised staff with individual accounts, and passwords are stored only in hashed form.
        </p>
      ),
    },
    {
      id: "rights",
      title: "9. Your choices and rights",
      body: (
        <p>
          You can ask us for a copy of the personal information we hold about you, or ask us to correct or delete it, by
          emailing{" "}
          <a href={`mailto:${contact.email}`} className="underline underline-offset-2">
            {contact.email}
          </a>
          . We will respond within a reasonable time and may need to confirm your identity first.
        </p>
      ),
    },
    {
      id: "changes",
      title: "10. Changes to this policy",
      body: <p>We may update this policy from time to time. The current version is always published on this page.</p>,
    },
  ];

  return (
    <>
      <section className="bg-ink pb-14 pt-36 text-ivory lg:pt-44">
        <div className="container-site">
          <Breadcrumbs
            tone="dark"
            items={[
              { label: "Home", href: "/" },
              { label: "Privacy Policy", href: "/privacy" },
            ]}
          />
          <h1 className="mt-10 text-5xl leading-[1.02] sm:text-6xl">Privacy Policy</h1>
        </div>
      </section>

      <div className="container-site py-16 lg:py-24">
        <div className="mx-auto max-w-3xl">
          <div role="note" className="flex gap-3 border-l-2 border-brass bg-ivory-2 p-5 text-[0.9rem]">
            <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-brass-deep" />
            <p>
              <strong>Draft for legal review.</strong> This policy describes how this website currently handles personal
              information. It has not yet been reviewed by a lawyer and should be checked against applicable law in Pakistan
              (and for overseas visitors where relevant) before it is relied on.
            </p>
          </div>

          <nav aria-label="Policy sections" className="mt-12 border-y border-line py-6">
            <ol className="grid gap-2 text-[0.92rem] sm:grid-cols-2">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-muted hover:text-ink">
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="mt-12 space-y-12">
            {sections.map((s) => (
              <section key={s.id} id={s.id} aria-labelledby={`${s.id}-title`} className="scroll-mt-32">
                <h2 id={`${s.id}-title`} className="text-3xl">
                  {s.title}
                </h2>
                <div className="mt-4 space-y-4 leading-[1.75] text-muted [&_li]:pl-1 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
                  {s.body}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
