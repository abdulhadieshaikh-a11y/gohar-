import "server-only";
import { createHmac } from "node:crypto";
import { getIpHashSalt } from "@/lib/env";

/** Best-effort client IP from proxy headers. Only ever stored as a salted hash. */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headers.get("x-real-ip")?.trim() || "unknown";
}

export function hashIdentifier(value: string): string {
  return createHmac("sha256", getIpHashSalt()).update(value).digest("hex").slice(0, 32);
}

/**
 * Rejects cross-site form posts to the API. Browsers always send Origin on
 * POST requests made with fetch(); when present it must match the host.
 */
export function isSameOrigin(headers: Headers): boolean {
  const origin = headers.get("origin");
  if (!origin) return true; // non-browser clients; still subject to validation and rate limits
  const host = headers.get("x-forwarded-host") ?? headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
