import { projects } from "@/data/projects";
import type { Project, ProjectCardData, ProjectCategory } from "@/types/project";

/**
 * Pure helpers over the static project data. Safe to import anywhere
 * (client components included). For content that includes admin overrides,
 * use `getProjects()` / `getProject()` from `lib/content.ts` on the server.
 */

export const allProjects: readonly Project[] = [...projects].sort((a, b) => a.order - b.order);

export const projectSlugs = allProjects.map((p) => p.slug);

export function findStaticProject(slug: string): Project | undefined {
  return allProjects.find((p) => p.slug === slug);
}

export function isKnownProjectSlug(slug: string): boolean {
  return projectSlugs.includes(slug);
}

export function toCardData(project: Project): ProjectCardData {
  return {
    slug: project.slug,
    name: project.name,
    category: project.category,
    categoryLabel: project.categoryLabel,
    city: project.location.city,
    area: project.location.area,
    summary: project.summary,
    status: project.status,
    image: {
      src: project.heroImage.src,
      alt: project.heroImage.alt,
      kind: project.heroImage.kind,
      width: project.heroImage.width,
      height: project.heroImage.height,
    },
    order: project.order,
  };
}

export function projectsByCategory(list: readonly Project[], category: ProjectCategory): Project[] {
  return list.filter((p) => p.category === category);
}

export function locationLabel(p: Pick<Project, "location">): string {
  return p.location.area === p.location.city ? p.location.city : `${p.location.area}, ${p.location.city}`;
}

export type ProjectStage = "completed" | "selling" | "other";

/**
 * Groups projects by their published status only:
 *  - completed: the company states the project is complete
 *  - selling: the company states "now booking" or publishes a payment plan
 */
export function projectStage(p: Pick<Project, "status" | "paymentPlan">): ProjectStage {
  if (p.status && /complete/i.test(p.status)) return "completed";
  if ((p.status && /booking/i.test(p.status)) || p.paymentPlan) return "selling";
  return "other";
}

/** Project choices for enquiry forms: [slug, name]. */
export const projectOptions = allProjects.map((p) => ({ value: p.slug, label: p.name }));
