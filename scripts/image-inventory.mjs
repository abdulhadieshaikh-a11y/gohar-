// Lists every project/story image with its pixel size, and flags images that are
// too small to look sharp at the size the site shows them.
// Usage: node scripts/image-inventory.mjs
import { readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..", "public", "images");

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (/\.(jpe?g|png|webp|avif)$/i.test(entry.name)) yield full;
  }
}

const rows = [];
for await (const file of walk(ROOT)) {
  const meta = await sharp(file).metadata();
  rows.push({ file: path.relative(ROOT, file).replaceAll("\\", "/"), w: meta.width ?? 0, h: meta.height ?? 0 });
}
rows.sort((a, b) => a.file.localeCompare(b.file));
for (const r of rows) {
  const flag = r.w < 1600 ? "  << low-res for full-width use" : "";
  console.log(`${String(r.w).padStart(5)} x ${String(r.h).padEnd(5)} ${r.file}${flag}`);
}
