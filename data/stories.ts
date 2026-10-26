import type { Story } from "@/types/story";

/**
 * Gohar Stories: articles migrated from the official website, gohargoc.com
 * (WordPress posts, retrieved 22 Oct 2026). Wording, dates and categories are
 * as published. Links that pointed to the old homepage now point to the
 * matching page on this site.
 *
 * Not migrated (could not be retrieved):
 *  - "Gohar Group teams up with Hilton Garden Inn for Gohar Gateway Hyderabad"
 *    (www.gohargoc.com/blogs/read/…): the legacy URL returns 404 and no archived
 *    copy was reachable. Nothing about it is published here.
 *  - The legacy /blogs/ and /news_events listings: the server closes the connection.
 */

const RETRIEVED = "2026-10-22";
const PUBLISHER = "Gohar Group of Companies";
const CREDIT = "Image: Gohar Group of Companies";

export const stories: Story[] = [
  {
    slug: "making-home-ownership-accessible-gohar-group-partners-with-meezan-bank",
    title: "Making Home Ownership Accessible: Gohar Group Partners with Meezan Bank",
    category: "news-updates",
    publishedAt: "2026-07-18T14:39:41Z",
    excerpt:
      "Gohar Group of Companies has announced a strategic partnership with Meezan Bank to provide Shariah-compliant home financing for selected residential projects.",
    cover: {
      src: "/images/stories/meezan-bank-mou.jpg",
      width: 2400,
      height: 1350,
      alt: "Representatives of Gohar Group and Meezan Bank shake hands and hold the signed memorandum of understanding in front of the Gohar logo",
      caption: "The MoU signing between Gohar Group of Companies and Meezan Bank in Karachi.",
      credit: CREDIT,
    },
    blocks: [
      {
        type: "p",
        lead: true,
        text: "Gohar Group of Companies has officially announced a new strategic partnership with Meezan Bank, Pakistan’s leading Islamic bank, to provide Shariah-compliant home financing solutions for its residential projects.",
      },
      { type: "h2", id: "empowering-homebuyers", text: "Empowering Homebuyers" },
      {
        type: "p",
        text: "This collaboration is designed to make the journey toward home ownership easier, more transparent, and fully Riba-free. By providing customized Islamic housing finance, Gohar Group and Meezan Bank are creating a smooth, customer-focused experience for families looking to purchase units in the following select developments:",
      },
      {
        type: "list",
        items: [
          "**Gohar Green City** ([KN Gohar Green City](/projects/kn-gohar-green-city))",
          "**[Gohar Complex](/projects/gohar-complex-shopping-mall)**",
          "**[Gohar Golf Vista](/projects/gohar-golf-vista)**",
        ],
      },
      { type: "h2", id: "a-shared-vision", text: "A Shared Vision for Pakistan" },
      {
        type: "p",
        text: "The Memorandum of Understanding (MoU) was signed in Karachi by Mr. Muhammad Hanif Gohar, Chairman of Gohar Group, and Mr. Ahmed Ali Siddiqui, Group Head of Consumer Finance at Meezan Bank. Both organizations emphasized a shared commitment to strengthening Pakistan’s housing sector and offering ethical financial solutions that help families turn their dream of home ownership into a reality.",
      },
    ],
    relatedProjects: ["gohar-complex-shopping-mall", "gohar-golf-vista", "kn-gohar-green-city"],
    contextNote:
      "Announced on 18 July 2026. Financing is subject to the bank’s own eligibility criteria and approval; please ask our team for current details.",
    source: {
      url: "https://gohargoc.com/making-home-ownership-accessible-gohar-group-partners-with-meezan-bank/",
      publisher: PUBLISHER,
      retrievedOn: RETRIEVED,
      notes: [
        "SECURITY: the published WordPress post contains two injected <script> tags loading code from an unknown third-party domain. They were not migrated. The WordPress site should be cleaned and its passwords changed.",
        "The article says 'Gohar Green City'; it is linked to KN Gohar Green City (the only Green City in the portfolio). Confirm.",
      ],
    },
  },
  {
    slug: "a-new-era-for-hyderabad-pakistans-first-shariah-compliant-green-hotel-reit",
    title: "A New Era for Hyderabad: Pakistan’s First Shariah-Compliant Green Hotel REIT",
    category: "news-updates",
    publishedAt: "2026-07-18T14:32:04Z",
    excerpt:
      "The signing ceremony for Pakistan’s first Shariah-compliant green hotel REIT, anchored at Gohar Gateway, marks a landmark moment for Hyderabad and the country’s hospitality sector.",
    cover: {
      src: "/images/stories/green-hotel-reit-signing.jpg",
      width: 2340,
      height: 1300,
      alt: "Representatives of JS Investments and Gohar Group seated at the signing table in front of a JS Hotel REIT backdrop",
      caption: "The signing ceremony with JS Investments.",
      credit: CREDIT,
    },
    blocks: [
      {
        type: "p",
        lead: true,
        text: "Hyderabad is witnessing a historic transformation. A groundbreaking partnership has officially been formed, marking a landmark moment for the city’s development and Pakistan’s hospitality sector. The signing ceremony for Pakistan’s **First Shariah-Compliant Green Hotel REIT** has taken place, signaling a new chapter of innovation and sustainable growth.",
      },
      { type: "h2", id: "a-visionary-partnership", text: "A Visionary Partnership" },
      { type: "p", text: "This ambitious project is the result of a strategic collaboration between two industry leaders:" },
      {
        type: "list",
        items: [
          "**Gohar Group of Companies:** Represented by Chairman Mr. Muhammad Hanif Gohar, whose vision for urban transformation is at the core of this initiative.",
          "**JS Investments:** A key partner in bringing this financial and developmental milestone to fruition.",
        ],
      },
      {
        type: "p",
        text: "The project is proudly anchored at **[Gohar Gateway](/projects/gohar-gateway)**, a development poised to redefine the urban landscape of Hyderabad.",
      },
      {
        type: "image",
        image: {
          src: "/images/projects/gohar-gateway/exterior.webp",
          width: 2500,
          height: 1406,
          alt: "Architectural render of Gohar Gateway, a curved, terraced building with parking in front",
          caption: "Gohar Gateway, Hyderabad (architectural render).",
          credit: CREDIT,
        },
      },
      { type: "h2", id: "why-this-matters", text: "Why This Matters" },
      {
        type: "p",
        text: "This development is more than just a construction project; it is a catalyst for change. By introducing a **multinational hotel brand** to Hyderabad, the project aims to achieve several critical objectives:",
      },
      {
        type: "list",
        items: [
          "**Promoting Sustainable Tourism:** By focusing on “Green” initiatives, the project aligns modern hospitality with environmental responsibility.",
          "**Driving Strategic Investment:** The creation of a Shariah-compliant REIT offers a transparent and innovative investment vehicle, contributing to national progress.",
          "**Urban Transformation:** Through the Gohar Gateway, the project serves as a cornerstone for the modernization of the city’s infrastructure and commercial appeal.",
        ],
      },
      { type: "h2", id: "a-commitment-to-the-future", text: "A Commitment to the Future" },
      {
        type: "p",
        text: "At the heart of this milestone lies a commitment to **innovation, transparency, and national development**. By blending global hospitality standards with local development goals, Gohar Group and JS Investments are setting a new benchmark for excellence in Pakistan.",
      },
      {
        type: "p",
        text: "As Hyderabad continues to evolve, projects like these demonstrate the immense potential for growth, sustainable infrastructure, and world-class investment opportunities in the region.",
      },
      { type: "p", text: "Stay tuned for more updates on Gohar Gateway and the future of sustainable development in Pakistan." },
    ],
    relatedProjects: ["gohar-gateway"],
    contextNote:
      "Published on 18 July 2026, at the signing stage. The REIT, hotel brand and timelines are subject to the partners’ announcements and regulatory approvals. This is news, not an investment offer.",
    tags: ["GoharGateway", "HyderabadDevelopment", "SustainableTourism", "REITPakistan", "InnovationInHospitality"],
    source: {
      url: "https://gohargoc.com/a-new-era-for-hyderabad-pakistans-first-shariah-compliant-green-hotel-reit/",
      publisher: PUBLISHER,
      retrievedOn: RETRIEVED,
      notes: ["The article does not name the multinational hotel brand."],
    },
  },
  {
    slug: "gohar-gateway-a-new-benchmark-for-luxury-living-in-hyderabad",
    title: "Gohar Gateway: A New Benchmark for Luxury Living in Hyderabad",
    category: "buying",
    publishedAt: "2026-06-16T07:17:58Z",
    excerpt:
      "In the bustling heart of Hyderabad, Gohar Gateway offers an elevated living experience on the main Hyderabad bypass road, opposite Hyderabad Darbar Hotel.",
    cover: {
      src: "/images/projects/gohar-gateway/aerial-courtyard.webp",
      width: 2000,
      height: 1125,
      alt: "Aerial architectural render of Gohar Gateway looking down into its landscaped courtyard between terraced wings",
      caption: "Gohar Gateway, Hyderabad (architectural render).",
      credit: CREDIT,
    },
    blocks: [
      {
        type: "p",
        lead: true,
        text: "In the bustling heart of Hyderabad, finding a home that perfectly balances modern luxury with comfort can be a challenge. Enter **[Gohar Gateway](/projects/gohar-gateway)**, a premier residential project by the **[Gohar Group of Companies](/about)**. Designed for those who refuse to compromise on lifestyle, Gohar Gateway offers an elevated living experience on the prestigious main Hyderabad bypass road, opposite Hyderabad Darbar Hotel.",
      },
      { type: "h2", id: "unmatched-comfort-and-design", text: "Unmatched Comfort and Design" },
      {
        type: "p",
        text: "At Gohar Gateway, every detail is crafted with precision. Whether you are looking for spacious **3-bedroom apartments**, expansive **4-bedroom units**, or the ultimate in luxury, our **5-bedroom apartments**, this project provides a sanctuary of elegance. With layouts extending up to 2,900 sq. ft., residents enjoy the freedom of space designed for family-centric living.",
      },
      {
        type: "image",
        image: {
          src: "/images/projects/gohar-gateway/courtyard.jpg",
          width: 2000,
          height: 1125,
          alt: "Architectural render of Gohar Gateway's curved residential wings and planted terraces around the central courtyard",
          caption: "The courtyard at Gohar Gateway (architectural render).",
          credit: CREDIT,
        },
      },
      { type: "h2", id: "why-choose-gohar-gateway", text: "Why Choose Gohar Gateway?" },
      { type: "h3", text: "Prime Location" },
      {
        type: "list",
        items: [
          "Situated on the main Hyderabad Bypass Road, opposite Hyderabad Darbar Hotel.",
          "Built by the Gohar Group, a name synonymous with quality construction and integrity for over 30 years.",
        ],
      },
      { type: "h3", text: "Modern Amenities" },
      {
        type: "list",
        items: ["Experience a community built for the future, featuring top-tier facilities that cater to all your needs."],
      },
      { type: "h2", id: "a-smart-investment-choice", text: "A Smart Investment Choice" },
      {
        type: "p",
        text: "Investing in Gohar Gateway is more than just buying a house; it is a commitment to a premium asset. With the real estate market in Hyderabad constantly evolving, properties in prime locations like the main Hyderabad Bypass Road consistently show high appreciation and strong rental yields. Whether you are buying for your family or as a long-term investment, Gohar Gateway stands out as a reliable and high-value project.",
      },
      { type: "h2", id: "schedule-your-visit-today", text: "Schedule Your Visit Today" },
      { type: "p", text: "Experience the future of urban living at Gohar Gateway. Are you ready to step into your dream home?" },
      {
        type: "contact",
        title: "Visit us",
        lines: ["A/2, Gohar Chamber, CC Area, Block 7/8, KCHS, Shahrah-e-Faisal, Karachi.", "Call +92 21 111 000 061"],
      },
    ],
    relatedProjects: ["gohar-gateway"],
    contextNote:
      "Published on 16 June 2026. The current Gohar Gateway project page lists 2, 3 and 4-room apartments; please confirm unit types, sizes and availability with our sales team. Market comments are the publisher’s view at the time, not a guarantee of returns.",
    source: {
      url: "https://gohargoc.com/gohar-gateway-a-new-benchmark-for-luxury-living-in-hyderabad/",
      publisher: PUBLISHER,
      retrievedOn: RETRIEVED,
      notes: [
        "The original links on '3-bedroom apartments', '4-bedroom units' and '5-bedroom apartments' all pointed to the homepage and were removed.",
        "Unit types and sizes in the article (3, 4 and 5 bedrooms, up to 2,900 sq ft) differ from the project page (2, 3 and 4 rooms). Confirm with the client.",
      ],
    },
  },
  {
    slug: "5-essential-tips-before-buying-your-dream-property",
    title: "5 Essential Tips Before Buying Your Dream Property",
    category: "buying",
    publishedAt: "2026-06-16T07:11:53Z",
    excerpt:
      "Buying your own home is one of the most significant decisions in life. Here are five essential tips to help you make a smart decision, from setting a budget to choosing a trustworthy partner.",
    cover: {
      src: "/images/projects/gohar-golf-vista/golf-course.webp",
      width: 2000,
      height: 1125,
      alt: "Architectural render of Gohar Golf Vista's residential towers seen across the lakes and fairways of a golf course",
      caption: "Gohar Golf Vista, Gulshan-e-Roomi (architectural render).",
      credit: CREDIT,
    },
    blocks: [
      {
        type: "p",
        lead: true,
        text: "Buying your own home is one of the most significant and exciting decisions in life. While the real estate market in Pakistan is growing rapidly, choosing the right property or investment can be a complex process. If you are planning to buy a property, here are 5 essential tips to help you make a smart decision.",
      },
      {
        type: "tip",
        number: 1,
        id: "define-your-budget",
        title: "Define Your Budget",
        text: "Start by setting a clear budget. Don’t just consider the price of the property; remember to factor in additional costs like registration fees, taxes, and transfer charges. Keep your monthly income and savings in mind to ensure the investment remains sustainable.",
      },
      {
        type: "tip",
        number: 2,
        id: "the-importance-of-location",
        title: "The Importance of Location",
        text: "In real estate, “location, location, location” is more than just a saying—it is the key to value. Choose an area with easy access to schools, hospitals, markets, and public transport. A well-located property not only provides convenience but also ensures a higher resale value in the future.",
      },
      {
        type: "image",
        image: {
          src: "/images/projects/141-broadway-heights/exterior.jpg",
          width: 2048,
          height: 2560,
          alt: "Street-level architectural render of 141 Broadway Heights, a white residential tower above a commercial podium",
          caption: "141 Broadway Heights on Main Korangi Road, DHA Phase 1 (architectural render).",
          credit: CREDIT,
        },
      },
      {
        type: "tip",
        number: 3,
        id: "verify-legal-documents",
        title: "Verify Legal Documents",
        text: "Before finalizing any purchase, ensure that all legal documents (such as the Fard, Allotment Letter, or Lease) are verified. Avoid investing in disputed or illegal properties. It is always best to have the papers checked by a professional lawyer or an authorized dealer.",
      },
      {
        type: "tip",
        number: 4,
        id: "consider-future-development",
        title: "Consider Future Development",
        text: "Look into the area where you are investing. Are there upcoming road projects, commercial hubs, or infrastructure improvements planned for the neighborhood? Future development is a major driver of appreciation in property value.",
      },
      {
        type: "tip",
        number: 5,
        id: "choose-a-trustworthy-partner",
        title: "Choose a Trustworthy Partner",
        text: "Always work with a reputable and registered real estate developer or agency. Trusted names, like the **[Gohar Group of Companies](/about)**, provide secure and profitable investment opportunities, giving you peace of mind throughout the buying process.",
      },
      { type: "h2", id: "conclusion", text: "Conclusion" },
      {
        type: "p",
        text: "Real estate investment is a long-term commitment. By staying cautious and conducting thorough research, you can not only find the perfect home but also make a highly profitable investment for your future.",
      },
    ],
    relatedProjects: ["gohar-golf-vista", "141-broadway-heights", "gohar-residencia-shopping-mall"],
    contextNote:
      "General guidance, not legal or financial advice. Always have documents checked by a qualified professional before you buy.",
    source: {
      url: "https://gohargoc.com/5-essential-tips-before-buying-your-dream-property/",
      publisher: PUBLISHER,
      retrievedOn: RETRIEVED,
      notes: ["Matches the client-supplied article (category Buying, 16 June 2026)."],
    },
  },
];
