import type { ContactSettings } from "@/data/company";
import { projects } from "@/data/projects";
import type { FaqItem } from "@/components/ui/faq-accordion";

/**
 * Buyer FAQs. Every answer is built from verified data (project records and
 * contact settings), never from assumptions about prices or availability.
 */
export function buildFaqs(contact: ContactSettings): FaqItem[] {
  const withPlans = projects.filter((p) => p.paymentPlan).map((p) => p.name);
  const withBrochures = projects.filter((p) => p.brochure).map((p) => p.name);
  const list = (names: string[]) =>
    names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)}` : (names[0] ?? "");

  return [
    {
      question: "How do I enquire about a project?",
      answer: `Use the enquiry form on any project page or on our contact page, call our UAN ${contact.phoneDisplay}, or email ${contact.email}. Our team responds during office hours (${contact.hours}).`,
    },
    {
      question: "Can I visit a project site?",
      answer:
        "Yes. Choose “Schedule a site visit” as the enquiry type on the form and tell us the project and the days that suit you. Our team will contact you to arrange the visit.",
    },
    {
      question: "Are payment plans available?",
      answer: `Payment plans are published for ${list(withPlans)}. Plans and terms change over time, so please ask our sales team for the current details for the project you are interested in.`,
    },
    {
      question: "Why are prices not shown on the website?",
      answer:
        "Prices and availability change, and we want you to receive accurate figures. Request current pricing through the enquiry form or by phone and our team will share the latest details.",
    },
    {
      question: "I live overseas. Can I enquire?",
      answer:
        "Yes. Select “Overseas” as your city on the enquiry form and include an international phone number. Our team will contact you by phone or email.",
    },
    {
      question: "Where can I download a brochure?",
      answer: `Official brochures and presentations are available on the project pages for ${list(withBrochures)}. For other projects, ask our team for the latest material.`,
    },
    {
      question: "Where is your head office?",
      answer: `${contact.addressLines.join(", ")}. We are open ${contact.hours}. ${contact.closed}.`,
    },
  ];
}
