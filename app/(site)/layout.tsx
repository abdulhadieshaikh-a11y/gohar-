import { company } from "@/data/company";
import { getContactSettings } from "@/lib/content";
import { absoluteUrl, siteUrl } from "@/lib/site";
import { JsonLd } from "@/components/seo/json-ld";
import { SiteChrome } from "@/components/layout/site-chrome";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const contact = await getContactSettings();
  return (
    <>
      <SiteChrome>{children}</SiteChrome>
      {/* Local business data, built only from verified company details. No ratings or reviews. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "@id": `${siteUrl}/#organization`,
          name: company.name,
          slogan: company.tagline,
          url: siteUrl,
          logo: absoluteUrl("/images/brand/gohar-logo-dark.png"),
          image: absoluteUrl("/images/projects/gohar-gateway/exterior.webp"),
          telephone: contact.phoneHref.replace("tel:", ""),
          email: contact.email,
          address: {
            "@type": "PostalAddress",
            streetAddress: "A/2, Gohar Chamber, CC Area, Shahra-e-Faisal, near Duty Free Shop, Kathiawar Society Block 7/8",
            addressLocality: "Karachi",
            addressRegion: "Sindh",
            addressCountry: "PK",
          },
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
              opens: "11:00",
              closes: "20:00",
            },
          ],
          areaServed: ["Karachi", "Hyderabad"],
        }}
      />
    </>
  );
}
