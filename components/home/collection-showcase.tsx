"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, MapPin } from "lucide-react";
import { CATEGORY_LABELS, type ProjectCardData, type ProjectCategory } from "@/types/project";

const FILTERS: (ProjectCategory | "all")[] = ["all", "residential", "commercial", "mixed-use", "community"];

/**
 * Horizontal project collection with category filters.
 * Native horizontal scrolling with snap points (touch and trackpads),
 * mouse drag-to-scroll, previous/next buttons, arrow keys and a progress bar.
 * Each card is a single link to its project page.
 */
export function CollectionShowcase({ projects }: { projects: ProjectCardData[] }) {
  const [filter, setFilter] = useState<ProjectCategory | "all">("all");
  const [progress, setProgress] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const scroller = useRef<HTMLUListElement>(null);
  const drag = useRef({ active: false, startX: 0, startLeft: 0, moved: false });

  const list = filter === "all" ? projects : projects.filter((p) => p.category === filter);
  const counts = Object.fromEntries(FILTERS.map((f) => [f, f === "all" ? projects.length : projects.filter((p) => p.category === f).length]));

  const sync = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? el.scrollLeft / max : 1);
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < max - 4);
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTo({ left: 0 });
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, [filter, sync]);

  const step = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    const card = el.querySelector("li");
    const amount = card ? card.getBoundingClientRect().width + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * amount, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  /* Mouse drag-to-scroll (touch and pens use native scrolling). */
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || e.button !== 0 || !scroller.current) return;
    drag.current = { active: true, startX: e.clientX, startLeft: scroller.current.scrollLeft, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const el = scroller.current;
    if (!d.active || !el) return;
    const dx = e.clientX - d.startX;
    if (Math.abs(dx) > 6) {
      d.moved = true;
      el.style.scrollSnapType = "none";
      el.style.cursor = "grabbing";
    }
    if (d.moved) el.scrollLeft = d.startLeft - dx;
  };
  const endDrag = () => {
    const el = scroller.current;
    drag.current.active = false;
    if (el) {
      el.style.scrollSnapType = "";
      el.style.cursor = "";
    }
  };
  // A drag must not count as a click on the card underneath.
  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label="Filter the collection" className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {FILTERS.map((f) => {
            const active = filter === f;
            return (
              <button
                key={f}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(f)}
                className={`shrink-0 rounded-full border px-5 py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.12em] transition-colors duration-500 ${
                  active ? "border-ink bg-ink text-ivory" : "border-ink/15 text-ink hover:border-ink"
                }`}
              >
                {f === "all" ? "All" : CATEGORY_LABELS[f]}
                <span className={`num ml-2 ${active ? "text-ivory" : "text-muted"}`}>{counts[f]}</span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-5">
          <span className="num text-[0.75rem] text-muted" aria-hidden="true">
            {String(list.length).padStart(2, "0")} developments
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => step(-1)}
              disabled={!canPrev}
              className="grid size-12 place-items-center rounded-full border border-ink/20 transition-colors duration-500 enabled:hover:border-ink enabled:hover:bg-ink enabled:hover:text-ivory disabled:opacity-30"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              <span className="sr-only">Previous projects</span>
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              disabled={!canNext}
              className="grid size-12 place-items-center rounded-full border border-ink/20 transition-colors duration-500 enabled:hover:border-ink enabled:hover:bg-ink enabled:hover:text-ivory disabled:opacity-30"
            >
              <ArrowRight aria-hidden="true" className="size-4" />
              <span className="sr-only">Next projects</span>
            </button>
          </div>
        </div>
      </div>

      <ul
        ref={scroller}
        key={filter}
        tabIndex={0}
        role="list"
        aria-label={`${filter === "all" ? "All" : CATEGORY_LABELS[filter]} projects, scroll horizontally`}
        onScroll={sync}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            step(1);
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            step(-1);
          }
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={onClickCapture}
        onDragStart={(e) => e.preventDefault()}
        className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 outline-offset-8"
      >
        {list.map((p, i) => (
          <li key={p.slug} className="w-[80vw] shrink-0 snap-start animate-fade-in sm:w-[52vw] lg:w-[31vw] xl:w-[27rem]" style={{ animationDelay: `${i * 70}ms` }}>
            <Link href={`/projects/${p.slug}`} className="group block select-none" draggable={false}>
              <div className="zoom-media corner-accent relative aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-ink-3 [--accent:var(--color-ivory)]" data-cursor="View" data-tilt="6">
                <Image quality={85}
                  src={p.image.src}
                  alt={p.image.alt}
                  fill
                  draggable={false}
                  sizes="(min-width: 1280px) 27rem, (min-width: 1024px) 31vw, (min-width: 640px) 52vw, 80vw"
                  className="object-cover"
                />
                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/75 via-transparent to-ink/20 transition-opacity duration-700 group-hover:opacity-90" />
                <span className="absolute left-5 top-5 flex items-center gap-2">
                  <span className="rounded-full bg-ivory/90 px-3 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-ink backdrop-blur">
                    {p.categoryLabel}
                  </span>
                  {p.status ? (
                    <span className="rounded-full bg-ink/85 px-3 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-ivory backdrop-blur">
                      {p.status}
                    </span>
                  ) : null}
                </span>
                <span className="num absolute right-5 top-5 text-[0.75rem] text-ivory/80">{String(i + 1).padStart(2, "0")}</span>
                <span className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4 text-ivory">
                  <span className="font-display text-[1.75rem] leading-[1.02] sm:text-[2rem]">{p.name}</span>
                  <span className="grid size-11 shrink-0 translate-y-2 place-items-center rounded-full bg-ivory text-ink opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    <ArrowUpRight aria-hidden="true" className="size-4" />
                  </span>
                </span>
                <span aria-hidden="true" className="tilt-glare" />
              </div>
              <p className="mt-4 flex items-center gap-2 text-[0.75rem] font-medium uppercase tracking-[0.12em] text-muted">
                <MapPin aria-hidden="true" className="size-3.5 text-gohar" />
                {p.area === p.city ? p.city : `${p.area}, ${p.city}`}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-6 h-px bg-ink/10" aria-hidden="true">
        <div className="h-px origin-left bg-gohar transition-transform duration-300" style={{ transform: `scaleX(${Math.max(0.08, progress)})` }} />
      </div>
    </div>
  );
}
