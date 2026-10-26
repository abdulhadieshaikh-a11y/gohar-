"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

/**
 * Site-wide motion system (one small client component, no animation library).
 *
 *  - Smooth scrolling (Lenis) on desktop pointers; native scrolling on touch.
 *  - Scroll reveals for [data-reveal] elements:
 *      "up" (default) rise + fade · "fade" · "mask" image clip-reveal with a
 *      settling zoom · "clip-left" horizontal wipe · "words" masked words
 *      rising (see SplitWords) · "stagger" children one after another ·
 *      "line" a hairline drawing itself.
 *  - Parallax for [data-parallax="0.12"] (speed as a fraction of the viewport).
 *  - A cursor dot that swells over clickable things, and a cursor label for
 *    [data-cursor="View"], on fine pointers (the system cursor stays visible).
 *  - 3D tilt with a moving glare for [data-tilt] cards (value = max degrees).
 *  - Magnetic pull for [data-magnetic] buttons on fine pointers.
 *
 * Accessibility and robustness:
 *  - Nothing is hidden with CSS. After hydration only elements still below
 *    the fold are parked at their first keyframe and played when they scroll
 *    into view; anything on screen stays visible. Without JavaScript the
 *    page is fully readable.
 *  - prefers-reduced-motion disables all of it.
 *  - Uses the Web Animations API, so React-managed attributes are untouched.
 */

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const EASE_LUX = "cubic-bezier(0.76, 0, 0.24, 1)";

type Lenisish = { stop(): void; start(): void; resize(): void; scrollTo(target: number | HTMLElement, opts?: object): void };
declare global {
  interface Window {
    __lenis?: Lenisish;
  }
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function buildAnimations(el: HTMLElement): Animation[] {
  const variant = el.dataset.reveal || "up";
  const delay = Number.parseInt(el.style.getPropertyValue("--reveal-delay"), 10) || 0;
  const anims: Animation[] = [];
  switch (variant) {
    case "fade":
      anims.push(el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1300, delay, easing: EASE, fill: "both" }));
      break;
    case "mask": {
      anims.push(
        el.animate([{ clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0 0 0 0)" }], {
          duration: 1500,
          delay,
          easing: EASE_LUX,
          fill: "both",
        }),
      );
      const img = el.querySelector("img");
      if (img) {
        anims.push(img.animate([{ transform: "scale(1.22)" }, { transform: "scale(1)" }], { duration: 2200, delay, easing: EASE, fill: "both" }));
      }
      break;
    }
    case "clip-left":
      anims.push(
        el.animate([{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0 0 0)" }], {
          duration: 1400,
          delay,
          easing: EASE_LUX,
          fill: "both",
        }),
      );
      break;
    case "words": {
      const words = el.querySelectorAll<HTMLElement>(".split-mask > span");
      words.forEach((w, i) => {
        anims.push(
          w.animate([{ transform: "translate3d(0, 108%, 0)" }, { transform: "none" }], {
            duration: 1150,
            delay: delay + i * 55,
            easing: EASE_LUX,
            fill: "both",
          }),
        );
      });
      if (!words.length) anims.push(el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 900, delay, easing: EASE, fill: "both" }));
      break;
    }
    case "stagger":
      Array.from(el.children).forEach((child, i) => {
        anims.push(
          child.animate([{ opacity: 0, transform: "translate3d(0, 32px, 0)" }, { opacity: 1, transform: "none" }], {
            duration: 1000,
            delay: delay + i * 90,
            easing: EASE,
            fill: "both",
          }),
        );
      });
      break;
    case "line":
      anims.push(
        el.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: 1400, delay, easing: EASE_LUX, fill: "both" }),
      );
      break;
    default:
      anims.push(
        el.animate([{ opacity: 0, transform: "translate3d(0, 28px, 0)" }, { opacity: 1, transform: "none" }], {
          duration: 1000,
          delay,
          easing: EASE,
          fill: "both",
        }),
      );
  }
  // The final keyframe always equals the element's natural style, so once an
  // animation finishes it is removed; CSS (e.g. hover zooms) takes over again.
  anims.forEach((a) => a.addEventListener("finish", () => a.cancel()));
  return anims;
}

