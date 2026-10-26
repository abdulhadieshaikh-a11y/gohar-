import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, LayoutGrid } from "lucide-react";
import type { Project } from "@/types/project";

/** Previous / next project navigation with a link back to the full collection. */
export function ProjectPager({ prev, next }: { prev: Project; next: Project }) {
  const item = (p: Project, dir: "prev" | "next") => (
    <Link
      href={`/projects/${p.slug}`}
      data-cursor={dir === "prev" ? "Previous" : "Next"}
      className={`group relative isolate flex min-h-[22rem] flex-col justify-end overflow-hidden bg-ink p-7 text-ivory sm:p-12 lg:min-h-[28rem] ${dir === "next" ? "sm:items-end sm:text-right" : ""}`}
    >
      <span className="zoom-media absolute inset-0 -z-10">
        <Image quality={85} src={p.heroImage.src} alt="" fill sizes="50vw" className="object-cover opacity-45 transition-opacity duration-700 group-hover:opacity-65" />
      </span>
      <span aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/45 to-transparent" />
      <span className="eyebrow flex items-center gap-2 text-brass-light">
        {dir === "prev" ? <ArrowLeft aria-hidden="true" className="size-4 transition-transform duration-500 group-hover:-translate-x-1" /> : null}
        {dir === "prev" ? "Previous project" : "Next project"}
        {dir === "next" ? <ArrowRight aria-hidden="true" className="size-4 transition-transform duration-500 group-hover:translate-x-1" /> : null}
      </span>
      <span className="mt-4 font-display text-[clamp(2.4rem,4.4vw,4.2rem)] leading-[1]">{p.name}</span>
      <span className="mt-3 text-[0.8rem] uppercase tracking-[0.12em] text-stone">
        {p.location.area === p.location.city ? p.location.city : `${p.location.area}, ${p.location.city}`}
      </span>
    </Link>
  );

  return (
    <nav aria-label="More projects" className="bg-ink">
      <div className="grid gap-px bg-ivory/10 sm:grid-cols-2">
        {item(prev, "prev")}
        {item(next, "next")}
      </div>
      <div className="flex justify-center border-t border-ivory/10 py-6">
        <Link href="/projects" className="group inline-flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-stone hover:text-ivory">
          <LayoutGrid aria-hidden="true" className="size-4" /> <span className="link-line">The full collection</span>
        </Link>
      </div>
    </nav>
  );
}
