import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Place } from "@/content/types";
import { placePhoto } from "@/lib/destination-photos";
import { cn } from "@/lib/cn";
import { BookmarkButton } from "@/components/ui/BookmarkButton";
import { PhotoFrame } from "@/components/ui/PhotoFrame";

/** A destination on a cream card: full-bleed photo, region, name, tagline, bookmark and arrow. */
export function PlaceCard({
  place,
  size = "md",
  headingLevel = "h3",
  className,
}: {
  place: Pick<Place, "slug" | "name" | "region" | "tagline">;
  size?: "md" | "lg";
  headingLevel?: "h2" | "h3";
  className?: string;
}) {
  const Heading = headingLevel;
  return (
    <article className={cn("group card relative flex h-full flex-col p-3 sm:p-4", className)}>
      <div className="relative flex-1">
        <PhotoFrame
          src={placePhoto(place.slug)}
          name={place.name}
          decorative
          sizes={size === "lg" ? "(min-width: 1024px) 60vw, 100vw" : "(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"}
          className={cn("size-full", size === "lg" ? "aspect-[4/3] lg:aspect-auto lg:min-h-[24rem]" : "aspect-[4/3]")}
        />
        <div className="absolute top-2.5 right-2.5 z-20">
          <BookmarkButton item={{ slug: place.slug, type: "place", title: place.name }} />
        </div>
      </div>
      <div className="flex items-start justify-between gap-3 px-1.5 pt-4 pb-1">
        <div className="min-w-0">
          <p className="label-caps text-accent-ink">{place.region}</p>
          <Heading className={cn("mt-1 leading-tight text-charcoal-900", size === "lg" ? "text-3xl" : "text-xl")}>
            <Link href={`/destinations/${place.slug}`} className="after:absolute after:inset-0 after:rounded-card">
              {place.name}
            </Link>
          </Heading>
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
