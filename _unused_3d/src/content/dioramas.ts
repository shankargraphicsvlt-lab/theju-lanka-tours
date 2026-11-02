/**
 * Diorama artwork lives in /public/dioramas/{key}.{webp,png,avif} with a
 * transparent background. Which files exist is resolved on the server at
 * build time (src/lib/dioramas.ts); this module is safe to import anywhere.
 */

export const dioramaKeys = [
  "hero",
  "sigiriya",
  "ella",
  "kandy",
  "galle",
  "yala",
  "nuwara-eliya",
  "anuradhapura",
  "polonnaruwa",
  "negombo",
  "south-coast",
  "mirissa",
] as const;

export type DioramaKey = (typeof dioramaKeys)[number];

/** A resolved diorama: `src` is null when the file has not been supplied yet. */
export interface Diorama {
  key: DioramaKey;
  /** Shown on the placeholder and used for alt text. */
  label: string;
  src: string | null;
}

/** Optional ambient layers in /public/dioramas/fx/. */
export interface DioramaFx {
  clouds: string | null;
  birds: string | null;
}

export const placeDioramaKey: Record<string, DioramaKey> = {
  "sigiriya-and-dambulla": "sigiriya",
  kandy: "kandy",
  ella: "ella",
  galle: "galle",
  yala: "yala",
  "south-coast": "south-coast",
  "nuwara-eliya": "nuwara-eliya",
  anuradhapura: "anuradhapura",
  polonnaruwa: "polonnaruwa",
  negombo: "negombo",
  mirissa: "mirissa",
};

/** Each sample tour is pictured by the diorama of its signature stop. */
export const tourDioramaKey: Record<string, DioramaKey> = {
  "cultural-triangle-and-kandy": "sigiriya",
  "hill-country-rail-and-southern-shores": "ella",
  "classic-sri-lanka": "kandy",
  "ancient-kingdoms-and-wild-places": "anuradhapura",
  "grand-tour-of-sri-lanka": "yala",
};
