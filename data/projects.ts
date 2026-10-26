import type { PaymentOptions, Project, ProjectImage } from "@/types/project";

/**
 * THE single source of truth for project content.
 *
 * Every fact below comes from the official project pages on https://gohargoc.com/,
 * the official presentation books the company publishes there, or official
 * Gohar Stories articles (all retrieved 22 Oct 2026). Published prices are shown
 * only inside `payment`, always with their source, retrieval date and a note
 * that the sales team must confirm current figures. Anything that could not be
 * confirmed is left out and listed in `provenance.notes`.
 *
 * To add a project: add an object to `projects`, put its images in
 * public/images/projects/<slug>/, and run `npm test` (the data-integrity test
 * checks slugs, image files and related-project references).
 */

const RETRIEVED = "2026-10-22";
const UPLOADS = "https://gohargoc.com/wp-content/uploads";

function officialImage(
  slug: string,
  file: string,
  sourcePath: string,
  width: number,
  height: number,
  alt: string,
  kind: ProjectImage["kind"],
  extra: Partial<Pick<ProjectImage, "verification" | "permission" | "note">> = {},
): ProjectImage {
  return {
    src: `/images/projects/${slug}/${file}`,
    width,
    height,
    alt,
    kind,
    source: `${UPLOADS}/${sourcePath}`,
    verification: extra.verification ?? "verified-official",
    permission: extra.permission ?? "assumed-client-owned",
    note: extra.note,
  };
}

/** An image cut from one of the official presentation books in /public/documents. */
function brochureImage(
  slug: string,
  file: string,
  pdfSourcePath: string,
  page: string,
  width: number,
  height: number,
  alt: string,
  kind: ProjectImage["kind"],
  note?: string,
): ProjectImage {
  return {
    src: `/images/projects/${slug}/${file}`,
    width,
    height,
    alt,
    kind,
    source: `${UPLOADS}/${pdfSourcePath} (${page})`,
    verification: "verified-official",
    permission: "assumed-client-owned",
    note,
  };
}

function published(source: string, options: PaymentOptions["options"], notes?: string[]): PaymentOptions {
  return { options, source, retrievedOn: RETRIEVED, notes };
}

/* ------------------------------------------------------------------ */
/* 141 Broadway Heights                                                */
/* ------------------------------------------------------------------ */
const broadway = "141-broadway-heights";
const BROADWAY_BOOK = "2026/08/Broadway-Presentation-Book.pdf";
const broadwayImages = {
  dusk: officialImage(broadway, "dusk.jpg", "2026/08/dusk-new-broadway-141.jpg", 2560, 1440,
    "141 Broadway Heights at dusk, aerial render of the tower with its illuminated rooftop terraces", "render"),
  exterior: officialImage(broadway, "exterior.jpg", "2026/08/cam-03-HR.jpg.jpeg", 2048, 2560,
    "141 Broadway Heights street-level render showing the white residential tower above its commercial podium", "render"),
  rooftop: officialImage(broadway, "rooftop-pool.jpg", "2026/08/Ani-Cam-9.jpg.jpeg", 1920, 1080,
    "141 Broadway Heights: aerial render of the rooftop with the glass-edged infinity pool, deck and garden", "render"),
  terrace: officialImage(broadway, "terrace.jpg", "2026/08/Terrace-1.jpg.jpeg", 1920, 1080,
    "Render of a glass-balustraded terrace at 141 Broadway Heights", "render"),
  living: officialImage(broadway, "living.jpg", "2026/08/Living.jpg.jpeg", 2500, 1406,
    "Interior render of a living room at 141 Broadway Heights with floor-to-ceiling windows", "render"),
  bedroom: officialImage(broadway, "bedroom.jpg", "2026/08/Bedroom.jpg.jpeg", 1920, 1080,
    "Interior render of a bedroom at 141 Broadway Heights opening onto a balcony", "render"),
};
const broadwayPlans = [
  brochureImage(broadway, "plan-basement.jpg", BROADWAY_BOOK, "presentation book, basement plan", 2110, 2266,
    "141 Broadway Heights basement plan: ramp to ground, 18 ft driveway, ten parking bays, prayer area, lifts and underground water tank", "floor-plan"),
  brochureImage(broadway, "plan-typical-residential.jpg", BROADWAY_BOOK, "presentation book, residential floor plan", 2110, 2266,
    "141 Broadway Heights residential floor plan: apartment types A2, A3, A4, B, B1 and B2 arranged around a 33 by 15 ft courtyard, with passenger and cargo lifts", "floor-plan"),
  brochureImage(broadway, "plan-roof.jpg", BROADWAY_BOOK, "presentation book, roof plan", 2110, 2266,
    "141 Broadway Heights roof plan: 16 by 41 ft swimming pool, roof deck, rooftop garden, kitchen and toilets", "floor-plan"),
];

/* ------------------------------------------------------------------ */
/* Other image sets                                                    */
/* ------------------------------------------------------------------ */
const complexImg = officialImage("gohar-complex-shopping-mall", "exterior.jpg", "2026/06/gohar-complex.jpg", 2400, 2400,
  "Gohar Complex & Shopping Mall, a group of residential towers above ground-floor shops in Model Colony, Karachi", "render", {
    verification: "needs-confirmation",
    note: "Appears to be a render; the project is marked complete, so an actual photograph would be preferable.",
  });

const gateway = "gohar-gateway";
const gatewayImages = {
  exterior: officialImage(gateway, "exterior.webp", "2026/06/Building_cam_06.webp", 2500, 1406,
    "Gohar Gateway, Hyderabad: render of the curved, terraced mixed-use building with parking in front", "render"),
  aerial: officialImage(gateway, "aerial-courtyard.webp", "2026/06/Building_cam_03.webp", 2000, 1125,
    "Gohar Gateway: aerial render looking down into the landscaped courtyard between the terraced wings", "render", {
      note: "Used by the company as the cover image of its June 2026 Gohar Gateway article.",
    }),
  courtyard: officialImage(gateway, "courtyard.jpg", "2026/07/Building_cam_01.jpg", 2000, 1125,
    "Gohar Gateway: render of the curved residential wings and planted terraces framing the central courtyard", "render", {
      note: "Same render series (Building_cam_01/03/06) as the official project image; not shown on the project page itself.",
    }),
  hotelTower: officialImage(gateway, "hotel-tower.jpg", "2026/06/gohar_gateway_44876.png", 1000, 2300,
    "Gohar Gateway: tall render of the cylindrical tower with its diamond-pattern facade rising above the boulevard", "render", {
      verification: "needs-confirmation",
      note: "Official media library file named gohar_gateway; imported 27 Oct 2026. Confirm which building of the Gateway it shows.",
    }),
};

