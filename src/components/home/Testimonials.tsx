"use client";

import Image from "next/image";
import { useRef } from "react";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import type { Testimonial } from "@/content/testimonials";
import { cn } from "@/lib/cn";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(-2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

/**
 * Horizontally scrolling testimonial cards: arrows move one card, and swipe or
 * trackpad scrolling snaps card by card. The scrollbar is hidden, and the
 * scroll padding keeps a snapped card's left edge in line with the heading.
 */
export function Testimonials({ items, labelledBy }: { items: Testimonial[]; labelledBy: string }) {
  const track = useRef<HTMLUListElement>(null);

  function scroll(dir: 1 | -1) {
    const el = track.current;
    const card = el?.querySelector("li");
    if (!el || !card) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * (card.getBoundingClientRect().width + 16), behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <div>
      <div className="flex justify-end gap-2">
        {[
          { dir: -1 as const, label: "Previous testimonials", Icon: ArrowLeft },
          { dir: 1 as const, label: "Next testimonials", Icon: ArrowRight },
        ].map(({ dir, label, Icon }) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            onClick={() => scroll(dir)}
            className="grid size-11 place-items-center rounded-full border border-ivory-300 bg-cream text-charcoal-800 transition-colors hover:bg-ivory-100"
          >
            <Icon aria-hidden className="size-4" />
          </button>
        ))}
      </div>
      <ul
        ref={track}
        aria-labelledby={labelledBy}
        className="-mx-6 mt-5 flex snap-x snap-mandatory scroll-px-6 gap-4 overflow-x-auto px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((t) => {
          const rating = Math.max(0, Math.min(5, Math.round(t.rating)));
          return (
            <li key={t.name} className="w-[85%] shrink-0 snap-start sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.7rem)]">
              <figure className="card flex h-full flex-col p-6">
                <p className="flex gap-0.5" role="img" aria-label={`Rated ${rating} out of 5`}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      aria-hidden
                      className={cn("size-4", i < rating ? "fill-gold-500 text-gold-500" : "text-ivory-300")}
                    />
                  ))}
                </p>
                <blockquote className="mt-4 flex-1 font-serif text-xl leading-snug text-charcoal-900">“{t.text}”</blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  {t.photo ? (
                    <Image src={t.photo} alt="" width={44} height={44} className="size-11 shrink-0 rounded-full object-cover" />
                  ) : (
                    <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-full bg-forest-700 text-sm font-semibold text-gold-300">
                      {initials(t.name)}
                    </span>
                  )}
                  <span>
                    <span className="block text-sm font-semibold text-charcoal-900">{t.name}</span>
                    <span className="block text-xs text-charcoal-600">{t.country}</span>
                  </span>
                </figcaption>
              </figure>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
