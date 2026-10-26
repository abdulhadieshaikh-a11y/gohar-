/**
 * Central project content model.
 *
 * Rule of thumb: if a fact is not confirmed by the company or its official
 * website, leave the optional field out. Components hide sections that have
 * no data instead of inventing filler.
 */

export type ProjectCategory = "residential" | "commercial" | "mixed-use" | "community";

/** How an image relates to reality. Shown to visitors next to every image. */
export type ImageKind =
  | "photograph" // a real photograph of the built project / site
  | "render" // official architectural render or CGI (artist's impression)
  | "masterplan" // official masterplan / site-plan visual
  | "floor-plan"
  | "placeholder"; // temporary, must be replaced before launch

export type VerificationStatus =
  | "verified-official" // taken from the official website / company material, association confirmed by source page
  | "needs-confirmation" // official source, but something about it (type, association) needs client sign-off
  | "unverified";

export type UsagePermission =
  | "client-approved"
  | "assumed-client-owned" // published by the company on its own website; written confirmation still recommended
  | "unknown";

export interface ProjectImage {
  /** Path under /public, e.g. /images/projects/gohar-towers/exterior.jpg */
  src: string;
  width: number;
  height: number;
  alt: string;
  kind: ImageKind;
  /** Where the file came from (URL or document reference). */
  source: string;
  verification: VerificationStatus;
  permission: UsagePermission;
  /** Optional note shown in the asset manifest only. */
  note?: string;
}

export interface ProjectFact {
  label: string;
  value: string;
}

export interface UnitType {
  name: string;
  description: string;
  /** e.g. "Towers 1 & 2" */
  detail?: string;
}

export interface ProjectBrochure {
  label: string;
  /** Path under /public/documents or an absolute official URL. */
  href: string;
  sizeLabel?: string;
  source: string;
}

/** One row of a payment plan exactly as published by the company. */
export interface PaymentOption {
  /** e.g. "Type A" or "Phase 1" */
  name: string;
  /** e.g. "5 rooms apartment" or "120 sq yd residential plot" */
  description?: string;
  /** Total as published, e.g. "PKR 19,320,000" */
  total: string;
  /** Instalment terms as published. */
  terms?: string;
}

export interface PaymentOptions {
  options: PaymentOption[];
  /** Where and when the figures were read (shown with the table). */
  source: string;
  retrievedOn: string;
  /** Inconsistencies or caveats visible in the published figures. */
  notes?: string[];
}

export interface ProjectLocation {
  city: "Karachi" | "Hyderabad";
  /** Short area label used for filtering and cards, e.g. "DHA Phase 1". */
  area: string;
  /** Full address as published by the company. */
  address?: string;
  landmarks?: string[];
  connectivity?: string[];
  /** Official Google Maps link published by the company. */
  mapUrl?: string;
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  category: ProjectCategory;
  /** Display label, preserves official wording (e.g. "Residential & Commercial Community"). */
  categoryLabel: string;
  location: ProjectLocation;
  /** Headline / tagline as published, optional. */
  tagline?: string;
  /** One or two sentence summary for cards and meta descriptions. */
  summary: string;
  /** Longer narrative paragraphs (verified content only). */
  overview: string[];
  /** Headline of the official "project story", shown above the overview paragraphs. */
  storyTitle?: string;
  /** Status as published by the company, e.g. "Completed". */
  status?: string;
  /** Payment-plan availability as published (prices intentionally omitted). */
  paymentPlan?: string;
  facts: ProjectFact[];
  unitTypes?: UnitType[];
  /** Heading for the unit section, e.g. "Apartment categories" or "Plot sizes". */
  unitTypesHeading?: string;
  amenities?: string[];
  /** Where the amenity list comes from, when it is not the current project page. */
  amenitiesNote?: string;
  /** Published prices and instalment plans (shown with source, date and a "confirm with sales" note). */
  payment?: PaymentOptions;
  /** Official floor plans and site plans. */
  floorPlans?: ProjectImage[];
  heroImage: ProjectImage;
  /**
   * Hero composition, chosen to suit the project's imagery:
   * "full" full-bleed image · "split" text panel beside the image ·
   * "framed" image set inside an ivory frame.
   */
  heroLayout?: "full" | "split" | "framed";
  gallery: ProjectImage[];
  brochure?: ProjectBrochure;
  seo: { title: string; description: string };
  relatedSlugs: string[];
  enquiry: {
    enabled: boolean;
    /** Default enquiry type preselected on this project's form. */
    defaultType: "sales" | "site-visit" | "general";
  };
  featured: boolean;
  /** Sort weight for "featured order" (lower first). */
  order: number;
  /** Where the content came from and what still needs confirming. */
  provenance: {
    sourceUrl: string;
    retrievedOn: string;
    notes: string[];
  };
}

/** The subset of project data safe and useful to send to client components. */
export interface ProjectCardData {
  slug: string;
  name: string;
  category: ProjectCategory;
  categoryLabel: string;
  city: string;
  area: string;
  summary: string;
  status?: string;
  image: Pick<ProjectImage, "src" | "alt" | "kind" | "width" | "height">;
  order: number;
}

export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  residential: "Residential",
  commercial: "Commercial",
  "mixed-use": "Mixed Use",
  community: "Communities",
};

export const IMAGE_KIND_LABELS: Record<ImageKind, string> = {
  photograph: "Photograph",
  render: "Architectural render",
  masterplan: "Masterplan visual",
  "floor-plan": "Floor plan",
  placeholder: "Image pending",
};
