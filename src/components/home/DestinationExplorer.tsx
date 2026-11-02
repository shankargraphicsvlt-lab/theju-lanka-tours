"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import type { Destination, SiteImage } from "@/content/types";
import { cn } from "@/lib/cn";

interface ExplorerItem {
  destination: Destination;
  image: SiteImage;
}

/**
 * Illustrated island map beside the featured destinations: pick one from the
 * buttons to see its photo, summary and link.
 */
export function DestinationExplorer({ items }: { items: ExplorerItem[] }) {
  const [activeSlug, setActiveSlug] = useState(items[0]?.destination.slug ?? "");
  const active = items.find((i) => i.destination.slug === activeSlug) ?? items[0];
  if (!active) return null;

  return (
    <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
      <figure>
        <div className="relative mx-auto aspect-[1083/1000] w-full max-w-[28rem] overflow-hidden rounded-card shadow-card">
          <Image
            src="/images/island-map.webp"
            alt="Illustrated map of Sri Lanka marking Jaffna, Anuradhapura, Sigiriya, Dambulla, Polonnaruwa, Trincomalee, Kandy, Nuwara Eliya, Ella, Yala, Negombo, Colombo, Bentota, Galle Fort, Mirissa, Tangalle and Arugam Bay"
            fill
            sizes="(min-width: 1024px) 28rem, 90vw"
            className="object-cover"
          />
        </div>
        <figcaption className="mt-4 flex items-center justify-center gap-2 text-xs text-ivory-50/70">
          Illustrative map, not to scale.
        </figcaption>
      </figure>

      <div>
        <ul className="mb-8 flex flex-wrap gap-2" aria-label="Featured destinations">
          {items.map(({ destination }) => {
            const selected = destination.slug === active.destination.slug;
            return (
              <li key={destination.slug}>
                <button
                  type="button"
                  onClick={() => setActiveSlug(destination.slug)}
                  aria-pressed={selected}
                  className={cn(
                    "min-h-10 rounded-full border-2 px-4 text-sm font-semibold transition-colors",
                    selected
                      ? "border-gold bg-gold text-teal-900"
                      : "border-on-dark/30 text-on-dark hover:border-gold hover:text-white",
                  )}
                >
                  {destination.name}
                </button>
              </li>
            );
          })}
        </ul>

        <article key={active.destination.slug} aria-live="polite" className="animate-rise">
          <div className="relative aspect-[16/10] overflow-hidden rounded-card bg-charcoal-800">
            <Image
              src={active.image.src}
              alt={active.image.alt}
              fill
              sizes="(min-width: 1024px) 55vw, 100vw"
              placeholder="blur"
              className="object-cover"
            />
          </div>
          <p className="label-caps mt-6 text-gold">{active.destination.region}</p>
          <h3 className="mt-1 text-3xl text-ivory-50">{active.destination.name}</h3>
          <p className="mt-3 max-w-xl leading-relaxed text-on-dark">{active.destination.summary}</p>
          <Link
            href={`/destinations/${active.destination.slug}`}
            className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-gold underline-offset-4 hover:underline"
          >
            Discover {active.destination.name} <ArrowRight aria-hidden className="size-4" />
          </Link>
        </article>
      </div>
    </div>
  );
}
