import "server-only";
import { existsSync } from "node:fs";
import path from "node:path";
import { overnightPhotoKey, placePhotoKey, tourPhotoKey, type DestinationPhotos } from "@/content/destination-photos";

const PUBLIC_DIR = path.join(process.cwd(), "public");

const cache = new Map<string, boolean>();
/** Public URL if the file exists, else null. Checked once per build. */
function publicFile(rel: string): string | null {
  if (!cache.has(rel)) cache.set(rel, existsSync(path.join(PUBLIC_DIR, rel)));
  return cache.get(rel) ? `/${rel}` : null;
}

/** Public URL of a photo folder's hero.webp, or null when the file is missing. */
export function heroFor(key: string): string | null {
  return publicFile(`images/destinations/${key}/hero.webp`);
}

/** Hero and gallery for a destination page. Gallery labels come from the highlights, in order. */
export function photosForPlace(slug: string, highlightTitles: string[]): DestinationPhotos {
  const key = placePhotoKey[slug] ?? slug;
  const gallery = [1, 2, 3].flatMap((n) => {
    const src = publicFile(`images/destinations/${key}/gallery-${n}.webp`);
    return src ? [{ src, label: highlightTitles[n - 1] ?? "" }] : [];
  });
  return { hero: heroFor(key), gallery };
}

/** Hero photo for an itinerary day, by its overnight stop's place slug. */
export function heroForOvernight(overnight: string | null, placeSlug: string | undefined): string | null {
  if (overnight && overnightPhotoKey[overnight]) return heroFor(overnightPhotoKey[overnight]);
  return placeSlug ? heroFor(placePhotoKey[placeSlug] ?? placeSlug) : null;
}

/** Card photo for a place page, or null when its photo has not been supplied. */
export function placePhoto(slug: string): string | null {
  return heroFor(placePhotoKey[slug] ?? slug);
}

/** Card photo for a sample tour. */
export function tourPhoto(slug: string): string | null {
  const key = tourPhotoKey[slug];
  return key ? heroFor(key) : null;
}
