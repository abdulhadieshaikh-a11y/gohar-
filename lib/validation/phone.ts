/**
 * Normalises a telephone number to E.164 (+<country><number>).
 * Pakistani formats are understood without a country code:
 *   0300 1234567   → +923001234567  (mobile)
 *   021 34567890   → +922134567890  (landline)
 *   021 111 000 061 → +9221111000061 (UAN)
 * International numbers must start with + or 00.
 * Returns null when the input is not a plausible phone number.
 */
export function normalizePhone(input: string): string | null {
  let s = input.trim().replace(/[\s\-().\/]/g, "");
  if (!s) return null;

  if (s.startsWith("00")) s = `+${s.slice(2)}`;
  else if (/^0\d{9,11}$/.test(s)) s = `+92${s.slice(1)}`;
  else if (/^92\d{9,11}$/.test(s)) s = `+${s}`;
  else if (/^3\d{9}$/.test(s)) s = `+92${s}`;

  if (!/^\+[1-9]\d{7,14}$/.test(s)) return null;

  if (s.startsWith("+92")) {
    const national = s.slice(3);
    // Mobile: 3XXXXXXXXX (10 digits). Landline / UAN: 9 to 11 digits, not starting with 0.
    if (!/^[1-9]\d{8,10}$/.test(national)) return null;
    if (national.startsWith("3") && national.length !== 10) return null;
  }
  return s;
}

/** Formats an E.164 number for display. Pakistani numbers get conventional grouping. */
export function formatPhone(e164: string): string {
  const m = /^\+92(3\d{2})(\d{7})$/.exec(e164);
  if (m) return `+92 ${m[1]} ${m[2]}`;
  const l = /^\+92(\d{2})(\d+)$/.exec(e164);
  if (l) return `+92 ${l[1]} ${l[2]}`;
  return e164;
}
