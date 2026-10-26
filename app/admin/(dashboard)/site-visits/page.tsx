import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { and, asc, count, desc, eq, like, or, type SQL } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { SITE_VISIT_STATUSES, siteVisits } from "@/lib/db/schema";
import { allProjects, findStaticProject } from "@/lib/projects";
import { formatPhone } from "@/lib/validation/phone";
import { formatVisitDate, timeSlotLabel } from "@/lib/validation/site-visit-options";
import { AdminHeading, AdminLoading, Notice, SITE_VISIT_STATUS_LABELS, StatusBadge, formatDateTime } from "@/components/admin/ui";
import { buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = { title: "Site visits" };

const PAGE_SIZE = 25;

export default function SiteVisitsPage({ searchParams }: PageProps<"/admin/site-visits">) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <SiteVisitList searchParams={searchParams} />
    </Suspense>
  );
}

function one(v: string | string[] | undefined) {
  return (Array.isArray(v) ? v[0] : v)?.trim() ?? "";
}

async function SiteVisitList({ searchParams }: Pick<PageProps<"/admin/site-visits">, "searchParams">) {
  await requireAdmin();
  const sp = await searchParams;
  const q = one(sp.q).slice(0, 100);
  const status = one(sp.status);
  const project = one(sp.project);
  const sort = one(sp.sort) === "date" ? "date" : "received";
  const page = Math.max(1, Number.parseInt(one(sp.page) || "1", 10) || 1);

  const conditions: SQL[] = [];
  if ((SITE_VISIT_STATUSES as readonly string[]).includes(status))
    conditions.push(eq(siteVisits.status, status as (typeof SITE_VISIT_STATUSES)[number]));
  if (findStaticProject(project)) conditions.push(eq(siteVisits.projectSlug, project));
  if (q) {
    const pattern = `%${q.replace(/[%_]/g, "")}%`;
    conditions.push(
      or(like(siteVisits.name, pattern), like(siteVisits.phone, pattern), like(siteVisits.email, pattern), like(siteVisits.reference, pattern))!,
    );
  }
  const where = conditions.length ? and(...conditions) : undefined;

  const db = getDb();
  const [rows, totalRow, pendingRow] = await Promise.all([
    db
      .select()
      .from(siteVisits)
      .where(where)
      .orderBy(sort === "date" ? asc(siteVisits.preferredDate) : desc(siteVisits.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE)
      .all(),
    db.select({ n: count() }).from(siteVisits).where(where).get(),
    db.select({ n: count() }).from(siteVisits).where(eq(siteVisits.status, "pending")).get(),
  ]);
  const total = totalRow?.n ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    if (project) params.set("project", project);
    if (sort === "date") params.set("sort", "date");
    if (p > 1) params.set("page", String(p));
    const s = params.toString();
    return `/admin/site-visits${s ? `?${s}` : ""}`;
  };

  return (
    <>
      <AdminHeading
        title="Site visits"
        description="Visit requests from the website. Each one is a request: call the visitor, agree a time, then mark it confirmed with the agreed date and time."
        actions={
          pendingRow?.n ? (
            <Link href="/admin/site-visits?status=pending&sort=date" className={buttonClasses("primary")}>
              {pendingRow.n} awaiting confirmation
            </Link>
          ) : null
        }
      />
      {sp.deleted ? <Notice tone="success">The request was deleted.</Notice> : null}
      {sp.error ? <Notice tone="error">That request could not be completed.</Notice> : null}

      <form method="get" className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]" role="search">
        <div>
          <label htmlFor="q" className="field-label">
            Search
          </label>
          <input id="q" name="q" type="search" defaultValue={q} placeholder="Name, phone, email, reference…" className="field-control" />
        </div>
        <div>
          <label htmlFor="status" className="field-label">
            Status
          </label>
          <select id="status" name="status" defaultValue={status} className="field-control">
            <option value="">All statuses</option>
            {SITE_VISIT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {SITE_VISIT_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="project" className="field-label">
            Project
          </label>
          <select id="project" name="project" defaultValue={project} className="field-control">
            <option value="">All projects</option>
            {allProjects.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="sort" className="field-label">
            Sort by
          </label>
          <select id="sort" name="sort" defaultValue={sort} className="field-control">
            <option value="received">Newest request</option>
            <option value="date">Preferred visit date</option>
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button type="submit" className={buttonClasses("primary")}>
            Apply
          </button>
          <Link href="/admin/site-visits" className={buttonClasses("secondary")}>
            Reset
          </Link>
        </div>
      </form>

      <p className="mb-3 text-[0.85rem] text-muted" aria-live="polite">
        {total} {total === 1 ? "request" : "requests"}
        {pages > 1 ? ` · page ${page} of ${pages}` : ""}
      </p>

      {rows.length === 0 ? (
        <p className="border border-dashed border-stone p-10 text-center text-muted">No site visit requests match these filters.</p>
      ) : (
        <div className="overflow-x-auto border border-line">
          <table className="w-full min-w-[60rem] text-left text-[0.88rem]">
            <thead className="bg-ivory-2 text-[0.72rem] uppercase tracking-wider text-muted">
              <tr>
                <th scope="col" className="px-3 py-3 font-semibold">Reference</th>
                <th scope="col" className="px-3 py-3 font-semibold">Project</th>
                <th scope="col" className="px-3 py-3 font-semibold">Preferred</th>
                <th scope="col" className="px-3 py-3 font-semibold">Visitor</th>
                <th scope="col" className="px-3 py-3 font-semibold">Status</th>
                <th scope="col" className="px-3 py-3 font-semibold">Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((v) => (
                <tr key={v.id} className="hover:bg-ivory-2/60">
                  <td className="px-3 py-3 font-mono text-[0.8rem]">
                    <Link href={`/admin/site-visits/${v.id}`} className="text-brass-deep underline underline-offset-2">
                      {v.reference}
                    </Link>
                  </td>
                  <td className="px-3 py-3">{findStaticProject(v.projectSlug)?.name ?? v.projectSlug}</td>
                  <td className="px-3 py-3">
                    <span className="block whitespace-nowrap">{formatVisitDate(v.preferredDate, "short")}</span>
                    <span className="block text-muted">{timeSlotLabel(v.timeSlot)}</span>
                    {v.confirmedDate ? (
                      <span className="block text-[0.8rem] text-success">
                        Agreed: {formatVisitDate(v.confirmedDate, "short")} {v.confirmedTime}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-3 py-3">
                    <span className="block font-medium">{v.name}</span>
                    <span className="block text-muted">
                      {formatPhone(v.phone)} · {v.visitors} {v.visitors === 1 ? "visitor" : "visitors"}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge status={v.status} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-muted">{formatDateTime(v.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 ? (
        <nav aria-label="Pagination" className="mt-6 flex justify-between">
          {page > 1 ? (
            <Link href={pageHref(page - 1)} className={buttonClasses("secondary")}>
              Previous
            </Link>
          ) : (
            <span />
          )}
          {page < pages ? (
            <Link href={pageHref(page + 1)} className={buttonClasses("secondary")}>
              Next
            </Link>
          ) : null}
        </nav>
      ) : null}
    </>
  );
}
