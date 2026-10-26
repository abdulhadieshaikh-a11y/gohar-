import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { SITE_VISIT_STATUSES, siteVisits } from "@/lib/db/schema";
import { findStaticProject } from "@/lib/projects";
import { formatPhone } from "@/lib/validation/phone";
import { formatVisitDate, timeSlotLabel } from "@/lib/validation/site-visit-options";
import { deleteSiteVisitAction, retrySiteVisitEmailAction, updateSiteVisitAction } from "../../../actions";
import { AdminHeading, AdminLoading, Notice, SITE_VISIT_STATUS_LABELS, StatusBadge, formatDateTime } from "@/components/admin/ui";
import { buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = { title: "Site visit" };

export default function SiteVisitDetailPage(props: PageProps<"/admin/site-visits/[id]">) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <SiteVisitDetail {...props} />
    </Suspense>
  );
}

async function SiteVisitDetail({ params, searchParams }: PageProps<"/admin/site-visits/[id]">) {
  const user = await requireAdmin();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  if (!z.uuid().safeParse(id).success) notFound();
  const v = await getDb().select().from(siteVisits).where(eq(siteVisits.id, id)).get();
  if (!v) notFound();

  const project = findStaticProject(v.projectSlug);
  const waText = `Hello ${v.name}, this is Gohar Group of Companies about your site visit request ${v.reference}${project ? ` for ${project.name}` : ""}.`;
  const rows: [string, React.ReactNode][] = [
    ["Reference", <span key="r" className="font-mono">{v.reference}</span>],
    ["Received", formatDateTime(v.createdAt)],
    ["Project", project ? <Link key="p" href={`/projects/${project.slug}`} className="underline">{project.name}</Link> : v.projectSlug],
    ["Preferred date", formatVisitDate(v.preferredDate)],
    ["Preferred time", `${timeSlotLabel(v.timeSlot)} (PKT)`],
    ["Visitors", String(v.visitors)],
    ["Name", v.name],
    [
      "Phone",
      <span key="t" className="flex flex-wrap gap-3">
        <a href={`tel:${v.phone}`} className="underline">{formatPhone(v.phone)}</a>
        <a href={`https://wa.me/${v.phone.replace(/\D/g, "")}?text=${encodeURIComponent(waText)}`} target="_blank" rel="noopener noreferrer" className="text-whatsapp-deep underline">
          WhatsApp
        </a>
      </span>,
    ],
    ["Email", v.email ? <a key="e" href={`mailto:${v.email}?subject=${encodeURIComponent(`Your site visit request ${v.reference}`)}`} className="underline">{v.email}</a> : "Not given"],
    ["Consent given", formatDateTime(v.consentAt)],
    ["Submitted from", v.sourcePath ?? "Unknown"],
  ];

  return (
    <>
      <Link href="/admin/site-visits" className="mb-6 inline-flex items-center gap-2 text-[0.85rem] text-muted hover:text-ink">
        <ArrowLeft aria-hidden="true" className="size-4" /> All site visits
      </Link>
      <AdminHeading title={v.name} description={`Site visit request ${v.reference}`} actions={<StatusBadge status={v.status} />} />

      {sp.saved ? <Notice tone="success">Changes saved.</Notice> : null}
      {sp.error === "date" ? (
        <Notice tone="error">To mark a visit confirmed or rescheduled, enter the agreed date and time.</Notice>
      ) : null}
      {sp.error === "invalid" ? <Notice tone="error">Please check the values and try again.</Notice> : null}
      {sp.error === "confirm" ? <Notice tone="error">Type DELETE to confirm deletion.</Notice> : null}
      {sp.email === "sent" ? <Notice tone="success">The notification email was sent.</Notice> : null}
      {sp.email === "failed" ? <Notice tone="error">The notification email failed again. Check the email settings.</Notice> : null}
      {sp.email === "skipped" ? <Notice tone="info">Email is not configured, so no notification was sent.</Notice> : null}
      {v.status === "pending" ? (
        <Notice tone="info">
          Not confirmed yet. Call the visitor, agree a date and time, then set the status to <strong>Confirmed</strong> with
          the agreed date and time.
        </Notice>
      ) : null}

      <div className="grid gap-10 xl:grid-cols-[1fr_22rem]">
        <div>
          <dl className="divide-y divide-line border-y border-line">
            {rows.map(([k, val]) => (
              <div key={k} className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr]">
                <dt className="text-[0.82rem] text-muted">{k}</dt>
                <dd>{val}</dd>
              </div>
            ))}
          </dl>
          <h2 className="mt-8 text-2xl">Message</h2>
          <p className="mt-3 whitespace-pre-wrap border-l-2 border-brass bg-ivory-2 p-5 leading-relaxed">{v.message ?? "No message."}</p>
        </div>

        <aside className="space-y-8">
          <form action={updateSiteVisitAction} className="space-y-4 border border-line p-5">
            <h2 className="text-2xl">Update</h2>
            <input type="hidden" name="id" value={v.id} />
            <div>
              <label htmlFor="status" className="field-label">
                Status
              </label>
              <select id="status" name="status" defaultValue={v.status} className="field-control">
                {SITE_VISIT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {SITE_VISIT_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <fieldset className="grid grid-cols-2 gap-3">
              <legend className="field-label">Agreed date and time</legend>
              <div>
                <label htmlFor="confirmedDate" className="sr-only">
                  Agreed date
                </label>
                <input id="confirmedDate" name="confirmedDate" type="date" defaultValue={v.confirmedDate ?? v.preferredDate} className="field-control" />
              </div>
              <div>
                <label htmlFor="confirmedTime" className="sr-only">
                  Agreed time
                </label>
                <input id="confirmedTime" name="confirmedTime" type="time" defaultValue={v.confirmedTime ?? ""} className="field-control" />
              </div>
              <p className="col-span-2 text-[0.78rem] text-muted">Required for Confirmed and Rescheduled.</p>
            </fieldset>
            <div>
              <label htmlFor="notes" className="field-label">
                Internal notes
              </label>
              <textarea id="notes" name="notes" rows={4} maxLength={4000} defaultValue={v.notes ?? ""} className="field-control" />
            </div>
            <button type="submit" className={buttonClasses("primary", "md", "w-full")}>
              Save
            </button>
          </form>

          <div className="space-y-3 border border-line p-5">
            <h2 className="text-2xl">Staff notification</h2>
            <p className="flex items-center gap-2 text-[0.9rem]">
              Status: <StatusBadge status={v.emailStatus} />
            </p>
            {v.emailError ? <p className="text-[0.82rem] text-muted">{v.emailError}</p> : null}
            {v.emailStatus !== "sent" ? (
              <form action={retrySiteVisitEmailAction}>
                <input type="hidden" name="id" value={v.id} />
                <button type="submit" className={buttonClasses("secondary", "md", "w-full")}>
                  Send notification again
                </button>
              </form>
            ) : null}
          </div>

          {user.role === "admin" ? (
            <form action={deleteSiteVisitAction} className="space-y-3 border border-danger/40 p-5">
              <h2 className="text-2xl text-danger">Delete permanently</h2>
              <p className="text-[0.85rem] text-muted">For spam, or when a visitor asks for their data to be erased.</p>
              <input type="hidden" name="id" value={v.id} />
              <label htmlFor="confirm" className="field-label">
                Type DELETE to confirm
              </label>
              <input id="confirm" name="confirm" autoComplete="off" className="field-control" />
              <button type="submit" className="w-full bg-danger px-5 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-ivory hover:bg-danger/90">
                Delete request
              </button>
            </form>
          ) : null}
        </aside>
      </div>
    </>
  );
}
