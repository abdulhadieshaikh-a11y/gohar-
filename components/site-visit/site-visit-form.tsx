"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { AlertCircle, ArrowLeft, ArrowRight, CalendarClock, CheckCircle2, Clock, Loader2, Minus, Phone, Plus } from "lucide-react";
import {
  MAX_DAYS_AHEAD,
  MAX_VISITORS,
  TIME_SLOTS,
  addDays,
  availableSlots,
  formatVisitDate,
  pakistanNow,
  timeSlotLabel,
  upcomingVisitDates,
  type TimeSlot,
} from "@/lib/validation/site-visit-options";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";

// Zod and the schema load only once someone starts using the form.
let validationModule: Promise<typeof import("@/lib/validation/site-visit")> | undefined;
const loadValidation = () => (validationModule ??= import("@/lib/validation/site-visit"));

export interface VisitProjectOption {
  slug: string;
  name: string;
  area: string;
  city: string;
  image: { src: string; alt: string };
}

interface SiteVisitFormProps {
  projects: VisitProjectOption[];
  /** Story slug → project slugs mentioned in that story (to suggest them first). */
  storyProjects: Record<string, { title: string; projects: string[] }>;
  phone: { display: string; href: string };
  whatsappNumber: string | null;
}

type Values = {
  project: string;
  date: string;
  timeSlot: TimeSlot | "";
  visitors: number;
  name: string;
  phone: string;
  email: string;
  message: string;
  consent: boolean;
};
type Errors = Partial<Record<keyof Values | "form", string>>;
type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; reference: string; confirmed: boolean }
  | { kind: "error"; message: string };

const STEPS = [
  { title: "Your visit", fields: ["project", "date", "timeSlot", "visitors"] },
  { title: "Your details", fields: ["name", "phone", "email", "message"] },
  { title: "Review & send", fields: ["consent"] },
] as const satisfies readonly { title: string; fields: readonly (keyof Values)[] }[];

const FIELD_STEP: Record<string, number> = Object.fromEntries(STEPS.flatMap((s, i) => s.fields.map((f) => [f, i])));

function newSubmissionId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
        (Number(c) ^ (Math.random() * 16) >> (Number(c) / 4)).toString(16),
      );
}

// "Now" is read once on the client. During server rendering and hydration it is
// null, so dates are never baked into the static HTML at build time.
let clientNow: number | undefined;
const subscribeNow = () => () => {};
const getNow = () => (clientNow ??= Date.now());
const getServerNow = () => null;

/**
 * Booking form. Keyed by the query string, so following another "Schedule a
 * site visit" link while already on this page starts a fresh form with the
 * new project selected (the page itself is not re-mounted on client navigation).
 */
export function SiteVisitForm(props: SiteVisitFormProps) {
  const searchParams = useSearchParams();
  return <SiteVisitFormInner key={searchParams.toString()} {...props} />;
}

