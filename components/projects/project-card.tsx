import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CalendarCheck, MapPin } from "lucide-react";
import { siteVisitHref } from "@/lib/site-visits/href";
import type { ProjectCardData } from "@/types/project";
import { ImageKindBadge } from "@/components/ui/image-kind-badge";

interface ProjectCardProps {
  project: ProjectCardData;
  /** Larger editorial presentation for featured slots. */
  size?: "default" | "large";
  headingLevel?: "h2" | "h3";
  sizes?: string;
  /** Position in a list, shown as a small index. */
  index?: number;
}

/**
 * Editorial project card. The image and the title both open the project
 * page; "Request a visit" is a separate sibling link (no nested click targets).
 */
export function ProjectCard({ project, size = "default", headingLevel: Heading = "h3", sizes, index }: ProjectCardProps) {
  const location = project.area === project.city ? project.city : `${project.area}, ${project.city}`;
  const href = `/projects/${project.slug}`;
  return (
    <article className="group flex h-full flex-col">
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden="true"
        data-cursor="View"
        data-tilt="5"
        className={`zoom-media corner-accent press relative block overflow-hidden rounded-[1.25rem] bg-ink-3 [--accent:var(--color-ivory)] ${size === "large" ? "aspect-[4/3] lg:aspect-[16/10]" : "aspect-[4/3]"}`}
      >
        <Image quality={85}
          src={project.image.src}
          alt=""
          fill
          sizes={sizes ?? "(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw"}
          className="object-cover"
        />
        <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-ink/15 opacity-70 transition-opacity duration-700 group-hover:opacity-100" />
        <span className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-ivory/90 px-3 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-ink backdrop-blur">
            {project.categoryLabel}
          </span>
          {project.status ? (
            <span className="flex items-center gap-1.5 rounded-full bg-ink/85 px-3 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-ivory backdrop-blur">
              <span className="size-1.5 rounded-full bg-gohar" />
              {project.status}
            </span>
          ) : null}
        </span>
        {index !== undefined ? <span className="num absolute right-5 top-4 text-[0.72rem] text-ivory/85">{String(index).padStart(2, "0")}</span> : null}
        <span className="absolute bottom-4 right-4 grid size-12 translate-y-3 place-items-center rounded-full bg-ivory text-ink opacity-0 shadow-[0_12px_28px_-10px_rgb(0_0_0/0.6)] transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="size-4" />
        </span>
        <ImageKindBadge kind={project.image.kind} className="absolute bottom-4 left-4" />
        <span aria-hidden="true" className="tilt-glare" />
      </Link>
      <div className="flex flex-1 flex-col pt-5">
        <p className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted">
          <MapPin aria-hidden="true" className="size-3.5 text-gohar" />
          {location}
        </p>
        <Heading className={`mt-2.5 leading-[1.02] ${size === "large" ? "text-[2.2rem] lg:text-[2.8rem]" : "text-[1.65rem] sm:text-[1.8rem]"}`}>
          <Link href={href} className="link-line transition-colors duration-300 group-hover:text-gohar-deep">
            {project.name}
          </Link>
        </Heading>
        <p className="mt-3 line-clamp-2 max-w-xl text-[0.94rem] leading-relaxed text-muted">{project.summary}</p>
        <div className="mt-auto flex items-center justify-between gap-4 border-t border-line pt-4">
          <Link href={href} className="inline-flex min-h-11 items-center gap-2 text-[0.9rem] font-semibold text-ink">
            View project
            <span className="h-px w-6 bg-gohar transition-all duration-500 group-hover:w-12" aria-hidden="true" />
            <span className="sr-only">: {project.name}</span>
          </Link>
          <Link
            href={siteVisitHref({ project: project.slug })}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-ink/15 px-4 text-[0.85rem] font-semibold text-ink transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-ivory"
          >
            <CalendarCheck aria-hidden="true" className="size-3.5" />
            Request a visit<span className="sr-only"> to {project.name}</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
