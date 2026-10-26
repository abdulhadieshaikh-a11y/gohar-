"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { CITY_OPTIONS, ENQUIRY_TYPES, NO_PROJECT, type EnquiryType } from "@/lib/validation/enquiry-options";
import type { EnquiryInput } from "@/lib/validation/enquiry";
import { Button } from "@/components/ui/button";

// The validation schema (and Zod) is downloaded only once someone starts
// using the form, keeping it out of the initial page JavaScript.
let validationModule: Promise<typeof import("@/lib/validation/enquiry")> | undefined;
const loadValidation = () => (validationModule ??= import("@/lib/validation/enquiry"));

interface EnquiryFormProps {
  projects: { value: string; label: string }[];
  defaultProject?: string;
  defaultType?: EnquiryType;
  phone: { display: string; href: string };
  email: string;
  /** Hides the project selector (used on a project page, where the project is fixed but still editable via "change"). */
  lockedProjectName?: string;
}

type FormState = Omit<EnquiryInput, "consent" | "project" | "city"> & { consent: boolean; project: string; city: string };
type Status = { kind: "idle" } | { kind: "submitting" } | { kind: "success"; reference: string } | { kind: "error"; message: string };

const FIELD_ORDER = ["enquiryType", "name", "email", "phone", "city", "project", "message", "consent"] as const;

function newSubmissionId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
        (Number(c) ^ (Math.random() * 16) >> (Number(c) / 4)).toString(16),
      );
}

