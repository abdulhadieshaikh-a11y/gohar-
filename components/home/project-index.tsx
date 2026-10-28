"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";

export interface IndexProject {
  slug: string;
  name: string;
  category: string;
  location: string;
  image: { src: string; alt: string };
}

/**
 * Interactive project index: oversized names in a list. On desktop, hovering
 * a row slides it open and a photograph of that development follows the
 * pointer, swapping with a wipe as you move between rows. On touch screens
 * each row shows its own thumbnail instead. Every row is a plain link.
 */
export function ProjectIndex({ projects }: { projects: IndexProject[] }) {
  const [active, setActive] = useState<number | null>(null);
  const [everHovered, setEverHovered] = useState(false);
  const floatRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    const float = floatRef.current;
    if (!list || !float) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;
    let raf = 0;
    const loop = () => {
      x += (tx - x) * 0.14;
      y += (ty - y) * 0.14;
      const tilt = Math.max(-8, Math.min(8, (tx - x) * 0.05));
      float.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${tilt.toFixed(2)}deg)`;
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.2 ? requestAnimationFrame(loop) : 0;
    };
    const onMove = (e: PointerEvent) => {
      const r = list.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const onEnter = (e: PointerEvent) => {
      const r = list.getBoundingClientRect();
      x = tx = e.clientX - r.left;
      y = ty = e.clientY - r.top;
      setEverHovered(true);
    };
    list.addEventListener("pointermove", onMove);
    list.addEventListener("pointerenter", onEnter);
    return () => {
      cancelAnimationFrame(raf);
      list.removeEventListener("pointermove", onMove);
      list.removeEventListener("pointerenter", onEnter);
    };
  }, []);

  return (
    <div className="relative">
      <ul ref={listRef} className="relative border-t border-ivory/15" onPointerLeave={() => setActive(null)}>
        {projects.map((p, i) => (
          <li key={p.slug} className="border-b border-ivory/15">
            <Link
              href={`/projects/${p.slug}`}
              onPointerEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              className={`group relative isolate flex items-center gap-4 py-5 transition-[padding,color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:gap-8 sm:py-7 lg:py-8 ${
                active === i ? "lg:pl-6" : ""
              } ${active !== null && active !== i ? "text-ivory lg:text-ivory/35" : "text-ivory"}`}
            >
              {/* Soft light fill that sweeps up behind the active row */}
              <span
                aria-hidden="true"
                className={`absolute inset-0 -z-10 hidden origin-bottom bg-ivory/[0.06] transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] lg:block ${
                  active === i ? "scale-y-100" : "scale-y-0"
                }`}
              />
              <span className={`num w-8 shrink-0 text-[0.8rem] font-semibold transition-colors duration-300 ${active === i ? "lg:text-gohar" : "text-stone-ink"}`}>
                {String(i + 1).padStart(2, "0")}
              </span>
              {/* Touch: inline thumbnail */}
              <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-ink-3 sm:size-20 lg:hidden">
                <Image quality={85} src={p.image.src} alt="" fill sizes="80px" className="object-cover" />
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={`block font-display text-[clamp(1.6rem,4.6vw,4.4rem)] leading-[0.95] transition-colors duration-300 ${
                    active === i ? "lg:text-gohar" : ""
                  }`}
                >
                  {p.name}
                </span>
                <span className={`mt-2 block text-[0.85rem] transition-colors duration-300 lg:hidden`}>
                  <span className="text-stone">{p.location}</span>
                </span>
              </span>
              <span className={`hidden shrink-0 text-right text-[0.85rem] leading-snug transition-colors duration-300 lg:block ${active === i ? "text-ivory" : "text-stone"}`}>
                {p.category}
                <span className="block">{p.location}</span>
              </span>
              <span
                className={`grid size-12 shrink-0 place-items-center rounded-full border transition-all duration-500 ${
                  active === i ? "rotate-45 border-gohar bg-gohar text-ivory lg:mr-6" : "border-ivory/25"
                }`}
              >
                <ArrowUpRight aria-hidden="true" className="size-5" />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Desktop: floating preview that follows the pointer */}
      <div
        ref={floatRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-20 hidden lg:block"
        style={{ transform: "translate3d(-9999px,0,0)" }}
      >
        <div
          className={`relative -ml-[11rem] -mt-[8rem] h-[16rem] w-[22rem] overflow-hidden rounded-2xl shadow-[0_40px_80px_-30px_rgb(0_0_0/0.65)] transition-[opacity,scale] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            active !== null ? "scale-100 opacity-100" : "scale-75 opacity-0"
          }`}
        >
          {everHovered
            ? projects.map((p, i) => (
                <span
                  key={p.slug}
                  className="absolute inset-0 transition-[clip-path] duration-700 ease-[cubic-bezier(0.76,0,0.24,1)]"
                  style={{ clipPath: active === i ? "inset(0 0 0 0)" : "inset(100% 0 0 0)", zIndex: active === i ? 2 : 1 }}
                >
                  <Image quality={85} src={p.image.src} alt="" fill sizes="352px" className={`object-cover transition-transform duration-[1200ms] ${active === i ? "scale-100" : "scale-125"}`} />
                </span>
              ))
            : null}
        </div>
      </div>
    </div>
  );
}
