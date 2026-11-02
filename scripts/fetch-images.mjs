// Downloads the Unsplash photos listed in src/content/image-credits.json,
// strips metadata, caps dimensions and re-encodes them as progressive JPEGs.
// next/image then generates responsive AVIF/WebP variants at request time.
//
// Usage: npm run images:fetch            (skips files that already exist)
//        npm run images:fetch -- --force (re-downloads everything)
import { readFile, mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const outDir = path.join(root, "src", "assets", "images");
const force = process.argv.includes("--force");
const credits = JSON.parse(
  await readFile(path.join(root, "src", "content", "image-credits.json"), "utf8"),
);

await mkdir(outDir, { recursive: true });

let failures = 0;
for (const item of credits) {
  const target = path.join(outDir, item.file);
  if (!force) {
    try {
      await access(target);
      console.log(`skip  ${item.file}`);
      continue;
    } catch {
      // file missing, download it
    }
  }

  const url = `https://images.unsplash.com/${item.imageBase}?w=${item.width}&q=85&fm=jpg&fit=max`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const input = Buffer.from(await res.arrayBuffer());
    const output = await sharp(input)
      .rotate()
      .resize({ width: item.width, withoutEnlargement: true })
      .jpeg({ quality: 78, progressive: true, mozjpeg: true })
      .toBuffer();
    await writeFile(target, output);
    const meta = await sharp(output).metadata();
    console.log(
      `saved ${item.file} ${meta.width}x${meta.height} ${(output.length / 1024).toFixed(0)} KB`,
    );
  } catch (err) {
    failures++;
    console.error(`FAIL  ${item.file}: ${err instanceof Error ? err.message : err}`);
  }
}

if (failures > 0) {
  console.error(`${failures} image(s) failed to download.`);
  process.exit(1);
}
