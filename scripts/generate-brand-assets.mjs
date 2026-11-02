// Builds the favicon, app icons, Open Graph image and a cropped footer logo from
// the GSKT logo pack in public/brand/. The pack's own files are never changed.
//
// Usage: node scripts/generate-brand-assets.mjs
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const brand = (f) => path.join(root, "public", "brand", f);
const app = (f) => path.join(root, "src", "app", f);
const BACKGROUND = "#0F383D"; // --teal-800

// 1. Footer / share logo: the vertical logo with its empty margins cropped away.
//    The SVG viewBox is 2048×3072 and the matching PNG is 3000×4500, so the
//    artwork's bounding box is measured on the PNG and scaled back to SVG units.
const whitePng = brand("gskt-logo-white.png");
const { info: trimmed } = await sharp(whitePng).trim({ threshold: 1 }).toBuffer({ resolveWithObject: true });
const meta = await sharp(whitePng).metadata();
const scale = 2048 / meta.width;
const pad = 24; // a little breathing room, in SVG units
const box = {
  x: Math.round(-trimmed.trimOffsetLeft * scale) - pad,
  y: Math.round(-trimmed.trimOffsetTop * scale) - pad,
  w: Math.round(trimmed.width * scale) + 2 * pad,
  h: Math.round(trimmed.height * scale) + 2 * pad,
};
const whiteSvg = await readFile(brand("gskt-logo-white.svg"), "utf8");
const cropped = whiteSvg.replace(/viewBox="[^"]*"/, `viewBox="${box.x} ${box.y} ${box.w} ${box.h}"`);
await writeFile(brand("gskt-logo-white-cropped.svg"), cropped);
console.log(`gskt-logo-white-cropped.svg  viewBox ${box.x} ${box.y} ${box.w} ${box.h}`);

// 2. Open Graph / Twitter image: 1200×630, dark teal, logo centred at 70% of the height.
const logoHeight = Math.round(630 * 0.7);
const logo = await sharp(Buffer.from(cropped), { density: 300 }).resize({ height: logoHeight }).png().toBuffer();
const logoMeta = await sharp(logo).metadata();
const og = await sharp({ create: { width: 1200, height: 630, channels: 3, background: BACKGROUND } })
  .composite([{ input: logo, left: Math.round((1200 - logoMeta.width) / 2), top: Math.round((630 - logoMeta.height) / 2) }])
  .png()
  .toBuffer();
await writeFile(app("opengraph-image.png"), og);
await writeFile(app("twitter-image.png"), og);
console.log(`opengraph-image.png / twitter-image.png  1200x630, logo ${logoMeta.width}x${logoMeta.height}`);

// 3. Icons from the elephant on its dark background.
const iconSrc = brand("gskt-icon-dark.png");
const square = (size) => sharp(iconSrc).resize(size, size).ensureAlpha().png().toBuffer(); // ICO entries must be RGBA
await writeFile(app("icon.png"), await square(512));
await writeFile(app("apple-icon.png"), await square(180));
await mkdir(path.join(root, "public", "icons"), { recursive: true });
for (const size of [192, 512]) await writeFile(path.join(root, "public", "icons", `icon-${size}.png`), await square(size));

// favicon.ico holding 16, 32 and 48 px PNGs (the ICO container allows PNG entries).
const sizes = [16, 32, 48];
const pngs = await Promise.all(sizes.map(square));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((size, i) => {
  const e = 6 + 16 * i;
  header.writeUInt8(size, e); // width
  header.writeUInt8(size, e + 1); // height
  header.writeUInt8(0, e + 2); // palette
  header.writeUInt8(0, e + 3); // reserved
  header.writeUInt16LE(1, e + 4); // colour planes
  header.writeUInt16LE(32, e + 6); // bits per pixel
  header.writeUInt32LE(pngs[i].length, e + 8);
  header.writeUInt32LE(offset, e + 12);
  offset += pngs[i].length;
});
await writeFile(app("favicon.ico"), Buffer.concat([header, ...pngs]));
console.log("icon.png 512, apple-icon.png 180, public/icons/icon-192.png + icon-512.png, favicon.ico 16/32/48");
