import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "./breadcrumbs";
import { SplitWords } from "./split-words";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  /** Italic accent words after the title, shown in champagne. */
  accent?: string;
  lead?: ReactNode;
  image: { src: string; alt?: string };
  crumbs: Crumb[];
  /** Right-hand column under the lead (e.g. buttons). */
  children?: ReactNode;
  /** Full-width content under the heading (e.g. a figures strip). */
  footer?: ReactNode;
}

/**
 * Cinematic dark hero for inner pages: a parallax photograph that settles
 * from a slow zoom, fine architectural grid lines, and a headline whose words
 * rise from masks. Entrance motion is CSS-only (runs on first paint).
 */
export function PageHero({ eyebrow, title, accent, lead, image, crumbs, children, footer }: PageHeroProps) {
  const titleWords = title.split(/\s+/).length;
  return (
    <section className="grain relative isolate overflow-hidden bg-ink text-ivory">
      <div className="absolute inset-x-0 -top-[12%] -z-20 h-[124%]" suppressHydrationWarning data-parallax="0.1">
        <Image
          src={image.src}
          alt={image.alt ?? ""}
          fill
          preload
          sizes="100vw"
          quality={85}
          className="page-hero-image object-cover opacity-80"
        />
      </div>
      {/* Neutral, photographic grading: deep at the bottom and left for legible type, open at the top right. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/45 to-ink/30" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/85 via-ink/35 to-transparent" />

      <div className="container-site pb-16 pt-36 lg:pb-24 lg:pt-48">
        <div className="hero-fade" style={{ "--d": "100ms" } as CSSProperties}>
          <Breadcrumbs tone="dark" items={crumbs} />
        </div>
        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="eyebrow hero-fade flex items-center gap-3 text-brass-light" style={{ "--d": "200ms" } as CSSProperties}>
              <span className="brand-dot" aria-hidden="true" />
              {eyebrow}
            </p>
            <h1 className="display-xl hero-words mt-6">
              <SplitWords text={title} />
              {accent ? (
                <>
                  {" "}
                  <SplitWords text={accent} em start={titleWords} className="text-brass-light" />
                </>
              ) : null}
            </h1>
          </div>
          {lead || children ? (
            <div className="hero-fade lg:col-span-4" style={{ "--d": "800ms" } as CSSProperties}>
              {lead ? <div className="text-[1.02rem] leading-relaxed text-stone">{lead}</div> : null}
              {children ? <div className={lead ? "mt-8" : ""}>{children}</div> : null}
            </div>
          ) : null}
        </div>
        {footer ? (
          <div className="hero-fade mt-14 lg:mt-20" style={{ "--d": "1000ms" } as CSSProperties}>
            {footer}
          </div>
        ) : null}
      </div>
    </section>
  );
}
