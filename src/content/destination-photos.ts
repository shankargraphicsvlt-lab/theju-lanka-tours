/**
 * Destination photographs live in /public/images/destinations/{key}/:
 * hero.webp, plus optional gallery-1.webp … gallery-3.webp (gallery-N should
 * picture the page's Nth highlight, whose title becomes its label). Which
 * files exist is resolved on the server at build time
 * (src/lib/destination-photos.ts); a place without a hero shows a "photo
 * coming soon" panel.
 */

/** Place slug → photo folder. Places not listed fall back to their slug. */
export const placePhotoKey: Record<string, string> = {
  "sigiriya-and-dambulla": "sigiriya",
  // The South Coast destination is pictured by its best-known bay.
  "south-coast": "mirissa",
};

/** Each sample tour is pictured by its signature stop. */
export const tourPhotoKey: Record<string, string> = {
  "cultural-triangle-and-kandy": "sigiriya",
  "hill-country-rail-and-southern-shores": "ella",
  "classic-sri-lanka": "kandy",
  "ancient-kingdoms-and-wild-places": "polonnaruwa",
  "grand-tour-of-sri-lanka": "yala",
};

/** Overnight stops whose photo differs from their place page (Mirissa nights belong to South Coast). */
export const overnightPhotoKey: Record<string, string> = {
  Mirissa: "mirissa",
};

export interface DestinationPhotos {
  /** Public URL of hero.webp, or null when not supplied yet. */
  hero: string | null;
  gallery: { src: string; label: string }[];
}
