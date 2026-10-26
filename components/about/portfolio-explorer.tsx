"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";

export interface PortfolioGroup {
  key: string;
  label: string;
  blurb: string;
  image: { src: string; alt: string };
  projects: { slug: string; name: string; area: string }[];
}

/**
 * "What we build": the portfolio by type. Hovering, focusing or tapping a
 * type wipes in its photograph and lists its developments. Facts only: the
 * counts and names come straight from the project data.
 */
export function PortfolioExplorer({ groups, tone = "light" }: { groups: PortfolioGroup[]; tone?: "light" | "dark" }) {
  const [active, setActive] = useState(0);
  const dark = tone === "dark";
  const line = dark ? "border-ivory/15" : "border-ink/15";
  const current = groups[active]!;

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
      {/* Types */}
      <div className="lg:col-span-5">
        <ul className={`border-t ${line}`} role="tablist" aria-label="Portfolio by type">
          {groups.map((g, i) => {
            const on = i === active;
            return (
              <li key={g.key} className={`border-b ${line}`} role="presentation">
                <button
                  type="button"
                  role="tab"
                  aria-selected={on}
                  aria-controls={`portfolio-panel-${g.key}`}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  className="group flex w-full items-center gap-5 py-6 text-left"
                >
                  <span
                    className={`grid size-14 shrink-0 place-items-center rounded-full border font-display text-[1.35rem] transition-all duration-500 ${
                      on
                        ? "border-gohar bg-gohar text-ivory"
                        : dark
                          ? "border-ivory/20 text-ivory/60 group-hover:border-ivory/60"
                          : "border-ink/15 text-ink/50 group-hover:border-ink/50"
                    }`}
                  >
                    {String(g.projects.length).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block font-display text-[clamp(1.8rem,3.4vw,3rem)] leading-none transition-[color,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        on ? `translate-x-1.5 ${dark ? "text-ivory" : "text-ink"}` : dark ? "text-ivory/35 group-hover:text-ivory/70" : "text-ink/30 group-hover:text-ink/60"
                      }`}
                    >
                      {g.label}
                    </span>
                    <span
                      className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        on ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <span className="overflow-hidden">
                        <span className={`block pt-3 text-[0.98rem] leading-relaxed ${dark ? "text-stone" : "text-muted"}`}>{g.blurb}</span>
                      </span>
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Visual + projects */}
      <div className="lg:col-span-7" id={`portfolio-panel-${current.key}`} role="tabpanel" aria-label={current.label}>
        <div className="relative aspect-[16/11] overflow-hidden rounded-[1.5rem] bg-ink-3" data-tilt="3">
          {groups.map((g, i) => (
            <span
              key={g.key}
              aria-hidden={i !== active}
              className="absolute inset-0 transition-[clip-path] duration-[1000ms] ease-[cubic-bezier(0.76,0,0.24,1)]"
              style={{ clipPath: i === active ? "inset(0 0 0 0)" : "inset(0 0 0 100%)", zIndex: i === active ? 2 : 1 }}
            >
              <Image quality={85}
                src={g.image.src}
                alt={i === active ? g.image.alt : ""}
                fill
                sizes="(min-width: 1024px) 55vw, 100vw"
                className={`object-cover transition-transform duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${i === active ? "scale-100" : "scale-110"}`}
              />
            </span>
          ))}
          <span aria-hidden="true" className="absolute inset-0 z-[3] bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
          <span className="absolute inset-x-0 bottom-0 z-[4] flex items-end justify-between gap-4 p-6 text-ivory sm:p-8">
            <span>
              <span className="eyebrow block text-ivory/70">
                {current.projects.length} {current.projects.length === 1 ? "development" : "developments"}
              </span>
              <span className="mt-2 block font-display text-[clamp(2rem,4vw,3.6rem)] leading-none">{current.label}</span>
            </span>
            <Link
              href={`/projects?category=${current.key}`}
              className="grid size-14 shrink-0 place-items-center rounded-full bg-ivory text-ink transition-transform duration-500 hover:rotate-45"
            >
              <ArrowUpRight aria-hidden="true" className="size-5" />
              <span className="sr-only">View all {current.label} projects</span>
            </Link>
          </span>
          <span aria-hidden="true" className="tilt-glare" />
        </div>
        <ul className="mt-5 grid gap-2 sm:grid-cols-2" aria-live="polite">
          {current.projects.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/projects/${p.slug}`}
                className={`group flex min-h-14 items-center justify-between gap-3 rounded-2xl border px-5 py-3 transition-colors duration-300 ${
                  dark ? "border-ivory/15 hover:border-ivory hover:bg-ivory hover:text-ink" : "border-ink/10 bg-paper hover:border-ink hover:bg-ink hover:text-ivory"
                }`}
              >
                <span>
                  <span className="block text-[0.98rem] font-semibold leading-tight">{p.name}</span>
                  <span className={`block text-[0.8rem] ${dark ? "text-stone-ink" : "text-muted"} group-hover:text-current group-hover:opacity-70`}>{p.area}</span>
                </span>
                <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
