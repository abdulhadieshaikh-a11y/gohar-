/**
 * Downloads and optimises the additional official images used by the
 * project pages and Gohar Stories (Oct 2026 content migration).
 *
 *   node scripts/import-official-media.mjs [--force]
 *
 * Sources:
 *  - gohargoc.com WordPress media library (files the company published)
 *  - the official presentation books already stored in public/documents
 *    (floor-plan pages are cut from these PDFs; see docs/ASSET-MANIFEST.md)
 *
 * Output files are written next to the existing project images. Existing files
 * are skipped unless --force is given. Nothing is upscaled.
 */
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const force = process.argv.includes("--force");
const UPLOADS = "https://gohargoc.com/wp-content/uploads";
const MAX = 2000;

/** Remote originals: [output path under public/, source path under /wp-content/uploads] */
const remote = [
  ["images/projects/141-broadway-heights/rooftop-pool.jpg", "2026/08/Ani-Cam-9.jpg.jpeg"],
  ["images/projects/gohar-gateway/courtyard.jpg", "2026/07/Building_cam_01.jpg"],
  ["images/projects/gohar-gateway/aerial-courtyard.webp", "2026/06/Building_cam_03.webp"],
  ["images/projects/gohar-golf-vista/golf-course.webp", "2026/06/CAM2-0-00-00-00-1-scaled.webp"],
  ["images/projects/gohar-golf-vista/towers-aerial.webp", "2026/06/CAM10-0-00-00-00-scaled.webp"],
  ["images/projects/gohar-golf-vista/facade-detail.webp", "2026/06/CAM11-0-00-00-00-scaled.webp"],
  ["images/projects/gohar-golf-vista/balconies.webp", "2026/06/CAM13-0-00-00-00-scaled.webp"],
  ["images/projects/gohar-villas/gate-approach.webp", "2026/07/Gate-Cam_02-0-00-00-00-scaled.webp"],
  ["images/projects/gohar-villas/commercial-area.webp", "2026/07/Commercial_Area-0-00-00-00-scaled.webp"],
  ["images/projects/gohar-villas/masterplan-phase-1.webp", "2026/07/Masterplan-4-phase-1-0-00-00-00-scaled.webp"],
  ["images/projects/gohar-villas/masterplan-phase-2.webp", "2026/07/Masterplan-9-phase-2-0-00-00-00-scaled.webp"],
  ["images/projects/gohar-villas/masterplan-phase-3.webp", "2026/07/Masterplan-10-phase-30-00-00-00-scaled.webp"],
  ["images/projects/kn-gohar-green-city/photo-street.jpg", "2026/07/IMG_3747-scaled.jpeg"],
  ["images/projects/kn-gohar-green-city/photo-club-house.jpg", "2026/07/IMG_3765-scaled.jpeg"],
  ["images/projects/kn-gohar-green-city/photo-garden-walk.jpg", "2026/07/IMG_3776-scaled.jpeg"],
  ["images/projects/kn-gohar-green-city/photo-lawn.jpg", "2026/07/IMG_3785-scaled.jpeg"],
  ["images/stories/meezan-bank-mou.jpg", "2026/07/WhatsApp-Image-2026-07-18-at-16.29.36.jpeg"],
  ["images/stories/green-hotel-reit-signing.jpg", "2026/07/A-Landmark-Moment-for-HyderabadWe-are-proud-to-announce-the-signing-ceremony-of-Pakistans-Firs-01.jpg"],
];

/**
 * Crops from the official PDFs. `image` is the n-th embedded JPEG (1-based)
 * of at least `min` bytes; `crop` is a fraction of the page (x, y, w, h).
 */
