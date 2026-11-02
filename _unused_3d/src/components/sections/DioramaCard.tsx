import { ArrowUpRight } from "lucide-react";
import type { Place } from "@/content/types";
import { dioramaForPlace } from "@/lib/dioramas";
import { cn } from "@/lib/cn";
import { DioramaArt } from "@/components/diorama/DioramaArt";
import { TiltCard } from "@/components/diorama/TiltCard";
import { TransitionLink } from "@/components/diorama/TransitionLink";
import { accentClasses, accentAt } from "@/components/ui/accents";
import { BookmarkButton } from "@/components/ui/BookmarkButton";

export const placeTransitionName = (slug: string) => `diorama-${slug}`;

/** A destination as a small diorama world on a cream card. */
export function DioramaCard({
  place,
  index = 0,
  size = "md",
  headingLevel = "h3",
  className,
}: {
  place: Pick<Place, "slug" | "name" | "region" | "tagline">;
  index?: number;
  size?: "md" | "lg";
  headingLevel?: "h2" | "h3";
  className?: string;
}) {
  const Heading = headingLevel;
  const accent = accentClasses[accentAt(index)];
  const href = `/destinations/${place.slug}`;
  return (
    <TiltCard className={cn("h-full", className)}>
      <article data-transition-card className="group card relative flex h-full flex-col p-3 sm:p-4">
        <div className={cn("relative flex flex-1 items-center rounded-[1.1rem] px-4 pt-3", accent.soft)}>
          <div className="absolute top-2.5 right-2.5 z-20">
            <BookmarkButton item={{ slug: place.slug, type: "place", title: place.name }} />
          </div>
          <DioramaArt
            diorama={dioramaForPlace(place.slug, place.name)}
            sizes={size === "lg" ? "(min-width: 1024px) 45vw, 100vw" : "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"}
            decorative
            className="transition-transform duration-500 group-hover:-translate-y-1.5"
          />
        </div>
        <div className="flex items-start justify-between gap-3 px-1.5 pt-4 pb-1">
          <div className="min-w-0">
            <p className={cn("label-caps", accent.text)}>{place.region}</p>
            <Heading className={cn("mt-1 leading-tight text-charcoal-900", size === "lg" ? "text-3xl" : "text-xl")}>
              <TransitionLink
                href={href}
                transitionName={placeTransitionName(place.slug)}
                className="after:absolute after:inset-0 after:rounded-card"
              >
                {place.name}
              </TransitionLink>
            </Heading>
            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-charcoal-600">{place.tagline}</p>
          </div>
          <span
            aria-hidden
            className="grid size-9 shrink-0 place-items-center rounded-full bg-charcoal-900 text-cream transition-transform duration-300 group-hover:rotate-45"
          >
            <ArrowUpRight className="size-4" />
          </span>
        </div>
      </article>
    </TiltCard>
  );
}
