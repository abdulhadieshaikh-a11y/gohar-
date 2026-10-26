import "server-only";
import { getEmailProvider } from "@/lib/env";

/**
 * Transactional email for staff notifications.
 *
 * EMAIL_PROVIDER=none   (default) nothing is sent; enquiries are marked "skipped".
 * EMAIL_PROVIDER=resend uses the Resend HTTP API (RESEND_API_KEY).
 * EMAIL_PROVIDER=smtp   uses any SMTP server, e.g. Google Workspace (SMTP_*).
 *
 * A message counts as "sent" only when the provider accepted it.
 */

export interface OutgoingEmail {
  to: string[];
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}

export type EmailResult =
  | { status: "sent"; providerId?: string }
  | { status: "skipped"; reason: string }
  | { status: "failed"; error: string };

export interface EmailConfigStatus {
  provider: string;
  configured: boolean;
  problems: string[];
  from?: string;
  notifyTo: string[];
}

function notifyRecipients(): string[] {
  return (process.env.ENQUIRY_NOTIFY_TO ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function getEmailConfigStatus(): EmailConfigStatus {
  const provider = getEmailProvider();
  const problems: string[] = [];
  const from = process.env.EMAIL_FROM?.trim();
  const notifyTo = notifyRecipients();

  if (provider === "none") {
    return { provider, configured: false, problems: ["EMAIL_PROVIDER is 'none': notifications are not sent."], notifyTo };
  }
  if (!from) problems.push("EMAIL_FROM is not set.");
  if (notifyTo.length === 0) problems.push("ENQUIRY_NOTIFY_TO is not set.");
  if (provider === "resend" && !process.env.RESEND_API_KEY) problems.push("RESEND_API_KEY is not set.");
  if (provider === "smtp") {
    for (const key of ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"]) {
      if (!process.env[key]) problems.push(`${key} is not set.`);
    }
  }
  return { provider, configured: problems.length === 0, problems, from, notifyTo };
}

export async function sendEmail(message: Omit<OutgoingEmail, "to"> & { to?: string[] }): Promise<EmailResult> {
  const config = getEmailConfigStatus();
  if (config.provider === "none") return { status: "skipped", reason: "Email provider not configured" };
  if (!config.configured) return { status: "failed", error: `Email misconfigured: ${config.problems.join(" ")}` };

  const email: OutgoingEmail = { ...message, to: message.to ?? config.notifyTo };
  try {
    if (config.provider === "resend") return await sendWithResend(email, config.from!);
    return await sendWithSmtp(email, config.from!);
  } catch (error) {
    return { status: "failed", error: error instanceof Error ? error.message.slice(0, 300) : "Unknown email error" };
  }
}

async function sendWithResend(email: OutgoingEmail, from: string): Promise<EmailResult> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: email.to,
      subject: email.subject,
      text: email.text,
      html: email.html,
      reply_to: email.replyTo,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  const body = (await res.json().catch(() => ({}))) as { id?: string; message?: string; name?: string };
  if (!res.ok) return { status: "failed", error: `Resend ${res.status}: ${body.message ?? body.name ?? "request failed"}` };
  return { status: "sent", providerId: body.id };
}

async function sendWithSmtp(email: OutgoingEmail, from: string): Promise<EmailResult> {
  const nodemailer = await import("nodemailer");
  const port = Number(process.env.SMTP_PORT);
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
  const info = await transport.sendMail({
    from,
    to: email.to,
    subject: email.subject,
    text: email.text,
    html: email.html,
    replyTo: email.replyTo,
  });
  if (info.rejected && info.rejected.length > 0 && (!info.accepted || info.accepted.length === 0)) {
    return { status: "failed", error: "SMTP server rejected all recipients" };
  }
  return { status: "sent", providerId: info.messageId };
}
