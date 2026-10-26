import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { and, count, desc, eq, isNull, like, or, type SQL } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { EMAIL_STATUSES, ENQUIRY_STATUSES, enquiries } from "@/lib/db/schema";
import { allProjects, findStaticProject } from "@/lib/projects";
import { formatPhone } from "@/lib/validation/phone";
import { ENQUIRY_TYPES } from "@/lib/validation/enquiry";
import { AdminHeading, AdminLoading, Notice, StatusBadge, STATUS_LABELS, formatDateTime } from "@/components/admin/ui";
import { buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = { title: "Enquiries" };

const PAGE_SIZE = 25;

export default function EnquiriesPage({ searchParams }: PageProps<"/admin/enquiries">) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <EnquiryList searchParams={searchParams} />
    </Suspense>
  );
}

function one(v: string | string[] | undefined) {
  return (Array.isArray(v) ? v[0] : v)?.trim() ?? "";
}

async function EnquiryList({ searchParams }: Pick<PageProps<"/admin/enquiries">, "searchParams">) {
  await requireAdmin();
  const sp = await searchParams;
  const q = one(sp.q).slice(0, 100);
  const status = one(sp.status);
  const project = one(sp.project);
  const emailStatus = one(sp.email);
  const page = Math.max(1, Number.parseInt(one(sp.page) || "1", 10) || 1);

  const conditions: SQL[] = [];
  if ((ENQUIRY_STATUSES as readonly string[]).includes(status)) conditions.push(eq(enquiries.status, status as (typeof ENQUIRY_STATUSES)[number]));
  if ((EMAIL_STATUSES as readonly string[]).includes(emailStatus))
    conditions.push(eq(enquiries.emailStatus, emailStatus as (typeof EMAIL_STATUSES)[number]));
  if (project === "none") conditions.push(isNull(enquiries.projectSlug));
  else if (findStaticProject(project)) conditions.push(eq(enquiries.projectSlug, project));
  if (q) {
    // Wildcards typed by the user are dropped (SQLite LIKE has no default escape character).
    const pattern = `%${q.replace(/[%_]/g, "")}%`;
    conditions.push(
      or(
        like(enquiries.name, pattern),
        like(enquiries.email, pattern),
        like(enquiries.phone, pattern),
        like(enquiries.reference, pattern),
        like(enquiries.message, pattern),
      )!,
    );
  }
  const where = conditions.length ? and(...conditions) : undefined;

  const db = getDb();
  const [rows, totalRow] = await Promise.all([
    db
      .select()
      .from(enquiries)
      .where(where)
      .orderBy(desc(enquiries.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE)
      .all(),
    db.select({ n: count() }).from(enquiries).where(where).get(),
  ]);
  const total = totalRow?.n ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    if (project) params.set("project", project);
    if (emailStatus) params.set("email", emailStatus);
    if (p > 1) params.set("page", String(p));
    const s = params.toString();
    return `/admin/enquiries${s ? `?${s}` : ""}`;
  };

  return (
    <>
      <AdminHeading title="Enquiries" description="Search, filter and manage enquiries submitted through the website." />
      {sp.deleted ? <Notice tone="success">The enquiry was deleted.</Notice> : null}
      {sp.error ? <Notice tone="error">That request could not be completed.</Notice> : null}

      <form method="get" className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]" role="search">
        <div>
          <label htmlFor="q" className="field-label">
            Search
          </label>
          <input id="q" name="q" type="search" defaultValue={q} placeholder="Name, email, phone, reference…" className="field-control" />
        </div>
        <div>
          <label htmlFor="status" className="field-label">
            Status
          </label>
          <select id="status" name="status" defaultValue={status} className="field-control">
            <option value="">All statuses</option>
            {ENQUIRY_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
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
            <option value="none">No specific project</option>
            {allProjects.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="email" className="field-label">
            Notification
          </label>
          <select id="email" name="email" defaultValue={emailStatus} className="field-control">
            <option value="">Any</option>
            {EMAIL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button type="submit" className={buttonClasses("primary")}>
            Apply
          </button>
          <Link href="/admin/enquiries" className={buttonClasses("secondary")}>
            Reset
          </Link>
        </div>
      </form>

      <p className="mb-3 text-[0.85rem] text-muted" aria-live="polite">
        {total} {total === 1 ? "enquiry" : "enquiries"}
        {pages > 1 ? ` · page ${page} of ${pages}` : ""}
      </p>

      {rows.length === 0 ? (
        <p className="border border-dashed border-stone p-10 text-center text-muted">No enquiries match these filters.</p>
      ) : (
        <div className="overflow-x-auto border border-line">
          <table className="w-full min-w-[56rem] text-left text-[0.88rem]">
            <thead className="bg-ivory-2 text-[0.72rem] uppercase tracking-wider text-muted">
              <tr>
                <th scope="col" className="px-3 py-3 font-semibold">Received</th>
                <th scope="col" className="px-3 py-3 font-semibold">Reference</th>
                <th scope="col" className="px-3 py-3 font-semibold">Name</th>
                <th scope="col" className="px-3 py-3 font-semibold">Contact</th>
                <th scope="col" className="px-3 py-3 font-semibold">Project / type</th>
                <th scope="col" className="px-3 py-3 font-semibold">Status</th>
                <th scope="col" className="px-3 py-3 font-semibold">Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((e) => (
                <tr key={e.id} className="hover:bg-ivory-2/60">
                  <td className="whitespace-nowrap px-3 py-3 text-muted">{formatDateTime(e.createdAt)}</td>
                  <td className="px-3 py-3 font-mono text-[0.8rem]">
                    <Link href={`/admin/enquiries/${e.id}`} className="text-brass-deep underline underline-offset-2">
                      {e.reference}
                    </Link>
                  </td>
                  <td className="px-3 py-3 font-medium">{e.name}</td>
                  <td className="px-3 py-3">
                    <span className="block">{e.email}</span>
                    <span className="block text-muted">{formatPhone(e.phone)}</span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="block">{e.projectSlug ? (findStaticProject(e.projectSlug)?.name ?? e.projectSlug) : "—"}</span>
                    <span className="block text-muted">{ENQUIRY_TYPES.find((t) => t.value === e.enquiryType)?.label ?? e.enquiryType}</span>
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge status={e.status} />
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge status={e.emailStatus} />
                  </td>
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
