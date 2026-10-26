// Imports extra images found in the official gohargoc.com media library (27 Oct 2026)
// from incoming-photos/_official into public/images/projects/<slug>/, resized with Lanczos
// to at most 2560 px on the long edge and encoded as high-quality JPEG.
// Usage: node scripts/import-extra-official.mjs
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "incoming-photos", "_official");
const OUT = path.join(ROOT, "public", "images", "projects");

/** [source file, project slug, output file, optional crop {top, bottom} as fractions] */
const JOBS = [
  ["residencia-01.png", "gohar-residencia-shopping-mall", "street-view.jpg"],
  ["residencia-02.png", "gohar-residencia-shopping-mall", "aerial.jpg"],
  ["gohar_gateway_44876.png", "gohar-gateway", "hotel-tower.jpg"],
  ["IMG_8015-scaled.jpeg", "kn-gohar-green-city", "photo-facade.jpg"],
  ["Masjid-cam_01-0-00-00-00-scaled.webp", "gohar-villas", "masjid.jpg"],
  ["comunity-centar-Cam_01-0-00-00-00-scaled.webp", "gohar-villas", "community-centre.jpg"],
  ["gohar-complex-hospital.jpg", "gohar-villas", "hospital.jpg"],
];

for (const [file, slug, out] of JOBS) {
  await mkdir(path.join(OUT, slug), { recursive: true });
  const dest = path.join(OUT, slug, out);
  const info = await sharp(path.join(SRC, file), { limitInputPixels: false })
    .resize({ width: 2560, height: 2560, fit: "inside", withoutEnlargement: true, kernel: sharp.kernel.lanczos3 })
    .sharpen({ sigma: 0.6, m1: 0.4, m2: 1.5 })
    .jpeg({ quality: 88, mozjpeg: true, chromaSubsampling: "4:4:4" })
    .toFile(dest);
  console.log(`${slug}/${out}: ${info.width}x${info.height} (${Math.round(info.size / 1024)} KB)`);
}
