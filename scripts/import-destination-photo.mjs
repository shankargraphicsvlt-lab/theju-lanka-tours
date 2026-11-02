// Converts a supplied image into public/images/destinations/{slug}/{name}.webp.
//
//   node scripts/import-destination-photo.mjs <slug> <input-file> [name]
//
// name defaults to "hero"; use gallery-1, gallery-2, gallery-3 for the strip.
// Images are resized to at most 1920px wide (never enlarged) and saved as WebP.
// Nothing is cropped. Record the source of every image in docs/media-credits.md.
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const [slug, input, name = "hero"] = process.argv.slice(2);
const NAMES = new Set(["hero", "gallery-1", "gallery-2", "gallery-3"]);

if (!slug || !input || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || !NAMES.has(name)) {
  console.error("Usage: node scripts/import-destination-photo.mjs <slug> <input-file> [hero|gallery-1|gallery-2|gallery-3]");
  process.exit(1);
}

const dir = path.join(process.cwd(), "public", "images", "destinations", slug);
await mkdir(dir, { recursive: true });
const out = path.join(dir, `${name}.webp`);
const info = await sharp(input)
  .rotate()
  .resize({ width: 1920, withoutEnlargement: true })
  .webp({ quality: 80, effort: 6 })
  .toFile(out);
console.log(`${path.relative(process.cwd(), out)}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`);
