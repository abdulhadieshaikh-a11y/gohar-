// Enhances low-resolution source images so they stay crisp at the sizes the site shows them:
// high-quality Lanczos upscaling, gentle sharpening and a high-quality JPEG encode.
// Originals are copied to .website-manager/originals/ first (never overwritten twice).
// It cannot invent detail that was never photographed; for the best results, replace
// these files with the client's original high-resolution photographs.
//
// Usage: node scripts/enhance-images.mjs
import { copyFile, mkdir, access, rename } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const PUB = path.join(ROOT, "public", "images");
const BACKUP = path.join(ROOT, ".website-manager", "originals");

/** [file under public/images, target width] */
const TARGETS = [
  ["projects/gohar-complex-shopping-mall/exterior.jpg", 2400],
  ["projects/gohar-towers/exterior.jpg", 2560],
  ["projects/141-broadway-heights/plan-basement.jpg", 2110],
  ["projects/141-broadway-heights/plan-roof.jpg", 2110],
  ["projects/141-broadway-heights/plan-typical-residential.jpg", 2110],
  ["projects/kn-gohar-green-city/photo-club-house.jpg", 1920],
  ["projects/kn-gohar-green-city/photo-garden-walk.jpg", 1920],
  ["projects/kn-gohar-green-city/photo-lawn.jpg", 1920],
  ["projects/kn-gohar-green-city/photo-street.jpg", 1920],
  ["stories/green-hotel-reit-signing.jpg", 2340],
  ["stories/meezan-bank-mou.jpg", 2400],
];

const exists = (p) => access(p).then(() => true, () => false);

for (const [rel, width] of TARGETS) {
  const file = path.join(PUB, rel);
  const backup = path.join(BACKUP, rel);
  await mkdir(path.dirname(backup), { recursive: true });
  if (!(await exists(backup))) await copyFile(file, backup);
  const meta = await sharp(backup).metadata();
  if ((meta.width ?? 0) >= width) {
    console.log(`skip  ${rel} (already ${meta.width}px)`);
    continue;
  }
  const tmp = `${file}.tmp`;
  const info = await sharp(backup)
    .resize({ width, kernel: sharp.kernel.lanczos3 })
    .sharpen({ sigma: 0.9, m1: 0.6, m2: 2 })
    .jpeg({ quality: 90, mozjpeg: true, chromaSubsampling: "4:4:4" })
    .toFile(tmp);
  await rename(tmp, file);
  console.log(`done  ${rel}: ${meta.width}x${meta.height} -> ${info.width}x${info.height}`);
}
