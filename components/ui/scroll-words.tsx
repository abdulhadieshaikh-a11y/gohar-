"use client";

import { useEffect, useRef } from "react";

/**
 * Editorial statement whose words light up one by one as it scrolls through
 * the viewport. Words render at full strength on the server and without
 * JavaScript; reduced-motion visitors always see the full-strength text.
 */
// The dimmest words stay at 50% strength: still at least 3:1 contrast for large text (WCAG AA).
export function ScrollWords({ text, className = "", dim = 0.5 }: { text: string; className?: string; dim?: number }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = text.split(/\s+/).filter(Boolean);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const spans = Array.from(el.querySelectorAll<HTMLSpanElement>("span[data-w]"));
    let ticking = false;
    const update = () => {
      ticking = false;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the block's top reaches 85% of the viewport, 1 when its bottom passes 45%.
      const progress = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.4)));
      const lit = progress * spans.length;
      spans.forEach((s, i) => {
        const o = Math.min(1, Math.max(dim, lit - i + dim));
        s.style.opacity = o.toFixed(3);
      });
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      spans.forEach((s) => (s.style.opacity = ""));
    };
  }, [dim, text]);

  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        <span key={`${w}-${i}`}>
          <span data-w="" className="transition-opacity duration-300">
            {w}
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </p>
  );
}