function SiteVisitFormInner({ projects, storyProjects, phone, whatsappNumber }: SiteVisitFormProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const nowMs = useSyncExternalStore(subscribeNow, getNow, getServerNow);
  const now = nowMs === null ? null : new Date(nowMs);
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;

  const requested = searchParams.get("project") ?? "";
  const fromStory = storyProjects[searchParams.get("from") ?? ""];
  const initialProject = projects.some((p) => p.slug === requested)
    ? requested
    : fromStory && fromStory.projects.length === 1
      ? fromStory.projects[0]!
      : "";

  const [values, setValues] = useState<Values>({
    project: initialProject,
    date: "",
    timeSlot: "",
    visitors: 1,
    name: "",
    phone: "",
    email: "",
    message: "",
    consent: false,
  });
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [honeypot, setHoneypot] = useState("");
  const [focusTarget, setFocusTarget] = useState<{ n: number; target: string } | null>(null);
  const submissionId = useRef("");
  const startedAt = useRef(0);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    submissionId.current = newSubmissionId();
    startedAt.current = Date.now();
  }, []);

  // Moves focus after a step change or failed validation, once the DOM has updated.
  useEffect(() => {
    if (!focusTarget) return;
    const el = rootRef.current?.querySelector<HTMLElement>(focusTarget.target);
    el?.focus();
    if (el && typeof el.scrollIntoView === "function") el.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [focusTarget]);

  const focus = (target: string) => setFocusTarget((f) => ({ n: (f?.n ?? 0) + 1, target }));

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((v) => {
      const next = { ...v, [key]: value };
      // A new date may close today's earlier windows.
      if (key === "date" && next.timeSlot && now && !availableSlots(String(value), now).includes(next.timeSlot)) next.timeSlot = "";
      return next;
    });
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = async (v: Values): Promise<Errors> => {
    try {
      const { siteVisitSchema, fieldErrors } = await loadValidation();
      const parsed = siteVisitSchema(new Date()).safeParse({
        ...v,
        email: v.email || undefined,
        message: v.message || undefined,
        timeSlot: v.timeSlot || undefined,
      });
      return parsed.success ? {} : (fieldErrors(parsed.error) as Errors);
    } catch {
      return {}; // the server validates everything regardless
    }
  };

  const stepErrors = (all: Errors, s: number): Errors =>
    Object.fromEntries(Object.entries(all).filter(([k]) => (STEPS[s]!.fields as readonly string[]).includes(k)));

  async function next() {
    const all = await validate(values);
    const current = stepErrors(all, step);
    setErrors(current);
    const first = STEPS[step]!.fields.find((f) => current[f]);
    if (first) {
      focus(`[data-field="${first}"]`);
      return;
    }
    setStep((s) => s + 1);
    focus("[data-step-heading]");
  }

  function back() {
    setErrors({});
    setStep((s) => Math.max(0, s - 1));
    focus("[data-step-heading]");
  }

  function goTo(s: number) {
    if (s < step) {
      setErrors({});
      setStep(s);
      focus("[data-step-heading]");
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step < STEPS.length - 1) {
      await next();
      return;
    }
    if (status.kind === "submitting") return;

    const all = await validate(values);
    if (Object.keys(all).length) {
      const firstField = (Object.keys(all) as (keyof Values)[]).sort((a, b) => (FIELD_STEP[a] ?? 0) - (FIELD_STEP[b] ?? 0))[0]!;
      const target = FIELD_STEP[firstField] ?? 0;
      setStep(target);
      setErrors(stepErrors(all, target));
      focus(`[data-field="${firstField}"]`);
      return;
    }

    setStatus({ kind: "submitting" });
    try {
      const res = await fetch("/api/site-visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          email: values.email || undefined,
          message: values.message || undefined,
          submissionId: submissionId.current,
          startedAt: startedAt.current,
          sourcePath: `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`.slice(0, 200),
          website: honeypot,
        }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok: true; reference: string; status: string }
        | { ok: false; error: string; fieldErrors?: Errors }
        | null;

      if (res.ok && data && data.ok) {
        setStatus({ kind: "success", reference: data.reference, confirmed: data.status === "confirmed" });
        return;
      }
      if (data && !data.ok && data.fieldErrors && Object.keys(data.fieldErrors).length) {
        const firstField = (Object.keys(data.fieldErrors) as (keyof Values)[])
          .filter((k) => k in FIELD_STEP)
          .sort((a, b) => (FIELD_STEP[a] ?? 0) - (FIELD_STEP[b] ?? 0))[0];
        if (firstField) {
          const target = FIELD_STEP[firstField]!;
          setStep(target);
          setErrors(stepErrors(data.fieldErrors, target));
          focus(`[data-field="${firstField}"]`);
        }
      }
      setStatus({ kind: "error", message: data && !data.ok ? data.error : `Something went wrong. Please call ${phone.display}.` });
    } catch {
      setStatus({ kind: "error", message: `We couldn't reach our server. Check your connection and try again, or call ${phone.display}.` });
    }
  }

  function reset() {
    setValues((v) => ({ ...v, date: "", timeSlot: "", visitors: 1, message: "", consent: false }));
    setErrors({});
    setStep(0);
    submissionId.current = newSubmissionId();
    startedAt.current = Date.now();
    setStatus({ kind: "idle" });
  }

  const project = projects.find((p) => p.slug === values.project);

  /* ---------------- Success ---------------- */
  if (status.kind === "success") {
    const waText = `Hi, I sent a site visit request on the Gohar Group website (reference ${status.reference}) for ${project?.name ?? "a project"} on ${values.date ? formatVisitDate(values.date) : ""}, ${values.timeSlot ? timeSlotLabel(values.timeSlot) : ""}.`;
    return (
      <div ref={rootRef} role="status" className="rounded-[1.5rem] border border-line bg-paper p-7 shadow-[0_40px_80px_-50px_rgb(15_14_13/0.45)] sm:p-12">
        <CheckCircle2 aria-hidden="true" className="size-10 text-success" />
        <p className="eyebrow mt-6 text-gohar-deep">{status.confirmed ? "Visit confirmed" : "Request received · awaiting confirmation"}</p>
        <h2 className="mt-3 text-[2.2rem] leading-tight sm:text-[2.6rem]" tabIndex={-1} data-autofocus ref={(el) => el?.focus()}>
          Thank you{values.name ? `, ${values.name.split(" ")[0]}` : ""}. We&rsquo;ve received your request.
        </h2>
        <p className="mt-5 max-w-xl leading-relaxed text-muted">
          Your visit is <strong className="text-ink">not confirmed yet</strong>. Our team will call you on{" "}
          <strong className="text-ink">{values.phone}</strong> during office hours to check availability and agree a time.
        </p>
        <dl className="mt-8 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
          {[
            ["Reference", status.reference],
            ["Status", status.confirmed ? "Confirmed" : "Pending confirmation"],
            ["Project", project?.name ?? values.project],
            ["Preferred date", values.date ? formatVisitDate(values.date) : ""],
            ["Preferred time", values.timeSlot ? `${timeSlotLabel(values.timeSlot)} (PKT)` : ""],
            ["Visitors", String(values.visitors)],
          ].map(([k, v]) => (
            <div key={k} className="bg-paper px-5 py-4">
              <dt className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted">{k}</dt>
              <dd className={`mt-1 font-medium ${k === "Reference" ? "font-mono tracking-wider" : ""}`}>{v}</dd>
            </div>
          ))}
        </dl>
        <ol className="mt-8 space-y-3 text-[0.95rem] text-muted">
          <li className="flex gap-3">
            <Phone aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brass-deep" />
            We call you to confirm the date and time (Monday to Saturday, 11:00 AM – 8:00 PM).
          </li>
          <li className="flex gap-3">
            <CalendarClock aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brass-deep" />
            Please wait for our confirmation before travelling to the site.
          </li>
        </ol>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          {whatsappNumber ? (
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(waText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 rounded-full border border-whatsapp-deep bg-whatsapp-deep px-6 py-3.5 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-ivory transition-colors hover:bg-ink hover:border-ink"
            >
              <WhatsAppIcon className="size-4" /> Follow up on WhatsApp
            </a>
          ) : null}
          <a href={phone.href} className="inline-flex items-center justify-center gap-2.5 rounded-full border border-ink/80 px-6 py-3.5 text-[0.72rem] font-semibold uppercase tracking-[0.08em] hover:bg-ink hover:text-ivory">
            <Phone aria-hidden="true" className="size-4" /> Call {phone.display}
          </a>
          <Button variant="text" onClick={reset} className="sm:ml-auto">
            Request another visit
          </Button>
        </div>
      </div>
    );
  }

  /* ---------------- Form ---------------- */
  const dates = now ? upcomingVisitDates(12, now) : [];
  const todayPk = now ? pakistanNow(now).date : "";
  const openSlots = now && values.date ? availableSlots(values.date, now) : TIME_SLOTS.map((s) => s.value);
  // A project chosen from a link is listed first so the selection is visible straight away.
  const suggested = fromStory
    ? projects.filter((p) => fromStory.projects.includes(p.slug))
    : projects.filter((p) => p.slug === initialProject);
  const ordered = [...suggested, ...projects.filter((p) => !suggested.includes(p))];
  const err = (name: keyof Values) =>
    errors[name] ? (
      <p id={id(`${name}-error`)} className="field-error">
        {errors[name]}
      </p>
    ) : null;
  const describedBy = (name: keyof Values, extra?: string) =>
    [errors[name] ? id(`${name}-error`) : "", extra ?? ""].filter(Boolean).join(" ") || undefined;
  const chip = (active: boolean, disabled = false) =>
    `flex flex-col items-start rounded-xl border px-4 py-3 text-left transition-colors duration-300 ${
      disabled
        ? "cursor-not-allowed border-line bg-ivory-2/60 text-muted/60 line-through"
        : active
          ? "border-ink bg-ink text-ivory"
          : "border-line bg-paper hover:border-ink"
    }`;

  return (
    <div ref={rootRef} className="overflow-hidden rounded-[1.5rem] border border-line bg-paper shadow-[0_40px_80px_-50px_rgb(15_14_13/0.45)]">
      {/* Progress */}
      <ol className="grid grid-cols-3 border-b border-line" aria-label="Booking steps">
        {STEPS.map((s, i) => {
          const state = i < step ? "done" : i === step ? "current" : "todo";
          return (
            <li key={s.title} className="min-w-0">
              <button
                type="button"
                onClick={() => goTo(i)}
                disabled={i >= step}
                aria-current={state === "current" ? "step" : undefined}
                className={`relative flex w-full items-center gap-3 px-3 py-4 text-left sm:px-6 ${i < step ? "cursor-pointer hover:bg-ivory" : "cursor-default"}`}
              >
                <span
                  className={`grid size-7 shrink-0 place-items-center rounded-full border text-[0.75rem] font-semibold ${
                    state === "current" ? "border-ink bg-ink text-ivory" : state === "done" ? "border-brass bg-brass text-ivory" : "border-line text-muted"
                  }`}
                >
                  {state === "done" ? <CheckCircle2 aria-hidden="true" className="size-4" /> : i + 1}
                </span>
                <span className={`hidden truncate text-[0.72rem] font-semibold uppercase tracking-[0.12em] sm:block ${state === "todo" ? "text-muted" : ""}`}>
                  {s.title}
                </span>
                <span className="sr-only">
                  {` Step ${i + 1} of ${STEPS.length}: ${s.title}${state === "done" ? " (completed)" : ""}`}
                </span>
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-0 bottom-0 h-0.5 origin-left bg-gohar transition-transform duration-500 ${i <= step ? "scale-x-100" : "scale-x-0"}`}
                />
              </button>
            </li>
          );
        })}
      </ol>

      <form onSubmit={onSubmit} onFocusCapture={() => void loadValidation()} noValidate className="p-6 sm:p-10" aria-busy={status.kind === "submitting"}>
        <h2 data-step-heading tabIndex={-1} className="text-[1.9rem] leading-tight outline-none sm:text-[2.2rem]">
          <span className="eyebrow mb-2 block font-sans text-gohar-deep">
            Step {step + 1} of {STEPS.length}
          </span>
          {step === 0 ? "Choose your visit" : step === 1 ? "How can we reach you?" : "Review your request"}
        </h2>

        {status.kind === "error" ? (
          <div role="alert" className="mt-6 flex gap-3 border-l-2 border-danger bg-danger/5 p-4 text-[0.92rem]">
            <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-danger" />
            <p>{status.message}</p>
          </div>
        ) : null}

        {/* STEP 1 */}
        {step === 0 ? (
          <div className="mt-8 space-y-10">
            <fieldset className="min-w-0" aria-describedby={describedBy("project")}>
              <legend className="field-label">
                Project <span aria-hidden="true" className="text-brass-deep">*</span>
              </legend>
              {fromStory && suggested.length ? (
                <p className="mb-3 text-[0.85rem] text-muted">
                  Mentioned in <span className="italic">{fromStory!.title}</span>: listed first.
                </p>
              ) : null}
              <div className="grid max-h-[26rem] grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2" data-field="project" tabIndex={-1} data-lenis-prevent="">
                {ordered.map((p) => {
                  const active = values.project === p.slug;
                  return (
                    <label
                      key={p.slug}
                      className={`group flex min-w-0 cursor-pointer items-center gap-3 rounded-xl border p-2 pr-3 transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brass ${
                        active ? "border-ink bg-ink text-ivory" : "border-line bg-paper hover:border-ink"
                      }`}
                    >
                      <input
                        type="radio"
                        name="project"
                        value={p.slug}
                        checked={active}
                        onChange={() => set("project", p.slug)}
                        className="sr-only"
                      />
                      <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-ink-3">
                        <Image quality={85} src={p.image.src} alt="" fill sizes="56px" className="object-cover" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-display text-[1.1rem] leading-tight">{p.name}</span>
                        <span className={`block text-[0.75rem] ${active ? "text-stone" : "text-muted"}`}>
                          {p.area === p.city ? p.city : `${p.area}, ${p.city}`}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
              {err("project")}
            </fieldset>

            <fieldset className="min-w-0" aria-describedby={describedBy("date", id("date-hint"))}>
              <legend className="field-label">
                Preferred date <span aria-hidden="true" className="text-brass-deep">*</span>
              </legend>
              <p id={id("date-hint")} className="mb-3 text-[0.85rem] text-muted">
                Monday to Saturday (closed Sunday), up to {MAX_DAYS_AHEAD} days ahead. Dates and times are Pakistan time.
              </p>
              {now ? (
                // relative: keeps the chips' absolutely positioned sr-only text inside the scroll box
                <div className="relative flex gap-2 overflow-x-auto pb-2" data-field="date" tabIndex={-1}>
                  {dates.map((d) => {
                    const active = values.date === d;
                    const [wd, day, mon] = formatVisitDate(d, "short").replace(",", "").split(" ");
                    return (
                      <button
                        key={d}
                        type="button"
                        aria-pressed={active}
                        onClick={() => set("date", d)}
                        className={`${chip(active)} min-w-[4.6rem] shrink-0 items-center !text-center`}
                      >
                        <span className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] opacity-80">{d === todayPk ? "Today" : wd}</span>
                        <span className="font-display text-[1.7rem] leading-none">{day}</span>
                        <span className="text-[0.7rem] uppercase tracking-[0.12em] opacity-80">{mon}</span>
                        <span className="sr-only">{formatVisitDate(d)}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex gap-2" aria-hidden="true">
                  {Array.from({ length: 6 }, (_, i) => (
                    <span key={i} className="h-[5.4rem] w-[4.6rem] shrink-0 animate-pulse bg-ivory-2" />
                  ))}
                </div>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <label htmlFor={id("date-other")} className="text-[0.85rem] text-muted">
                  Or pick another date:
                </label>
                <input
                  id={id("date-other")}
                  type="date"
                  value={values.date}
                  min={todayPk || undefined}
                  max={todayPk ? addDays(todayPk, MAX_DAYS_AHEAD) : undefined}
                  onChange={(e) => set("date", e.target.value)}
                  aria-invalid={errors.date ? true : undefined}
                  aria-describedby={describedBy("date")}
                  className="field-control !w-auto !py-2"
                />
              </div>
              {values.date && !errors.date ? (
                <p className="mt-2 text-[0.9rem] font-medium">Selected: {formatVisitDate(values.date)}</p>
              ) : null}
              {err("date")}
            </fieldset>

            <fieldset className="min-w-0" aria-describedby={describedBy("timeSlot")}>
              <legend className="field-label">
                Preferred time <span aria-hidden="true" className="text-brass-deep">*</span>
              </legend>
              <p className="mb-3 text-[0.85rem] text-muted">A preference, not a booking: we confirm the exact time with you by phone.</p>
              <div className="grid grid-cols-2 gap-2 lg:grid-cols-4" data-field="timeSlot" tabIndex={-1}>
                {TIME_SLOTS.map((s) => {
                  const disabled = !openSlots.includes(s.value);
                  const active = values.timeSlot === s.value;
                  return (
                    <button
                      key={s.value}
                      type="button"
                      aria-pressed={active}
                      disabled={disabled}
                      onClick={() => set("timeSlot", s.value)}
                      className={chip(active, disabled)}
                    >
                      <span className="flex items-center gap-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.12em] opacity-80">
                        <Clock aria-hidden="true" className="size-3" />
                        {s.short}
                      </span>
                      <span className="mt-1 text-[0.95rem] font-medium">{s.label}</span>
                      {disabled ? <span className="sr-only">(no longer available today)</span> : null}
                    </button>
                  );
                })}
              </div>
              {err("timeSlot")}
            </fieldset>

            <div>
              <label htmlFor={id("visitors")} className="field-label">
                Number of visitors
              </label>
              <div className="flex w-fit items-center overflow-hidden rounded-full border border-line bg-paper">
                <button
                  type="button"
                  onClick={() => set("visitors", Math.max(1, values.visitors - 1))}
                  className="grid size-11 place-items-center hover:bg-ivory-2 disabled:opacity-40"
                  disabled={values.visitors <= 1}
                >
                  <Minus aria-hidden="true" className="size-4" />
                  <span className="sr-only">Fewer visitors</span>
                </button>
                <input
                  id={id("visitors")}
                  data-field="visitors"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={MAX_VISITORS}
                  value={values.visitors}
                  onChange={(e) => set("visitors", Math.min(MAX_VISITORS, Math.max(1, Number(e.target.value) || 1)))}
                  aria-invalid={errors.visitors ? true : undefined}
                  aria-describedby={describedBy("visitors")}
                  className="h-11 w-14 border-x border-line bg-transparent text-center font-medium [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  onClick={() => set("visitors", Math.min(MAX_VISITORS, values.visitors + 1))}
                  className="grid size-11 place-items-center hover:bg-ivory-2 disabled:opacity-40"
                  disabled={values.visitors >= MAX_VISITORS}
                >
                  <Plus aria-hidden="true" className="size-4" />
                  <span className="sr-only">More visitors</span>
                </button>
              </div>
              {err("visitors")}
            </div>
          </div>
        ) : null}

        {/* STEP 2 */}
        {step === 1 ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor={id("name")} className="field-label">
                Full name <span aria-hidden="true" className="text-brass-deep">*</span>
              </label>
              <input
                id={id("name")}
                data-field="name"
                type="text"
                autoComplete="name"
                value={values.name}
                onChange={(e) => set("name", e.target.value)}
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={describedBy("name")}
                className="field-control"
                maxLength={100}
                required
              />
              {err("name")}
            </div>
            <div>
              <label htmlFor={id("phone")} className="field-label">
                Phone <span aria-hidden="true" className="text-brass-deep">*</span>
              </label>
              <input
                id={id("phone")}
                data-field="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="0300 1234567"
                value={values.phone}
                onChange={(e) => set("phone", e.target.value)}
                aria-invalid={errors.phone ? true : undefined}
                aria-describedby={describedBy("phone")}
                className="field-control"
                maxLength={30}
                required
              />
              {err("phone")}
            </div>
            <div className="sm:col-span-2">
              <label htmlFor={id("email")} className="field-label">
                Email <span className="font-normal text-muted">(optional)</span>
              </label>
              <input
                id={id("email")}
                data-field="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={values.email}
                onChange={(e) => set("email", e.target.value)}
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={describedBy("email")}
                className="field-control"
                maxLength={254}
              />
              {err("email")}
            </div>
            <div className="sm:col-span-2">
              <label htmlFor={id("message")} className="field-label">
                Message or special requirements <span className="font-normal text-muted">(optional)</span>
              </label>
              <textarea
                id={id("message")}
                data-field="message"
                rows={4}
                value={values.message}
                onChange={(e) => set("message", e.target.value)}
                aria-invalid={errors.message ? true : undefined}
                aria-describedby={describedBy("message")}
                className="field-control resize-y"
                maxLength={1000}
                placeholder="For example: accessibility needs, the unit types you'd like to see, or a better time to call."
              />
              <div className="flex justify-between gap-4">
                {err("message") ?? <span />}
                <span className="mt-1.5 text-[0.75rem] tabular-nums text-muted">{values.message.length}/1000</span>
              </div>
            </div>
          </div>
        ) : null}

        {/* STEP 3 */}
        {step === 2 ? (
          <div className="mt-8">
            <dl className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
              {[
                { k: "Project", v: project?.name ?? "", s: 0 },
                { k: "Preferred date", v: values.date ? formatVisitDate(values.date) : "", s: 0 },
                { k: "Preferred time", v: values.timeSlot ? `${timeSlotLabel(values.timeSlot)} (PKT)` : "", s: 0 },
                { k: "Visitors", v: String(values.visitors), s: 0 },
                { k: "Name", v: values.name, s: 1 },
                { k: "Phone", v: values.phone, s: 1 },
                { k: "Email", v: values.email || "Not given", s: 1 },
                { k: "Message", v: values.message || "None", s: 1 },
              ].map((r) => (
                <div key={r.k} className="flex items-start justify-between gap-3 bg-paper px-5 py-4">
                  <div className="min-w-0">
                    <dt className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted">{r.k}</dt>
                    <dd className="mt-1 break-words font-medium">{r.v}</dd>
                  </div>
                  <button type="button" onClick={() => goTo(r.s)} className="shrink-0 text-[0.7rem] font-semibold uppercase tracking-wider text-brass-deep hover:text-ink">
                    Edit<span className="sr-only"> {r.k.toLowerCase()}</span>
                  </button>
                </div>
              ))}
            </dl>

            <p className="mt-6 flex gap-3 rounded-r-xl border-l-2 border-brass bg-ivory p-4 text-[0.9rem] leading-relaxed text-muted">
              <CalendarClock aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brass-deep" />
              This sends a <strong className="text-ink">visit request</strong>. Availability isn&rsquo;t checked online: our team
              will call you to confirm a date and time before your visit.
            </p>

            <div className="mt-6">
              <div className="flex items-start gap-3">
                <input
                  id={id("consent")}
                  data-field="consent"
                  type="checkbox"
                  checked={values.consent}
                  onChange={(e) => set("consent", e.target.checked)}
                  aria-invalid={errors.consent ? true : undefined}
                  aria-describedby={describedBy("consent")}
                  className="mt-1 size-4 shrink-0 accent-[var(--color-ink)]"
                  required
                />
                <label htmlFor={id("consent")} className="text-[0.88rem] leading-relaxed text-muted">
                  I agree that Gohar Group of Companies may contact me by phone, WhatsApp or email about this visit request and
                  store these details as described in the{" "}
                  <Link href="/privacy" className="font-medium text-ink underline underline-offset-2">
                    Privacy Policy
                  </Link>
                  . <span aria-hidden="true" className="text-brass-deep">*</span>
                </label>
              </div>
              {err("consent")}
            </div>
          </div>
        ) : null}

        {/* Honeypot */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor={id("website")}>Leave this field empty</label>
          <input id={id("website")} name="website" type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
        </div>

        <div className="mt-10 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          {step > 0 ? (
            <Button variant="text" onClick={back}>
              <ArrowLeft aria-hidden="true" className="size-4" /> Back
            </Button>
          ) : (
            <span className="text-[0.78rem] text-muted">
              <span aria-hidden="true" className="text-brass-deep">*</span> Required
            </span>
          )}
          {step < STEPS.length - 1 ? (
            <Button type="submit" size="lg" className="sm:min-w-52">
              Continue <ArrowRight aria-hidden="true" className="size-4" />
            </Button>
          ) : (
            <Button type="submit" size="lg" disabled={status.kind === "submitting"} className="sm:min-w-60">
              {status.kind === "submitting" ? (
                <>
                  <Loader2 aria-hidden="true" className="size-4 animate-spin" /> Sending…
                </>
              ) : (
                "Send visit request"
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

/** Static placeholder shown while the search parameters load. */
export function SiteVisitFormFallback() {
  return (
    <div aria-hidden="true" className="space-y-4 rounded-[1.5rem] border border-line bg-paper p-10">
      <div className="h-8 w-56 animate-pulse bg-ivory-2" />
      <div className="grid gap-2 sm:grid-cols-2">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-[4.5rem] animate-pulse bg-ivory-2" />
        ))}
      </div>
    </div>
  );
}
