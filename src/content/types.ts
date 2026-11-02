import type { StaticImageData } from "next/image";

export type ImageKey =
  | "sigiriyaAerial"
  | "sigiriyaRock"
  | "dambullaCave"
  | "kandyTemple"
  | "kandyPerahera"
  | "ellaTrain"
  | "ellaAerial"
  | "teaPlucking"
  | "galleLighthouse"
  | "galleClockTower"
  | "yalaLeopard"
  | "minneriyaElephants"
  | "safariElephant"
  | "mirissaBeach"
  | "mirissaShore";

export interface SiteImage {
  src: StaticImageData;
  alt: string;
  photographer: string;
  profile: string;
  unsplashUrl: string;
  location: string;
}

export type Interest =
  | "culture"
  | "wildlife"
  | "nature"
  | "beach"
  | "rail"
  | "wellness"
  | "food";

export type Region =
  | "Cultural Triangle"
  | "Hill Country"
  | "South Coast"
  | "Deep South";

export interface Destination {
  slug: string;
  name: string;
  region: Region;
  tagline: string;
  summary: string;
  /** Paragraphs of editorial copy. */
  description: string[];
  highlights: { title: string; text: string }[];
  bestTime: string;
  gettingThere: string;
  interests: Interest[];
  heroImage: ImageKey;
  gallery: ImageKey[];
  /** Approximate coordinates, used for the destination map. */
  coordinates: { lat: number; lng: number };
}

/**
 * A place on our sample routes that is not one of the six featured
 * destinations (so it is not part of the destination filters or the seed).
 * It has a page but no photographs of its own.
 */
export interface RoutePlace extends Omit<Destination, "region" | "heroImage" | "gallery"> {
  region: Region | "West Coast";
}

/** Anything that can be shown as a destination page. */
export type Place = (Destination & { featured: true }) | (RoutePlace & { featured: false; gallery: [] });

export interface Experience {
  slug: string;
  title: string;
  category: Interest;
  summary: string;
  description: string[];
  whatToExpect: string[];
  goodToKnow: string[];
  destinations: string[];
  duration: string;
  image: ImageKey;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  overnight: string | null;
}

export interface Tour {
  slug: string;
  title: string;
  summary: string;
  description: string[];
  durationDays: number;
  destinations: string[];
  interests: Interest[];
  style: string;
  /** Price is not stored: it is calculated from durationDays (see src/lib/pricing.ts). */
  itinerary: ItineraryDay[];
  included: string[];
  excluded: string[];
  pickup: string;
  image: ImageKey;
  isSample: boolean;
}

export interface Faq {
  question: string;
  answer: string;
}
