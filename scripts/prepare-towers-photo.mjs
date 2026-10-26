// Prepares the client-supplied Gohar Towers picture (537 x 399 px with a grey caption bar):
// finds and removes the caption bar, then upscales with Lanczos + gentle sharpening.
// Usage: node scripts/prepare-towers-photo.mjs <source.jpg>
import { mkdir, copyFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const src = process.argv[2];
if (!src) throw new Error("Pass the source image path");
const ROOT = path.resolve(import.meta.dirname, "..");
const out = path.join(ROOT, "public", "images", "projects", "gohar-towers", "towers-sky.jpg");
const keep = path.join(ROOT, ".website-manager", "originals", "projects", "gohar-towers", "client-supplied-towers.jpg");
await mkdir(path.dirname(keep), { recursive: true });
await copyFile(src, keep);

const { data, info } = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true });
// The caption bar is a band of flat, unsaturated grey. Find the first row (from the bottom half) where
// most pixels are grey with almost no saturation.
const isGreyRow = (y) => {
  let grey = 0;
  for (let x = 0; x < info.width; x++) {
    const i = (y * info.width + x) * info.channels;
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (max - min < 14 && max > 90 && max < 215) grey++;
  }
  return grey / info.width > 0.55;
};
let cut = info.height;
for (let y = Math.floor(info.height * 0.6); y < info.height; y++) {
  if (isGreyRow(y) && isGreyRow(Math.min(info.height - 1, y + 2))) {
    cut = y;
    break;
  }
}
const height = Math.max(1, cut - 2);
const result = await sharp(src)
  .extract({ left: 0, top: 0, width: info.width, height })
  .resize({ width: 1600, kernel: sharp.kernel.lanczos3 })
  .sharpen({ sigma: 1.1, m1: 0.7, m2: 2.2 })
  .modulate({ saturation: 1.04 })
  .jpeg({ quality: 92, mozjpeg: true, chromaSubsampling: "4:4:4" })
  .toFile(out);
console.log(`caption bar starts at y=${cut}; saved ${path.relative(ROOT, out)} at ${result.width}x${result.height}`);
