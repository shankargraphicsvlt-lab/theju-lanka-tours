import type { Metadata } from "next";
import { places } from "@/content/places";
import { tours } from "@/content/tours";
import { placePhoto, tourPhoto } from "@/lib/destination-photos";
import { Breadcrumbs } from "@/components/sections/Breadcrumbs";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SavedView } from "./SavedView";

export const metadata: Metadata = {
  title: "Saved Journeys & Destinations",
  description: "View your saved tour itineraries and favourite Sri Lanka destinations.",
  alternates: { canonical: "/saved" },
};

export default function SavedPage() {
  const photos: Record<string, string | null> = Object.fromEntries([
    ...tours.map((t) => [`tour:${t.slug}`, tourPhoto(t.slug)]),
    ...places.map((p) => [`place:${p.slug}`, placePhoto(p.slug)]),
  ]);
  return (
    <div className="container-page pt-4 pb-20 sm:pb-28">
      <Breadcrumbs items={[{ label: "Saved", href: "/saved" }]} />
      <div className="mt-6 mb-12">
        <SectionHeading
          as="h1"
          eyebrow="Your shortlist"
          title="Saved tours"
          intro="Keep track of the itineraries and destinations that catch your eye. Bookmark any tour or destination across the site to compare them here."
        />
      </div>
      <SavedView allTours={tours} allPlaces={places} photos={photos} />
    </div>
  );
}
