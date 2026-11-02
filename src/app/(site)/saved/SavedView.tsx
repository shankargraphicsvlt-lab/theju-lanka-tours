"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Bookmark, CalendarDays, Moon, Trash2 } from "lucide-react";
import type { Place, Tour } from "@/content/types";
import { pluralize } from "@/lib/format";
import { calculateTourPrice } from "@/lib/pricing";
import { hotelNights, tourHref } from "@/lib/tours";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { accentAt, accentClasses } from "@/components/ui/accents";
import { PriceSummary } from "@/components/pricing/PriceBreakdown";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { itineraryWording } from "@/config/site";

export interface SavedRecord {
  slug: string;
  type: "tour" | "place";
  title: string;
}

function subscribe(callback: () => void) {
  window.addEventListener("theju-saved-updated", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("theju-saved-updated", callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): string {
  return localStorage.getItem("theju_saved_v1") ?? "[]";
}

function getServerSnapshot(): string {
  return "[]";
}

function removeSavedItem(slug: string, type: "tour" | "place") {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("theju_saved_v1");
    const items: SavedRecord[] = raw ? JSON.parse(raw) : [];
    const next = items.filter((i) => !(i.slug === slug && i.type === type));
    localStorage.setItem("theju_saved_v1", JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("theju-saved-updated", { detail: next }));
  } catch {
    // ignore
  }
}

export function SavedView({
  allTours,
  allPlaces,
  photos,
}: {
  allTours: Tour[];
  allPlaces: Place[];
  /** Card photos keyed "tour:slug" / "place:slug", resolved on the server. */
  photos: Record<string, string | null>;
}) {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  let saved: SavedRecord[] = [];
  try {
    saved = JSON.parse(raw) as SavedRecord[];
  } catch {
    saved = [];
  }

  const clearAll = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("theju_saved_v1");
    window.dispatchEvent(new CustomEvent("theju-saved-updated", { detail: [] }));
  };

  const savedTours = allTours.filter((t) => saved.some((s) => s.type === "tour" && s.slug === t.slug));
  const savedPlaces = allPlaces.filter((p) => saved.some((s) => s.type === "place" && s.slug === p.slug));

  const hasItems = savedTours.length > 0 || savedPlaces.length > 0;

  if (!hasItems) {
    return (
      <div className="mx-auto max-w-xl text-center py-12 px-4">
        <div className="card relative overflow-hidden p-8 sm:p-12">
          <div className="mx-auto mb-6 grid size-20 place-items-center rounded-3xl bg-forest-500/15 text-forest-700">
            <Bookmark aria-hidden className="size-10" />
          </div>
          <p className="label-caps text-accent-ink">Your shortlist is empty</p>
          <h2 className="mt-2 text-2xl text-primary sm:text-3xl">
            No saved journeys or places yet
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-charcoal-600 sm:text-base">
            While exploring Sri Lanka, click the bookmark icon on any suggested tour or destination card. They will stay
            saved here so you can easily include them when planning your private trip.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/tours" variant="dark">
              Explore suggested tours <ArrowRight aria-hidden className="size-4" />
            </ButtonLink>
            <ButtonLink href="/destinations" variant="outline">
              Browse destinations
            </ButtonLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      <div className="flex items-center justify-between border-b border-ivory-300 pb-4">
        <p className="text-sm text-charcoal-600">
          Showing <strong className="font-semibold text-charcoal-900">{saved.length}</strong> saved item
          {saved.length === 1 ? "" : "s"}
        </p>
        <button
          type="button"
          onClick={clearAll}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-500 hover:text-accent-ink transition-colors cursor-pointer"
        >
          <Trash2 aria-hidden className="size-3.5" /> Clear shortlist
        </button>
      </div>

      {savedTours.length > 0 && (
        <section aria-labelledby="saved-tours-title">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 id="saved-tours-title" className="text-2xl text-primary">
              Saved Tour Packages ({savedTours.length})
            </h2>
            <Link href="/tours" className="text-sm font-semibold text-forest-700 hover:underline">
              View all tours
            </Link>
          </div>
          <div className="space-y-6">
            {savedTours.map((tour, idx) => (
              <SavedTourCard key={tour.slug} tour={tour} index={idx} photo={photos[`tour:${tour.slug}`] ?? null} />
            ))}
          </div>
        </section>
      )}

      {savedPlaces.length > 0 && (
        <section aria-labelledby="saved-places-title">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 id="saved-places-title" className="text-2xl text-primary">
              Saved Destinations ({savedPlaces.length})
            </h2>
            <Link href="/destinations" className="text-sm font-semibold text-forest-700 hover:underline">
              View all destinations
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {savedPlaces.map((place) => (
              <SavedPlaceCard key={place.slug} place={place} photo={photos[`place:${place.slug}`] ?? null} />
            ))}
          </div>
        </section>
      )}

      {/* Action card */}
      <div className="card flex flex-col items-center justify-between gap-6 bg-forest-900 p-8 text-cream sm:flex-row sm:p-10">
        <div>
          <p className="label-caps text-gold-300">Ready to travel?</p>
          <h3 className="mt-2 text-2xl sm:text-3xl">
            Incorporate your shortlist into a custom journey
          </h3>
          <p className="mt-2 max-w-lg text-sm text-ivory-100/80">
            Tell us which saved places and tours you want in your itinerary, and we will prepare a complete private quote.
          </p>
        </div>
        <ButtonLink href="/plan-your-trip" size="lg" className="shrink-0">
          Plan your journey <ArrowRight aria-hidden className="size-4" />
        </ButtonLink>
      </div>
    </div>
  );
}

function SavedTourCard({ tour, index, photo }: { tour: Tour; index: number; photo: string | null }) {
  const accent = accentClasses[accentAt(index)];

  return (
      <article className="group relative">
        <div className="grid rounded-card bg-cream shadow-card md:ticket-perforated md:grid-cols-[minmax(0,30fr)_minmax(0,42fr)_minmax(0,28fr)] md:[--perf-x:72%]">
          <div className="relative m-3">
            <PhotoFrame src={photo} name={tour.title} sizes="(min-width: 768px) 28vw, 100vw" decorative className="size-full min-h-52" />
            <span className="absolute top-3 left-3 rounded-full bg-charcoal-900 px-3 py-1 text-xs font-semibold text-cream">
              {tour.durationDays}-day package
            </span>
            <button
              type="button"
              onClick={() => removeSavedItem(tour.slug, "tour")}
              aria-label={`Remove ${tour.title} from saved`}
              title="Remove from saved"
              className="absolute top-3 right-3 z-20 grid size-8 place-items-center rounded-full bg-accent text-text shadow-sm hover:opacity-90"
            >
              <Bookmark aria-hidden className="size-4 fill-current" />
            </button>
          </div>

          <div className="flex flex-col px-5 pb-5 md:py-7 md:pr-6 md:pl-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className={cn("label-caps", accent.text)}>{tour.style}</p>
            </div>
            <h3 className="mt-2 text-2xl leading-tight text-primary sm:text-[1.65rem]">
              <Link href={tourHref(tour)} className="after:absolute after:inset-0 after:rounded-card">
                {tour.title}
              </Link>
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-charcoal-600">{tour.summary}</p>
            {tour.isSample && <p className="mt-1.5 text-xs text-muted">{itineraryWording.label}</p>}
            <dl className="mt-4 grid gap-2 text-sm text-charcoal-700">
              <div className="flex gap-2.5">
                <dt className="sr-only">Package duration</dt>
                <CalendarDays aria-hidden className={cn("mt-0.5 size-4 shrink-0", accent.text)} />
                <dd>{tour.durationDays}-day package</dd>
              </div>
              <div className="flex gap-2.5">
                <dt className="sr-only">Hotel nights</dt>
                <Moon aria-hidden className={cn("mt-0.5 size-4 shrink-0", accent.text)} />
                <dd>{pluralize(hotelNights(tour), "hotel night")} in the {itineraryWording.route}</dd>
              </div>
            </dl>
          </div>

          <div className="flex flex-col justify-between gap-5 border-t-2 border-dashed border-ivory-300 p-5 md:border-t-0 md:border-l-2 md:py-7">
            <PriceSummary price={calculateTourPrice(tour.durationDays)} />
            <div className="relative z-10 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <ButtonLink href={tourHref(tour)} variant="dark" className="w-full px-4 sm:w-auto sm:flex-1">
                View tour
              </ButtonLink>
              <ButtonLink
                href={`/plan-your-trip?tour=${encodeURIComponent(tour.slug)}`}
                aria-label={`Book ${tour.title}: send an enquiry`}
                className="w-full px-4 sm:w-auto sm:flex-1"
              >
                Book <ArrowRight aria-hidden className="size-4" />
              </ButtonLink>
            </div>
          </div>
        </div>
      </article>
  );
}

function SavedPlaceCard({ place, photo }: { place: Place; photo: string | null }) {
  const href = `/destinations/${place.slug}`;

  return (
      <article className="group card relative flex h-full flex-col p-3 sm:p-4">
        <div className="relative flex-1">
          <PhotoFrame
            src={photo}
            name={place.name}
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
            decorative
            className="aspect-[4/3] size-full"
          />
          <button
            type="button"
            onClick={() => removeSavedItem(place.slug, "place")}
            aria-label={`Remove ${place.name} from saved`}
            title="Remove from saved"
            className="absolute top-2.5 right-2.5 z-20 grid size-8 place-items-center rounded-full bg-accent text-text shadow-sm hover:opacity-90"
          >
            <Bookmark aria-hidden className="size-4 fill-current" />
          </button>
        </div>
        <div className="flex items-start justify-between gap-3 px-1.5 pt-4 pb-1">
          <div className="min-w-0">
            <p className="label-caps text-accent-ink">{place.region}</p>
            <h3 className="mt-1 text-xl leading-tight text-primary">
              <Link href={href} className="after:absolute after:inset-0 after:rounded-card">
                {place.name}
              </Link>
            </h3>
            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-charcoal-600">{place.tagline}</p>
          </div>
          <span
            aria-hidden
            className="grid size-9 shrink-0 place-items-center rounded-full bg-teal-800 text-gold transition-transform duration-300 group-hover:rotate-45"
          >
            <ArrowUpRight className="size-4" />
          </span>
        </div>
      </article>
  );
}
