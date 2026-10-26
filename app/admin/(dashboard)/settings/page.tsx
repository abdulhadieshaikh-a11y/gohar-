import type { Metadata } from "next";
import { Suspense } from "react";
import { eq } from "drizzle-orm";
import { defaultContact } from "@/data/company";
import { requireAdmin } from "@/lib/auth/session";
import { CONTACT_SETTINGS_KEY, parseContactSettings } from "@/lib/content";
import { getDb } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import { getEmailConfigStatus } from "@/lib/email";
import { getDatabaseConfig, getRetentionDays } from "@/lib/env";
import { resetSettingsAction, saveSettingsAction } from "../../actions";
import { AdminHeading, AdminLoading, Notice, formatDateTime } from "@/components/admin/ui";
import { buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage({ searchParams }: PageProps<"/admin/settings">) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <Settings searchParams={searchParams} />
    </Suspense>
  );
}

const FIELD_LABELS: Record<string, string> = {
  phoneDisplay: "Phone (display)",
  phoneHref: "Phone link",
  email: "Email",
  address: "Address",
  hours: "Opening hours",
  closed: "Closed days",
  mapUrl: "Map link",
};

async function Settings({ searchParams }: Pick<PageProps<"/admin/settings">, "searchParams">) {
  await requireAdmin("admin");
  const sp = await searchParams;
  const row = await getDb().select().from(siteSettings).where(eq(siteSettings.key, CONTACT_SETTINGS_KEY)).get();
  const contact = parseContactSettings(row?.value);
  const email = getEmailConfigStatus();
  const db = getDatabaseConfig();
  const errorField = typeof sp.error === "string" ? (FIELD_LABELS[sp.error] ?? sp.error) : null;

  return (
    <>
      <AdminHeading title="Settings" description="Contact details shown across the website, plus a read-only view of the server configuration." />
      {sp.saved ? <Notice tone="success">Contact details saved. They now appear across the website.</Notice> : null}
      {sp.reset ? <Notice tone="success">Contact details restored to the verified defaults.</Notice> : null}
      {errorField ? <Notice tone="error">Please check the &ldquo;{errorField}&rdquo; field.</Notice> : null}

      <div className="grid gap-12 xl:grid-cols-[1fr_24rem]">
        <form action={saveSettingsAction} className="max-w-2xl space-y-5">
          <h2 className="text-2xl">Contact details</h2>
          {row ? (
            <p className="text-[0.82rem] text-muted">
              Last changed {formatDateTime(row.updatedAt)} by {row.updatedBy ?? "unknown"}.
            </p>
          ) : (
            <p className="text-[0.82rem] text-muted">Using the verified defaults.</p>
          )}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="phoneDisplay" className="field-label">Phone (as displayed)</label>
              <input id="phoneDisplay" name="phoneDisplay" required defaultValue={contact.phoneDisplay} className="field-control" />
            </div>
            <div>
              <label htmlFor="phoneHref" className="field-label">Phone link</label>
              <input id="phoneHref" name="phoneHref" required defaultValue={contact.phoneHref} placeholder="tel:+9221111000061" className="field-control" />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="field-label">Public email</label>
            <input id="email" name="email" type="email" required defaultValue={contact.email} className="field-control" />
          </div>
          <div>
            <label htmlFor="address" className="field-label">Office address (one line per row)</label>
            <textarea id="address" name="address" rows={3} required defaultValue={contact.addressLines.join("\n")} className="field-control" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="hours" className="field-label">Opening hours</label>
              <input id="hours" name="hours" required defaultValue={contact.hours} className="field-control" />
            </div>
            <div>
              <label htmlFor="closed" className="field-label">Closed days</label>
              <input id="closed" name="closed" defaultValue={contact.closed} className="field-control" />
            </div>
          </div>
          <div>
            <label htmlFor="mapUrl" className="field-label">Google Maps link for the office</label>
            <input id="mapUrl" name="mapUrl" type="url" required defaultValue={contact.mapUrl} className="field-control" />
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="submit" className={buttonClasses("primary", "lg")}>
              Save contact details
            </button>
          </div>
          <p className="text-[0.8rem] text-muted">Verified default phone: {defaultContact.phoneDisplay} · email: {defaultContact.email}</p>
        </form>

        <aside className="space-y-6">
          {row ? (
            <form action={resetSettingsAction} className="border border-line p-5">
              <h2 className="text-xl">Restore defaults</h2>
              <p className="mt-2 text-[0.85rem] text-muted">Return to the verified contact details.</p>
              <button type="submit" className={buttonClasses("secondary", "md", "mt-4")}>
                Restore
              </button>
            </form>
          ) : null}
          <div className="border border-line p-5 text-[0.88rem]">
            <h2 className="text-xl">Server configuration</h2>
            <dl className="mt-4 space-y-3">
              <div>
                <dt className="text-muted">Database</dt>
                <dd>{db.ok ? (db.url.startsWith("file:") ? `Local SQLite file${db.source === "dev-default" ? " (development default)" : ""}` : "Remote libSQL database") : db.reason}</dd>
              </div>
              <div>
                <dt className="text-muted">Email provider</dt>
                <dd>
                  {email.provider}
                  {email.configured ? " (configured)" : ""}
                </dd>
                {email.problems.length ? <dd className="mt-1 text-danger">{email.problems.join(" ")}</dd> : null}
                {email.notifyTo.length ? <dd className="mt-1 text-muted">Notifications go to: {email.notifyTo.join(", ")}</dd> : null}
              </div>
              <div>
                <dt className="text-muted">Enquiry retention</dt>
                <dd>{getRetentionDays()} days (run <code>npm run enquiries:purge</code>)</dd>
              </div>
            </dl>
            <p className="mt-4 text-[0.78rem] text-muted">Secrets are set in environment variables on the server and are never shown here.</p>
          </div>
        </aside>
      </div>
    </>
  );
}
