import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export function AdminHeading({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-4xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-[0.92rem] text-muted">{description}</p> : null}
      </div>
      {actions}
    </div>
  );
}

export function Notice({ tone, children }: { tone: "success" | "error" | "info"; children: ReactNode }) {
  const styles = {
    success: "border-success bg-success/5",
    error: "border-danger bg-danger/5",
    info: "border-brass bg-ivory-2",
  }[tone];
  const Icon = tone === "error" ? AlertCircle : CheckCircle2;
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`mb-6 flex gap-2 border-l-2 p-3 text-[0.9rem] ${styles}`}>
      {tone !== "info" ? <Icon aria-hidden="true" className={`mt-0.5 size-4 shrink-0 ${tone === "error" ? "text-danger" : "text-success"}`} /> : null}
      <div>{children}</div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    new: "bg-brass-deep text-ivory",
    contacted: "bg-ivory-2 text-ink border border-stone",
    in_progress: "bg-ink text-ivory",
    closed: "bg-success/10 text-success",
    spam: "bg-danger/10 text-danger",
    sent: "bg-success/10 text-success",
    failed: "bg-danger/10 text-danger",
    skipped: "bg-ivory-2 text-muted border border-stone",
    pending: "bg-ivory-2 text-muted border border-stone",
    reviewed: "bg-ivory-2 text-ink border border-stone",
    shortlisted: "bg-success/10 text-success",
    archived: "bg-ivory-2 text-muted",
    confirmed: "bg-success/10 text-success",
    rescheduled: "bg-ink text-ivory",
    cancelled: "bg-danger/10 text-danger",
    completed: "bg-ivory-2 text-ink border border-stone",
  };
  return (
    <span className={`inline-block whitespace-nowrap px-2 py-0.5 text-[0.72rem] font-semibold uppercase tracking-wider ${map[status] ?? "bg-ivory-2"}`}>
      {status.replace("_", " ")}
    </span>
  );
}

export function AdminLoading() {
  return (
    <div aria-busy="true" className="space-y-4">
      <div className="h-10 w-64 animate-pulse bg-ivory-2" />
      <div className="h-64 animate-pulse bg-ivory-2" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function DatabaseUnavailable({ reason }: { reason: string }) {
  return (
    <Notice tone="error">
      <strong>The database is not available.</strong> {reason} See README → Database.
    </Notice>
  );
}

export const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  in_progress: "In progress",
  closed: "Closed",
  spam: "Spam",
};

export const SITE_VISIT_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  rescheduled: "Rescheduled",
  cancelled: "Cancelled",
  completed: "Completed",
};

export function formatDateTime(d: Date) {
  return d.toLocaleString("en-GB", {
    timeZone: "Asia/Karachi",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
