/**
 * Verified company information. These values are the defaults; admins can
 * override the contact fields at /admin/settings (stored in the database).
 *
 * Source: https://gohargoc.com/ (contact block and about page, retrieved 22 Oct 2026),
 * plus the client brief. Email confirmed by the client as info@gohargoc.com.
 */
export const company = {
  name: "Gohar Group of Companies",
  shortName: "Gohar Group",
  tagline: "Where Relationships Come First.",
  officialWebsite: "https://gohargoc.com/",
  /** Paraphrased from the official About page. No founding year: the official site gives conflicting years. */
  introduction:
    "Gohar Group of Companies is a Karachi-based group known for real estate development, construction and building. Its portfolio spans apartments, shopping centres, commercial buildings and gated communities in Karachi and Hyderabad.",
  purpose:
    "To build safe, legally sound communities where trust is foundational and relationships always come first.",
  mission:
    "To rebuild and sustain customer loyalty by prioritizing transparent communication, resolving past delivery delays, and proving every day that we believe in relationships.",
  /** The four values published on the official About page ("Our Foundation"). */
  valuesIntro:
    "We build with clarity, serve with intent, and design every interaction around long-term trust.",
  values: [
    {
      number: "01",
      title: "Trust First",
      body: "We believe credibility is earned through transparent communication and consistent delivery.",
    },
    {
      number: "02",
      title: "Design With Purpose",
      body: "Every decision should improve how people live, invest, and experience space.",
    },
    {
      number: "03",
      title: "Excellence In Detail",
      body: "From presentation to execution, quality should be visible in every touchpoint.",
    },
    {
      number: "04",
      title: "Relationships That Last",
      body: "We aim to create long-term value, not short-term transactions.",
    },
  ],
} as const;

export interface ContactSettings {
  phoneDisplay: string;
  phoneHref: string;
  email: string;
  addressLines: string[];
  hours: string;
  closed: string;
  /** Official map link published by the company for the head office. */
  mapUrl: string;
}

export const defaultContact: ContactSettings = {
  phoneDisplay: "+92 21 111 000 061",
  phoneHref: "tel:+9221111000061",
  email: "info@gohargoc.com",
  addressLines: [
    "A/2, Gohar Chamber, CC Area, Shahra-e-Faisal",
    "Near Duty Free Shop, Kathiawar Society Block 7/8",
    "Karachi, Pakistan",
  ],
  hours: "Monday to Saturday, 11:00 AM – 8:00 PM",
  closed: "Sunday: closed",
  mapUrl: "https://maps.google.com/?cid=16029177641268874238",
};

/** Social profiles: none confirmed yet. Add verified URLs here to show them in the footer. */
export const socialLinks: { label: string; href: string }[] = [];
