import { z } from "zod";
import { projectSlugs } from "@/lib/projects";
import { normalizePhone } from "./phone";

/**
 * Enquiry validation, shared by the browser form (instant feedback) and the
 * API route (authoritative). The server never trusts client-side checks.
 */

import { CITY_OPTIONS, ENQUIRY_TYPES, NO_PROJECT, type EnquiryType } from "./enquiry-options";

export { CITY_OPTIONS, ENQUIRY_TYPES, NO_PROJECT, type EnquiryType };

const enquiryTypeValues = ENQUIRY_TYPES.map((t) => t.value) as [EnquiryType, ...EnquiryType[]];

export const enquirySchema = z.object({
  enquiryType: z.enum(enquiryTypeValues, { error: "Please choose an enquiry type." }),
  name: z
    .string({ error: "Please enter your name." })
    .trim()
    .min(2, "Please enter your full name.")
    .max(100, "Name must be 100 characters or fewer.")
    .regex(/^[^<>{}\[\]\\]+$/, "Name contains characters that are not allowed."),
  email: z
    .string({ error: "Please enter your email address." })
    .trim()
    .toLowerCase()
    .max(254, "Email address is too long.")
    .pipe(z.email("Please enter a valid email address, for example name@example.com.")),
  phone: z
    .string({ error: "Please enter your phone number." })
    .trim()
    .min(1, "Please enter your phone number.")
    .max(30, "Phone number is too long.")
    .transform((value, ctx) => {
      const normalized = normalizePhone(value);
      if (!normalized) {
        ctx.addIssue({
          code: "custom",
          message: "Please enter a valid phone number, for example 0300 1234567 or +44 20 7946 0000.",
        });
        return z.NEVER;
      }
      return normalized;
    }),
  city: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine((v) => v === undefined || (CITY_OPTIONS as readonly string[]).includes(v), "Please choose a city from the list."),
  project: z
    .string()
    .trim()
    .default(NO_PROJECT)
    .refine((v) => v === NO_PROJECT || projectSlugs.includes(v), "Please choose a project from the list."),
  message: z
    .string({ error: "Please enter a message." })
    .trim()
    .min(10, "Please write a little more (at least 10 characters) so our team can help.")
    .max(2000, "Message must be 2,000 characters or fewer."),
  consent: z.literal(true, { error: "Please confirm that we may use your details to respond to your enquiry." }),
});

/** Extra fields the API needs that are not user-facing. */
export const enquiryRequestSchema = enquirySchema.extend({
  submissionId: z.uuid("Invalid submission."),
  startedAt: z.number().int().positive(),
  sourcePath: z.string().max(200).optional(),
  /** Honeypot. Real visitors never see or fill it. */
  website: z.string().max(0).optional().default(""),
});

export type EnquiryInput = z.input<typeof enquirySchema>;
export type EnquiryData = z.output<typeof enquirySchema>;
export type EnquiryField = keyof EnquiryInput;

/** Maps Zod issues to { field: firstMessage }. */
export function fieldErrors(error: z.ZodError): Partial<Record<string, string>> {
  const out: Partial<Record<string, string>> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
