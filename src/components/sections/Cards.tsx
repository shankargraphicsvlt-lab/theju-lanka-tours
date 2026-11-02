import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Moon } from "lucide-react";
import { images } from "@/content/images";
import { getDestination } from "@/content/destinations";
import type { Destination, Experience, Tour } from "@/content/types";
import { pluralize } from "@/lib/format";
import { calculateTourPrice } from "@/lib/pricing";
import { hotelNights, tourHref } from "@/lib/tours";
import { tourPhoto } from "@/lib/destination-photos";
import { cn } from "@/lib/cn";
import { ButtonLink } from "@/components/ui/Button";
import { PriceSummary } from "@/components/pricing/PriceBreakdown";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { accentAt, accentClasses } from "@/components/ui/accents";
import { BookmarkButton } from "@/components/ui/BookmarkButton";
import { PlaceCard } from "./PlaceCard";
import { itineraryWording } from "@/config/site";

const imageHover = "transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]";

export function DestinationCard({ destination }: { destination: Destination }) {
  return <PlaceCard place={destination} />;
}

export function ExperienceCard({ experience, tone = "dark" }: { experience: Experience; tone?: "light" | "dark" }) {
  const img = images[experience.image];
  const dark = tone === "dark";
  return (
    <article className={cn("group relative flex h-full flex-col rounded-card p-3", dark ? "bg-forest-800" : "card")}>
      <div className="relative aspect-[4/3] overflow-hidden rounded-[1.1rem] bg-ivory-200">
        <Image
          src={img.src}
          alt={img.alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          placeholder="blur"
          className={cn("object-cover", imageHover)}
        />
      </div>
      <div className="flex flex-1 flex-col px-2 pt-4 pb-2">
        <p className={cn("label-caps", dark ? "text-gold-300" : "text-accent-ink")}>{experience.duration}</p>
        <h3 className={cn("mt-1.5 text-xl leading-tight", dark ? "text-cream" : "text-primary")}>
          <Link href={`/experiences/${experience.slug}`} className="after:absolute after:inset-0 after:rounded-card">
            {experience.title}
          </Link>
        </h3>
        <p className={cn("mt-2 text-sm leading-relaxed", dark ? "text-ivory-100/75" : "text-charcoal-600")}>
          {experience.summary}
        </p>
      </div>
    </article>
  );
}

/**
 * Tour package as a ticket: photo of its signature stop, journey details, and a
 * perforated price stub with "View tour" and "Book" actions. The title link
 * covers the card; the buttons sit above that overlay.
 */
export function TourCard({ tour, priority = false, index = 0 }: { tour: Tour; priority?: boolean; index?: number }) {
  const places = tour.destinations.map((s) => getDestination(s)?.name).filter(Boolean);
  const accent = accentClasses[accentAt(index)];
  return (
    <article className="group relative">
        <div className="grid rounded-card bg-cream shadow-card md:ticket-perforated md:grid-cols-[minmax(0,30fr)_minmax(0,42fr)_minmax(0,28fr)] md:[--perf-x:72%]">
          <div className="relative m-3">
            <PhotoFrame
              src={tourPhoto(tour.slug)}
              name={tour.title}
              sizes="(min-width: 768px) 28vw, 100vw"
              preload={priority}
              decorative
              className="size-full min-h-52"
            />
            <span className="absolute top-3 left-3 rounded-full bg-charcoal-900 px-3 py-1 text-xs font-semibold text-cream">
              {tour.durationDays}-day package
            </span>
            <div className="absolute top-3 right-3">
              <BookmarkButton item={{ slug: tour.slug, type: "tour", title: tour.title }} />
            </div>
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
              <div className="flex gap-2.5">
                <dt className="sr-only">Destinations</dt>
                <MapPin aria-hidden className={cn("mt-0.5 size-4 shrink-0", accent.text)} />
                <dd>{places.join(" · ")}</dd>
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
