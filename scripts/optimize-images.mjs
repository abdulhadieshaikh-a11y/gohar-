// Resizes oversized source images in public/images so the repository stays lean.
// Images are never cropped or upscaled; aspect ratio is preserved.
// next/image still produces responsive AVIF/WebP variants at request time.
//
// Usage: node scripts/optimize-images.mjs [--dry]
import { readdir, stat, writeFile, rename } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const MAX_EDGE = 2560;
const ROOT = path.resolve(import.meta.dirname, "..", "public", "images");
const dry = process.argv.includes("--dry");

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (/\.(jpe?g|png|webp)$/i.test(entry.name)) yield full;
  }
}

for await (const file of walk(ROOT)) {
  const before = (await stat(file)).size;
  const meta = await sharp(file).metadata();
  const rel = path.relative(ROOT, file).replaceAll("\\", "/");
  const longest = Math.max(meta.width ?? 0, meta.height ?? 0);
  const needsResize = longest > MAX_EDGE;
  const needsRecompress = before > 900 * 1024 && !rel.startsWith("brand/");

  if (dry || (!needsResize && !needsRecompress)) {
    console.log(`keep ${rel} ${meta.width}x${meta.height} ${(before / 1024).toFixed(0)}KB`);
    continue;
  }

  let pipeline = sharp(file).rotate();
  if (needsResize) {
    pipeline = pipeline.resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true });
  }
  const ext = path.extname(file).toLowerCase();
  if (ext === ".webp") pipeline = pipeline.webp({ quality: 86 });
  else if (ext === ".png") pipeline = pipeline.png({ compressionLevel: 9 });
  else pipeline = pipeline.jpeg({ quality: 85, mozjpeg: true });

  const buffer = await pipeline.toBuffer();
  const out = await sharp(buffer).metadata();
  const tmp = `${file}.tmp`;
  await writeFile(tmp, buffer);
  await rename(tmp, file);
  console.log(
    `done ${rel} ${meta.width}x${meta.height} -> ${out.width}x${out.height} ` +
      `${(before / 1024).toFixed(0)}KB -> ${(buffer.length / 1024).toFixed(0)}KB`,
  );
}
