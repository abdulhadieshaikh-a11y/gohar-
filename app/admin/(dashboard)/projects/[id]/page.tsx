import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { eq } from "drizzle-orm";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { applyOverride } from "@/lib/content";
import { getDb } from "@/lib/db";
import { projectOverrides } from "@/lib/db/schema";
import { findStaticProject } from "@/lib/projects";
import { IMAGE_KIND_LABELS } from "@/types/project";
import { resetProjectAction, saveProjectAction } from "../../../actions";
import { AdminHeading, AdminLoading, Notice } from "@/components/admin/ui";
import { buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = { title: "Edit project" };

const ERRORS: Record<string, string> = {
  invalid: "Some values were too long or invalid.",
  image: "The selected image is not part of this project's verified gallery.",
  summary: "The summary should be at least 20 characters.",
};

export default function AdminProjectEditPage(props: PageProps<"/admin/projects/[id]">) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <ProjectEditor {...props} />
    </Suspense>
  );
}

async function ProjectEditor({ params, searchParams }: PageProps<"/admin/projects/[id]">) {
  await requireAdmin();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const base = findStaticProject(id);
  if (!base) notFound();
  const override = await getDb().select().from(projectOverrides).where(eq(projectOverrides.projectSlug, id)).get();
  const current = applyOverride(base, override);
  const error = typeof sp.error === "string" ? ERRORS[sp.error] : undefined;

  return (
    <>
      <Link href="/admin/projects" className="mb-6 inline-flex items-center gap-2 text-[0.85rem] text-muted hover:text-ink">
        <ArrowLeft aria-hidden="true" className="size-4" /> All projects
      </Link>
      <AdminHeading
        title={base.name}
        description={`${base.categoryLabel} · ${base.location.area}, ${base.location.city}`}
        actions={
          <Link href={`/projects/${base.slug}`} target="_blank" className={buttonClasses("secondary")}>
            View live page <ExternalLink aria-hidden="true" className="size-4" />
          </Link>
        }
      />
      {sp.saved ? <Notice tone="success">Saved. The public page now shows these changes.</Notice> : null}
      {sp.reset ? <Notice tone="success">Restored the verified default content.</Notice> : null}
      {error ? <Notice tone="error">{error}</Notice> : null}
      <Notice tone="info">
        Only publish information the company has confirmed. Leave a field empty to use the verified default shown as its
        placeholder.
      </Notice>

      <form action={saveProjectAction} className="max-w-3xl space-y-6">
        <input type="hidden" name="slug" value={base.slug} />
        <div>
          <label htmlFor="summary" className="field-label">
            Summary <span className="font-normal text-muted">(cards and search results, 20–400 characters)</span>
          </label>
          <textarea id="summary" name="summary" rows={3} maxLength={400} defaultValue={override?.summary ?? ""} placeholder={base.summary} className="field-control" />
        </div>
        <div>
          <label htmlFor="overview" className="field-label">
            Overview <span className="font-normal text-muted">(separate paragraphs with a blank line)</span>
          </label>
          <textarea
            id="overview"
            name="overview"
            rows={8}
            maxLength={5000}
            defaultValue={override?.overview ?? ""}
            placeholder={base.overview.join("\n\n")}
            className="field-control"
          />
        </div>

        <fieldset>
          <legend className="field-label">Lead image</legend>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {base.gallery.map((img) => (
              <label key={img.src} className="cursor-pointer border border-line p-2 has-[:checked]:border-ink has-[:checked]:ring-2 has-[:checked]:ring-brass/40">
                <span className="relative block aspect-[4/3] bg-ivory-2">
                  <Image src={img.src} alt={img.alt} fill sizes="200px" className="object-cover" />
                </span>
                <span className="mt-2 flex items-center gap-2 text-[0.78rem]">
                  <input type="radio" name="heroImageSrc" value={img.src} defaultChecked={img.src === current.heroImage.src} />
                  {IMAGE_KIND_LABELS[img.kind]}
                </span>
              </label>
            ))}
          </div>
          <p className="mt-2 text-[0.8rem] text-muted">
            To add new photographs, place approved files in public/images/projects/{base.slug}/ and add them to
            data/projects.ts with their source and verification status.
          </p>
        </fieldset>

        <div>
          <label htmlFor="seoTitle" className="field-label">
            SEO title <span className="font-normal text-muted">(max 120)</span>
          </label>
          <input id="seoTitle" name="seoTitle" maxLength={120} defaultValue={override?.seoTitle ?? ""} placeholder={base.seo.title} className="field-control" />
        </div>
        <div>
          <label htmlFor="seoDescription" className="field-label">
            SEO description <span className="font-normal text-muted">(max 300)</span>
          </label>
          <textarea
            id="seoDescription"
            name="seoDescription"
            rows={3}
            maxLength={300}
            defaultValue={override?.seoDescription ?? ""}
            placeholder={base.seo.description}
            className="field-control"
          />
        </div>
        <button type="submit" className={buttonClasses("primary", "lg")}>
          Save changes
        </button>
      </form>

      {override ? (
        <form action={resetProjectAction} className="mt-10 max-w-3xl border-t border-line pt-6">
          <input type="hidden" name="slug" value={base.slug} />
          <button type="submit" className={buttonClasses("secondary")}>
            Restore verified defaults
          </button>
        </form>
      ) : null}

      <section className="mt-12 max-w-3xl border-t border-line pt-6" aria-labelledby="facts-title">
        <h2 id="facts-title" className="text-2xl">
          Verified facts (read-only)
        </h2>
        <dl className="mt-4 divide-y divide-line text-[0.9rem]">
          {base.facts.map((f) => (
            <div key={f.label} className="grid grid-cols-[10rem_1fr] gap-4 py-2">
              <dt className="text-muted">{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>
        <h3 className="mt-6 eyebrow text-brass-deep">Content notes</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-[0.85rem] text-muted">
          {base.provenance.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
          <li>
            Source:{" "}
            <a href={base.provenance.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
              {base.provenance.sourceUrl}
            </a>{" "}
            (retrieved {base.provenance.retrievedOn})
          </li>
        </ul>
      </section>
    </>
  );
}
