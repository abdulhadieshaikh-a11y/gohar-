import type { Project, ProjectCategory } from "@/types/project";
import { CATEGORY_LABELS } from "@/types/project";
import type { PortfolioGroup } from "@/components/about/portfolio-explorer";

const ORDER: ProjectCategory[] = ["residential", "commercial", "mixed-use", "community"];

/** One line per type, describing the kind of building (no figures, no claims). */
const BLURBS: Record<ProjectCategory, string> = {
  residential: "Apartment towers and family homes, from Gulshan-e-Iqbal to the edge of the ACACIA golf course.",
  commercial: "Shopping centres, shops and offices, from Tariq Road to Korangi Link Road.",
  "mixed-use": "Homes above retail and workspace: addresses where people live, shop and meet.",
  community: "Gated, master-planned neighbourhoods with streets, parks and shared facilities.",
};

/** The photograph shown for each type: [project slug, preferred image file]. */
const VISUAL: Record<ProjectCategory, [string, string]> = {
  residential: ["gohar-golf-vista", "exterior.webp"],
  commercial: ["gohar-green-corner-shopping-center", "street-view.jpg"],
  "mixed-use": ["gohar-gateway", "exterior.webp"],
  community: ["kn-gohar-green-city", "photo-lawn.jpg"],
};

function imageFor(projects: readonly Project[], [slug, file]: [string, string]) {
  const p = projects.find((x) => x.slug === slug);
  if (!p) return null;
  const img = [p.heroImage, ...p.gallery].find((g) => g.src.endsWith(`/${file}`)) ?? p.heroImage;
  return { src: img.src, alt: img.alt };
}

/** The portfolio grouped by type, for the interactive "What we build" explorer. */
export function portfolioGroups(projects: readonly Project[]): PortfolioGroup[] {
  return ORDER.map((key) => {
    const list = projects.filter((p) => p.category === key);
    const image = imageFor(projects, VISUAL[key]) ?? { src: list[0]!.heroImage.src, alt: list[0]!.heroImage.alt };
    return {
      key,
      label: CATEGORY_LABELS[key],
      blurb: BLURBS[key],
      image,
      projects: list.map((p) => ({ slug: p.slug, name: p.name, area: p.location.area === p.location.city ? p.location.city : `${p.location.area}, ${p.location.city}` })),
    };
  }).filter((g) => g.projects.length > 0);
}
