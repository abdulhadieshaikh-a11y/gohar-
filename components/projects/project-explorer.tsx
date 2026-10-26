"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, LayoutGrid, List, Search, SlidersHorizontal, X } from "lucide-react";
import {
  DEFAULT_FILTERS,
  filterProjects,
  filtersToSearch,
  isFiltered,
  locationOptions,
  parseFilters,
  type ProjectFilters,
} from "@/lib/project-filter";
import { CATEGORY_LABELS, type ProjectCardData, type ProjectCategory } from "@/types/project";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "./project-card";

const CATEGORY_TABS: (ProjectCategory | "all")[] = ["all", "residential", "commercial", "mixed-use", "community"];

/**
 * Search, category and location filters for the project directory.
 * Filter state lives in the URL (?q=&category=&location=&sort=) so results
 * can be shared and survive reloads.
 */
export function ProjectExplorer({ projects }: { projects: ProjectCardData[] }) {
  const searchParams = useSearchParams();
  const paramString = searchParams.toString();
  const [filters, setFilters] = useState<ProjectFilters>(() => parseFilters(new URLSearchParams(paramString)));
  const ids = { search: useId(), location: useId(), sort: useId(), results: useId() };

  // Follow external URL changes (e.g. clicking a category link in the header).
  // Our own URL writes always match the current filters, so they are ignored here.
  const [seenParams, setSeenParams] = useState(paramString);
  if (paramString !== seenParams) {
    setSeenParams(paramString);
    if (`?${paramString}` !== filtersToSearch(filters) && !(paramString === "" && filtersToSearch(filters) === "")) {
      setFilters(parseFilters(new URLSearchParams(paramString)));
    }
  }

  // Write filter state to the URL without a server round trip.
  useEffect(() => {
    const handle = window.setTimeout(() => {
      const search = filtersToSearch(filters);
      if (search !== window.location.search) {
        window.history.replaceState(null, "", `${window.location.pathname}${search}`);
      }
    }, 250);
    return () => window.clearTimeout(handle);
  }, [filters]);

  const results = useMemo(() => filterProjects(projects, filters), [projects, filters]);
  const locations = useMemo(() => locationOptions(projects), [projects]);
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: projects.length };
    for (const p of projects) c[p.category] = (c[p.category] ?? 0) + 1;
    return c;
  }, [projects]);

  const [view, setView] = useState<"grid" | "list">("grid");
  // List view: a floating image preview follows the pointer (desktop mouse only).
  const [preview, setPreview] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const movePreview = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !previewRef.current) return;
    previewRef.current.style.transform = `translate3d(${e.clientX + 28}px, ${e.clientY - 110}px, 0)`;
  };
  const update = (patch: Partial<ProjectFilters>) => setFilters((f) => ({ ...f, ...patch }));
  const filtered = isFiltered(filters);

  return (
    <div>
      <div className="rounded-[1.5rem] border border-line bg-paper p-3 shadow-[0_30px_70px_-50px_rgb(15_14_13/0.5)] sm:p-4">
        <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
          <div role="group" aria-label="Filter by category" className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 2xl:pb-0">
            {CATEGORY_TABS.map((key) => {
              const active = filters.category === key;
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => update({ category: key })}
                  className={`shrink-0 rounded-full border px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.12em] transition-colors duration-500 ${
                    active ? "border-ink bg-ink text-ivory" : "border-transparent text-ink hover:border-ink/20"
                  }`}
                >
                  {key === "all" ? "All projects" : CATEGORY_LABELS[key]}
                  <span className={`ml-2 tabular-nums ${active ? "text-brass-light" : "text-muted"}`}>{counts[key] ?? 0}</span>
                </button>
              );
            })}
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] 2xl:min-w-[40rem]">
            <div className="relative">
              <label htmlFor={ids.search} className="sr-only">
                Search projects
              </label>
              <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <input
                id={ids.search}
                type="search"
                value={filters.q}
                onChange={(e) => update({ q: e.target.value })}
                placeholder="Search by name or area"
                autoComplete="off"
                className="field-control py-2.5 pl-10 sm:min-w-64"
              />
            </div>
            <div>
              <label htmlFor={ids.location} className="sr-only">
                Location
              </label>
              <select
                id={ids.location}
                value={filters.location}
                onChange={(e) => update({ location: e.target.value })}
                className="field-control min-w-[12rem] py-2.5"
              >
                <option value="all">All locations</option>
                {locations.map((group) => (
                  <optgroup key={group.city} label={group.city}>
                    <option value={group.city}>All of {group.city}</option>
                    {group.areas.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={ids.sort} className="sr-only">
                Sort
              </label>
              <select
                id={ids.sort}
                value={filters.sort}
                onChange={(e) => update({ sort: e.target.value === "name" ? "name" : "featured" })}
                className="field-control min-w-[11.5rem] py-2.5"
              >
                <option value="featured">Featured first</option>
                <option value="name">Name A–Z</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between py-6">
        <p id={ids.results} aria-live="polite" className="text-[0.85rem] text-muted">
          <SlidersHorizontal aria-hidden="true" className="mr-2 inline size-4 text-brass" />
          Showing <strong className="font-semibold text-ink">{results.length}</strong> of {projects.length} projects
        </p>
        <div className="flex items-center gap-5">
          <div role="group" aria-label="Layout" className="flex gap-1 rounded-full border border-line p-1">
            {(["grid", "list"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => setView(v)}
                className={`grid size-9 place-items-center rounded-full transition-colors duration-500 ${view === v ? "bg-ink text-ivory" : "text-muted hover:text-ink"}`}
              >
                {v === "grid" ? <LayoutGrid aria-hidden="true" className="size-4" /> : <List aria-hidden="true" className="size-4" />}
                <span className="sr-only">{v === "grid" ? "Grid view" : "List view"}</span>
              </button>
            ))}
          </div>
        {filtered ? (
          <button
            type="button"
            onClick={() => setFilters(DEFAULT_FILTERS)}
            className="inline-flex items-center gap-1.5 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-brass-deep hover:text-ink"
          >
            <X aria-hidden="true" className="size-4" />
            Clear filters
          </button>
        ) : null}
        </div>
      </div>

      {results.length > 0 && view === "grid" ? (
        <ul className="grid gap-x-8 gap-y-16 md:grid-cols-2 xl:grid-cols-3" aria-describedby={ids.results}>
          {results.map((p, i) => (
            <li
              key={p.slug}
              className={`flex animate-fade-in ${i === 0 && results.length > 2 ? "md:col-span-2 xl:col-span-2" : ""}`}
              style={{ animationDelay: `${Math.min(i, 6) * 60}ms` }}
            >
              <div className="w-full">
                <ProjectCard
                  project={p}
                  headingLevel="h2"
                  index={i + 1}
                  size={i === 0 && results.length > 2 ? "large" : "default"}
                  sizes={i === 0 && results.length > 2 ? "(min-width: 768px) 62vw, 100vw" : undefined}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : results.length > 0 ? (
        <>
        <ol className="border-t border-line" aria-describedby={ids.results} onPointerMove={movePreview} onMouseLeave={() => setPreview(null)}>
          {results.map((p, i) => (
            <li key={p.slug} className="relative border-b border-line" onMouseEnter={() => setPreview(p.slug)}>
              <span aria-hidden="true" className={`pointer-events-none absolute inset-x-0 -bottom-px h-px origin-left bg-gohar transition-transform duration-700 ${preview === p.slug ? "scale-x-100" : "scale-x-0"}`} />
              <Link
                href={`/projects/${p.slug}`}
                className="group grid grid-cols-[4.5rem_1fr_auto] items-center gap-4 py-5 transition-[padding] duration-500 sm:grid-cols-[2.5rem_7rem_1fr_12rem_auto] sm:gap-6 lg:hover:pl-3"
              >
                <span className="num hidden text-[0.8rem] text-gohar-deep sm:block">{String(i + 1).padStart(2, "0")}</span>
                <span className="zoom-media relative block aspect-[4/3] overflow-hidden bg-ink-3">
                  <Image quality={85} src={p.image.src} alt="" fill sizes="112px" className="object-cover" />
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-[1.7rem] leading-tight transition-colors duration-300 group-hover:text-gohar-deep sm:text-[2.3rem]">
                    {p.name}
                  </span>
                  <span className="mt-1 block text-[0.75rem] uppercase tracking-[0.12em] text-muted sm:hidden">
                    {p.area === p.city ? p.city : `${p.area}, ${p.city}`}
                  </span>
                </span>
                <span className="hidden text-[0.75rem] uppercase tracking-[0.12em] text-muted sm:block">
                  {p.area === p.city ? p.city : `${p.area}, ${p.city}`}
                  <span className="block text-brass-deep">
                    {p.categoryLabel}
                    {p.status ? ` · ${p.status}` : ""}
                  </span>
                </span>
                <span className="grid size-10 place-items-center rounded-full border border-line text-muted transition-colors duration-500 group-hover:border-ink group-hover:bg-ink group-hover:text-ivory">
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </span>
              </Link>
            </li>
          ))}
        </ol>
        <div
          ref={previewRef}
          aria-hidden="true"
          className={`pointer-events-none fixed left-0 top-0 z-40 hidden aspect-[4/3] w-72 overflow-hidden rounded-2xl bg-ink-3 shadow-[0_40px_80px_-30px_rgb(15_14_13/0.6)] transition-[opacity,scale] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:block ${preview ? "scale-100 opacity-100" : "scale-90 opacity-0"}`}
        >
          {results.map((p) => (
            <span key={p.slug} className={`absolute inset-0 transition-opacity duration-500 ${preview === p.slug ? "opacity-100" : "opacity-0"}`}>
              <Image quality={85} src={p.image.src} alt="" fill sizes="288px" className="object-cover" />
            </span>
          ))}
        </div>
        </>
      ) : (
        <div className="border border-dashed border-stone px-6 py-20 text-center">
          <p className="font-display text-3xl">No projects match your search</p>
          <p className="mx-auto mt-3 max-w-md text-muted">
            Try a different name or area, or clear the filters to see all {projects.length} developments.
          </p>
          <Button variant="secondary" className="mt-8" onClick={() => setFilters(DEFAULT_FILTERS)}>
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}

/** Server-rendered fallback: the full grid, so content is visible before (and without) JavaScript. */
export function ProjectGridFallback({ projects }: { projects: ProjectCardData[] }) {
  return (
    <div>
      <div className="border-y border-line py-4">
        <p className="text-[0.85rem] text-muted">Loading search and filters…</p>
      </div>
      <ul className="mt-6 grid gap-x-8 gap-y-12 pt-6 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((p) => (
          <li key={p.slug}>
            <ProjectCard project={p} headingLevel="h2" />
          </li>
        ))}
      </ul>
    </div>
  );
}
