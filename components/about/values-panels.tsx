"use client";

import Image from "next/image";
import { useState } from "react";
import { Plus } from "lucide-react";

export interface ValuePanel {
  number: string;
  title: string;
  body: string;
  image: { src: string; alt: string };
}

/**
 * The company's published values as expanding photo panels. Desktop: the
 * hovered or focused panel widens and reveals its text. Touch: panels stack
 * and a tap opens one. Text is always in the DOM for screen readers.
 */
export function ValuesPanels({ items }: { items: ValuePanel[] }) {
  const [active, setActive] = useState(0);
  return (
    <ul className="flex flex-col gap-3 lg:h-[34rem] lg:flex-row">
      {items.map((v, i) => {
        const open = i === active;
        return (
          <li
            key={v.title}
            className={`relative overflow-hidden rounded-[1.5rem] bg-ink text-ivory transition-[flex-grow,height] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              open ? "h-[26rem] lg:h-auto lg:flex-[3.2]" : "h-28 lg:h-auto lg:flex-1"
            }`}
          >
            <button
              type="button"
              aria-expanded={open}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              className="group absolute inset-0 isolate flex h-full w-full flex-col justify-end p-6 text-left sm:p-8"
            >
              <Image quality={85}
                src={v.image.src}
                alt=""
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className={`-z-10 object-cover transition-[transform,opacity] duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  open ? "scale-100 opacity-70" : "scale-110 opacity-30"
                }`}
              />
              <span aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/40 to-ink/10" />
              <span className="flex items-start justify-between gap-4">
                <span className={`font-display text-[clamp(2.4rem,4vw,4rem)] leading-none transition-colors duration-500 ${open ? "text-gohar" : "text-ivory/40"}`}>
                  {v.number}
                </span>
                <span
                  aria-hidden="true"
                  className={`grid size-10 shrink-0 place-items-center rounded-full border border-ivory/30 transition-transform duration-500 ${open ? "rotate-45" : ""}`}
                >
                  <Plus className="size-4" />
                </span>
              </span>
              <span className="mt-auto block">
                <span
                  className={`block font-display leading-[1.02] transition-[font-size] duration-500 ${
                    open ? "text-[clamp(1.9rem,3vw,3rem)]" : "text-[1.4rem] lg:[writing-mode:vertical-rl] lg:rotate-180 lg:text-[1.6rem]"
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
                    <span className="block max-w-md pt-4 text-[1.02rem] leading-relaxed text-stone">{v.body}</span>
                  </span>
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
