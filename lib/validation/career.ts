import { z } from "zod";
import { vacancies } from "@/data/careers";
import { CITY_OPTIONS } from "./enquiry-options";
import { normalizePhone } from "./phone";

/** Careers expression-of-interest validation (browser + server). */

export const CV_MAX_BYTES = 4 * 1024 * 1024;
export const CV_EXTENSIONS = [".pdf", ".doc", ".docx"] as const;
export const CV_ACCEPT = ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export const careerSchema = z.object({
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
        ctx.addIssue({ code: "custom", message: "Please enter a valid phone number, for example 0300 1234567." });
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
  vacancyId: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine((v) => v === undefined || vacancies.some((j) => j.id === v), "Please choose a listed vacancy."),
  roleInterest: z
    .string()
    .trim()
    .max(120, "Please keep this under 120 characters.")
    .optional()
    .transform((v) => (v ? v : undefined)),
  profileUrl: z
    .string()
    .trim()
    .max(300)
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine((v) => v === undefined || /^https:\/\/[^\s]+$/i.test(v), "Please enter a full https:// link, or leave this empty."),
  message: z
    .string()
    .trim()
    .max(2000, "Please keep your note under 2,000 characters.")
    .optional()
    .transform((v) => (v ? v : undefined)),
  consent: z.literal(true, { error: "Please confirm that we may keep your details and CV for recruitment purposes." }),
});

export type CareerInput = z.input<typeof careerSchema>;
export type CareerData = z.output<typeof careerSchema>;

/** Client-side check of the chosen file (the server re-checks the content). */
export function cvProblem(file: { name: string; size: number } | null | undefined): string | null {
  if (!file) return "Please attach your CV (PDF or Word, up to 4 MB).";
  const lower = file.name.toLowerCase();
  if (!CV_EXTENSIONS.some((ext) => lower.endsWith(ext))) return "Please upload a PDF or Word document (.pdf, .doc or .docx).";
  if (file.size === 0) return "That file is empty.";
  if (file.size > CV_MAX_BYTES) return "Please upload a file smaller than 4 MB.";
  return null;
}

export function careerFieldErrors(error: z.ZodError): Partial<Record<string, string>> {
  const out: Partial<Record<string, string>> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
