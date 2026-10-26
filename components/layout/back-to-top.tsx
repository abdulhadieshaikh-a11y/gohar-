"use client";

import { ArrowUp } from "lucide-react";

/** Returns to the top of the page (smoothly where motion is allowed) and moves focus to the main content. */
export function BackToTop() {
  const onClick = () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (window.__lenis && !reduced) window.__lenis.scrollTo(0, { duration: 1.4 });
    else window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    document.getElementById("main")?.focus({ preventScroll: true });
  };
  return (
    <button type="button" onClick={onClick} className="group inline-flex items-center gap-3 self-start text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-stone hover:text-ivory sm:self-auto">
      Back to top
      <span className="grid size-10 place-items-center rounded-full border border-ivory/25 transition-colors duration-500 group-hover:border-ivory group-hover:bg-ivory group-hover:text-ink">
        <ArrowUp aria-hidden="true" className="size-4 transition-transform duration-500 group-hover:-translate-y-0.5" />
      </span>
    </button>
  );
}
