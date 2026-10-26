import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { eq } from "drizzle-orm";
import { ArrowLeft, Download } from "lucide-react";
import { vacancies } from "@/data/careers";
import { requireAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { APPLICATION_STATUSES, careerApplications } from "@/lib/db/schema";
import { formatPhone } from "@/lib/validation/phone";
import { deleteApplicationAction, updateApplicationAction } from "../../../actions";
import { AdminHeading, AdminLoading, Notice, StatusBadge, formatDateTime } from "@/components/admin/ui";
import { buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = { title: "Application" };

export default function ApplicationDetailPage(props: PageProps<"/admin/applications/[id]">) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <ApplicationDetail {...props} />
    </Suspense>
  );
}

async function ApplicationDetail({ params, searchParams }: PageProps<"/admin/applications/[id]">) {
  const user = await requireAdmin();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const a = await getDb().select().from(careerApplications).where(eq(careerApplications.id, id)).get();
  if (!a) notFound();

  const rows: [string, React.ReactNode][] = [
    ["Reference", <span key="r" className="font-mono">{a.reference}</span>],
    ["Received", formatDateTime(a.createdAt)],
    ["Applying for", (a.vacancyId && vacancies.find((v) => v.id === a.vacancyId)?.title) || "General expression of interest"],
    ["Role / area of interest", a.roleInterest ?? "Not given"],
    ["Email", <a key="e" href={`mailto:${a.email}`} className="underline">{a.email}</a>],
    ["Phone", <a key="p" href={`tel:${a.phone}`} className="underline">{formatPhone(a.phone)}</a>],
    ["City", a.city ?? "Not given"],
    ["Profile link", a.profileUrl ? <a key="l" href={a.profileUrl} target="_blank" rel="noopener noreferrer nofollow" className="underline">{a.profileUrl}</a> : "Not given"],
    ["Consent given", formatDateTime(a.consentAt)],
    ["Notification", <StatusBadge key="n" status={a.emailStatus} />],
  ];

  return (
    <>
      <Link href="/admin/applications" className="mb-6 inline-flex items-center gap-2 text-[0.85rem] text-muted hover:text-ink">
        <ArrowLeft aria-hidden="true" className="size-4" /> All applications
      </Link>
      <AdminHeading title={a.name} description={`Application ${a.reference}`} actions={<StatusBadge status={a.status} />} />
      {sp.saved ? <Notice tone="success">Changes saved.</Notice> : null}
      {sp.error === "confirm" ? <Notice tone="error">Type DELETE to confirm deletion.</Notice> : null}

      <div className="grid gap-10 xl:grid-cols-[1fr_22rem]">
        <div>
          <dl className="divide-y divide-line border-y border-line">
            {rows.map(([k, v]) => (
              <div key={k} className="grid gap-1 py-3 sm:grid-cols-[11rem_1fr]">
                <dt className="text-[0.82rem] text-muted">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          {a.message ? (
            <>
              <h2 className="mt-8 text-2xl">Note from the candidate</h2>
              <p className="mt-3 whitespace-pre-wrap border-l-2 border-brass bg-ivory-2 p-5 leading-relaxed">{a.message}</p>
            </>
          ) : null}
          <a href={`/admin/applications/${a.id}/cv`} className={buttonClasses("primary", "md", "mt-8")}>
            <Download aria-hidden="true" className="size-4" /> Download CV ({a.cvFilename}, {Math.round(a.cvSize / 1024)} KB)
          </a>
        </div>
        <aside className="space-y-8">
          <form action={updateApplicationAction} className="space-y-4 border border-line p-5">
            <h2 className="text-2xl">Update</h2>
            <input type="hidden" name="id" value={a.id} />
            <div>
              <label htmlFor="status" className="field-label">Status</label>
              <select id="status" name="status" defaultValue={a.status} className="field-control capitalize">
                {APPLICATION_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="notes" className="field-label">Internal notes</label>
              <textarea id="notes" name="notes" rows={5} maxLength={4000} defaultValue={a.notes ?? ""} className="field-control" />
            </div>
            <button type="submit" className={buttonClasses("primary", "md", "w-full")}>Save</button>
          </form>
          {user.role === "admin" ? (
            <form action={deleteApplicationAction} className="space-y-3 border border-danger/40 p-5">
              <h2 className="text-2xl text-danger">Delete permanently</h2>
              <p className="text-[0.85rem] text-muted">Deletes the application and the CV file, e.g. on request.</p>
              <input type="hidden" name="id" value={a.id} />
              <label htmlFor="confirm" className="field-label">Type DELETE to confirm</label>
              <input id="confirm" name="confirm" autoComplete="off" className="field-control" />
              <button type="submit" className="w-full bg-danger px-5 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-ivory hover:bg-danger/90">
                Delete application
              </button>
            </form>
          ) : null}
        </aside>
      </div>
    </>
  );
}
