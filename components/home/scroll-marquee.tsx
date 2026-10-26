"use client";

import { useEffect, useRef } from "react";

/**
 * Oversized line of words that runs continuously and speeds up with the
 * visitor's scroll (scrolling down pushes it forward, up pulls it back).
 * Runs only while on screen; static for reduced motion.
 */
export function ScrollMarquee({
  items,
  className = "",
  speed = 0.045,
  size = "lg",
  reverse = false,
}: {
  items: string[];
  className?: string;
  /** Base speed in % of the track per frame. */
  speed?: number;
  size?: "lg" | "md";
  reverse?: boolean;
}) {
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = track.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let offset = 0;
    let velocity = 0;
    let lastY = window.scrollY;
    let raf = 0;
    let visible = false;
    const dir = reverse ? -1 : 1;

    const loop = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;
      // Scroll adds momentum that eases back to the base speed.
      velocity += (delta * 0.012 - velocity) * 0.12;
      offset -= (speed + velocity) * dir;
      // The track holds the list twice: wrap at half its width.
      if (offset <= -50) offset += 50;
      if (offset > 0) offset -= 50;
      el.style.transform = `translate3d(${offset.toFixed(3)}%, 0, 0) skewX(${Math.max(-8, Math.min(8, -velocity * 6 * dir)).toFixed(2)}deg)`;
      raf = visible ? requestAnimationFrame(loop) : 0;
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting;
      if (visible && !raf) {
        lastY = window.scrollY;
        raf = requestAnimationFrame(loop);
      }
    });
    io.observe(el.parentElement!);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [speed, reverse]);

  const row = [...items, ...items];
  const text = size === "lg" ? "text-[clamp(3.5rem,9vw,9rem)]" : "text-[clamp(2rem,4.5vw,4.25rem)]";
  return (
    <div className={`overflow-hidden ${className}`} aria-hidden="true">
      <div ref={track} className="flex w-max items-center whitespace-nowrap will-change-transform">
        {row.map((item, i) => (
          <span key={`${item}-${i}`} className="flex items-center">
            <span
              className={`font-display ${text} px-[0.35em] leading-[1.05] ${
                i % 2 === 1 ? "text-transparent [-webkit-text-stroke:1px_currentColor] opacity-60" : ""
              }`}
            >
              {item}
            </span>
            <span className="size-2.5 shrink-0 rotate-45 bg-gohar" />
          </span>
        ))}
      </div>
    </div>
  );
}