export function EnquiryForm({ projects, defaultProject, defaultType = "sales", phone, email, lockedProjectName }: EnquiryFormProps) {
  const pathname = usePathname();
  const formId = useId();
  const id = (name: string) => `${formId}-${name}`;
  const initial: FormState = {
    enquiryType: defaultType,
    name: "",
    email: "",
    phone: "",
    city: "",
    project: defaultProject ?? NO_PROJECT,
    message: "",
    consent: false,
  };
  const [values, setValues] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<string, boolean>>>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  // Bumped after a failed submit; focus moves to the error summary once it has rendered.
  const [focusSummary, setFocusSummary] = useState(0);
  const [honeypot, setHoneypot] = useState("");
  const [showProjectPicker, setShowProjectPicker] = useState(!lockedProjectName);
  const submissionId = useRef<string>("");
  const startedAt = useRef<number>(0);
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    submissionId.current = newSubmissionId();
    startedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (status.kind === "success") successRef.current?.focus();
  }, [status]);

  useEffect(() => {
    if (focusSummary > 0) summaryRef.current?.focus();
  }, [focusSummary]);

  const validate = async (v: FormState): Promise<Partial<Record<string, string>>> => {
    try {
      const { enquirySchema, fieldErrors } = await loadValidation();
      const parsed = enquirySchema.safeParse({ ...v, city: v.city || undefined });
      return parsed.success ? {} : fieldErrors(parsed.error);
    } catch {
      return {}; // if the module can't load, the server still validates everything
    }
  };

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    const next = { ...values, [key]: value };
    setValues(next);
    if (touched[key as string] || errors[key as string]) {
      void validate(next).then((e) => setErrors((prev) => ({ ...prev, [key]: e[key as string] })));
    }
  };

  const blur = (key: keyof FormState) => {
    setTouched((t) => ({ ...t, [key]: true }));
    void validate(values).then((e) => setErrors((prev) => ({ ...prev, [key]: e[key as string] })));
  };

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status.kind === "submitting") return; // guard against double submission

    const clientErrors = await validate(values);
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      setTouched(Object.fromEntries(FIELD_ORDER.map((f) => [f, true])));
      setStatus({ kind: "idle" });
      if (clientErrors.project) setShowProjectPicker(true);
      setFocusSummary((n) => n + 1);
      return;
    }

    setStatus({ kind: "submitting" });
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          city: values.city || undefined,
          submissionId: submissionId.current,
          startedAt: startedAt.current,
          sourcePath: pathname,
          website: honeypot,
        }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok: true; reference: string }
        | { ok: false; error: string; fieldErrors?: Partial<Record<string, string>> }
        | null;

      if (res.ok && data && data.ok) {
        setStatus({ kind: "success", reference: data.reference });
        return;
      }
      if (data && !data.ok && data.fieldErrors) {
        setErrors(data.fieldErrors);
        setTouched(Object.fromEntries(FIELD_ORDER.map((f) => [f, true])));
        setFocusSummary((n) => n + 1);
      }
      setStatus({
        kind: "error",
        message: data && !data.ok ? data.error : `Something went wrong. Please call ${phone.display} or email ${email}.`,
      });
    } catch {
      setStatus({
        kind: "error",
        message: `We couldn't reach our server. Check your connection and try again, or call ${phone.display}.`,
      });
    }
  }

  function reset() {
    setValues(initial);
    setErrors({});
    setTouched({});
    submissionId.current = newSubmissionId();
    startedAt.current = Date.now();
    setStatus({ kind: "idle" });
  }

  if (status.kind === "success") {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="border border-success/30 bg-paper p-8 outline-none sm:p-10"
      >
        <CheckCircle2 aria-hidden="true" className="size-9 text-success" />
        <h3 className="mt-5 text-3xl">Thank you. Your enquiry has been received.</h3>
        <p className="mt-4 leading-relaxed text-muted">
          Your reference number is{" "}
          <strong className="font-semibold tracking-wider text-ink">{status.reference}</strong>. Our team will get back to
          you during office hours (Monday to Saturday, 11:00 AM – 8:00 PM). For anything urgent, call{" "}
          <a href={phone.href} className="font-semibold text-ink underline underline-offset-4">
            {phone.display}
          </a>
          .
        </p>
        <Button variant="secondary" className="mt-8" onClick={reset}>
          Send another enquiry
        </Button>
      </div>
    );
  }

  const errorList = FIELD_ORDER.filter((f) => errors[f]);
  const showSummary = errorList.length > 0 && Object.keys(touched).length >= FIELD_ORDER.length;
  const fieldError = (name: string) =>
    errors[name] ? (
      <p id={id(`${name}-error`)} className="field-error">
        {errors[name]}
      </p>
    ) : null;
  const a11y = (name: string) => ({
    id: id(name),
    name,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? id(`${name}-error`) : undefined,
  });

  return (
    <form
      onSubmit={onSubmit}
      onFocusCapture={() => void loadValidation()}
      noValidate
      className="space-y-5"
      aria-busy={status.kind === "submitting"}
    >
      {showSummary ? (
        <div ref={summaryRef} tabIndex={-1} role="alert" className="border-l-2 border-danger bg-danger/5 p-4 outline-none">
          <p className="flex items-center gap-2 font-semibold text-danger">
            <AlertCircle aria-hidden="true" className="size-4" />
            Please correct {errorList.length === 1 ? "1 field" : `${errorList.length} fields`}:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-[0.88rem]">
            {errorList.map((f) => (
              <li key={f}>
                <a href={`#${id(f)}`} className="underline underline-offset-2">
                  {errors[f]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {status.kind === "error" ? (
        <div role="alert" className="flex gap-3 border-l-2 border-danger bg-danger/5 p-4 text-[0.92rem]">
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-danger" />
          <p>{status.message}</p>
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={id("enquiryType")} className="field-label">
            Enquiry type <span aria-hidden="true" className="text-brass-deep">*</span>
          </label>
          <select
            {...a11y("enquiryType")}
            value={values.enquiryType}
            onChange={(e) => set("enquiryType", e.target.value as EnquiryType)}
            onBlur={() => blur("enquiryType")}
            className="field-control"
            required
          >
            {ENQUIRY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          {fieldError("enquiryType")}
        </div>

        <div className="min-w-0">
          {showProjectPicker ? (
            <>
              <label htmlFor={id("project")} className="field-label">
                Project of interest
              </label>
              <select
                {...a11y("project")}
                value={values.project}
                onChange={(e) => set("project", e.target.value)}
                onBlur={() => blur("project")}
                className="field-control"
              >
                <option value={NO_PROJECT}>No specific project</option>
                {projects.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
              {fieldError("project")}
            </>
          ) : (
            <>
              <p className="field-label">Project of interest</p>
              <p className="flex items-center justify-between border border-stone bg-ivory-2 px-3.5 py-[0.8rem]">
                <span className="truncate font-medium">{lockedProjectName}</span>
                <button
                  type="button"
                  className="ml-3 shrink-0 text-[0.75rem] font-semibold uppercase tracking-wider text-brass-deep hover:text-ink"
                  onClick={() => setShowProjectPicker(true)}
                >
                  Change
                </button>
              </p>
            </>
          )}
        </div>

        <div>
          <label htmlFor={id("name")} className="field-label">
            Full name <span aria-hidden="true" className="text-brass-deep">*</span>
          </label>
          <input
            {...a11y("name")}
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            onBlur={() => blur("name")}
            className="field-control"
            required
            maxLength={100}
          />
          {fieldError("name")}
        </div>

        <div>
          <label htmlFor={id("email")} className="field-label">
            Email <span aria-hidden="true" className="text-brass-deep">*</span>
          </label>
          <input
            {...a11y("email")}
            type="email"
            inputMode="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            onBlur={() => blur("email")}
            className="field-control"
            required
            maxLength={254}
          />
          {fieldError("email")}
        </div>

        <div>
          <label htmlFor={id("phone")} className="field-label">
            Phone <span aria-hidden="true" className="text-brass-deep">*</span>
          </label>
          <input
            {...a11y("phone")}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0300 1234567"
            value={values.phone}
            onChange={(e) => set("phone", e.target.value)}
            onBlur={() => blur("phone")}
            className="field-control"
            required
            maxLength={30}
          />
          {fieldError("phone")}
        </div>

        <div>
          <label htmlFor={id("city")} className="field-label">
            City <span className="font-normal text-muted">(optional)</span>
          </label>
          <select
            {...a11y("city")}
            value={values.city}
            onChange={(e) => set("city", e.target.value)}
            onBlur={() => blur("city")}
            className="field-control"
          >
            <option value="">Select a city</option>
            {CITY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {fieldError("city")}
        </div>
      </div>

      <div>
        <label htmlFor={id("message")} className="field-label">
          Message <span aria-hidden="true" className="text-brass-deep">*</span>
        </label>
        <textarea
          {...a11y("message")}
          rows={5}
          value={values.message}
          onChange={(e) => set("message", e.target.value)}
          onBlur={() => blur("message")}
          className="field-control resize-y"
          required
          maxLength={2000}
          placeholder="Tell us what you're looking for, and the best time to call you."
        />
        <div className="flex justify-between gap-4">
          {fieldError("message") ?? <span />}
          <span className="mt-1.5 text-[0.75rem] tabular-nums text-muted">{values.message.length}/2000</span>
        </div>
      </div>

      {/* Honeypot: hidden from people and assistive tech; bots tend to fill it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={id("website")}>Leave this field empty</label>
        <input
          id={id("website")}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div>
        <div className="flex items-start gap-3">
          <input
            {...a11y("consent")}
            type="checkbox"
            checked={values.consent}
            onChange={(e) => set("consent", e.target.checked)}
            onBlur={() => blur("consent")}
            className="mt-1 size-4 shrink-0 accent-[var(--color-ink)]"
            required
          />
          <label htmlFor={id("consent")} className="text-[0.88rem] leading-relaxed text-muted">
            I agree that Gohar Group of Companies may store and use these details to respond to my enquiry, as described in
            the{" "}
            <Link href="/privacy" className="font-medium text-ink underline underline-offset-2">
              Privacy Policy
            </Link>
            . <span aria-hidden="true" className="text-brass-deep">*</span>
          </label>
        </div>
        {fieldError("consent")}
      </div>

      <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <Button type="submit" size="lg" disabled={status.kind === "submitting"} className="sm:min-w-56">
          {status.kind === "submitting" ? (
            <>
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              Sending…
            </>
          ) : (
            "Send enquiry"
          )}
        </Button>
        <p className="text-[0.78rem] text-muted">
          <span aria-hidden="true" className="text-brass-deep">*</span> Required fields
        </p>
      </div>
    </form>
  );
}
