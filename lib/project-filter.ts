import type { ProjectCardData, ProjectCategory } from "@/types/project";

/** Pure filtering/sorting for the project directory (unit-tested). */

export type SortOrder = "featured" | "name";

export interface ProjectFilters {
  q: string;
  category: ProjectCategory | "all";
  location: string; // area name or "all"
  sort: SortOrder;
}

export const DEFAULT_FILTERS: ProjectFilters = { q: "", category: "all", location: "all", sort: "featured" };

const CATEGORIES: ProjectCategory[] = ["residential", "commercial", "mixed-use", "community"];

function normalise(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function parseFilters(params: URLSearchParams): ProjectFilters {
  const category = params.get("category") ?? "all";
  const sort = params.get("sort") === "name" ? "name" : "featured";
  return {
    q: (params.get("q") ?? "").slice(0, 80),
    category: (CATEGORIES as string[]).includes(category) ? (category as ProjectCategory) : "all",
    location: params.get("location")?.trim() || "all",
    sort,
  };
}

export function filtersToSearch(f: ProjectFilters): string {
  const p = new URLSearchParams();
  if (f.q.trim()) p.set("q", f.q.trim());
  if (f.category !== "all") p.set("category", f.category);
  if (f.location !== "all") p.set("location", f.location);
  if (f.sort !== "featured") p.set("sort", f.sort);
  const s = p.toString();
  return s ? `?${s}` : "";
}

export function filterProjects(list: readonly ProjectCardData[], f: ProjectFilters): ProjectCardData[] {
  const terms = normalise(f.q).split(" ").filter(Boolean);
  const result = list.filter((p) => {
    if (f.category !== "all" && p.category !== f.category) return false;
    if (f.location !== "all" && p.area !== f.location && p.city !== f.location) return false;
    if (terms.length === 0) return true;
    const haystack = normalise(`${p.name} ${p.area} ${p.city} ${p.categoryLabel} ${p.summary}`);
    return terms.every((t) => haystack.includes(t));
  });
  return result.sort((a, b) => (f.sort === "name" ? a.name.localeCompare(b.name) : a.order - b.order));
}

export function isFiltered(f: ProjectFilters): boolean {
  return f.q.trim() !== "" || f.category !== "all" || f.location !== "all";
}

/** Location choices grouped by city, derived from the data. */
export function locationOptions(list: readonly ProjectCardData[]): { city: string; areas: string[] }[] {
  const byCity = new Map<string, Set<string>>();
  for (const p of list) {
    if (!byCity.has(p.city)) byCity.set(p.city, new Set());
    if (p.area !== p.city) byCity.get(p.city)!.add(p.area);
  }
  return [...byCity.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([city, areas]) => ({ city, areas: [...areas].sort((a, b) => a.localeCompare(b)) }));
}