const fromPdf = [
  { pdf: "gohar-green-corner-shopping-center-presentation-book.pdf", min: 150000, items: [
    { image: 1, crop: [0.5, 0, 0.5, 1], out: "images/projects/gohar-green-corner-shopping-center/brochure-exterior.jpg" },
    { image: 3, crop: [0.5, 0, 0.5, 1], out: "images/projects/gohar-green-corner-shopping-center/street-view.jpg" },
    { image: 2, crop: [0, 0, 0.5, 1], out: "images/projects/gohar-green-corner-shopping-center/plan-basement.jpg" },
    { image: 3, crop: [0, 0, 0.5, 1], out: "images/projects/gohar-green-corner-shopping-center/plan-lower-ground.jpg" },
    { image: 4, crop: [0, 0, 0.5, 1], out: "images/projects/gohar-green-corner-shopping-center/plan-upper-ground.jpg" },
    { image: 5, crop: [0, 0, 0.5, 1], out: "images/projects/gohar-green-corner-shopping-center/plan-1st-4th.jpg" },
    { image: 6, crop: [0, 0, 0.5, 1], out: "images/projects/gohar-green-corner-shopping-center/plan-2nd-3rd-5th.jpg" },
  ] },
  { pdf: "141-broadway-heights-presentation-book.pdf", min: 100000, items: [
    { image: 3, crop: [0, 0, 1, 1], out: "images/projects/141-broadway-heights/plan-basement.jpg" },
    { image: 9, crop: [0, 0, 1, 1], out: "images/projects/141-broadway-heights/plan-typical-residential.jpg" },
    { image: 15, crop: [0, 0, 1, 1], out: "images/projects/141-broadway-heights/plan-roof.jpg" },
  ] },
  { pdf: "kn-gohar-green-city-presentation.pdf", min: 100000, items: [
    { image: 3, crop: [0, 0, 1, 1], out: "images/projects/kn-gohar-green-city/master-layout-plan.jpg" },
  ] },
];

function pdfJpegs(file, min) {
  const buf = readFileSync(file);
  const s = buf.toString("latin1");
  const found = [];
  let pos = 0;
  while ((pos = s.indexOf("/DCTDecode", pos)) !== -1) {
    const dictStart = s.lastIndexOf("<<", pos);
    const streamIdx = s.indexOf("stream", pos);
    if (streamIdx === -1) break;
    let start = streamIdx + 6;
    if (s[start] === "\r") start++;
    if (s[start] === "\n") start++;
    const len = /\/Length\s+(\d+)(\s+\d+\s+R)?/.exec(s.slice(dictStart, streamIdx));
    const end = len && !len[2] ? start + Number(len[1]) : s.indexOf("endstream", start);
    const data = buf.subarray(start, end);
    if (data.length >= min && data[0] === 0xff && data[1] === 0xd8) found.push(data);
    pos = streamIdx;
  }
  return found;
}

async function save(input, out, crop) {
  const dest = path.join(root, "public", out);
  mkdirSync(path.dirname(dest), { recursive: true });
  let img = sharp(input).rotate();
  if (crop) {
    const meta = await sharp(input).metadata();
    const [x, y, w, h] = crop;
    img = img.extract({
      left: Math.round(meta.width * x),
      top: Math.round(meta.height * y),
      width: Math.round(meta.width * w),
      height: Math.round(meta.height * h),
    });
  }
  img = img.resize({ width: MAX, height: MAX, fit: "inside", withoutEnlargement: true });
  img = out.endsWith(".webp") ? img.webp({ quality: 80 }) : img.jpeg({ quality: 80, mozjpeg: true });
  const info = await img.toFile(dest);
  console.log(`${out}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`);
}

for (const [out, src] of remote) {
  if (!force && existsSync(path.join(root, "public", out))) continue;
  const res = await fetch(`${UPLOADS}/${src}`, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) {
    console.error(`FAILED ${src}: HTTP ${res.status}`);
    process.exitCode = 1;
    continue;
  }
  await save(Buffer.from(await res.arrayBuffer()), out);
}

for (const { pdf, min, items } of fromPdf) {
  const todo = items.filter((i) => force || !existsSync(path.join(root, "public", i.out)));
  if (!todo.length) continue;
  const images = pdfJpegs(path.join(root, "public/documents", pdf), min);
  for (const item of todo) {
    const data = images[item.image - 1];
    if (!data) {
      console.error(`FAILED ${pdf} image ${item.image}: not found`);
      process.exitCode = 1;
      continue;
    }
    await save(data, item.out, item.crop);
  }
}
