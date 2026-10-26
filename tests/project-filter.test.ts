import { describe, expect, it } from "vitest";
import { allProjects, toCardData } from "@/lib/projects";
import {
  DEFAULT_FILTERS,
  filterProjects,
  filtersToSearch,
  isFiltered,
  locationOptions,
  parseFilters,
} from "@/lib/project-filter";

const cards = allProjects.map(toCardData);

describe("filterProjects", () => {
  it("returns all ten projects by default, in featured order", () => {
    const result = filterProjects(cards, DEFAULT_FILTERS);
    expect(result).toHaveLength(10);
    expect(result[0]!.slug).toBe("141-broadway-heights");
  });

  it("filters by category", () => {
    const commercial = filterProjects(cards, { ...DEFAULT_FILTERS, category: "commercial" });
    expect(commercial.map((p) => p.slug).sort()).toEqual(["gohar-green-corner-shopping-center", "gohar-rabi-center"]);
  });

  it("filters by city and by area", () => {
    expect(filterProjects(cards, { ...DEFAULT_FILTERS, location: "Hyderabad" }).map((p) => p.slug)).toEqual(["gohar-gateway"]);
    expect(filterProjects(cards, { ...DEFAULT_FILTERS, location: "PECHS" }).map((p) => p.slug)).toEqual(["gohar-rabi-center"]);
    expect(filterProjects(cards, { ...DEFAULT_FILTERS, location: "Karachi" })).toHaveLength(9);
  });

  it("searches names, areas and summaries, ignoring case, punctuation and '&'", () => {
    expect(filterProjects(cards, { ...DEFAULT_FILTERS, q: "golf" }).map((p) => p.slug)).toEqual(["gohar-golf-vista"]);
    expect(filterProjects(cards, { ...DEFAULT_FILTERS, q: "gulshan-e-iqbal" }).map((p) => p.slug)).toEqual(["gohar-towers"]);
    expect(filterProjects(cards, { ...DEFAULT_FILTERS, q: "complex and shopping" }).map((p) => p.slug)).toEqual([
      "gohar-complex-shopping-mall",
    ]);
  });

  it("combines filters and can return an empty list", () => {
    expect(filterProjects(cards, { ...DEFAULT_FILTERS, category: "commercial", location: "Hyderabad" })).toHaveLength(0);
  });

  it("sorts by name", () => {
    const names = filterProjects(cards, { ...DEFAULT_FILTERS, sort: "name" }).map((p) => p.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });
});

describe("URL state", () => {
  it("round-trips filters through the query string", () => {
    const f = { q: "towers", category: "residential" as const, location: "Gulshan-e-Iqbal", sort: "name" as const };
    expect(parseFilters(new URLSearchParams(filtersToSearch(f).slice(1)))).toEqual(f);
  });

  it("treats empty and invalid values as defaults (e.g. a homepage search with blank fields)", () => {
    expect(parseFilters(new URLSearchParams("q=&category=&location="))).toEqual(DEFAULT_FILTERS);
    expect(parseFilters(new URLSearchParams("category=castles&sort=random"))).toEqual(DEFAULT_FILTERS);
    expect(filtersToSearch(DEFAULT_FILTERS)).toBe("");
    expect(isFiltered(DEFAULT_FILTERS)).toBe(false);
  });
});

describe("locationOptions", () => {
  it("groups areas by city", () => {
    const opts = locationOptions(cards);
    expect(opts.map((o) => o.city)).toEqual(["Hyderabad", "Karachi"]);
    expect(opts.find((o) => o.city === "Karachi")!.areas).toContain("DHA Phase 1");
  });
});
