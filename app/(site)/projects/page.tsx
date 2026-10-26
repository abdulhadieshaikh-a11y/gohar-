import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowUpRight } from "lucide-react";
import { CATEGORY_LABELS } from "@/types/project";
import { getProjects } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { toCardData } from "@/lib/projects";
import { PageHero } from "@/components/ui/page-hero";
import { ProjectExplorer, ProjectGridFallback } from "@/components/projects/project-explorer";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Projects in Karachi & Hyderabad | Gohar Group",
  absoluteTitle: true,
  description:
    "Explore all ten Gohar Group developments: residential towers, commercial centres, mixed-use projects and gated communities in Karachi and Hyderabad.",
  path: "/projects",
});

export default async function ProjectsPage() {
  const projects = (await getProjects()).map(toCardData);

  return (
    <>
      <PageHero
        eyebrow="The collection"
        title="Developments across"
        accent="Karachi & Hyderabad"
        image={{ src: "/images/projects/gohar-villas/masterplan.jpg" }}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Projects", href: "/projects" },
        ]}
        lead={
          <p>
            Apartments, shopping centres, office space and gated communities. Search by name, or filter by category and
            location to find the right project.
          </p>
        }
        footer={
          <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-[1.25rem] border border-ivory/12 bg-ivory/12 sm:grid-cols-5">
            {[
              { label: "Developments", value: projects.length, href: "/projects" },
              ...(["residential", "commercial", "mixed-use", "community"] as const).map((c) => ({
                label: CATEGORY_LABELS[c],
                value: projects.filter((p) => p.category === c).length,
                href: `/projects?category=${c}`,
              })),
            ].map((s) => (
              <li key={s.label} className="bg-ink/60 backdrop-blur-md">
                <Link href={s.href} className="group block px-5 py-5 transition-colors duration-500 hover:bg-ivory/5">
                  <span className="block text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-stone">{s.label}</span>
                  <span className="mt-1 flex items-end justify-between font-display text-5xl">
                    {s.value}
                    <ArrowUpRight aria-hidden="true" className="mb-2 size-4 text-stone transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ivory" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        }
      />

      <section className="container-site pb-28 pt-12 lg:pt-16">
        <Suspense fallback={<ProjectGridFallback projects={projects} />}>
          <ProjectExplorer projects={projects} />
        </Suspense>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Gohar Group of Companies projects",
          itemListElement: projects.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: absoluteUrl(`/projects/${p.slug}`),
            name: p.name,
          })),
        }}
      />
    </>
  );
}
