import type { Project, ProjectImage } from "@/types/project";

export interface ImageUse {
  section: string;
  project: string;
  src: string;
}

/**
 * Allocates authentic project images across a page so the same photograph
 * is not repeated in nearby sections. Each pick takes the project's
 * least-used image (an explicitly preferred image wins while it is unused;
 * otherwise gallery order breaks ties) and records where it was used.
 * Projects with a single published image necessarily repeat; the record
 * makes that visible.
 */
export class ImagePlanner {
  private counts = new Map<string, number>();
  readonly record: ImageUse[] = [];

  constructor(private readonly projects: readonly Project[]) {}

  project(slug: string): Project {
    const p = this.projects.find((x) => x.slug === slug);
    if (!p) throw new Error(`Unknown project: ${slug}`);
    return p;
  }

  pick(slug: string, section: string, prefer?: string): ProjectImage {
    const p = this.project(slug);
    const pool = p.gallery.length ? p.gallery : [p.heroImage];
    const uses = (img: ProjectImage) => this.counts.get(img.src) ?? 0;
    const preferred = prefer ? pool.find((g) => g.src.endsWith(prefer)) : undefined;
    const chosen =
      preferred && uses(preferred) === 0
        ? preferred
        : pool.reduce((best, img) => (uses(img) < uses(best) ? img : best), pool[0]!);
    this.counts.set(chosen.src, uses(chosen) + 1);
    this.record.push({ section, project: slug, src: chosen.src });
    return chosen;
  }

  /** Images used more than once on the page. */
  repeats(): string[] {
    return [...this.counts.entries()].filter(([, n]) => n > 1).map(([src]) => src);
  }
}

/** The homepage's image allocation, section by section (in page order). */
export function planHome(projects: readonly Project[]) {
  const plan = new ImagePlanner(projects);
  const featured = projects.filter((p) => p.featured);

  const hero = [
    plan.pick("gohar-gateway", "hero", "exterior.webp"),
    plan.pick("gohar-golf-vista", "hero", "golf-course.webp"),
    plan.pick("141-broadway-heights", "hero", "dusk.jpg"),
    plan.pick("gohar-residencia-shopping-mall", "hero", "render-008.webp"),
    plan.pick("kn-gohar-green-city", "hero", "view-3.jpg"),
  ].map((image, i) => ({ project: plan.project(["gohar-gateway", "gohar-golf-vista", "141-broadway-heights", "gohar-residencia-shopping-mall", "kn-gohar-green-city"][i]!), image }));

  const intro = plan.pick("kn-gohar-green-city", "intro", "photo-lawn.jpg");

  const signature = featured.map((p) => ({
    project: p,
    image: plan.pick(p.slug, "signature", p.slug === "141-broadway-heights" ? "rooftop-pool.jpg" : undefined),
  }));

  const collection = projects.map((p) => ({ project: p, image: plan.pick(p.slug, "collection") }));

  const places = {
    karachi: plan.pick("gohar-residencia-shopping-mall", "places"),
    hyderabad: plan.pick("gohar-gateway", "places", "aerial-courtyard.webp"),
  };

  const approach = [
    plan.pick("gohar-towers", "approach"),
    plan.pick("141-broadway-heights", "approach", "living.jpg"),
    plan.pick("gohar-golf-vista", "approach", "facade-detail.webp"),
    plan.pick("kn-gohar-green-city", "approach", "photo-garden-walk.jpg"),
  ];

  const visitSlugs = ["141-broadway-heights", "gohar-golf-vista", "kn-gohar-green-city", "gohar-villas", "gohar-green-corner-shopping-center", "gohar-residencia-shopping-mall"];
  const visit = visitSlugs.map((slug) => ({ project: plan.project(slug), image: plan.pick(slug, "visit") }));

  return { hero, intro, signature, collection, places, approach, visit, record: plan.record, repeats: plan.repeats() };
}
