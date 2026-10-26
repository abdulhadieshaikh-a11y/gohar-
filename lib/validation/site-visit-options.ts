/**
 * Site-visit options and date helpers. Plain data, no Zod, so the booking
 * form can import it without pulling the validation library into the
 * initial page JavaScript.
 *
 * Time windows sit inside the published office hours (Monday to Saturday,
 * 11:00 AM – 8:00 PM; closed Sunday). They are *preferences*: no availability
 * is checked or promised. Staff confirm the actual time by phone.
 */

export const VISIT_TIMEZONE = "Asia/Karachi";

export const TIME_SLOTS = [
  { value: "11-13", label: "11:00 AM – 1:00 PM", short: "Late morning", startHour: 11 },
  { value: "13-15", label: "1:00 PM – 3:00 PM", short: "Early afternoon", startHour: 13 },
  { value: "15-17", label: "3:00 PM – 5:00 PM", short: "Afternoon", startHour: 15 },
  { value: "17-19", label: "5:00 PM – 7:00 PM", short: "Evening", startHour: 17 },
] as const;

export type TimeSlot = (typeof TIME_SLOTS)[number]["value"];

/** How far ahead a visit can be requested. */
export const MAX_DAYS_AHEAD = 60;
export const MAX_VISITORS = 10;

export function timeSlotLabel(value: string): string {
  return TIME_SLOTS.find((s) => s.value === value)?.label ?? value;
}

/** Current date (YYYY-MM-DD) and hour in Pakistan time. */
export function pakistanNow(now: Date = new Date()): { date: string; hour: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: VISIT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return { date: `${get("year")}-${get("month")}-${get("day")}`, hour: Number(get("hour")) };
}

/** Adds days to a YYYY-MM-DD date (calendar arithmetic in UTC, no time-zone drift). */
export function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

/** 0 = Sunday … 6 = Saturday. */
export function weekday(isoDate: string): number {
  return new Date(`${isoDate}T00:00:00Z`).getUTCDay();
}

/** Time windows still open on a given date (all of them for future dates). */
export function availableSlots(isoDate: string, now: Date = new Date()): TimeSlot[] {
  const pk = pakistanNow(now);
  if (isoDate !== pk.date) return TIME_SLOTS.map((s) => s.value);
  return TIME_SLOTS.filter((s) => s.startHour > pk.hour).map((s) => s.value);
}

/** Why a date can't be requested, or null when it can. */
export function dateProblem(isoDate: string, now: Date = new Date()): string | null {
  if (!isValidIsoDate(isoDate)) return "Please choose a date.";
  const today = pakistanNow(now).date;
  if (isoDate < today) return "Please choose today or a future date.";
  if (isoDate > addDays(today, MAX_DAYS_AHEAD)) return `Please choose a date within the next ${MAX_DAYS_AHEAD} days.`;
  if (weekday(isoDate) === 0) return "Our office is closed on Sundays. Please choose Monday to Saturday.";
  if (availableSlots(isoDate, now).length === 0) return "Today's visiting hours have passed. Please choose another day.";
  return null;
}

/** Selectable dates for the picker: the next `count` open days (Mon–Sat) with at least one window left. */
export function upcomingVisitDates(count = 14, now: Date = new Date()): string[] {
  const out: string[] = [];
  let d = pakistanNow(now).date;
  for (let i = 0; i <= MAX_DAYS_AHEAD && out.length < count; i++) {
    if (dateProblem(d, now) === null) out.push(d);
    d = addDays(d, 1);
  }
  return out;
}

/** "Mon 27 Oct 2026" style label for a YYYY-MM-DD date. */
export function formatVisitDate(isoDate: string, style: "long" | "short" = "long"): string {
  const d = new Date(`${isoDate}T12:00:00Z`);
  return new Intl.DateTimeFormat("en-GB", {
    weekday: style === "long" ? "long" : "short",
    day: "numeric",
    month: style === "long" ? "long" : "short",
    year: style === "long" ? "numeric" : undefined,
    timeZone: "UTC",
  }).format(d);
}
