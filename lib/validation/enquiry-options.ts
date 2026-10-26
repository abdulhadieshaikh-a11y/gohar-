/**
 * Enquiry form options (no validation library), so pages can render the form
 * without downloading Zod up front. The schema itself lives in ./enquiry.ts.
 */

export const ENQUIRY_TYPES = [
  { value: "sales", label: "Project or sales enquiry" },
  { value: "site-visit", label: "Schedule a site visit" },
  { value: "general", label: "General enquiry" },
  { value: "careers", label: "Careers" },
  { value: "other", label: "Other" },
] as const;

export type EnquiryType = (typeof ENQUIRY_TYPES)[number]["value"];

/** City options as offered on the official contact form. */
export const CITY_OPTIONS = [
  "Karachi",
  "Hyderabad",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Overseas",
  "Other",
] as const;

export const NO_PROJECT = "none";
