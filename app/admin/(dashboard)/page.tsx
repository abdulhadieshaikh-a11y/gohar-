import Link from "next/link";
import { Suspense } from "react";
import { count, desc, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { enquiries } from "@/lib/db/schema";
import { getEmailConfigStatus } from "@/lib/email";
import { findStaticProject } from "@/lib/projects";
import { AdminHeading, AdminLoading, Notice, StatusBadge, STATUS_LABELS, formatDateTime } from "@/components/admin/ui";

export default function AdminDashboardPage({ searchParams }: PageProps<"/admin">) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <Dashboard searchParams={searchParams} />
    </Suspense>
  );
}

async function Dashboard({ searchParams }: Pick<PageProps<"/admin">, "searchParams">) {
  const user = await requireAdmin();
  const sp = await searchParams;
  const db = getDb();

  const [byStatus, recent, failedEmails] = await Promise.all([
    db.select({ status: enquiries.status, n: count() }).from(enquiries).groupBy(enquiries.status).all(),
    db.select().from(enquiries).orderBy(desc(enquiries.createdAt)).limit(8).all(),
    db.select({ n: count() }).from(enquiries).where(eq(enquiries.emailStatus, "failed")).get(),
  ]);
  const total = byStatus.reduce((s, r) => s + r.n, 0);
  const email = getEmailConfigStatus();

  return (
    <>
      <AdminHeading title={`Welcome, ${user.name.split(" ")[0]}`} description="Website enquiries and content at a glance." />
      {sp.denied ? <Notice tone="error">Your account doesn&rsquo;t have permission to open that page.</Notice> : null}
      {!email.configured ? (
        <Notice tone="info">
          Email notifications are off ({email.problems.join(" ")}). Enquiries are still saved here. See{" "}
          <Link href="/admin/settings" className="underline">
            Settings
          </Link>
          .
        </Notice>
      ) : null}
      {failedEmails && failedEmails.n > 0 ? (
        <Notice tone="error">
          {failedEmails.n} enquiry notification{failedEmails.n === 1 ? "" : "s"} failed to send.{" "}
          <Link href="/admin/enquiries?email=failed" className="underline">
            Review
          </Link>
        </Notice>
      ) : null}

      <dl className="grid gap-px bg-line sm:grid-cols-3 lg:grid-cols-6">
        <div className="bg-paper p-5">
          <dt className="text-[0.75rem] uppercase tracking-wider text-muted">Total</dt>
          <dd className="mt-1 font-display text-4xl">{total}</dd>
        </div>
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <div key={key} className="bg-paper p-5">
            <dt className="text-[0.75rem] uppercase tracking-wider text-muted">
              <Link href={`/admin/enquiries?status=${key}`} className="hover:text-ink">
                {label}
              </Link>
            </dt>
            <dd className="mt-1 font-display text-4xl">{byStatus.find((r) => r.status === key)?.n ?? 0}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-10" aria-labelledby="recent-title">
        <div className="flex items-end justify-between">
          <h2 id="recent-title" className="text-2xl">
            Latest enquiries
          </h2>
          <Link href="/admin/enquiries" className="text-[0.8rem] font-semibold uppercase tracking-wider text-brass-deep">
            View all
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="mt-4 border border-dashed border-stone p-8 text-center text-muted">No enquiries yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {recent.map((e) => (
              <li key={e.id}>
                <Link href={`/admin/enquiries/${e.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 hover:bg-ivory-2">
                  <span className="w-28 font-mono text-[0.8rem]">{e.reference}</span>
                  <span className="min-w-40 flex-1 font-medium">{e.name}</span>
                  <span className="text-[0.85rem] text-muted">
                    {e.projectSlug ? (findStaticProject(e.projectSlug)?.name ?? e.projectSlug) : "General"}
                  </span>
                  <StatusBadge status={e.status} />
                  <span className="text-[0.8rem] text-muted">{formatDateTime(e.createdAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
