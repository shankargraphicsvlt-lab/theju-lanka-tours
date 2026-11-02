import type { Tour } from "@/content/types";
import { pluralize } from "@/lib/format";

export function tourHref(tour: Pick<Tour, "slug">): string {
  return `/tours/${encodeURIComponent(tour.slug)}`;
}

/**
 * Hotel nights are counted from the itinerary's overnight stops rather than
 * assumed, so a tour that ends with a night flight or a day trip is described
 * accurately. Package duration is always `durationDays`.
 */
export function hotelNights(tour: Pick<Tour, "itinerary">): number {
  return tour.itinerary.filter((d) => d.overnight !== null).length;
}

export function packageLabel(tour: Pick<Tour, "durationDays" | "itinerary">): string {
  return `${tour.durationDays}-day package · ${pluralize(hotelNights(tour), "hotel night")}`;
}
