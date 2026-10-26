/**
 * Identifies an uploaded CV by its content (magic bytes), not by the name or
 * the browser-supplied type, which are easy to fake.
 */
export type CvKind = { ext: ".pdf" | ".doc" | ".docx"; mime: string };

const PDF = [0x25, 0x50, 0x44, 0x46, 0x2d]; // %PDF-
const OLE = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]; // legacy .doc container
const ZIP = [0x50, 0x4b, 0x03, 0x04]; // .docx is a zip package

const startsWith = (bytes: Uint8Array, sig: number[]) => sig.every((b, i) => bytes[i] === b);

export function detectCv(bytes: Uint8Array, filename: string): CvKind | null {
  const lower = filename.toLowerCase();
  if (startsWith(bytes, PDF) && lower.endsWith(".pdf")) return { ext: ".pdf", mime: "application/pdf" };
  if (startsWith(bytes, OLE) && lower.endsWith(".doc")) return { ext: ".doc", mime: "application/msword" };
  if (startsWith(bytes, ZIP) && lower.endsWith(".docx")) {
    // A Word package contains a "word/" folder; check the first part of the archive.
    const head = new TextDecoder("latin1").decode(bytes.subarray(0, Math.min(bytes.length, 64 * 1024)));
    if (head.includes("word/") || head.includes("[Content_Types].xml")) {
      return { ext: ".docx", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" };
    }
  }
  return null;
}

/** Keeps a safe display filename: letters, digits, dot, dash, underscore, space. */
export function safeFilename(name: string, ext: string): string {
  const base = name
    .replace(/\.[^.]*$/, "")
    .normalize("NFKD")
    .replace(/[^\w\- ]+/g, "")
    .trim()
    .slice(0, 80);
  return `${base || "cv"}${ext}`;
}
