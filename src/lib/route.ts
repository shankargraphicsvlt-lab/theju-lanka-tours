import { airport, placeForOvernight } from "@/content/places";
import type { Tour } from "@/content/types";
import type { MapStop } from "@/components/ui/MapCard";

/** Overnight stops in order, consecutive nights merged, ending at the airport. */
export function routeStops(tour: Pick<Tour, "itinerary">): MapStop[] {
  const stops: MapStop[] = [];
  for (const day of tour.itinerary) {
    const place = placeForOvernight(day.overnight);
    const stop: MapStop = place ? { name: place.name, coordinates: place.coordinates } : airport;
    if (stops.at(-1)?.name !== stop.name) stops.push(stop);
  }
  return stops;
}
