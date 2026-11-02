import type { Destination, Interest, Region, Tour } from "@/content/types";
import { interestOptions } from "@/lib/validation/enquiry";

export type SearchParamsRecord = Record<string, string | string[] | undefined>;

const MAX_QUERY_LENGTH = 80;

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

/** Lower-cases and strips accents so "Sigiriya" matches "sigiríya". */
export function normalize(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

const interestValues = interestOptions.map((o) => o.value) as Interest[];
const isInterest = (v: string): v is Interest => (interestValues as string[]).includes(v);

/* ------------------------------------------------------------------ */
/* Destinations                                                        */
/* ------------------------------------------------------------------ */

export interface DestinationFilters {
  q: string;
  region: Region | "";
  interest: Interest | "";
}

export const regions: Region[] = ["Cultural Triangle", "Hill Country", "South Coast", "Deep South"];

/** Accepts only known values; anything else is ignored rather than echoed. */
export function parseDestinationFilters(params: SearchParamsRecord): DestinationFilters {
  const region = first(params.region);
  const interest = first(params.interest);
  return {
    q: first(params.q).trim().slice(0, MAX_QUERY_LENGTH),
    region: (regions as string[]).includes(region) ? (region as Region) : "",
    interest: isInterest(interest) ? interest : "",
  };
}

function destinationText(d: Destination): string {
  return normalize(
    [d.name, d.region, d.tagline, d.summary, ...d.description, ...d.highlights.flatMap((h) => [h.title, h.text])].join(" "),
  );
}

/** Every search word must appear somewhere in the destination's content. Editorial order is preserved. */
export function filterDestinations(list: Destination[], filters: DestinationFilters): Destination[] {
  const words = normalize(filters.q).split(/\s+/).filter(Boolean);
  return list.filter((d) => {
    if (filters.region && d.region !== filters.region) return false;
    if (filters.interest && !d.interests.includes(filters.interest)) return false;
    if (words.length === 0) return true;
    const text = destinationText(d);
    return words.every((w) => text.includes(w));
  });
}

/* ------------------------------------------------------------------ */
/* Tours                                                               */
/* ------------------------------------------------------------------ */

export const durationBuckets = [
  { value: "up-to-7", label: "Up to 7 days", min: 1, max: 7 },
  { value: "8-11", label: "8–11 days", min: 8, max: 11 },
  { value: "12-plus", label: "12 days or more", min: 12, max: Number.POSITIVE_INFINITY },
] as const;

export type DurationBucket = (typeof durationBuckets)[number]["value"];

export interface TourFilters {
  duration: DurationBucket | "";
  destination: string;
  experience: Interest | "";
}

export function parseTourFilters(params: SearchParamsRecord, destinationSlugs: string[]): TourFilters {
  const duration = first(params.duration);
  const destination = first(params.destination);
  const experience = first(params.experience);
  return {
    duration: durationBuckets.some((b) => b.value === duration) ? (duration as DurationBucket) : "",
    destination: destinationSlugs.includes(destination) ? destination : "",
    experience: isInterest(experience) ? experience : "",
  };
}

export function filterTours(list: Tour[], filters: TourFilters): Tour[] {
  const bucket = durationBuckets.find((b) => b.value === filters.duration);
  return list.filter((t) => {
    if (bucket && (t.durationDays < bucket.min || t.durationDays > bucket.max)) return false;
    if (filters.destination && !t.destinations.includes(filters.destination)) return false;
    if (filters.experience && !t.interests.includes(filters.experience)) return false;
    return true;
  });
}

export function hasActiveFilters(filters: object): boolean {
  return Object.values(filters).some((v) => v !== "");
}
