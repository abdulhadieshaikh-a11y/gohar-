import { after } from "next/server";
import { DatabaseNotConfiguredError, getDb, isMissingTableError } from "@/lib/db";
import { createEnquiry, deliverEnquiryNotification } from "@/lib/enquiries/service";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { clientIp, hashIdentifier, isSameOrigin } from "@/lib/security/request";
import { enquiryRequestSchema, fieldErrors } from "@/lib/validation/enquiry";

/**
 * POST /api/enquiries
 * Validates, rate-limits and stores an enquiry, then sends the staff
 * notification after the response. Success is returned only once the
 * enquiry is safely in the database.
 */

const MIN_FILL_MS = 2_500;
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const MAX_BODY_BYTES = 16 * 1024;

type ApiResponse =
  | { ok: true; reference: string }
  | { ok: false; error: string; fieldErrors?: Partial<Record<string, string>> };

function json(body: ApiResponse, status: number, headers?: HeadersInit) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

const UNAVAILABLE =
  "We couldn't save your enquiry right now. Please call +92 21 111 000 061 or email info@gohargoc.com.";

export async function POST(request: Request) {
  if (!isSameOrigin(request.headers)) {
    return json({ ok: false, error: "This request was blocked." }, 403);
  }
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

  const parsed = enquiryRequestSchema.safeParse(body);
  if (!parsed.success) {
    const errors = fieldErrors(parsed.error);
    if (errors.website || errors.submissionId || errors.startedAt) {
      return json({ ok: false, error: "We couldn't submit the form. Please reload the page and try again." }, 422);
    }
    return json({ ok: false, error: "Please check the highlighted fields.", fieldErrors: errors }, 422);
  }

  // `website` (the honeypot) is validated as empty above and deliberately not stored.
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
      console.error(`[enquiry] database not configured: ${error.message}`);
      return json({ ok: false, error: UNAVAILABLE }, 503);
    }
    throw error;
  }

  try {
    const ipHash = hashIdentifier(clientIp(request.headers));
    const limit = await consumeRateLimit(db, `enquiry:${ipHash}`, RATE_LIMIT, RATE_WINDOW_MS);
    if (!limit.allowed) {
      return json(
        { ok: false, error: "Too many enquiries were sent from your connection. Please try again later or call us." },
        429,
        { "Retry-After": String(limit.retryAfterSeconds) },
      );
    }

    const created = await createEnquiry(db, data, { submissionId, sourcePath, ipHash });

    if (!created.duplicate) {
      after(async () => {
        await deliverEnquiryNotification(db, created.id);
      });
    }
    return json({ ok: true, reference: created.reference }, created.duplicate ? 200 : 201);
  } catch (error) {
    if (isMissingTableError(error)) {
      console.error("[enquiry] database tables missing. Run `npm run db:migrate`.");
    } else {
      console.error(`[enquiry] failed to store enquiry: ${error instanceof Error ? error.message : "unknown error"}`);
    }
    return json({ ok: false, error: UNAVAILABLE }, 503);
  }
}
