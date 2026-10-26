import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { projectOverrides } from "@/lib/db/schema";
import { allProjects } from "@/lib/projects";
import { AdminHeading, AdminLoading, formatDateTime } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Projects" };

export default function AdminProjectsPage() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <ProjectList />
    </Suspense>
  );
}

async function ProjectList() {
  await requireAdmin();
  const overrides = await getDb().select().from(projectOverrides).all();

  return (
    <>
      <AdminHeading
        title="Projects"
        description="Edit descriptions, SEO text and the lead image. Verified facts, galleries and new projects are managed in data/projects.ts so every change is reviewed."
      />
      <ul className="grid gap-4 md:grid-cols-2">
        {allProjects.map((p) => {
          const o = overrides.find((x) => x.projectSlug === p.slug);
          return (
            <li key={p.slug}>
              <Link href={`/admin/projects/${p.slug}`} className="flex gap-4 border border-line p-3 hover:border-ink">
                <span className="relative block aspect-[4/3] w-32 shrink-0 bg-ivory-2">
                  <Image src={p.heroImage.src} alt="" fill sizes="128px" className="object-cover" />
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-xl leading-tight">{p.name}</span>
                  <span className="block text-[0.82rem] text-muted">
                    {p.categoryLabel} · {p.location.area}
                  </span>
                  <span className="mt-2 block text-[0.78rem] text-muted">
                    {o ? `Edited ${formatDateTime(o.updatedAt)} by ${o.updatedBy ?? "unknown"}` : "Using verified defaults"}
                  </span>
                  <span className="mt-1 block text-[0.78rem] text-muted">{p.gallery.length} image(s)</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
