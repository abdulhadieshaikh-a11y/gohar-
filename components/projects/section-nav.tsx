"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Floating in-page navigation (a glass pill) that highlights the section in
 * view and keeps the active item scrolled into sight on small screens.
 */
export function SectionNav({ sections, label }: { sections: { id: string; label: string }[]; label: string }) {
  const [active, setActive] = useState(sections[0]?.id);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const targets = sections.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [sections]);

  useEffect(() => {
    const list = listRef.current;
    const item = list?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!list || !item) return;
    const left = item.offsetLeft - list.clientWidth / 2 + item.clientWidth / 2;
    list.scrollTo({ left, behavior: "smooth" });
  }, [active]);

  return (
    <nav aria-label={label} className="pointer-events-none sticky top-3 z-30 py-3">
      <div className="container-site flex justify-center">
        <ul
          ref={listRef}
          className="no-scrollbar pointer-events-auto flex max-w-full gap-1 overflow-x-auto rounded-full border border-line bg-paper/85 p-1.5 shadow-[0_20px_50px_-30px_rgb(15_14_13/0.45)] backdrop-blur-xl"
        >
          {sections.map((s) => (
            <li key={s.id} className="shrink-0">
              <a
                href={`#${s.id}`}
                aria-current={active === s.id ? "true" : undefined}
                className={`block rounded-full px-4 py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.12em] transition-colors duration-500 ${
                  active === s.id ? "bg-ink text-ivory" : "text-muted hover:text-ink"
                }`}
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
