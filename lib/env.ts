import "server-only";

/**
 * Server configuration, read from environment variables.
 * Nothing here is ever sent to the browser.
 */

export const isProduction = process.env.NODE_ENV === "production";

/** Default local database for `npm run dev` when DATABASE_URL is not set. */
export const DEV_DATABASE_URL = "file:./.data/gohar-dev.db";

export type DatabaseConfig =
  | { ok: true; url: string; authToken?: string; source: "env" | "dev-default" }
  | { ok: false; reason: string };

export function getDatabaseConfig(): DatabaseConfig {
  const url = process.env.DATABASE_URL?.trim();
  const authToken = process.env.DATABASE_AUTH_TOKEN?.trim() || undefined;

  if (url) {
    // A local SQLite file on a serverless platform is wiped between
    // deployments and not shared between instances. Refuse it rather than
    // silently losing enquiries.
    if (url.startsWith("file:") && (process.env.VERCEL || process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME)) {
      return {
        ok: false,
        reason:
          "DATABASE_URL points to a local SQLite file on a serverless platform, which is not durable. Use a libSQL/Turso URL.",
      };
    }
    return { ok: true, url, authToken, source: "env" };
  }

  if (!isProduction) return { ok: true, url: DEV_DATABASE_URL, source: "dev-default" };

  return { ok: false, reason: "DATABASE_URL is not set. Production requires an explicit, persistent database." };
}

export type EmailProvider = "none" | "resend" | "smtp";

export function getEmailProvider(): EmailProvider {
  const p = (process.env.EMAIL_PROVIDER ?? "none").trim().toLowerCase();
  return p === "resend" || p === "smtp" ? p : "none";
}

export function getIpHashSalt(): string {
  return process.env.IP_HASH_SALT?.trim() || "gohar-local-development-salt";
}

/** Days after which closed/spam enquiries may be purged (see scripts/purge-enquiries.mjs). */
export function getRetentionDays(): number {
  const n = Number(process.env.ENQUIRY_RETENTION_DAYS ?? 730);
  return Number.isFinite(n) && n > 0 ? n : 730;
}
