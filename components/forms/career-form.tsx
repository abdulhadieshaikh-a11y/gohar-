"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, FileText, Loader2, Upload, X } from "lucide-react";
import { CITY_OPTIONS } from "@/lib/validation/enquiry-options";
import { Button } from "@/components/ui/button";

// Validation (and Zod) loads only when someone starts filling in the form.
let validationModule: Promise<typeof import("@/lib/validation/career")> | undefined;
const loadValidation = () => (validationModule ??= import("@/lib/validation/career"));

const CV_ACCEPT =
  ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

interface CareerFormProps {
  vacancies: { id: string; title: string }[];
  email: string;
}

type Values = {
  name: string;
  email: string;
  phone: string;
  city: string;
  vacancyId: string;
  roleInterest: string;
  profileUrl: string;
  message: string;
  consent: boolean;
};
type Status = { kind: "idle" } | { kind: "submitting" } | { kind: "success"; reference: string } | { kind: "error"; message: string };

const ORDER = ["name", "email", "phone", "city", "vacancyId", "roleInterest", "profileUrl", "message", "cv", "consent"] as const;

export function CareerForm({ vacancies, email }: CareerFormProps) {
  const uid = useId();
  const id = (n: string) => `${uid}-${n}`;
  const empty: Values = { name: "", email: "", phone: "", city: "", vacancyId: "", roleInterest: "", profileUrl: "", message: "", consent: false };
  const [values, setValues] = useState<Values>(empty);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  // Bumped after a failed submit; focus moves to the error summary once it has rendered.
  const [focusSummary, setFocusSummary] = useState(0);
  const [honeypot, setHoneypot] = useState("");
  const submissionId = useRef("");
  const startedAt = useRef(0);
  const fileInput = useRef<HTMLInputElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    submissionId.current = crypto.randomUUID();
    startedAt.current = Date.now();
  }, []);
  useEffect(() => {
    if (status.kind === "success") successRef.current?.focus();
  }, [status]);

  useEffect(() => {
    if (focusSummary > 0) summaryRef.current?.focus();
  }, [focusSummary]);

  const validate = async (v: Values, f: File | null) => {
    try {
      const mod = await loadValidation();
      const parsed = mod.careerSchema.safeParse(v);
      const out = parsed.success ? {} : mod.careerFieldErrors(parsed.error);
      const fileError = mod.cvProblem(f);
      if (fileError) out.cv = fileError;
      return out;
    } catch {
      return {};
    }
  };

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    const next = { ...values, [key]: value };
    setValues(next);
    if (errors[key as string]) void validate(next, file).then((e) => setErrors((p) => ({ ...p, [key]: e[key as string] })));
  };
  const blur = (key: string) => void validate(values, file).then((e) => setErrors((p) => ({ ...p, [key]: e[key] })));

  const chooseFile = (f: File | null) => {
    setFile(f);
    void validate(values, f).then((e) => setErrors((p) => ({ ...p, cv: e.cv })));
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status.kind === "submitting") return;
    const clientErrors = await validate(values, file);
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors);
      setFocusSummary((n) => n + 1);
      return;
    }
    setStatus({ kind: "submitting" });
    const body = new FormData();
    for (const [k, v] of Object.entries(values)) body.append(k, typeof v === "boolean" ? String(v) : v);
    body.append("cv", file!);
    body.append("submissionId", submissionId.current);
    body.append("startedAt", String(startedAt.current));
    body.append("website", honeypot);
    try {
      const res = await fetch("/api/careers", { method: "POST", body });
      const data = (await res.json().catch(() => null)) as
        | { ok: true; reference: string }
        | { ok: false; error: string; fieldErrors?: Partial<Record<string, string>> }
        | null;
      if (res.ok && data?.ok) {
        setStatus({ kind: "success", reference: data.reference });
        return;
      }
      if (data && !data.ok && data.fieldErrors) {
        setErrors(data.fieldErrors);
        setFocusSummary((n) => n + 1);
      }
      setStatus({ kind: "error", message: data && !data.ok ? data.error : `Something went wrong. Please email ${email}.` });
    } catch {
      setStatus({ kind: "error", message: "We couldn't reach our server. Check your connection and try again." });
    }
  }

  if (status.kind === "success") {
    return (
      <div ref={successRef} tabIndex={-1} role="status" className="border border-success/30 bg-paper p-8 outline-none sm:p-10">
        <CheckCircle2 aria-hidden="true" className="size-9 text-success" />
        <h3 className="mt-5 text-3xl">Thank you. Your details have been received.</h3>
        <p className="mt-4 leading-relaxed text-muted">
          Your reference is <strong className="font-semibold tracking-wider text-ink">{status.reference}</strong>. We keep
          your CV on file and will contact you if a suitable role opens.
        </p>
      </div>
    );
  }

  const err = (n: string) =>
    errors[n] ? (
      <p id={id(`${n}-error`)} className="field-error">
        {errors[n]}
      </p>
    ) : null;
  const a11y = (n: string) => ({
    id: id(n),
    name: n,
    "aria-invalid": errors[n] ? true : undefined,
    "aria-describedby": errors[n] ? id(`${n}-error`) : undefined,
  });
  const errorList = ORDER.filter((f) => errors[f]);
  const req = <span aria-hidden="true" className="text-brass-deep">*</span>;

  return (
    <form onSubmit={onSubmit} onFocusCapture={() => void loadValidation()} noValidate className="space-y-5" aria-busy={status.kind === "submitting"}>
      {errorList.length > 0 ? (
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
          <label htmlFor={id("name")} className="field-label">Full name {req}</label>
          <input {...a11y("name")} autoComplete="name" value={values.name} onChange={(e) => set("name", e.target.value)} onBlur={() => blur("name")} className="field-control" maxLength={100} />
          {err("name")}
        </div>
        <div>
          <label htmlFor={id("email")} className="field-label">Email {req}</label>
          <input {...a11y("email")} type="email" autoComplete="email" value={values.email} onChange={(e) => set("email", e.target.value)} onBlur={() => blur("email")} className="field-control" maxLength={254} />
          {err("email")}
        </div>
        <div>
          <label htmlFor={id("phone")} className="field-label">Phone {req}</label>
          <input {...a11y("phone")} type="tel" autoComplete="tel" placeholder="0300 1234567" value={values.phone} onChange={(e) => set("phone", e.target.value)} onBlur={() => blur("phone")} className="field-control" maxLength={30} />
          {err("phone")}
        </div>
        <div>
          <label htmlFor={id("city")} className="field-label">City <span className="font-normal text-muted">(optional)</span></label>
          <select {...a11y("city")} value={values.city} onChange={(e) => set("city", e.target.value)} className="field-control">
            <option value="">Select a city</option>
            {CITY_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {err("city")}
        </div>
        {vacancies.length > 0 ? (
          <div className="sm:col-span-2">
            <label htmlFor={id("vacancyId")} className="field-label">Vacancy</label>
            <select {...a11y("vacancyId")} value={values.vacancyId} onChange={(e) => set("vacancyId", e.target.value)} className="field-control">
              <option value="">General expression of interest</option>
              {vacancies.map((v) => (
                <option key={v.id} value={v.id}>{v.title}</option>
              ))}
            </select>
            {err("vacancyId")}
          </div>
        ) : null}
        <div>
          <label htmlFor={id("roleInterest")} className="field-label">Role or area of interest <span className="font-normal text-muted">(optional)</span></label>
          <input {...a11y("roleInterest")} placeholder="e.g. Sales, Site engineering, Accounts" value={values.roleInterest} onChange={(e) => set("roleInterest", e.target.value)} onBlur={() => blur("roleInterest")} className="field-control" maxLength={120} />
          {err("roleInterest")}
        </div>
        <div>
          <label htmlFor={id("profileUrl")} className="field-label">LinkedIn or portfolio link <span className="font-normal text-muted">(optional)</span></label>
          <input {...a11y("profileUrl")} type="url" inputMode="url" placeholder="https://" value={values.profileUrl} onChange={(e) => set("profileUrl", e.target.value)} onBlur={() => blur("profileUrl")} className="field-control" maxLength={300} />
          {err("profileUrl")}
        </div>
      </div>

      <div>
        <label htmlFor={id("message")} className="field-label">Short note <span className="font-normal text-muted">(optional)</span></label>
        <textarea {...a11y("message")} rows={4} value={values.message} onChange={(e) => set("message", e.target.value)} onBlur={() => blur("message")} className="field-control resize-y" maxLength={2000} placeholder="Your experience and the kind of role you're looking for." />
        {err("message")}
      </div>

      <div>
        <p className="field-label" id={id("cv-label")}>CV {req}</p>
        <div
          className={`flex flex-col gap-4 border border-dashed p-5 sm:flex-row sm:items-center sm:justify-between ${errors.cv ? "border-danger" : "border-stone"} bg-paper`}
        >
          {file ? (
            <p className="flex min-w-0 items-center gap-3 text-[0.92rem]">
              <FileText aria-hidden="true" className="size-6 shrink-0 text-brass-deep" />
              <span className="min-w-0">
                <span className="block truncate font-medium">{file.name}</span>
                <span className="text-[0.8rem] text-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </span>
            </p>
          ) : (
            <p className="text-[0.9rem] text-muted">PDF or Word document (.pdf, .doc, .docx), up to 4 MB.</p>
          )}
          <div className="flex gap-2">
            <label
              htmlFor={id("cv")}
              className="inline-flex cursor-pointer items-center gap-2 border border-ink px-4 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.1em] hover:bg-ink hover:text-ivory has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brass"
            >
              <Upload aria-hidden="true" className="size-4" />
              {file ? "Replace file" : "Choose file"}
              <input
                ref={fileInput}
                id={id("cv")}
                name="cv"
                type="file"
                accept={CV_ACCEPT}
                className="sr-only"
                aria-labelledby={id("cv-label")}
                aria-invalid={errors.cv ? true : undefined}
                aria-describedby={errors.cv ? id("cv-error") : undefined}
                onChange={(e) => chooseFile(e.target.files?.[0] ?? null)}
              />
            </label>
            {file ? (
              <button
                type="button"
                onClick={() => {
                  chooseFile(null);
                  if (fileInput.current) fileInput.current.value = "";
                }}
                className="grid size-10 place-items-center border border-line text-muted hover:text-ink"
              >
                <X aria-hidden="true" className="size-4" />
                <span className="sr-only">Remove file</span>
              </button>
            ) : null}
          </div>
        </div>
        {err("cv")}
      </div>

      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={id("website")}>Leave this field empty</label>
        <input id={id("website")} name="website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
      </div>

      <div>
        <div className="flex items-start gap-3">
          <input {...a11y("consent")} type="checkbox" checked={values.consent} onChange={(e) => set("consent", e.target.checked)} className="mt-1 size-4 shrink-0 accent-[var(--color-ink)]" />
          <label htmlFor={id("consent")} className="text-[0.88rem] leading-relaxed text-muted">
            I agree that Gohar Group of Companies may keep my details and CV to consider me for current and future roles,
            as described in the{" "}
            <Link href="/privacy" className="font-medium text-ink underline underline-offset-2">Privacy Policy</Link>. {req}
          </label>
        </div>
        {err("consent")}
      </div>

      <Button type="submit" size="lg" disabled={status.kind === "submitting"} className="sm:min-w-56">
        {status.kind === "submitting" ? (
          <>
            <Loader2 aria-hidden="true" className="size-4 animate-spin" /> Uploading…
          </>
        ) : (
          "Submit my details"
        )}
      </Button>
    </form>
  );
}
