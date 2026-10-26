import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { ENQUIRY_STATUSES, enquiries } from "@/lib/db/schema";
import { findStaticProject } from "@/lib/projects";
import { ENQUIRY_TYPES } from "@/lib/validation/enquiry";
import { formatPhone } from "@/lib/validation/phone";
import { deleteEnquiryAction, retryEnquiryEmailAction, updateEnquiryAction } from "../../../actions";
import { AdminHeading, AdminLoading, Notice, StatusBadge, STATUS_LABELS, formatDateTime } from "@/components/admin/ui";
import { buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = { title: "Enquiry" };

export default function EnquiryDetailPage(props: PageProps<"/admin/enquiries/[id]">) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <EnquiryDetail {...props} />
    </Suspense>
  );
}

async function EnquiryDetail({ params, searchParams }: PageProps<"/admin/enquiries/[id]">) {
  const user = await requireAdmin();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  if (!z.uuid().safeParse(id).success) notFound();
  const e = await getDb().select().from(enquiries).where(eq(enquiries.id, id)).get();
  if (!e) notFound();

  const project = e.projectSlug ? findStaticProject(e.projectSlug) : undefined;
  const rows: [string, React.ReactNode][] = [
    ["Reference", <span key="r" className="font-mono">{e.reference}</span>],
    ["Received", formatDateTime(e.createdAt)],
    ["Enquiry type", ENQUIRY_TYPES.find((t) => t.value === e.enquiryType)?.label ?? e.enquiryType],
    ["Project", project ? <Link key="p" href={`/projects/${project.slug}`} className="underline">{project.name}</Link> : "No specific project"],
    ["Name", e.name],
    ["Email", <a key="e" href={`mailto:${e.email}?subject=${encodeURIComponent(`Your enquiry ${e.reference}`)}`} className="underline">{e.email}</a>],
    ["Phone", <a key="t" href={`tel:${e.phone}`} className="underline">{formatPhone(e.phone)}</a>],
    ["City", e.city ?? "Not given"],
    ["Consent given", formatDateTime(e.consentAt)],
    ["Submitted from", e.sourcePath ?? "Unknown"],
  ];

  return (
    <>
      <Link href="/admin/enquiries" className="mb-6 inline-flex items-center gap-2 text-[0.85rem] text-muted hover:text-ink">
        <ArrowLeft aria-hidden="true" className="size-4" /> All enquiries
      </Link>
      <AdminHeading title={e.name} description={`Enquiry ${e.reference}`} actions={<StatusBadge status={e.status} />} />

      {sp.saved ? <Notice tone="success">Changes saved.</Notice> : null}
      {sp.email === "sent" ? <Notice tone="success">The notification email was sent.</Notice> : null}
      {sp.email === "failed" ? <Notice tone="error">The notification email failed again. Check the email settings.</Notice> : null}
      {sp.email === "skipped" ? <Notice tone="info">Email is not configured, so no notification was sent.</Notice> : null}
      {sp.error === "confirm" ? <Notice tone="error">Type DELETE to confirm deletion.</Notice> : null}

      <div className="grid gap-10 xl:grid-cols-[1fr_22rem]">
        <div>
          <dl className="divide-y divide-line border-y border-line">
            {rows.map(([k, v]) => (
              <div key={k} className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr]">
                <dt className="text-[0.82rem] text-muted">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <h2 className="mt-8 text-2xl">Message</h2>
          <p className="mt-3 whitespace-pre-wrap border-l-2 border-brass bg-ivory-2 p-5 leading-relaxed">{e.message}</p>
        </div>

        <aside className="space-y-8">
          <form action={updateEnquiryAction} className="space-y-4 border border-line p-5">
            <h2 className="text-2xl">Update</h2>
            <input type="hidden" name="id" value={e.id} />
            <div>
              <label htmlFor="status" className="field-label">
                Status
              </label>
              <select id="status" name="status" defaultValue={e.status} className="field-control">
                {ENQUIRY_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="notes" className="field-label">
                Internal notes
              </label>
              <textarea id="notes" name="notes" rows={5} maxLength={4000} defaultValue={e.notes ?? ""} className="field-control" />
            </div>
            <button type="submit" className={buttonClasses("primary", "md", "w-full")}>
              Save
            </button>
          </form>

          <div className="space-y-3 border border-line p-5">
            <h2 className="text-2xl">Staff notification</h2>
            <p className="flex items-center gap-2 text-[0.9rem]">
              Status: <StatusBadge status={e.emailStatus} />
            </p>
            {e.emailError ? <p className="text-[0.82rem] text-muted">{e.emailError}</p> : null}
            {e.emailStatus !== "sent" ? (
              <form action={retryEnquiryEmailAction}>
                <input type="hidden" name="id" value={e.id} />
                <button type="submit" className={buttonClasses("secondary", "md", "w-full")}>
                  Send notification again
                </button>
              </form>
            ) : null}
          </div>

          {user.role === "admin" ? (
            <form action={deleteEnquiryAction} className="space-y-3 border border-danger/40 p-5">
              <h2 className="text-2xl text-danger">Delete permanently</h2>
              <p className="text-[0.85rem] text-muted">Use this for spam or when a customer asks for their data to be erased.</p>
              <input type="hidden" name="id" value={e.id} />
              <label htmlFor="confirm" className="field-label">
                Type DELETE to confirm
              </label>
              <input id="confirm" name="confirm" autoComplete="off" className="field-control" />
              <button type="submit" className="w-full bg-danger px-5 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-ivory hover:bg-danger/90">
                Delete enquiry
              </button>
            </form>
          ) : null}
        </aside>
      </div>
    </>
  );
}