export function MotionSystem() {
  const pathname = usePathname();
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  /* Smooth scrolling (desktop pointers only). */
  useEffect(() => {
    if (prefersReducedMotion() || !window.matchMedia("(pointer: fine)").matches) return;
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      anchors: { offset: -96 },
      autoRaf: true,
      prevent: (node) => !!node.closest?.("[data-lenis-prevent], dialog"),
    });
    window.__lenis = lenis;
    // Pause while a modal dialog (menu, lightbox) is open.
    const sync = () => (document.querySelector("dialog[open]") ? lenis.stop() : lenis.start());
    const mo = new MutationObserver(sync);
    mo.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["open"] });
    return () => {
      mo.disconnect();
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  useEffect(() => {
    window.__lenis?.resize();
  }, [pathname]);

  /* Reveals + parallax (re-scanned on every route). */
  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (!("IntersectionObserver" in window) || !("animate" in Element.prototype)) return;

    const parked = new Map<Element, Animation[]>();
    const handled = new WeakSet<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          parked.get(entry.target)?.forEach((a) => a.play());
          parked.delete(entry.target);
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    let parallaxItems: HTMLElement[] = [];
    const scan = () => {
      const fold = window.innerHeight;
      // Read every position first, then create animations (avoids layout thrashing).
      const fresh = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]")).filter((el) => !handled.has(el));
      const below = fresh.filter((el) => {
        handled.add(el);
        return el.getBoundingClientRect().top >= fold * 0.98; // on screen already: leave it visible
      });
      below.forEach((el) => {
        const anims = buildAnimations(el);
        anims.forEach((a) => {
          a.pause();
          a.currentTime = 0;
        });
        // A fully clipped element counts as invisible to IntersectionObserver,
        // so clip reveals watch their (unclipped) parent instead.
        const clipped = el.dataset.reveal === "mask" || el.dataset.reveal === "clip-left";
        const watch = (clipped ? el.parentElement : null) ?? el;
        parked.set(watch, [...(parked.get(watch) ?? []), ...anims]);
        io.observe(watch);
      });
      parallaxItems = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
      updateParallax();
    };

    let ticking = false;
    function updateParallax() {
      ticking = false;
      const vh = window.innerHeight;
      for (const el of parallaxItems) {
        const box = (el.parentElement ?? el).getBoundingClientRect();
        if (box.bottom < -100 || box.top > vh + 100) continue;
        const speed = Number(el.dataset.parallax) || 0.1;
        const progress = (box.top + box.height / 2 - vh / 2) / vh; // -1 … 1 around the viewport centre
        el.style.transform = `translate3d(0, ${(-progress * speed * vh).toFixed(1)}px, 0)`;
      }
    }
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateParallax);
      }
    };

    // First scan after the browser has painted the page.
    const firstScan = requestAnimationFrame(scan);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    let frame = 0;
    const mo = new MutationObserver(() => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        scan();
      });
    });
    mo.observe(document.getElementById("main") ?? document.body, { childList: true, subtree: true });

    const finishAll = () => {
      parked.forEach((list) => list.forEach((a) => a.finish()));
      parked.clear();
    };
    window.addEventListener("beforeprint", finishAll);

    return () => {
      io.disconnect();
      mo.disconnect();
      cancelAnimationFrame(frame);
      cancelAnimationFrame(firstScan);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("beforeprint", finishAll);
      finishAll();
    };
  }, [pathname]);

  /* Cursor dot + label, tilt cards and magnetic buttons (fine pointers only). */
  useEffect(() => {
    if (prefersReducedMotion() || !window.matchMedia("(pointer: fine)").matches) return;
    const label = cursorRef.current;
    const dot = dotRef.current;
    if (!label || !dot) return;

    let x = -100;
    let y = -100;
    let tx = -100;
    let ty = -100;
    let raf = 0;
    let magnet: HTMLElement | null = null;
    let tilt: HTMLElement | null = null;

    const loop = () => {
      x += (tx - x) * 0.2;
      y += (ty - y) * 0.2;
      const t = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      label.style.transform = t;
      dot.style.transform = t;
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.3 ? requestAnimationFrame(loop) : 0;
    };

    const resetTilt = () => {
      if (!tilt) return;
      tilt.style.transform = "";
      tilt.style.removeProperty("--gx");
      tilt.style.removeProperty("--gy");
      tilt = null;
    };

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!raf) raf = requestAnimationFrame(loop);
      dot.dataset.on = "true";

      const target = e.target as Element | null;

      // The dot swells over anything clickable.
      const clickable = target?.closest?.("a, button, [role='button'], summary, label, select");
      dot.dataset.hover = clickable ? "true" : "false";

      // 3D tilt with a moving glare on [data-tilt] cards.
      const t = target?.closest?.<HTMLElement>("[data-tilt]") ?? null;
      if (tilt && tilt !== t) resetTilt();
      if (t) {
        const r = t.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const max = Number(t.dataset.tilt) || 6;
        t.style.transform = `perspective(1000px) rotateX(${((0.5 - py) * max).toFixed(2)}deg) rotateY(${((px - 0.5) * max).toFixed(2)}deg) translateZ(0)`;
        t.style.setProperty("--gx", `${(px * 100).toFixed(1)}%`);
        t.style.setProperty("--gy", `${(py * 100).toFixed(1)}%`);
        tilt = t;
      }
      // Pointer-following light on .spotlight cards.
      const spot = target?.closest?.<HTMLElement>(".spotlight");
      if (spot) {
        const r = spot.getBoundingClientRect();
        spot.style.setProperty("--mx", `${(e.clientX - r.left).toFixed(0)}px`);
        spot.style.setProperty("--my", `${(e.clientY - r.top).toFixed(0)}px`);
      }
      const host = target?.closest?.<HTMLElement>("[data-cursor]");
      if (host) {
        if (label.textContent !== host.dataset.cursor) label.textContent = host.dataset.cursor ?? "";
        label.dataset.visible = "true";
      } else if (label.dataset.visible) {
        delete label.dataset.visible;
      }

      const m = target?.closest?.<HTMLElement>("[data-magnetic]") ?? null;
      if (magnet && magnet !== m) {
        magnet.style.transform = "";
        magnet = null;
      }
      if (m) {
        const r = m.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        m.style.transform = `translate3d(${(dx * 10).toFixed(1)}px, ${(dy * 8).toFixed(1)}px, 0)`;
        magnet = m;
      }
    };
    const onLeave = () => {
      delete label.dataset.visible;
      delete dot.dataset.on;
      if (magnet) magnet.style.transform = "";
      magnet = null;
      resetTilt();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  // Hide the label on navigation (the hovered element may be gone).
  useEffect(() => {
    if (cursorRef.current) delete cursorRef.current.dataset.visible;
  }, [pathname]);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={cursorRef} className="cursor-label" aria-hidden="true" />
    </>
  );
}
