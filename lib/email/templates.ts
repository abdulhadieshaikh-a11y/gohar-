import { formatPhone } from "@/lib/validation/phone";

export interface EnquiryEmailData {
  reference: string;
  enquiryTypeLabel: string;
  name: string;
  email: string;
  phone: string;
  city?: string | null;
  projectName?: string | null;
  message: string;
  createdAt: Date;
  adminUrl: string;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export interface SiteVisitEmailData {
  reference: string;
  projectName: string;
  preferredDate: string;
  timeSlot: string;
  visitors: number;
  name: string;
  phone: string;
  email?: string | null;
  message?: string | null;
  createdAt: Date;
  adminUrl: string;
}

/** Internal staff notification for a new site-visit request (not a confirmed booking). */
export function siteVisitNotificationEmail(d: SiteVisitEmailData) {
  const rows: [string, string][] = [
    ["Reference", d.reference],
    ["Project", d.projectName],
    ["Preferred date", d.preferredDate],
    ["Preferred time", d.timeSlot],
    ["Visitors", String(d.visitors)],
    ["Name", d.name],
    ["Phone", formatPhone(d.phone)],
    ["Email", d.email ?? "Not given"],
    ["Received", d.createdAt.toLocaleString("en-GB", { timeZone: "Asia/Karachi" }) + " (PKT)"],
  ];
  const subject = `Site visit request ${d.reference} – ${d.projectName} – ${d.preferredDate}`;
  const text = [
    "A site visit was requested on the Gohar Group website.",
    "This is a REQUEST. Call the visitor to confirm a time, then mark it confirmed in the admin dashboard.",
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    "Message:",
    d.message ?? "(none)",
    "",
    `Open in admin: ${d.adminUrl}`,
  ].join("\n");

  const html = `<!doctype html><html><body style="font-family:Arial,Helvetica,sans-serif;color:#1c1b19;background:#f7f3ec;padding:24px">
  <table role="presentation" style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e3dbcd;padding:24px;width:100%">
    <tr><td>
      <p style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#7a6440;margin:0 0 8px">Gohar Group of Companies</p>
      <h1 style="font-size:20px;margin:0 0 8px">New site visit request</h1>
      <p style="font-size:14px;margin:0 0 16px;color:#6b6258">Not yet confirmed. Please call the visitor to agree a time, then update the status in the admin dashboard.</p>
      <table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px">
        ${rows
          .map(
            ([k, v]) =>
              `<tr><td style="padding:6px 0;color:#6b6258;width:140px;vertical-align:top">${escapeHtml(k)}</td><td style="padding:6px 0">${escapeHtml(v)}</td></tr>`,
          )
          .join("")}
      </table>
      <h2 style="font-size:15px;margin:20px 0 8px">Message</h2>
      <p style="font-size:14px;line-height:1.6;white-space:pre-wrap;margin:0">${escapeHtml(d.message ?? "(none)")}</p>
      <p style="margin:24px 0 0"><a href="${escapeHtml(d.adminUrl)}" style="color:#7a6440">Open this request in the admin dashboard</a></p>
    </td></tr>
  </table></body></html>`;

  return { subject, text, html, replyTo: d.email ?? undefined };
}

/** Internal staff notification for a new website enquiry. */
export function enquiryNotificationEmail(d: EnquiryEmailData) {
  const rows: [string, string][] = [
    ["Reference", d.reference],
    ["Type", d.enquiryTypeLabel],
    ["Project", d.projectName ?? "No specific project"],
    ["Name", d.name],
    ["Email", d.email],
    ["Phone", formatPhone(d.phone)],
    ["City", d.city ?? "Not given"],
    ["Received", d.createdAt.toLocaleString("en-GB", { timeZone: "Asia/Karachi" }) + " (PKT)"],
  ];
  const subject = `New website enquiry ${d.reference}${d.projectName ? ` – ${d.projectName}` : ""}`;
  const text = [
    "A new enquiry was submitted on the Gohar Group website.",
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    "Message:",
    d.message,
    "",
    `Open in admin: ${d.adminUrl}`,
  ].join("\n");

  const html = `<!doctype html><html><body style="font-family:Arial,Helvetica,sans-serif;color:#1c1b19;background:#f7f3ec;padding:24px">
  <table role="presentation" style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e3dbcd;padding:24px;width:100%">
    <tr><td>
      <p style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#7a6440;margin:0 0 8px">Gohar Group of Companies</p>
      <h1 style="font-size:20px;margin:0 0 16px">New website enquiry</h1>
      <table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px">
        ${rows
          .map(
            ([k, v]) =>
              `<tr><td style="padding:6px 0;color:#6b6258;width:120px;vertical-align:top">${escapeHtml(k)}</td><td style="padding:6px 0">${escapeHtml(v)}</td></tr>`,
          )
          .join("")}
      </table>
      <h2 style="font-size:15px;margin:20px 0 8px">Message</h2>
      <p style="font-size:14px;line-height:1.6;white-space:pre-wrap;margin:0">${escapeHtml(d.message)}</p>
      <p style="margin:24px 0 0"><a href="${escapeHtml(d.adminUrl)}" style="color:#7a6440">Open this enquiry in the admin dashboard</a></p>
    </td></tr>
  </table></body></html>`;

  return { subject, text, html, replyTo: d.email };
}
