// Builds a labelled contact sheet (grid of thumbnails) of every image in a folder.
// Usage: node scripts/contact-sheet.mjs <folder> <out.jpg>
import { readdirSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const [dir, out] = process.argv.slice(2);
const files = readdirSync(dir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort();
const W = 420;
const H = 300;
const COLS = 4;
const rows = Math.ceil(files.length / COLS);
const tiles = [];
for (const [i, f] of files.entries()) {
  const img = await sharp(path.join(dir, f), { limitInputPixels: false }).resize(W, H - 30, { fit: "contain", background: "#222" }).toBuffer();
  const label = Buffer.from(
    `<svg width="${W}" height="30"><rect width="100%" height="100%" fill="#000"/><text x="6" y="20" font-family="Arial" font-size="14" fill="#fff">${i + 1}. ${f.slice(0, 48).replace(/&/g, "&amp;")}</text></svg>`,
  );
  tiles.push({ input: img, left: (i % COLS) * W, top: Math.floor(i / COLS) * H });
  tiles.push({ input: label, left: (i % COLS) * W, top: Math.floor(i / COLS) * H + H - 30 });
}
await sharp({ create: { width: W * COLS, height: H * rows, channels: 3, background: "#111" } }).composite(tiles).jpeg({ quality: 82 }).toFile(out);
console.log(`wrote ${out} (${files.length} images)`);
