import { z } from "zod";
import { projectSlugs } from "@/lib/projects";
import { normalizePhone } from "./phone";
import { fieldErrors } from "./enquiry";
import { MAX_VISITORS, TIME_SLOTS, availableSlots, dateProblem, type TimeSlot } from "./site-visit-options";

export { fieldErrors };

const slotValues = TIME_SLOTS.map((s) => s.value) as [TimeSlot, ...TimeSlot[]];

/**
 * Site-visit request validation, shared by the booking form (instant feedback)
 * and the API route (authoritative). `now` is injectable for tests.
 */
export function siteVisitSchema(now: Date = new Date()) {
  return z
    .object({
      project: z
        .string({ error: "Please choose a project." })
        .trim()
        .refine((v) => projectSlugs.includes(v), "Please choose a project from the list."),
      date: z
        .string({ error: "Please choose a date." })
        .trim()
        .superRefine((v, ctx) => {
          const problem = dateProblem(v, now);
          if (problem) ctx.addIssue({ code: "custom", message: problem });
        }),
      timeSlot: z.enum(slotValues, { error: "Please choose a preferred time." }),
      visitors: z.coerce
        .number({ error: "Please enter the number of visitors." })
        .int("Please enter a whole number.")
        .min(1, "At least one visitor.")
        .max(MAX_VISITORS, `For groups larger than ${MAX_VISITORS}, please call us.`),
      name: z
        .string({ error: "Please enter your name." })
        .trim()
        .min(2, "Please enter your full name.")
        .max(100, "Name must be 100 characters or fewer.")
        .regex(/^[^<>{}\[\]\\]+$/, "Name contains characters that are not allowed."),
      phone: z
        .string({ error: "Please enter your phone number." })
        .trim()
        .min(1, "Please enter your phone number.")
        .max(30, "Phone number is too long.")
        .transform((value, ctx) => {
          const normalized = normalizePhone(value);
          if (!normalized) {
            ctx.addIssue({ code: "custom", message: "Please enter a valid phone number, for example 0300 1234567." });
            return z.NEVER;
          }
          return normalized;
        }),
      email: z
        .string()
        .trim()
        .toLowerCase()
        .max(254, "Email address is too long.")
        .optional()
        .transform((v) => (v ? v : undefined))
        .pipe(z.email("Please enter a valid email address, or leave it empty.").optional()),
      message: z
        .string()
        .trim()
        .max(1000, "Message must be 1,000 characters or fewer.")
        .optional()
        .transform((v) => (v ? v : undefined)),
      consent: z.literal(true, { error: "Please confirm that our team may contact you about this request." }),
    })
    .superRefine((v, ctx) => {
      // The chosen window must still be open on the chosen date (relevant for today).
      if (!dateProblem(v.date, now) && !availableSlots(v.date, now).includes(v.timeSlot)) {
        ctx.addIssue({ code: "custom", path: ["timeSlot"], message: "That time has already passed today. Please choose a later time." });
      }
    });
}

export function siteVisitRequestSchema(now: Date = new Date()) {
  return siteVisitSchema(now).safeExtend({
    submissionId: z.uuid("Invalid submission."),
    startedAt: z.number().int().positive(),
    sourcePath: z.string().max(200).optional(),
    /** Honeypot. Real visitors never see or fill it. */
    website: z.string().max(0).optional().default(""),
  });
}

export type SiteVisitInput = z.input<ReturnType<typeof siteVisitSchema>>;
export type SiteVisitData = z.output<ReturnType<typeof siteVisitSchema>>;