const golf = "gohar-golf-vista";
const golfSeriesNote = "Same render series (CAM2/9/10/11/13) and building as the official project image; from the official media library.";
const golfImages = {
  hero: officialImage(golf, "exterior.webp", "2026/06/CAM9-0-00-00-00-scaled.webp", 2560, 1440,
    "Gohar Golf Vista: render of the residential tower rising above tree-lined grounds near the ACACIA golf course", "render"),
  course: officialImage(golf, "golf-course.webp", "2026/06/CAM2-0-00-00-00-1-scaled.webp", 2000, 1125,
    "Gohar Golf Vista: render of the towers seen across the lakes and fairways of the neighbouring golf course", "render", {
      note: "Also the cover image of the official article '5 Essential Tips Before Buying Your Dream Property'.",
    }),
  aerial: officialImage(golf, "towers-aerial.webp", "2026/06/CAM10-0-00-00-00-scaled.webp", 2000, 1125,
    "Gohar Golf Vista: elevated render of the residential blocks beside the golf course greens", "render", { note: golfSeriesNote }),
  facade: officialImage(golf, "facade-detail.webp", "2026/06/CAM11-0-00-00-00-scaled.webp", 2000, 1125,
    "Gohar Golf Vista: upward render of the curved balconies on the tower facades", "render", { note: golfSeriesNote }),
  balconies: officialImage(golf, "balconies.webp", "2026/06/CAM13-0-00-00-00-scaled.webp", 2000, 1125,
    "Gohar Golf Vista: render of the stepped, rounded balconies at the top of the tower", "render", { note: golfSeriesNote }),
};

const greenCorner = "gohar-green-corner-shopping-center";
const GREEN_CORNER_BOOK = "2026/07/Gohar-Green-Corner-Shopping-Center-Presentation-Book.pdf";
const greenCornerImages = {
  hero: officialImage(greenCorner, "exterior.jpg", "2026/06/green-corner-1-scaled.jpg", 2560, 2200,
    "Gohar Green Corner & Shopping Center: render of the six-level commercial building with a red-brick grid facade", "render"),
  brochure: brochureImage(greenCorner, "brochure-exterior.jpg", GREEN_CORNER_BOOK, "presentation book, cover", 2000, 1333,
    "Gohar Green Corner & Shopping Center: render of the building's corner elevation with its glazed tower and brick-framed bays", "render"),
  street: brochureImage(greenCorner, "street-view.jpg", GREEN_CORNER_BOOK, "presentation book, lower-ground page", 2000, 1371,
    "Gohar Green Corner & Shopping Center: street-level render of the shopfronts and entrance along the main road", "render"),
};
const greenCornerPlans = [
  brochureImage(greenCorner, "plan-basement.jpg", GREEN_CORNER_BOOK, "presentation book, basement floor plan", 2000, 1371,
    "Gohar Green Corner basement floor plan: parking on the triangular plot", "floor-plan"),
  brochureImage(greenCorner, "plan-lower-ground.jpg", GREEN_CORNER_BOOK, "presentation book, lower ground floor plan", 2000, 1371,
    "Gohar Green Corner lower ground floor plan: commercial outlets", "floor-plan"),
  brochureImage(greenCorner, "plan-upper-ground.jpg", GREEN_CORNER_BOOK, "presentation book, upper ground floor plan", 2000, 1371,
    "Gohar Green Corner upper ground floor plan: commercial outlets", "floor-plan"),
  brochureImage(greenCorner, "plan-1st-4th.jpg", GREEN_CORNER_BOOK, "presentation book, 1st & 4th floor plan", 2000, 1371,
    "Gohar Green Corner 1st and 4th floor plan: commercial outlets", "floor-plan"),
  brochureImage(greenCorner, "plan-2nd-3rd-5th.jpg", GREEN_CORNER_BOOK, "presentation book, 2nd, 3rd & 5th floor plan", 2000, 1371,
    "Gohar Green Corner 2nd, 3rd and 5th floor plan: commercial outlets", "floor-plan"),
];

const rabiImg = officialImage("gohar-rabi-center", "day-view.jpg", "2026/06/Gohar-Rabi-Day-View-scaled.jpg", 2560, 1495,
  "Gohar Rabi Center, PECHS: daytime render of the arched, classically detailed commercial facade", "render");

const residencia = "gohar-residencia-shopping-mall";
const residenciaImages = {
  r010: officialImage(residencia, "render-010.webp", "2026/06/ARCH-PAKISTAN-HIRES-RENDER-GOHAR-010-scaled.webp", 2560, 1440,
    "Gohar Residencia & Shopping Mall: aerial render of the residential towers above the shopping podium", "render"),
  r008: officialImage(residencia, "render-008.webp", "2026/06/ARCH-PAKISTAN-HIRES-RENDER-GOHAR-008-scaled.webp", 2560, 1440,
    "Gohar Residencia & Shopping Mall: render of the full development seen across Gulshan-e-Maymar", "render"),
  r005: officialImage(residencia, "render-005.webp", "2026/06/ARCH-PAKISTAN-HIRES-RENDER-GOHAR-005-scaled.webp", 2560, 1440,
    "Gohar Residencia & Shopping Mall: street-level render of the entrance canopy and palm-lined approach", "render"),
  r001: officialImage(residencia, "render-001.webp", "2026/06/ARCH-PAKISTAN-HIRES-RENDER-GOHAR-001-scaled.webp", 2560, 1440,
    "Gohar Residencia & Shopping Mall: close render of the tower facades with balconies and screens", "render"),
  street: officialImage(residencia, "street-view.jpg", "2026/06/residencia-01.png", 2560, 1441,
    "Gohar Residencia & Shopping Mall: street-level render of the towers with lamp posts and planting along the boulevard", "render", {
      note: "Official media library (10,094 px original), imported 27 Oct 2026.",
    }),
  aerial: officialImage(residencia, "aerial.jpg", "2026/06/residencia-02.png", 2560, 1440,
    "Gohar Residencia & Shopping Mall: high aerial render of the courtyard towers within the surrounding neighbourhood", "render", {
      note: "Official media library (10,095 px original), imported 27 Oct 2026.",
    }),
};

const towersImg = officialImage("gohar-towers", "exterior.jpg", "2026/06/WhatsApp-Image-2026-06-12-at-8.30.16-PM-1.jpeg", 2560, 1659,
  "Gohar Towers, Gulshan-e-Iqbal: the completed residential towers photographed on a clear day", "photograph", {
    verification: "needs-confirmation",
    note: "Appears to be a real photograph (file originated from WhatsApp). Confirm it is Gohar Towers and that a higher-resolution original exists. Upscaled 1600 -> 2560 px (Lanczos + light sharpening) on 27 Oct 2026; original in .website-manager/originals.",
  });

/** Supplied by the client on 27 Oct 2026 (537 x 399 px with a caption bar). Caption bar removed, upscaled
 * with Lanczos + light sharpening by scripts/prepare-towers-photo.mjs. The sky appears to be edited. */
const towersSkyImg: ProjectImage = {
  src: "/images/projects/gohar-towers/towers-sky.jpg",
  width: 1600,
  height: 1010,
  alt: "Gohar Towers, Gulshan-e-Iqbal: the three completed residential towers against a bright blue sky",
  kind: "photograph",
  source: "Supplied by the client (website owner) on 27 Oct 2026",
  verification: "verified-official",
  permission: "client-approved",
  note: "Client-supplied marketing image; small original (537 px). Ask for the full-resolution file.",
};

