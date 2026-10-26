import { after } from "next/server";
import { DatabaseNotConfiguredError, getDb, isMissingTableError } from "@/lib/db";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { clientIp, hashIdentifier, isSameOrigin } from "@/lib/security/request";
import { createSiteVisit, deliverSiteVisitNotification } from "@/lib/site-visits/service";
import { fieldErrors, siteVisitRequestSchema } from "@/lib/validation/site-visit";

/**
 * POST /api/site-visits
 * Validates, rate-limits and stores a site-visit REQUEST (status "pending"),
 * then notifies staff after the response. Success is returned only once the
 * request is safely in the database. No appointment is confirmed here: there
 * is no calendar integration, so staff confirm each visit by phone.
 */

const MIN_FILL_MS = 2_500;
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const MAX_BODY_BYTES = 8 * 1024;

type ApiResponse =
  | { ok: true; reference: string; status: "pending" | "confirmed" | "rescheduled" | "cancelled" | "completed" }
  | { ok: false; error: string; fieldErrors?: Partial<Record<string, string>> };

function json(body: ApiResponse, status: number, headers?: HeadersInit) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

const UNAVAILABLE =
  "We couldn't save your request right now. Please call +92 21 111 000 061 to arrange your visit.";

export async function POST(request: Request) {
  if (!isSameOrigin(request.headers)) return json({ ok: false, error: "This request was blocked." }, 403);
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return json({ ok: false, error: "Unsupported request format." }, 415);
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return json({ ok: false, error: "Your message is too long." }, 413);

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ ok: false, error: "The request could not be read." }, 400);
  }

  const parsed = siteVisitRequestSchema().safeParse(body);
  if (!parsed.success) {
    const errors = fieldErrors(parsed.error);
    if (errors.website || errors.submissionId || errors.startedAt) {
      return json({ ok: false, error: "We couldn't submit the form. Please reload the page and try again." }, 422);
    }
    return json({ ok: false, error: "Please check the highlighted fields.", fieldErrors: errors }, 422);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { submissionId, startedAt, sourcePath, website, ...data } = parsed.data;
  if (Date.now() - startedAt < MIN_FILL_MS) {
    return json({ ok: false, error: "That was quick! Please check your details and submit again." }, 422);
  }

  let db;
  try {
    db = getDb();
  } catch (error) {
    if (error instanceof DatabaseNotConfiguredError) {
      console.error(`[site-visit] database not configured: ${error.message}`);
      return json({ ok: false, error: UNAVAILABLE }, 503);
    }
    throw error;
  }

  try {
    const ipHash = hashIdentifier(clientIp(request.headers));
    const limit = await consumeRateLimit(db, `site-visit:${ipHash}`, RATE_LIMIT, RATE_WINDOW_MS);
    if (!limit.allowed) {
      return json(
        { ok: false, error: "Too many requests were sent from your connection. Please try again later or call us." },
        429,
        { "Retry-After": String(limit.retryAfterSeconds) },
      );
    }

    const created = await createSiteVisit(db, data, { submissionId, sourcePath, ipHash });
    if (!created.duplicate) {
      after(async () => {
        await deliverSiteVisitNotification(db, created.id);
      });
    }
    return json({ ok: true, reference: created.reference, status: created.status }, created.duplicate ? 200 : 201);
  } catch (error) {
    if (isMissingTableError(error)) console.error("[site-visit] database tables missing. Run `npm run db:migrate`.");
    else console.error(`[site-visit] failed to store request: ${error instanceof Error ? error.message : "unknown error"}`);
    return json({ ok: false, error: UNAVAILABLE }, 503);
  }
}
