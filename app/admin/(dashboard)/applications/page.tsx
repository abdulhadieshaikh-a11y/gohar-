import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { desc, eq } from "drizzle-orm";
import { vacancies } from "@/data/careers";
import { requireAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { APPLICATION_STATUSES, careerApplications } from "@/lib/db/schema";
import { formatPhone } from "@/lib/validation/phone";
import { AdminHeading, AdminLoading, Notice, StatusBadge, formatDateTime } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Applications" };

export default function ApplicationsPage({ searchParams }: PageProps<"/admin/applications">) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <ApplicationList searchParams={searchParams} />
    </Suspense>
  );
}

async function ApplicationList({ searchParams }: Pick<PageProps<"/admin/applications">, "searchParams">) {
  await requireAdmin();
  const sp = await searchParams;
  const status = typeof sp.status === "string" && (APPLICATION_STATUSES as readonly string[]).includes(sp.status) ? sp.status : "";
  const rows = await getDb()
    .select({
      id: careerApplications.id,
      reference: careerApplications.reference,
      name: careerApplications.name,
      email: careerApplications.email,
      phone: careerApplications.phone,
      roleInterest: careerApplications.roleInterest,
      vacancyId: careerApplications.vacancyId,
      status: careerApplications.status,
      createdAt: careerApplications.createdAt,
    })
    .from(careerApplications)
    .where(status ? eq(careerApplications.status, status as (typeof APPLICATION_STATUSES)[number]) : undefined)
    .orderBy(desc(careerApplications.createdAt))
    .limit(200)
    .all();

  return (
    <>
      <AdminHeading title="Careers applications" description="CVs and expressions of interest submitted on the Careers page." />
      {sp.deleted ? <Notice tone="success">The application and its CV were deleted.</Notice> : null}
      <nav aria-label="Filter by status" className="mb-6 flex flex-wrap gap-2 text-[0.8rem]">
        {["", ...APPLICATION_STATUSES].map((s) => (
          <Link
            key={s || "all"}
            href={s ? `/admin/applications?status=${s}` : "/admin/applications"}
            aria-current={status === s ? "page" : undefined}
            className={`border px-3 py-1.5 capitalize ${status === s ? "border-ink bg-ink text-ivory" : "border-line hover:border-ink"}`}
          >
            {s || "All"}
          </Link>
        ))}
      </nav>
      {rows.length === 0 ? (
        <p className="border border-dashed border-stone p-10 text-center text-muted">No applications yet.</p>
      ) : (
        <div className="overflow-x-auto border border-line">
          <table className="w-full min-w-[48rem] text-left text-[0.88rem]">
            <thead className="bg-ivory-2 text-[0.72rem] uppercase tracking-wider text-muted">
              <tr>
                <th scope="col" className="px-3 py-3 font-semibold">Received</th>
                <th scope="col" className="px-3 py-3 font-semibold">Reference</th>
                <th scope="col" className="px-3 py-3 font-semibold">Name</th>
                <th scope="col" className="px-3 py-3 font-semibold">Contact</th>
                <th scope="col" className="px-3 py-3 font-semibold">Interest</th>
                <th scope="col" className="px-3 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-ivory-2/60">
                  <td className="whitespace-nowrap px-3 py-3 text-muted">{formatDateTime(r.createdAt)}</td>
                  <td className="px-3 py-3 font-mono text-[0.8rem]">
                    <Link href={`/admin/applications/${r.id}`} className="text-brass-deep underline underline-offset-2">
                      {r.reference}
                    </Link>
                  </td>
                  <td className="px-3 py-3 font-medium">{r.name}</td>
                  <td className="px-3 py-3">
                    <span className="block">{r.email}</span>
                    <span className="block text-muted">{formatPhone(r.phone)}</span>
                  </td>
                  <td className="px-3 py-3">{(r.vacancyId && vacancies.find((v) => v.id === r.vacancyId)?.title) || r.roleInterest || "General"}</td>
                  <td className="px-3 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
