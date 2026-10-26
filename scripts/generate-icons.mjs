// Builds app/icon.png and app/apple-icon.png from the official logo by
// cropping its red "A" letterform onto a charcoal tile. No new artwork is drawn.
// Usage: node scripts/generate-icons.mjs
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const logo = path.join(root, "public/images/brand/gohar-logo-light.png");

const { data, info } = await sharp(logo).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const isRed = (i) => data[i + 3] > 128 && data[i] > 150 && data[i + 1] < 90 && data[i + 2] < 90;

// The logo has a full-width red bar under the wordmark; find where it starts
// (first row that is mostly red) and only search above it.
let barTop = info.height;
for (let y = 0; y < info.height; y++) {
  let red = 0;
  for (let x = 0; x < info.width; x++) if (isRed((y * info.width + x) * 4)) red++;
  if (red > info.width * 0.5) {
    barTop = y;
    break;
  }
}

let minX = info.width, minY = barTop, maxX = 0, maxY = 0;
for (let y = 0; y < barTop - 2; y++) {
  for (let x = 0; x < info.width; x++) {
    if (isRed((y * info.width + x) * 4)) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}
const w = maxX - minX + 1;
const h = maxY - minY + 1;
console.log(`red letterform at ${minX},${minY} ${w}x${h} (bar starts at y=${barTop})`);

const letter = await sharp(logo).extract({ left: minX, top: minY, width: w, height: h }).png().toBuffer();

async function tile(size, file) {
  const inner = Math.round(size * 0.72);
  const glyph = await sharp(letter).resize({ width: inner, height: inner, fit: "inside" }).toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: "#1b1a17" } })
    .composite([{ input: glyph, gravity: "center" }])
    .png()
    .toFile(path.join(root, "app", file));
  console.log(`wrote app/${file}`);
}

await tile(512, "icon.png");
await tile(180, "apple-icon.png");

// favicon.ico for browsers that request it directly: an ICO container holding a 48px PNG.
const { writeFileSync, readFileSync } = await import("node:fs");
const tmp = path.join(root, "app", "icon.png");
const png = await sharp(readFileSync(tmp)).resize(48, 48).png().toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(1, 4); // one image
header.writeUInt8(48, 6); // width
header.writeUInt8(48, 7); // height
header.writeUInt8(0, 8); // palette
header.writeUInt8(0, 9); // reserved
header.writeUInt16LE(1, 10); // colour planes
header.writeUInt16LE(32, 12); // bits per pixel
header.writeUInt32LE(png.length, 14); // image size
header.writeUInt32LE(22, 18); // offset
writeFileSync(path.join(root, "app", "favicon.ico"), Buffer.concat([header, png]));
console.log("wrote app/favicon.ico");
