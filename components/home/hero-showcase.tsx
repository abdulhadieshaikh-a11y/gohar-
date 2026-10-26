"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play } from "lucide-react";
import { IMAGE_KIND_LABELS, type ImageKind } from "@/types/project";
import { buttonClasses } from "@/components/ui/button";
import { SplitWords } from "@/components/ui/split-words";

export interface HeroSlide {
  slug: string;
  name: string;
  location: string;
  category: string;
  image: { src: string; alt: string; kind: ImageKind };
}

const INTERVAL = 7000;

/**
 * Monumental homepage hero: a full-bleed photograph per development, a giant
 * two-tone headline, and calls to action that are visible immediately.
 * Only slides that have been shown (plus the next one) mount their image, so
 * the page downloads one large image up front instead of all of them.
 * Auto-advance can be paused at every screen size (WCAG 2.2.2) and is off for
 * visitors who prefer reduced motion.
 */
export function HeroShowcase({ slides, tagline }: { slides: HeroSlide[]; tagline: string }) {
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [playing, setPlaying] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  // Slides whose image has been mounted once stay mounted (no re-download, no flash).
  const [mounted, setMounted] = useState<ReadonlySet<number>>(() => new Set([0]));

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Warm up the next slide shortly after the first paint, then keep one ahead.
  useEffect(() => {
    const next = (active + 1) % slides.length;
    const t = window.setTimeout(
      () => setMounted((m) => (m.has(next) && m.has(active) ? m : new Set([...m, active, next]))),
      active === 0 ? 2500 : 0,
    );
    return () => window.clearTimeout(t);
  }, [active, slides.length]);

  const autoplay = playing && !reducedMotion && slides.length > 1;
  const go = (i: number) => {
    const next = (i + slides.length) % slides.length;
    if (next === active) return;
    setMounted((m) => (m.has(next) ? m : new Set([...m, next])));
    setPrev(active);
    setActive(next);
  };

  useEffect(() => {
    if (!autoplay) return;
    const t = window.setTimeout(() => {
      setPrev(active);
      setActive((active + 1) % slides.length);
    }, INTERVAL);
    return () => window.clearTimeout(t);
  }, [autoplay, active, slides.length]);

  /* Pointer: a soft light follows the cursor and the photo shifts slightly (desktop).
     Touch: swipe left/right to change development. */
  const sectionRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const section = sectionRef.current;
    const media = mediaRef.current;
    const light = lightRef.current;
    if (!section || !media || !light) return;
    if (!window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let px = 0.5;
    let py = 0.5;
    const apply = () => {
      raf = 0;
      light.style.setProperty("--px", `${(px * 100).toFixed(1)}%`);
      light.style.setProperty("--py", `${(py * 100).toFixed(1)}%`);
      media.style.transform = `translate3d(${((0.5 - px) * 24).toFixed(1)}px, ${((0.5 - py) * 16).toFixed(1)}px, 0) scale(1.04)`;
    };
    const onMove = (e: PointerEvent) => {
      const r = section.getBoundingClientRect();
      px = (e.clientX - r.left) / r.width;
      py = (e.clientY - r.top) / r.height;
      light.dataset.on = "true";
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      delete light.dataset.on;
      px = 0.5;
      py = 0.5;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    section.addEventListener("pointermove", onMove);
    section.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const current = slides[active]!;
  const [lead, accent] = splitTagline(tagline);
  const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

  return (
    <section
      ref={sectionRef}
      onTouchStart={(e) => {
        const p = e.touches[0];
        if (p) touchStart.current = { x: p.clientX, y: p.clientY };
      }}
      onTouchEnd={(e) => {
        const s = touchStart.current;
        const p = e.changedTouches[0];
        touchStart.current = null;
        if (!s || !p) return;
        const dx = p.clientX - s.x;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(p.clientY - s.y) * 1.5) go(active + (dx < 0 ? 1 : -1));
      }}
      aria-roledescription="carousel"
      aria-label="Gohar developments"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-ink text-ivory"
    >
      {/* Slides */}
      <div ref={mediaRef} className="absolute inset-0 -z-20 transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)]">
        {slides.map((slide, i) => (
          <div
            key={slide.slug}
            className="hero-slide absolute inset-0 overflow-hidden"
            data-active={i === active}
            data-prev={i === prev && i !== active}
            data-first={i === 0 ? "" : undefined}
            aria-hidden={i !== active}
          >
            {mounted.has(i) || i === active ? (
              <Image
                src={slide.image.src}
                alt={i === active ? slide.image.alt : ""}
                fill
                sizes="100vw"
                quality={85}
                preload={i === 0}
                className="object-cover"
              />
            ) : null}
          </div>
        ))}
      </div>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/35 to-ink/50" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/80 via-ink/25 to-transparent" />
      <div ref={lightRef} aria-hidden="true" className="pointer-light -z-10" />

      <div className="container-site relative flex flex-1 flex-col justify-end pb-8 pt-32 lg:pb-10">
        <div className="grid items-end gap-12 lg:grid-cols-12">
          {/* Headline */}
          <div className="lg:col-span-9">
            <p className="eyebrow hero-fade flex items-center gap-3 text-ivory/80" style={d(0)}>
              <span className="brand-dot" aria-hidden="true" />
              <span className="hidden sm:inline">
                Gohar Group of Companies <span aria-hidden="true" className="px-1 text-ivory/40">/</span>
              </span>
              Karachi &amp; Hyderabad
            </p>
            <h1 className="display-2xl hero-words mt-6 max-w-[13ch]">
              <SplitWords text={lead} />{" "}
              <SplitWords text={accent} em start={lead.split(" ").length} className="text-ivory/45" />
            </h1>
            <div className="hero-fade mt-9 flex flex-col gap-8 xl:flex-row xl:items-end xl:gap-14" style={d(250)}>
              <p className="max-w-md text-[1.05rem] leading-relaxed text-stone sm:text-[1.12rem]">
                Residential towers, shopping centres, mixed-use landmarks and gated communities, built around the
                families and businesses who live and work in them.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/site-visit" data-magnetic="" className={buttonClasses("solid-light", "lg", "transition-transform")}>
                  Request a site visit <ArrowUpRight aria-hidden="true" className="size-4" />
                </Link>
                <Link href="/projects" data-magnetic="" className={buttonClasses("ghost-light", "lg", "transition-transform")}>
                  Explore projects
                </Link>
              </div>
            </div>
          </div>

          {/* Project index */}
          <div className="hero-fade hidden lg:col-span-3 lg:block" style={d(400)}>
            <p className="eyebrow mb-4 text-ivory/60">Developments</p>
            <ol className="border-t border-ivory/15" aria-label="Choose a development">
              {slides.map((s, i) => (
                <li key={s.slug} className="relative border-b border-ivory/15">
                  <button
                    type="button"
                    onClick={() => go(i)}
                    aria-current={i === active ? "true" : undefined}
                    className={`group flex w-full items-baseline gap-3 py-3 text-left transition-colors duration-500 [text-shadow:0_1px_18px_rgb(0_0_0/0.55)] ${
                      i === active ? "text-ivory" : "text-ivory/55 hover:text-ivory"
                    }`}
                  >
                    <span className="num text-[0.72rem] text-ivory/50">{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-display text-[1.05rem] leading-tight">{s.name}</span>
                  </button>
                  {i === active ? (
                    <span
                      key={`${active}-${autoplay}`}
                      aria-hidden="true"
                      className={`absolute inset-x-0 -bottom-px h-[2px] bg-gohar ${autoplay ? "slide-progress" : ""}`}
                      style={{ ["--slide-duration" as string]: `${INTERVAL}ms` }}
                      data-paused={!autoplay}
                    />
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 lg:mt-14">
          <span aria-hidden="true" className="block h-px bg-ivory/20" />
          <div className="flex items-center justify-between gap-4 pt-5">
            <Link href={`/projects/${current.slug}`} className="group flex min-w-0 items-center gap-3" aria-live="polite">
              <span className="num shrink-0 text-[0.8rem] font-semibold text-ivory">
                {String(active + 1).padStart(2, "0")}
                <span className="text-ivory/40"> / {String(slides.length).padStart(2, "0")}</span>
              </span>
              <span className="truncate text-[0.85rem] text-stone">
                <span className="font-semibold text-ivory">{current.name}</span>
                <span className="hidden sm:inline"> · {current.location} · {IMAGE_KIND_LABELS[current.image.kind]}</span>
              </span>
              <ArrowUpRight aria-hidden="true" className="size-4 shrink-0 text-stone transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ivory" />
            </Link>
            <div className="flex shrink-0 items-center gap-2">
              {!reducedMotion && slides.length > 1 ? (
                <button type="button" onClick={() => setPlaying((p) => !p)} className="grid size-11 place-items-center rounded-full border border-ivory/25 transition-colors duration-500 hover:border-ivory">
                  {playing ? <Pause aria-hidden="true" className="size-3.5" /> : <Play aria-hidden="true" className="size-3.5" />}
                  <span className="sr-only">{playing ? "Pause slideshow" : "Play slideshow"}</span>
                </button>
              ) : null}
              <button type="button" onClick={() => go(active - 1)} className="grid size-11 place-items-center rounded-full border border-ivory/25 transition-colors duration-500 hover:border-ivory hover:bg-ivory hover:text-ink">
                <ArrowLeft aria-hidden="true" className="size-4" />
                <span className="sr-only">Previous development</span>
              </button>
              <button type="button" onClick={() => go(active + 1)} className="grid size-11 place-items-center rounded-full border border-ivory/25 transition-colors duration-500 hover:border-ivory hover:bg-ivory hover:text-ink">
                <ArrowRight aria-hidden="true" className="size-4" />
                <span className="sr-only">Next development</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** "Where Relationships Come First." → ["Where relationships", "come first."] */
function splitTagline(tagline: string): [string, string] {
  const words = tagline.replace(/\s+/g, " ").trim().split(" ");
  const cut = Math.max(1, words.length - 2);
  const sentence = words.map((w, i) => (i === 0 ? w : w.toLowerCase()));
  return [sentence.slice(0, cut).join(" "), sentence.slice(cut).join(" ")];
}