const villas = "gohar-villas";
const villasSeriesNote =
  "From the official media library, in the same render series as the Gohar Villas page images (Gate-Cam / Masterplan). Not shown on the project page itself; confirm with the client.";
const villasImages = {
  gate: officialImage(villas, "gate.jpg", "2026/08/Gate-Cam_03-0-00-00-02.jpg-scaled.jpeg", 2560, 1440,
    "Gohar Villas: render of the community entrance gate with a curved canopy and water feature", "render"),
  gateApproach: officialImage(villas, "gate-approach.webp", "2026/07/Gate-Cam_02-0-00-00-00-scaled.webp", 2000, 1125,
    "Gohar Villas: render of the road approaching the entrance gate through landscaped verges", "render", {
      verification: "needs-confirmation", note: villasSeriesNote,
    }),
  masterplan: officialImage(villas, "masterplan.jpg", "2026/08/Masterplan-1-0-00-00-00.jpg-scaled.jpeg", 2560, 1440,
    "Gohar Villas: aerial masterplan visual showing streets, plots and green spaces", "masterplan"),
  park: officialImage(villas, "park.jpg", "2026/08/Park-Cam_02-0-00-00-00.jpg-scaled.jpeg", 2560, 1440,
    "Gohar Villas: render of a landscaped park with a children's play area", "render"),
  masjid: officialImage(villas, "masjid.jpg", "2026/07/Masjid-cam_01-0-00-00-00-scaled.webp", 2560, 1440,
    "Gohar Villas: render of a domed masjid with a minaret, set in landscaped grounds with a water feature", "render", {
      verification: "needs-confirmation",
      note: villasSeriesNote,
    }),
  communityCentre: officialImage(villas, "community-centre.jpg", "2026/07/comunity-centar-Cam_01-0-00-00-00-scaled.webp", 2560, 1440,
    "Gohar Villas: render of a community centre with a swimming pool, loungers and shaded terraces", "render", {
      verification: "needs-confirmation",
      note: villasSeriesNote,
    }),
  hospital: officialImage(villas, "hospital.jpg", "2026/06/gohar-complex-hospital.jpg", 2560, 1440,
    "Gohar Villas: render of a modern hospital building with a glazed entrance and landscaped forecourt", "render", {
      verification: "needs-confirmation",
      note: `${villasSeriesNote} The 8,000 px original is attached to the Gohar Complex entry in the media library, but it matches the Villas render series (Hospital-0 / Hospital-2).`,
    }),
  commercial: officialImage(villas, "commercial-area.webp", "2026/07/Commercial_Area-0-00-00-00-scaled.webp", 2000, 1125,
    "Gohar Villas: render of a two-storey commercial parade with shopfronts and a landscaped forecourt", "render", {
      verification: "needs-confirmation", note: villasSeriesNote,
    }),
};
const villasPlans = [
  officialImage(villas, "masterplan-phase-1.webp", "2026/07/Masterplan-4-phase-1-0-00-00-00-scaled.webp", 2000, 1125,
    "Gohar Villas Phase 1: aerial masterplan visual of the residential streets and plots", "masterplan", {
      verification: "needs-confirmation", note: villasSeriesNote,
    }),
  officialImage(villas, "masterplan-phase-2.webp", "2026/07/Masterplan-9-phase-2-0-00-00-00-scaled.webp", 2000, 1125,
    "Gohar Villas Phase 2: aerial masterplan visual of the residential blocks and green spaces", "masterplan", {
      verification: "needs-confirmation", note: villasSeriesNote,
    }),
  officialImage(villas, "masterplan-phase-3.webp", "2026/07/Masterplan-10-phase-30-00-00-00-scaled.webp", 2000, 1125,
    "Gohar Villas Phase 3: aerial masterplan visual of the plot layout", "masterplan", {
      verification: "needs-confirmation", note: villasSeriesNote,
    }),
];

const greenCity = "kn-gohar-green-city";
const KN_PRESENTATION = "2026/07/kn-Green-city-presentation.pdf";
const greenCityPhotoNote = "Camera photograph attached to the KN Gohar Green City entry in the official media library.";
const greenCityImages = {
  aerial: officialImage(greenCity, "view-3.jpg", "2026/08/Green-City-3.jpg-scaled.jpeg", 2560, 1441,
    "KN Gohar Green City: aerial photograph of the low-rise community and its central avenue", "photograph", {
      verification: "needs-confirmation",
      note: "Appears to be a drone photograph. Confirm photograph vs. render with the client.",
    }),
  clubHouse: officialImage(greenCity, "photo-club-house.jpg", "2026/07/IMG_3765-scaled.jpeg", 1920, 2560,
    "KN Gohar Green City: photograph of the Club House building with its signage behind a planted terrace", "photograph", {
      note: greenCityPhotoNote,
    }),
  lawn: officialImage(greenCity, "photo-lawn.jpg", "2026/07/IMG_3785-scaled.jpeg", 1920, 2560,
    "KN Gohar Green City: photograph of a three-storey residential block behind a lawn and palm trees", "photograph", {
      note: greenCityPhotoNote,
    }),
  gardenWalk: officialImage(greenCity, "photo-garden-walk.jpg", "2026/07/IMG_3776-scaled.jpeg", 1920, 2560,
    "KN Gohar Green City: photograph of a hedged garden path leading to the apartment buildings", "photograph", {
      note: greenCityPhotoNote,
    }),
  street: officialImage(greenCity, "photo-street.jpg", "2026/07/IMG_3747-scaled.jpeg", 1920, 2560,
    "KN Gohar Green City: photograph of a community road lined with hedges and residential buildings", "photograph", {
      note: greenCityPhotoNote,
    }),
  facade: officialImage(greenCity, "photo-facade.jpg", "2026/07/IMG_8015-scaled.jpeg", 1704, 2560,
    "KN Gohar Green City: photograph of a residential building facade with arched windows and decorative balcony screens", "photograph", {
      note: `${greenCityPhotoNote} Imported 27 Oct 2026.`,
    }),
  greens: officialImage(greenCity, "view-2.jpg", "2026/08/Green-City-2.jpg-scaled.jpeg", 2560, 1441,
    "KN Gohar Green City: aerial photograph of landscaped lawns surrounded by apartment blocks", "photograph", {
      verification: "needs-confirmation",
      note: "Appears to be a drone photograph. Confirm photograph vs. render with the client.",
    }),
  gate: officialImage(greenCity, "view-1.jpg", "2026/08/Green-City-1.jpg-scaled.jpeg", 2560, 1441,
    "KN Gohar Green City: photograph of a gated entrance between apartment buildings", "photograph", {
      verification: "needs-confirmation",
      note: "The gate signage reads a residency name; confirm this entrance belongs to KN Gohar Green City.",
    }),
};
const greenCityPlans = [
  brochureImage(greenCity, "master-layout-plan.jpg", KN_PRESENTATION, "presentation, master layout plan", 2000, 1536,
    "KN Gohar Green City master layout plan from the official presentation: numbered plots in 120 sq yd Platinum, 120 sq yd Gold and 80 sq yd Silver categories, with a school, masjid, park, swimming pool and club house", "masterplan",
    "Photographed page of the printed presentation; image quality is limited."),
];

