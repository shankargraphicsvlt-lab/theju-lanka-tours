import Image from "next/image";
import { ArrowRight, MapPin, type LucideIcon } from "lucide-react";
import type { Place } from "@/content/types";
import type { DestinationPhotos } from "@/content/destination-photos";
import { MAP_VIEWBOX, SRI_LANKA_PATH, project } from "@/lib/map";
import { serif } from "@/lib/fonts";
import { cn } from "@/lib/cn";
import { Breadcrumbs, type Crumb } from "@/components/sections/Breadcrumbs";
import { HeroBackdrop } from "./HeroBackdrop";

interface PhotoHeroProps {
  place: Place;
  photos: DestinationPhotos & { hero: string };
  crumbs: Crumb[];
  rows: { icon: LucideIcon; label: string; value: string }[];
  cta: { href: string; label: string };
}

/** Small Sri Lanka silhouette with a pin at the place's coordinates. */
function LocationMap({ place }: { place: Place }) {
  const pin = project(place.coordinates.lat, place.coordinates.lng);
  return (
    <figure className="w-24 rounded-2xl bg-cream/85 p-2.5 shadow-float backdrop-blur-sm sm:w-32 lg:w-36 lg:p-3">
      <svg
        viewBox={`-10 -10 ${MAP_VIEWBOX.width + 20} ${MAP_VIEWBOX.height + 20}`}
        className="mx-auto block h-auto w-full"
        role="img"
        aria-label={`Map of Sri Lanka showing the location of ${place.name}`}
      >
        <path d={SRI_LANKA_PATH} className="fill-forest-800/85 stroke-forest-900/40" strokeWidth={2} />
        <circle cx={pin.x} cy={pin.y} r={14} className="origin-center fill-accent/35 motion-safe:animate-pulse-ring [transform-box:fill-box]" />
        <circle cx={pin.x} cy={pin.y} r={9} strokeWidth={3.5} className="fill-accent stroke-cream" />
      </svg>
      <figcaption className="mt-1.5 truncate text-center text-[0.65rem] font-semibold text-forest-900">{place.name}</figcaption>
    </figure>
  );
}

/**
 * Photographic destination hero: full-bleed image, soft ivory gradient on the
 * left for legibility, serif title, info card and call to action. On small
 * screens the image becomes a top band that fades into the page, and the
 * text sits below it on ivory, so it is always readable.
 */
export function PhotoHero({ place, photos, crumbs, rows, cta }: PhotoHeroProps) {
  return (
    <section aria-labelledby="place-title" className={cn(serif.variable, "relative isolate overflow-hidden bg-ivory-50")}>
      <div className="absolute inset-x-0 top-0 -z-10 h-[56vh] min-h-80 sm:h-[62vh] lg:inset-0 lg:h-auto">
        <HeroBackdrop src={photos.hero} alt={place.name} />
        {/* Mobile: fade the photo into the page. Desktop: ivory wash on the left. */}
        <div aria-hidden className="absolute inset-0 bg-linear-to-b from-transparent from-45% to-ivory-50 lg:hidden" />
        <div
          aria-hidden
          className="absolute inset-0 hidden bg-linear-to-r from-ivory-50 from-20% via-ivory-50/80 via-45% to-ivory-50/0 to-75% lg:block"
        />
        <div aria-hidden className="absolute inset-x-0 bottom-0 hidden h-24 bg-linear-to-t from-ivory-50/70 to-transparent lg:block" />
      </div>

      <div className="container-page relative">
        <div className="absolute top-4 right-4 sm:right-6 lg:top-8 lg:right-10">
          <LocationMap place={place} />
        </div>

        <div className="pt-[44vh] pb-12 sm:pt-[50vh] lg:flex lg:min-h-[44rem] lg:max-w-[36rem] lg:flex-col lg:justify-center lg:py-20">
          <Breadcrumbs items={crumbs} className="mb-6" />
          <p className="label-caps inline-flex items-center gap-1.5 text-forest-800">
            <MapPin aria-hidden className="size-3.5 text-accent-ink" />
            Sri Lanka
          </p>
          <h1
            id="place-title"
            className="mt-3 font-serif text-[3.25rem] leading-[0.95] font-bold tracking-normal text-primary sm:text-7xl lg:text-[5.25rem]"
          >
            {place.name}
          </h1>
          <p className="mt-4 font-serif text-2xl leading-snug text-forest-800 italic sm:text-[1.75rem]">{place.tagline}</p>
          <p className="mt-4 max-w-md leading-relaxed text-charcoal-700">{place.summary}</p>

          <dl className="mt-7 max-w-md space-y-3 rounded-2xl bg-cream/90 p-5 shadow-card backdrop-blur-sm">
            {rows.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-forest-800/10">
                  <Icon aria-hidden className="size-4 text-forest-800" />
                </span>
                <div className="min-w-0">
                  <dt className="label-caps text-charcoal-500">{label}</dt>
                  <dd className="text-sm font-medium text-charcoal-900">{value}</dd>
                </div>
              </div>
            ))}
          </dl>

          <a
            href={cta.href}
            className="mt-7 inline-flex min-h-12 w-fit items-center gap-2 rounded-full bg-forest-800 px-7 font-display text-[0.95rem] font-bold text-cream shadow-float transition-colors hover:bg-forest-900"
          >
            {cta.label} <ArrowRight aria-hidden className="size-4" />
          </a>
        </div>

        {photos.gallery.length > 0 && (
          <ul
            aria-label={`${place.name} gallery`}
            className="-mx-6 flex gap-3 overflow-x-auto px-6 pb-10 lg:absolute lg:right-10 lg:bottom-10 lg:mx-0 lg:overflow-visible lg:p-0"
          >
            {photos.gallery.map((g) => (
              <li key={g.src} className="w-32 shrink-0 sm:w-36">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-float ring-2 ring-cream/80">
                  <Image src={g.src} alt={g.label ? `${g.label}, ${place.name}` : place.name} fill sizes="144px" className="object-cover" />
                </div>
                {g.label && (
                  <p className="mt-1.5 truncate rounded-full bg-cream/90 px-2.5 py-1 text-center text-xs font-semibold text-forest-900">
                    {g.label}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
