import { after } from "next/server";
import { DatabaseNotConfiguredError, getDb, isMissingTableError } from "@/lib/db";
import { createApplication, deliverApplicationNotification } from "@/lib/careers/service";
import { detectCv, safeFilename } from "@/lib/security/file-signature";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { clientIp, hashIdentifier, isSameOrigin } from "@/lib/security/request";
import { CV_MAX_BYTES, careerFieldErrors, careerSchema } from "@/lib/validation/career";

/**
 * POST /api/careers (multipart/form-data)
 * Validates the form and the CV (size, extension AND file signature),
 * rate-limits, stores the application, then notifies staff in the background.
 */

const MAX_REQUEST_BYTES = CV_MAX_BYTES + 64 * 1024;
const MIN_FILL_MS = 3000;

type ApiResponse = { ok: true; reference: string } | { ok: false; error: string; fieldErrors?: Partial<Record<string, string>> };
const json = (body: ApiResponse, status: number, headers?: HeadersInit) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });

const UNAVAILABLE = "We couldn't save your application right now. Please try again later or email info@gohargoc.com.";

export async function POST(request: Request) {
  if (!isSameOrigin(request.headers)) return json({ ok: false, error: "This request was blocked." }, 403);
  if (!request.headers.get("content-type")?.includes("multipart/form-data")) {
    return json({ ok: false, error: "Unsupported request format." }, 415);
  }
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_REQUEST_BYTES) {
    return json({ ok: false, error: "Your CV is too large. Please upload a file smaller than 4 MB.", fieldErrors: { cv: "File is larger than 4 MB." } }, 413);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, error: "The form could not be read. Please try again." }, 400);
  }

  const text = (k: string) => {
    const v = form.get(k);
    return typeof v === "string" ? v : undefined;
  };
  if (text("website")) return json({ ok: false, error: "We couldn't submit the form. Please reload the page and try again." }, 422);
  const submissionId = text("submissionId") ?? "";
  const startedAt = Number(text("startedAt") ?? 0);
  if (!/^[0-9a-f-]{36}$/i.test(submissionId) || !startedAt) {
    return json({ ok: false, error: "We couldn't submit the form. Please reload the page and try again." }, 422);
  }
  if (Date.now() - startedAt < MIN_FILL_MS) {
    return json({ ok: false, error: "That was quick! Please check your details and submit again." }, 422);
  }

  const parsed = careerSchema.safeParse({
    name: text("name"),
    email: text("email"),
    phone: text("phone"),
    city: text("city"),
    vacancyId: text("vacancyId"),
    roleInterest: text("roleInterest"),
    profileUrl: text("profileUrl"),
    message: text("message"),
    consent: text("consent") === "true",
  });

  const file = form.get("cv");
  let cvError: string | undefined;
  let cv: { filename: string; mime: string; bytes: Uint8Array } | undefined;
  if (!(file instanceof File) || file.size === 0) {
    cvError = "Please attach your CV (PDF or Word, up to 4 MB).";
  } else if (file.size > CV_MAX_BYTES) {
    cvError = "Please upload a file smaller than 4 MB.";
  } else {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const kind = detectCv(bytes, file.name);
    if (!kind) cvError = "This file doesn't look like a PDF or Word document. Please upload your CV as .pdf, .doc or .docx.";
    else cv = { filename: safeFilename(file.name, kind.ext), mime: kind.mime, bytes };
  }

  if (!parsed.success || cvError) {
    const fieldErrors = parsed.success ? {} : careerFieldErrors(parsed.error);
    if (cvError) fieldErrors.cv = cvError;
    return json({ ok: false, error: "Please check the highlighted fields.", fieldErrors }, 422);
  }

  let db;
  try {
    db = getDb();
  } catch (error) {
    if (error instanceof DatabaseNotConfiguredError) {
      console.error(`[careers] database not configured: ${error.message}`);
      return json({ ok: false, error: UNAVAILABLE }, 503);
    }
    throw error;
  }

  try {
    const ipHash = hashIdentifier(clientIp(request.headers));
    const limit = await consumeRateLimit(db, `careers:${ipHash}`, 3, 60 * 60 * 1000);
    if (!limit.allowed) {
      return json({ ok: false, error: "Too many applications from your connection. Please try again later." }, 429, {
        "Retry-After": String(limit.retryAfterSeconds),
      });
    }
    const created = await createApplication(db, parsed.data, cv!, { submissionId, ipHash });
    if (!created.duplicate) {
      after(async () => {
        await deliverApplicationNotification(db, created.id);
      });
    }
    return json({ ok: true, reference: created.reference }, created.duplicate ? 200 : 201);
  } catch (error) {
    console.error(
      isMissingTableError(error)
        ? "[careers] database tables missing. Run `npm run db:migrate`."
        : `[careers] failed to store application: ${error instanceof Error ? error.message : "unknown error"}`,
    );
    return json({ ok: false, error: UNAVAILABLE }, 503);
  }
}