/* ------------------------------------------------------------------ */
/* Published payment plans (gohargoc.com project pages)                */
/* ------------------------------------------------------------------ */
const gatewayTerms = (monthly: string, halfYearly: string) =>
  `10% each on booking, confirmation, allocation and start of work + 48 monthly instalments of PKR ${monthly} + 8 half-yearly instalments of PKR ${halfYearly} + 10% before possession`;
const villasTerms = (monthly: string, halfYearly: string, charges: string) =>
  `10% each on booking, confirmation and allocation + 36 monthly instalments of PKR ${monthly} + 6 half-yearly instalments of PKR ${halfYearly} + 10% before possession + PKR ${charges} documentation / development / utility charges`;

/* ------------------------------------------------------------------ */
/* Projects                                                            */
/* ------------------------------------------------------------------ */
export const projects: Project[] = [
  {
    id: "p01",
    slug: "141-broadway-heights",
    name: "141 Broadway Heights",
    category: "mixed-use",
    categoryLabel: "Mixed Use",
    location: {
      city: "Karachi",
      area: "DHA Phase 1",
      address: "Plot #141, 17th Street East, Main Korangi Road, beside Toyota Defence Motors, DHA Phase 1, Karachi",
      landmarks: ["Beside Toyota Defence Motors", "DHA Phase 1", "Gold Mark", "NADRA Mega Center"],
      connectivity: ["Main Korangi Road", "Shahrah-e-Faisal", "Khayaban-e-Ittehad", "Shahrah-e-Bhutto"],
      mapUrl: "https://maps.app.goo.gl/2WQPaCN6zawGNKFB6",
    },
    tagline: "Spacious 3 & 4-room apartments and premium commercial / office spaces",
    summary:
      "Luxury apartments and modern commercial outlets in DHA Phase 1, Karachi, with an infinity pool, rooftop garden, gym and co-working space.",
    storyTitle: "Where modern living meets prime commerce",
    overview: [
      "Rising along Korangi Road in DHA Phase 1, 141 Broadway Heights brings spacious contemporary residences and premium commercial spaces together at a well-connected Karachi address.",
      "The project is planned for modern family living, with 3- and 4-room apartments and a range of shared amenities: an infinity swimming pool with a rooftop deck, a rooftop garden, a commercial-sized gym and a dedicated co-working space.",
      "Shahrah-e-Faisal, Khayaban-e-Ittehad and the newly developed Shahrah-e-Bhutto are all within easy reach, linking residents and businesses to key destinations across the city.",
    ],
    status: "Now booking",
    facts: [
      { label: "Towers", value: "1" },
      { label: "Floors", value: "Basement, LG, UG, 3 parking levels, 8 residential floors and roof" },
      { label: "Residences", value: "3 & 4-room apartments" },
      { label: "Commercial", value: "Commercial outlets and office spaces" },
    ],
    amenities: ["Infinity pool with rooftop deck", "Rooftop garden", "Commercial-sized gym", "Co-working space"],
    heroImage: broadwayImages.dusk,
    gallery: [broadwayImages.dusk, broadwayImages.exterior, broadwayImages.rooftop, broadwayImages.terrace, broadwayImages.living, broadwayImages.bedroom],
    floorPlans: broadwayPlans,
    brochure: {
      label: "Presentation book",
      href: "/documents/141-broadway-heights-presentation-book.pdf",
      sizeLabel: "PDF, 13 MB",
      source: `${UPLOADS}/2026/08/Broadway-Presentation-Book.pdf.pdf`,
    },
    seo: {
      title: "141 Broadway Heights | Apartments & Commercial Spaces in DHA Phase 1, Karachi",
      description:
        "3 & 4-room apartments and commercial/office spaces on Main Korangi Road, DHA Phase 1, Karachi, with an infinity pool, rooftop garden, gym and co-working space.",
    },
    relatedSlugs: ["gohar-golf-vista", "gohar-rabi-center", "gohar-gateway"],
    enquiry: { enabled: true, defaultType: "sales" },
    featured: true,
    order: 1,
    provenance: {
      sourceUrl: "https://gohargoc.com/projects/141-broadway-heights/",
      retrievedOn: RETRIEVED,
      notes: [
        "Completion date, unit sizes and prices not published.",
        "All images are official renders. Floor plans are pages of the official presentation book (floor names are not printed on the plans; labels describe what each plan shows).",
      ],
    },
  },
  {
    id: "p02",
    slug: "gohar-complex-shopping-mall",
    heroLayout: "split",
    name: "Gohar Complex & Shopping Mall",
    category: "mixed-use",
    categoryLabel: "Mixed Use",
    location: {
      city: "Karachi",
      area: "Model Colony",
      address: "Liaquat Ali Khan Road, Model Colony Block 9, Tina Square, Karachi 75080",
      landmarks: ["Tina Square", "Model Colony Block 9"],
      connectivity: ["Liaquat Ali Khan Road"],
    },
    summary:
      "A completed mixed-use development in Model Colony offering flats and shops across five towers.",
    overview: [
      "Gohar Complex & Shopping Mall is a mixed-use development on Liaquat Ali Khan Road, Model Colony Block 9, Tina Square, Karachi, offering flats and shops across five towers.",
      "It offers three apartment categories: Type A (5 rooms), Type B (4 rooms) and Type B1 (3 rooms), with commercial shops on the ground floor.",
      "As a completed project, it provides ready residential and commercial spaces for upper, middle and lower-middle income buyers.",
    ],
    status: "Completed",
    facts: [
      { label: "Towers", value: "5" },
      { label: "Residences", value: "3, 4 and 5-room flats" },
      { label: "Commercial", value: "Shops on the ground floor" },
      { label: "Home financing", value: "Islamic home financing with Meezan Bank (partnership announced July 2026)" },
    ],
    unitTypesHeading: "Apartment types",
    unitTypes: [
      { name: "Type A", description: "5 rooms" },
      { name: "Type B", description: "4 rooms" },
      { name: "Type B1", description: "3 rooms" },
    ],
    payment: published("https://gohargoc.com/projects/gohar-complex/", [
      { name: "Type A", description: "5 rooms apartment", total: "PKR 19,320,000",
        terms: "Booking PKR 10,000,000 + 3 monthly instalments of PKR 2,500,000 + PKR 1,820,000 before possession" },
      { name: "Type B", description: "4 rooms apartment", total: "PKR 13,080,000",
        terms: "Booking PKR 7,000,000 + 3 monthly instalments of PKR 1,500,000 + PKR 1,580,000 before possession" },
      { name: "Type B1", description: "3 rooms apartment", total: "PKR 13,386,000",
        terms: "Booking PKR 7,000,000 + 3 monthly instalments of PKR 1,500,000 + PKR 1,886,000 before possession" },
    ], ["As published, the 3-room Type B1 total is higher than the 4-room Type B total. Please confirm with our sales team."]),
    heroImage: complexImg,
    gallery: [complexImg],
    seo: {
      title: "Gohar Complex & Shopping Mall | Flats & Shops in Model Colony, Karachi",
      description:
        "A completed mixed-use development of five towers in Model Colony, Karachi, with 3, 4 and 5-room flats and ground-floor shops.",
    },
    relatedSlugs: ["gohar-residencia-shopping-mall", "gohar-towers", "kn-gohar-green-city"],
    enquiry: { enabled: true, defaultType: "sales" },
    featured: false,
    order: 6,
    provenance: {
      sourceUrl: "https://gohargoc.com/projects/gohar-complex/",
      retrievedOn: RETRIEVED,
      notes: [
        "Only one official image is available; the project is complete, so real photographs are needed.",
        "The media library has a hospital render attached to this project, but it matches the Gohar Villas render series, so it is not used here.",
        "Number of flats and shops not published.",
      ],
    },
  },
  {
    id: "p03",
    slug: "gohar-gateway",
    name: "Gohar Gateway",
    category: "mixed-use",
    categoryLabel: "Mixed Use",
    location: {
      city: "Hyderabad",
      area: "Hyderabad",
      address: "Main Hyderabad Bypass Road, opposite Hyderabad Darbar Hotel, Hyderabad",
      landmarks: ["Opposite Hyderabad Darbar Hotel"],
      connectivity: ["Main Hyderabad Bypass Road"],
    },
    summary:
      "A mixed-use development in Hyderabad with flats, shops, a banquet, a restaurant and entertainment areas.",
    overview: [
      "Gohar Gateway is a mixed-use development on the main Hyderabad Bypass Road, opposite Hyderabad Darbar Hotel.",
      "It offers 4-room apartments (Type A, A1), 3-room apartments (Type B, B1, B2, B3) and 2-room apartments (Type C, C1, C2), along with commercial outlets, a banquet, a restaurant and entertainment areas.",
      "The payment plan runs from booking, confirmation and allocation through monthly and half-yearly instalments to possession. In July 2026 the company announced the signing of Pakistan's first Shariah-compliant green hotel REIT, anchored at Gohar Gateway, with JS Investments.",
    ],
    paymentPlan: "Instalment plan to possession (published as a '3 Year Payment Plan')",
    facts: [
      { label: "City", value: "Hyderabad" },
      { label: "Residences", value: "2, 3 and 4-room apartments" },
      { label: "Commercial", value: "Commercial outlets" },
      { label: "Leisure", value: "Banquet, restaurant and entertainment area" },
      { label: "Hospitality", value: "Anchor of a Shariah-compliant green hotel REIT with JS Investments (announced July 2026)" },
    ],
    unitTypesHeading: "Apartment types",
    unitTypes: [
      { name: "4 rooms", description: "Type A and Type A1" },
      { name: "3 rooms", description: "Type B, B1, B2 and B3" },
      { name: "2 rooms", description: "Type C, C1 and C2" },
    ],
    amenities: ["Banquet", "Restaurant", "Entertainment area", "Commercial outlets"],
    payment: published("https://gohargoc.com/projects/gohar-gateway/", [
      { name: "Type A1", description: "4 rooms apartment", total: "PKR 22,200,000", terms: gatewayTerms("100,000", "787,500") },
      { name: "Type A", description: "4 rooms apartment", total: "PKR 21,200,000", terms: gatewayTerms("100,000", "725,000") },
      { name: "Type B1", description: "3 rooms apartment", total: "PKR 16,800,000", terms: gatewayTerms("75,000", "600,000") },
      { name: "Type B", description: "3 rooms apartment", total: "PKR 16,300,000", terms: gatewayTerms("75,000", "568,750") },
      { name: "Type B2", description: "3 rooms apartment", total: "PKR 16,300,000", terms: gatewayTerms("75,000", "568,750") },
      { name: "Type B3", description: "3 rooms apartment", total: "PKR 15,900,000", terms: gatewayTerms("75,000", "543,750") },
      { name: "Type C", description: "2 rooms apartment", total: "PKR 11,200,000", terms: gatewayTerms("40,000", "460,000") },
      { name: "Type C1", description: "2 rooms apartment", total: "PKR 10,800,000", terms: gatewayTerms("40,000", "435,000") },
      { name: "Type C2", description: "2 rooms apartment", total: "PKR 10,700,000", terms: gatewayTerms("40,000", "428,750") },
    ], ["The project page calls this a '3 Year Payment Plan', while the published schedule lists 48 monthly instalments. Please confirm the duration with our sales team."]),
    heroImage: gatewayImages.exterior,
    gallery: [gatewayImages.exterior, gatewayImages.aerial, gatewayImages.hotelTower, gatewayImages.courtyard],
    seo: {
      title: "Gohar Gateway | Mixed-Use Development in Hyderabad",
      description:
        "2, 3 and 4-room apartments, commercial outlets, a banquet, restaurant and entertainment area on the main Hyderabad Bypass Road, opposite Hyderabad Darbar Hotel.",
    },
    relatedSlugs: ["gohar-residencia-shopping-mall", "141-broadway-heights", "gohar-complex-shopping-mall"],
    enquiry: { enabled: true, defaultType: "sales" },
    featured: true,
    order: 2,
    provenance: {
      sourceUrl: "https://gohargoc.com/projects/gohar-gateway/",
      retrievedOn: RETRIEVED,
      notes: [
        "The official page title mentions 'Hilton Garden Inn & Residences', but no current page explains the arrangement. The legacy article about Hilton Garden Inn (www.gohargoc.com/blogs/read/…) now returns 404 and could not be retrieved, so no hotel brand is named on this site.",
        "Address: the project page reads 'Main Hyderabad Pass Road'; the company's June 2026 article reads 'main Hyderabad bypass road'. The article wording is used. Confirm.",
        "The June 2026 article mentions 3, 4 and 5-bedroom apartments of up to 2,900 sq ft, while the project page lists 2, 3 and 4-room apartments. The project page is used for unit types until the company confirms.",
      ],
    },
  },
  {
    id: "p04",
    slug: "gohar-golf-vista",
    name: "Gohar Golf Vista",
    category: "residential",
    categoryLabel: "Residential",
    location: {
      city: "Karachi",
      area: "Gulshan-e-Roomi",
      address: "Near ACACIA Country & Golf Club, Gulshan-e-Roomi, Karachi",
      landmarks: ["Adjacent to ACACIA Golf Club"],
      mapUrl: "https://maps.app.goo.gl/jSTPWrGegHHEhice9",
    },
    tagline: "Live above the ordinary",
    summary: "Luxury 3, 4 and 5-bedroom apartments with golf course views, near ACACIA Golf Club.",
    storyTitle: "Live above the ordinary",
    overview: [
      "Gohar Golf Vista is among the rare residential projects in Karachi set beside a golf course. Located next to the ACACIA Country & Golf Club, it offers 3, 4 and 5-bedroom luxury apartments with views across the course.",
      "The company describes the building as having an earthquake-resilient structure. It rises 13 floors above basement and ground-floor parking.",
    ],
    facts: [
      { label: "Floors", value: "Basement parking, ground-floor parking and 13 floors" },
      { label: "Residences", value: "3, 4 and 5-bedroom apartments" },
      { label: "Setting", value: "Next to ACACIA Golf Club" },
      { label: "Structure", value: "Earthquake-resilient (as stated by the developer)" },
      { label: "Home financing", value: "Islamic home financing with Meezan Bank (partnership announced July 2026)" },
    ],
    heroImage: golfImages.hero,
    gallery: [golfImages.hero, golfImages.course, golfImages.aerial, golfImages.facade, golfImages.balconies],
    brochure: {
      label: "Payment plan",
      href: "/documents/gohar-golf-vista-payment-plan.pdf",
      sizeLabel: "PDF, 47 MB",
      source: `${UPLOADS}/2026/07/Golf-VIsta-Payment-Plan-copy-3.pdf`,
    },
    seo: {
      title: "Gohar Golf Vista | Luxury Apartments near ACACIA Golf Club, Karachi",
      description:
        "3, 4 and 5-bedroom luxury apartments with golf course views beside ACACIA Country & Golf Club, Gulshan-e-Roomi, Karachi.",
    },
    relatedSlugs: ["141-broadway-heights", "gohar-towers", "gohar-residencia-shopping-mall"],
    enquiry: { enabled: true, defaultType: "sales" },
    featured: true,
    order: 3,
    provenance: {
      sourceUrl: "https://gohargoc.com/projects/gohar-golf-vista/",
      retrievedOn: RETRIEVED,
      notes: [
        "Project status not published.",
        "Four additional renders come from the official media library (same render series as the page image), not from the project page itself.",
      ],
    },
  },
  {
    id: "p05",
    slug: "gohar-green-corner-shopping-center",
    heroLayout: "split",
    name: "Gohar Green Corner & Shopping Center",
    category: "commercial",
    categoryLabel: "Commercial",
    location: {
      city: "Karachi",
      area: "Korangi Link Road",
      address: "Korangi Link Road, behind Malir Court, Karachi",
      landmarks: ["Opposite KN Gohar Green City", "Behind Malir Court"],
      connectivity: ["Korangi Link Road"],
      mapUrl: "https://maps.app.goo.gl/JUJ2fbXFd3ona6ji6",
    },
    summary: "411 commercial shops on Korangi Link Road with strong street exposure.",
    storyTitle: "The smart destination for business",
    overview: [
      "Gohar Green Corner & Shopping Center is a dedicated commercial project of 411 shops on Korangi Link Road, behind Malir Court.",
      "It stands opposite KN Gohar Green City, giving retailers commercial exposure to a large residential catchment across the road.",
    ],
    facts: [
      { label: "Buildings", value: "1" },
      { label: "Floors", value: "Ground + 5 (project page)" },
      { label: "Floor plans", value: "Basement parking, lower ground, upper ground and 1st–5th floors (presentation book)" },
      { label: "Shops", value: "411" },
    ],
    heroImage: greenCornerImages.hero,
    gallery: [greenCornerImages.hero, greenCornerImages.brochure, greenCornerImages.street],
    floorPlans: greenCornerPlans,
    brochure: {
      label: "Presentation book",
      href: "/documents/gohar-green-corner-shopping-center-presentation-book.pdf",
      sizeLabel: "PDF, 34 MB",
      source: `${UPLOADS}/2026/07/Gohar-Green-Corner-Shopping-Center-Presentation-Book.pdf`,
    },
    seo: {
      title: "Gohar Green Corner & Shopping Center | 411 Shops on Korangi Link Road",
      description:
        "A commercial project of 411 shops on Korangi Link Road, Karachi, opposite KN Gohar Green City. Floor plans, renders and location.",
    },
    relatedSlugs: ["kn-gohar-green-city", "gohar-rabi-center", "gohar-complex-shopping-mall"],
    enquiry: { enabled: true, defaultType: "sales" },
    featured: false,
    order: 7,
    provenance: {
      sourceUrl: "https://gohargoc.com/projects/gohar-green-corner-shopping-center/",
      retrievedOn: RETRIEVED,
      notes: [
        "Project status not published.",
        "The project page says 'Ground + 5'; the presentation book has basement, lower ground, upper ground and 1st–5th floor plans. Both are shown, labelled by source.",
        "The presentation book's interior photographs look like generic stock images and are not used.",
      ],
    },
  },
  {
    id: "p06",
    slug: "gohar-rabi-center",
    heroLayout: "framed",
    name: "Gohar Rabi Center",
    category: "commercial",
    categoryLabel: "Commercial",
    location: {
      city: "Karachi",
      area: "PECHS",
      address: "Plot No. 171/1-A, Block 3, PECHS, Karachi",
      landmarks: ["Adjacent to Rabi Centre, Tariq Road"],
      connectivity: ["Tariq Road"],
    },
    summary: "Shops and offices in PECHS, Karachi, at a prime location next to Rabi Centre on Tariq Road.",
    overview: [
      "Gohar Rabi Center is a commercial development in PECHS, Karachi, offering shops and offices in a central location next to Rabi Centre on Tariq Road.",
      "The scheme is planned across lower ground, upper ground and first to seventh floors, with structured commercial circulation and frontage on major surrounding roads.",
      "It is positioned for buyers seeking a central commercial address, with a 1-year payment plan and possession on 50% payment, as published.",
    ],
    paymentPlan: "1-year payment plan, possession on 50% payment (as published)",
    facts: [
      { label: "Buildings", value: "1" },
      { label: "Floors", value: "Lower ground, upper ground and 1st to 7th floors" },
      { label: "Space types", value: "Shops and offices" },
    ],
    heroImage: rabiImg,
    gallery: [rabiImg],
    seo: {
      title: "Gohar Rabi Center | Shops & Offices in PECHS, Karachi",
      description:
        "Commercial shops and offices in Block 3, PECHS, Karachi, next to Rabi Centre on Tariq Road. 1-year payment plan as published.",
    },
    relatedSlugs: ["gohar-green-corner-shopping-center", "141-broadway-heights", "gohar-complex-shopping-mall"],
    enquiry: { enabled: true, defaultType: "sales" },
    featured: false,
    order: 8,
    provenance: {
      sourceUrl: "https://gohargoc.com/projects/gohar-rabi-center/",
      retrievedOn: RETRIEVED,
      notes: ["Number of shops and offices and their prices not published.", "Only one official image is available."],
    },
  },
  {
    id: "p07",
    slug: "gohar-residencia-shopping-mall",
    name: "Gohar Residencia & Shopping Mall",
    category: "mixed-use",
    categoryLabel: "Mixed Use",
    location: {
      city: "Karachi",
      area: "Gulshan-e-Maymar",
      address: "Gulshan-e-Maymar, Karachi",
      landmarks: ["In the heart of Gulshan-e-Maymar"],
    },
    summary:
      "Four residential towers with 1,033 apartments and a 301-shop shopping mall in Gulshan-e-Maymar.",
    overview: [
      "Gohar Residencia & Shopping Mall is a mixed-use development in Gulshan-e-Maymar with four 14-floor residential towers, 1,033 apartments and a 301-shop retail mall, combining apartment living with everyday commercial convenience.",
      "Homes come in three configurations: Type A 3-bed lounge in Towers 1 & 2, and Type B 2-bed lounge and Type C 1-bed lounge in Towers 3 & 4, with prices that vary by floor band.",
    ],
    paymentPlan: "Payment plan available",
    facts: [
      { label: "Towers", value: "4" },
      { label: "Floors", value: "14" },
      { label: "Apartments", value: "1,033" },
      { label: "Shops", value: "301" },
    ],
    unitTypesHeading: "Apartment types",
    unitTypes: [
      { name: "Type A · 3 bed lounge", description: "1,200 sq ft gross (867 sq ft net)", detail: "Towers 1 & 2" },
      { name: "Type B · 2 bed lounge", description: "850 sq ft gross (543 sq ft net)", detail: "Towers 3 & 4" },
      { name: "Type C · 1 bed lounge", description: "550 sq ft gross (377 sq ft net)", detail: "Towers 3 & 4" },
    ],
    payment: published("https://gohargoc.com/projects/gohar-residencia/", [
      { name: "Type A", description: "3 bed lounge", total: "PKR 10,964,100 to 11,654,100", terms: "Depending on floor band" },
      { name: "Type B", description: "2 bed lounge", total: "PKR 6,883,900 to 7,573,900", terms: "Depending on floor band" },
      { name: "Type C", description: "1 bed lounge", total: "PKR 4,777,100 to 5,467,100", terms: "Depending on floor band" },
    ]),
    heroImage: residenciaImages.r010,
    gallery: [residenciaImages.r010, residenciaImages.street, residenciaImages.r008, residenciaImages.aerial, residenciaImages.r005, residenciaImages.r001],
    seo: {
      title: "Gohar Residencia & Shopping Mall | 1,033 Apartments in Gulshan-e-Maymar",
      description:
        "Four 14-floor towers with 1,033 apartments (1, 2 and 3-bed lounge) and a 301-shop mall in Gulshan-e-Maymar, Karachi.",
    },
    relatedSlugs: ["gohar-villas", "gohar-gateway", "gohar-complex-shopping-mall"],
    enquiry: { enabled: true, defaultType: "sales" },
    featured: true,
    order: 4,
    provenance: {
      sourceUrl: "https://gohargoc.com/projects/gohar-residencia/",
      retrievedOn: RETRIEVED,
      notes: [
        "The official page mentions basement, ground, amenity, typical-floor and tower plans, but they were not available to download. Floor plans are still needed.",
        "Construction status not published.",
      ],
    },
  },
  {
    id: "p08",
    slug: "gohar-towers",
    heroLayout: "split",
    name: "Gohar Towers",
    category: "residential",
    categoryLabel: "Residential",
    location: {
      city: "Karachi",
      area: "Gulshan-e-Iqbal",
      address: "Block 13-E, Gulshan-e-Iqbal, Karachi 75300",
      landmarks: ["Block 13-E, Gulshan-e-Iqbal"],
    },
    summary:
      "A completed residential project in Gulshan-e-Iqbal with Executive, Prime and Premium apartments across three towers.",
    overview: [
      "Gohar Towers is a completed residential apartment project in Block 13-E, Gulshan-e-Iqbal, Karachi, offering apartment living across three towers in a well-established neighbourhood.",
      "Apartments come in three categories: Executive (6 rooms), Prime (5 rooms) and Premium (5 rooms).",
    ],
    status: "Completed",
    facts: [
      { label: "Towers", value: "3" },
      { label: "Residences", value: "5 and 6-room apartments" },
    ],
    unitTypesHeading: "Apartment categories",
    unitTypes: [
      { name: "Executive", description: "6 rooms" },
      { name: "Prime", description: "5 rooms" },
      { name: "Premium", description: "5 rooms" },
    ],
    payment: published("https://gohargoc.com/projects/gohar-towers-6/", [
      { name: "Prime Suite", description: "5 room apartment", total: "PKR 26,560,000",
        terms: "50% booking PKR 13,280,000 + 3 monthly instalments of PKR 2,900,000 + PKR 2,380,000 before possession + PKR 2,200,000 documentation" },
      { name: "Premium Suite", description: "5 room apartment", total: "PKR 27,400,000",
        terms: "50% booking PKR 13,700,000 + 3 monthly instalments of PKR 3,000,000 + PKR 2,500,000 before possession + PKR 2,200,000 documentation" },
      { name: "Executive", description: "6 room apartment", total: "PKR 34,600,000",
        terms: "50% booking PKR 17,300,000 + 3 monthly instalments of PKR 3,500,000 + PKR 4,000,000 before possession + PKR 2,800,000 documentation" },
    ]),
    heroImage: towersSkyImg,
    gallery: [towersSkyImg, towersImg],
    seo: {
      title: "Gohar Towers | Completed Apartments in Gulshan-e-Iqbal, Karachi",
      description:
        "A completed three-tower residential project in Block 13-E, Gulshan-e-Iqbal, Karachi, with Executive, Prime and Premium apartments.",
    },
    relatedSlugs: ["gohar-golf-vista", "gohar-complex-shopping-mall", "gohar-residencia-shopping-mall"],
    enquiry: { enabled: true, defaultType: "sales" },
    featured: false,
    order: 5,
    provenance: {
      sourceUrl: "https://gohargoc.com/projects/gohar-towers-6/",
      retrievedOn: RETRIEVED,
      notes: ["Only one image is available, and it is low resolution (1600 px)."],
    },
  },
  {
    id: "p09",
    slug: "gohar-villas",
    name: "Gohar Villas",
    category: "mixed-use",
    categoryLabel: "Mixed Use",
    location: {
      city: "Karachi",
      area: "Taiser Town",
      address: "M-10, Sector 61, Taiser Town, adjacent to Gulshan-e-Maymar, Karachi 75500",
      landmarks: ["Near Taiser Town", "Next to Gulshan-e-Maymar"],
    },
    summary:
      "A residential and commercial plots community in three phases near Taiser Town and Gulshan-e-Maymar.",
    overview: [
      "Gohar Villas is a three-phase residential and commercial plots project at Sector 61, Taiser Town, next to Gulshan-e-Maymar, Karachi.",
      "Phases 1 and 2 offer residential plots of 120 and 160 sq yd. Phase 3 offers 120 sq yd residential plots and commercial plots of 100 and 200 sq yd.",
    ],
    paymentPlan: "36-month instalment plan (as published)",
    facts: [
      { label: "Phases", value: "3" },
      { label: "Plot sizes", value: "100, 120, 160 and 200 sq yd" },
      { label: "Plot types", value: "Residential (all phases) and commercial (Phase 3)" },
    ],
    unitTypesHeading: "Plots by phase",
    unitTypes: [
      { name: "Phase 1", description: "Residential plots of 120 and 160 sq yd" },
      { name: "Phase 2", description: "Residential plots of 120 and 160 sq yd" },
      { name: "Phase 3", description: "Residential plots of 120 sq yd; commercial plots of 100 and 200 sq yd" },
    ],
    payment: published("https://gohargoc.com/projects/gohar-villas/", [
      { name: "Phase 1", description: "120 sq yd residential plot", total: "PKR 7,705,000", terms: villasTerms("48,000", "282,495", "1,200,000") },
      { name: "Phase 1", description: "160 sq yd residential plot", total: "PKR 10,120,000", terms: villasTerms("64,500", "358,333", "1,600,000") },
      { name: "Phase 2", description: "120 sq yd residential plot", total: "PKR 6,900,000", terms: villasTerms("35,000", "280,000", "1,200,000") },
      { name: "Phase 2", description: "160 sq yd residential plot", total: "PKR 8,740,000", terms: villasTerms("50,000", "307,333", "1,600,000") },
      { name: "Phase 3", description: "120 sq yd residential plot", total: "PKR 5,405,000", terms: villasTerms("25,000", "190,500", "1,200,000") },
      { name: "Phase 3", description: "100 sq yd commercial plot", total: "PKR 8,050,000", terms: villasTerms("50,000", "338,333", "1,000,000") },
      { name: "Phase 3", description: "200 sq yd commercial plot", total: "PKR 16,100,000", terms: villasTerms("80,000", "796,666", "2,000,000") },
    ]),
    heroImage: villasImages.gate,
    gallery: [villasImages.gate, villasImages.masterplan, villasImages.park, villasImages.communityCentre, villasImages.masjid, villasImages.gateApproach, villasImages.hospital, villasImages.commercial],
    floorPlans: villasPlans,
    seo: {
      title: "Gohar Villas | Residential & Commercial Plots in Taiser Town, Karachi",
      description:
        "Residential and commercial plots of 100 to 200 sq yd across three phases in Sector 61, Taiser Town, next to Gulshan-e-Maymar, Karachi.",
    },
    relatedSlugs: ["gohar-residencia-shopping-mall", "kn-gohar-green-city", "gohar-golf-vista"],
    enquiry: { enabled: true, defaultType: "sales" },
    featured: false,
    order: 9,
    provenance: {
      sourceUrl: "https://gohargoc.com/projects/gohar-villas/",
      retrievedOn: RETRIEVED,
      notes: [
        "The official page refers to a presentation book, but no download link was published.",
        "Listed as 'Mixed Use' on the official project archive.",
        "Two renders and three phase masterplans come from the official media library (same render series), not from the project page. Confirm before launch. Mosque, hospital and community-centre renders in the same series are not used because the facilities are not described on the project page.",
      ],
    },
  },
  {
    id: "p10",
    slug: "kn-gohar-green-city",
    heroLayout: "framed",
    name: "KN Gohar Green City",
    category: "community",
    categoryLabel: "Residential & Commercial Community",
    location: {
      city: "Karachi",
      area: "Malir",
      address: "Korangi Road Link, off Shahrah-e-Faisal, near the Malir Court area, Karachi",
      landmarks: ["Near Malir Court", "Malir Cantt", "Jamia Millia Road", "Jinnah Terminal", "Opposite Gohar Green Corner"],
      connectivity: ["Shahrah-e-Faisal", "Korangi Road Link"],
      mapUrl: "https://maps.app.goo.gl/TcBdEBQue58g7gaZA",
    },
    tagline: "A complete lifestyle community in the middle of the city",
    summary: "A gated, master-planned residential and commercial community near Malir, Karachi.",
    storyTitle: "More than a home: a complete lifestyle community",
    overview: [
      "Set along the Korangi Road Link off Shahrah-e-Faisal, KN Gohar Green City is a master-planned, gated community built on the idea that a home should come with more than four walls: it should come with a lifestyle.",
      "It is close to Malir Cantt and Jamia Millia Road and within easy reach of Jinnah Terminal, connecting residents to the rest of Karachi while offering the calm of a self-contained township.",
      "Buildings rise four floors above a basement and a ground-floor commercial market, with SBS flats and residential apartments.",
    ],
    facts: [
      { label: "Buildings", value: "Basement, ground-floor commercial market and 4 floors" },
      { label: "Residences", value: "SBS flats and residential apartments" },
      { label: "Community", value: "Gated, master-planned" },
    ],
    unitTypesHeading: "Home types in the official presentation",
    unitTypes: [
      { name: "Platinum", description: "120 sq yd, one unit", detail: "Presentation" },
      { name: "Gold", description: "120 sq yd, single storey", detail: "Presentation" },
      { name: "Silver", description: "80 sq yd, single storey", detail: "Presentation" },
      { name: "Apartments", description: "Types A, B, C and D", detail: "Presentation" },
    ],
    amenities: ["Club house", "Swimming pool", "Mini golf", "Children's play area", "Basketball court", "Security control room"],
    amenitiesNote:
      "As shown in the official KN Gohar Green City presentation (undated). The club house is pictured in a recent photograph; please confirm current facilities with our team.",
    heroImage: greenCityImages.aerial,
    gallery: [greenCityImages.aerial, greenCityImages.clubHouse, greenCityImages.lawn, greenCityImages.gardenWalk, greenCityImages.street, greenCityImages.facade, greenCityImages.greens, greenCityImages.gate],
    floorPlans: greenCityPlans,
    brochure: {
      label: "Presentation",
      href: "/documents/kn-gohar-green-city-presentation.pdf",
      sizeLabel: "PDF, 12 MB",
      source: `${UPLOADS}/2026/07/kn-Green-city-presentation.pdf`,
    },
    seo: {
      title: "KN Gohar Green City | Gated Community near Malir, Karachi",
      description:
        "A gated, master-planned residential and commercial community near Malir Court, Malir Cantt and Jinnah Terminal, Karachi, with a club house and green spaces.",
    },
    relatedSlugs: ["gohar-green-corner-shopping-center", "gohar-villas", "gohar-complex-shopping-mall"],
    enquiry: { enabled: true, defaultType: "sales" },
    featured: false,
    order: 10,
    provenance: {
      sourceUrl: "https://gohargoc.com/projects/kn-gohar-green-city/",
      retrievedOn: RETRIEVED,
      notes: [
        "The official site gives no category. 'Residential & Commercial Community' comes from the client brief.",
        "Project status and prices not published.",
        "Home types and facilities come from the official presentation PDF, which is undated and photographed from print. Confirm they are current.",
        "The July 2026 Meezan Bank article lists 'Gohar Green City' among the financed projects. It is linked as a related story, but financing is not listed as a fact here until the company confirms it means KN Gohar Green City.",
      ],
    },
  },
];
