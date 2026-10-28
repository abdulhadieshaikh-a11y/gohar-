"use client";

import Image from "next/image";
import { useState } from "react";
import { IMAGE_KIND_LABELS, type ImageKind } from "@/types/project";

interface ApproachItem {
  number: string;
  title: string;
  body: string;
  image: { src: string; alt: string; kind: ImageKind; caption: string };
}

/**
 * The company's published values as an interactive list: hovering, focusing
 * or tapping a value opens its description and brings its image forward.
 */
export function ApproachList({ items }: { items: ApproachItem[] }) {
  const [active, setActive] = useState(0);
  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
      <ol className="border-t border-ivory/15 lg:col-span-7">
        {items.map((v, i) => {
          const open = i === active;
          return (
            <li key={v.title} className="border-b border-ivory/15">
              <button
                type="button"
                aria-expanded={open}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                className="group grid w-full grid-cols-[3rem_1fr] items-baseline gap-4 py-7 text-left sm:grid-cols-[4.5rem_1fr]"
              >
                <span className={`num text-[0.78rem] transition-colors duration-500 ${open ? "text-brass-light" : "text-stone-ink"}`}>{v.number}</span>
                <span>
                  <span
                    className={`block font-display text-[clamp(2rem,4vw,3.4rem)] leading-[1.02] transition-[color,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      open ? "translate-x-2 text-ivory" : "text-stone-ink group-hover:text-ivory"
                    }`}
                  >
                    {v.title}
                  </span>
                  <span
                    className={`grid transition-[grid-template-rows,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <span className="overflow-hidden">
                      <span className="block max-w-lg pt-4 text-[1rem] leading-relaxed text-stone">{v.body}</span>
                    </span>
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <div className="relative hidden lg:col-span-5 lg:block">
        <div className="theme-dark sticky top-28 aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-ink-3">
          {items.map((v, i) => (
            <figure
              key={v.title}
              className={`absolute inset-0 transition-[clip-path] duration-[1100ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${
                i === active ? "z-10 [clip-path:inset(0_0_0_0)]" : "z-0 [clip-path:inset(100%_0_0_0)]"
              }`}
              aria-hidden={i !== active}
            >
              <Image quality={85} src={v.image.src} alt={i === active ? v.image.alt : ""} fill sizes="38vw" className="object-cover" />
              <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-ink/85 to-transparent p-6 text-[0.75rem] text-stone">
                <span className="font-display text-[1.3rem] text-ivory">{v.image.caption}</span>
                <span className="uppercase tracking-[0.12em]">{IMAGE_KIND_LABELS[v.image.kind]}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}
