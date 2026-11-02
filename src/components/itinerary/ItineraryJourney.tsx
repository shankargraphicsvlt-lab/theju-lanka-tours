"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Moon, Plane } from "lucide-react";
import { cn } from "@/lib/cn";
import { MapCard, type MapStop } from "@/components/ui/MapCard";
import { accentAt, accentClasses } from "@/components/ui/accents";

export interface JourneyDay {
  day: number;
  title: string;
  description: string;
  overnight: string | null;
  /** Hero photo of the day's destination; null shows a plain cream card. */
  photo: string | null;
  /** Where the day ends: the overnight stop, or the airport on departure day. */
  stop: MapStop;
}

/**
 * Day-by-day scroll journey. Each day is a card, alternating sides from `md`:
 * the destination's photo as background under a dark overlay, or a plain
 * cream card when there is no photo (departure day, or a photo still to come). A dashed route connects the
 * day pins and draws itself with scroll (ScrollTrigger); a sticky mini map
 * follows the current day. Reduced motion: the route is shown fully drawn and
 * nothing animates. Mobile: one column, no route line.
 */
export function ItineraryJourney({ days }: { days: JourneyDay[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<SVGPathElement>(null);
  const [path, setPath] = useState({ d: "", width: 0, height: 0 });
  const [active, setActive] = useState(0);
  const maskId = `route-mask-${useId().replace(/:/g, "")}`;

  // Route through the day pins, as smooth vertical S-curves.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const measure = () => {
      const box = root.getBoundingClientRect();
      const pins = Array.from(root.querySelectorAll<HTMLElement>("[data-pin]"));
      const points = pins
        .filter((pin) => pin.offsetParent !== null)
        .map((pin) => {
          const r = pin.getBoundingClientRect();
          return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top };
        });
      let d = "";
      points.forEach((p, i) => {
        if (i === 0) {
          d = `M${p.x.toFixed(1)},${p.y.toFixed(1)}`;
          return;
        }
        const prev = points[i - 1]!;
        const mid = (p.y - prev.y) / 2;
        d += ` C${prev.x.toFixed(1)},${(prev.y + mid).toFixed(1)} ${p.x.toFixed(1)},${(p.y - mid).toFixed(1)} ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      });
      setPath({ d, width: box.width, height: box.height });
    };
    // Fires once on observe, then on every size change (fonts, images, breakpoints).
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  // Draw the route with scroll.
  useEffect(() => {
    const root = rootRef.current;
    const mask = maskRef.current;
    if (!root || !mask || !path.d) return;
    const length = mask.getTotalLength();
    mask.style.strokeDasharray = `${length}`;
    mask.style.strokeDashoffset = "0";

    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        mask,
        { strokeDashoffset: length },
        {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: { trigger: root, start: "top 65%", end: "bottom 65%", scrub: 0.6 },
        },
      );
    });
    return () => mm.revert();
  }, [path.d]);

  // Current day for the progress map: the section crossing the middle of the viewport.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const sections = Array.from(root.querySelectorAll<HTMLElement>("[data-day-index]"));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.dayIndex));
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const current = days[active] ?? days[0];
  const stops = days.map((d) => d.stop);

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_15rem] xl:gap-10">
      {/* Compact progress pill below xl, where the side map doesn't fit. */}
      {current && (
        <div className="sticky top-3 z-20 xl:hidden" aria-hidden>
          <div className="mx-auto flex w-fit items-center gap-3 rounded-full bg-charcoal-900 py-2 pr-4 pl-2 text-cream shadow-float">
            <span className="grid size-8 place-items-center rounded-full bg-accent font-display text-sm font-extrabold text-charcoal-950">
              {current.day}
            </span>
            <span className="text-sm font-semibold">{current.stop.name}</span>
            <span className="h-1.5 w-16 overflow-hidden rounded-full bg-cream/20">
              <span
                className="block h-full rounded-full bg-accent transition-[width] duration-300"
                style={{ width: `${((active + 1) / days.length) * 100}%` }}
              />
            </span>
          </div>
        </div>
      )}

      <div ref={rootRef} className="relative">
        {path.d && (
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 hidden md:block"
            width={path.width}
            height={path.height}
            viewBox={`0 0 ${path.width} ${path.height}`}
          >
            <defs>
              <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width={path.width} height={path.height}>
                <path ref={maskRef} d={path.d} fill="none" stroke="white" strokeWidth={10} strokeLinecap="round" />
              </mask>
            </defs>
            <path d={path.d} fill="none" strokeWidth={3} strokeDasharray="1 9" strokeLinecap="round" className="stroke-secondary/25" />
            <path
              d={path.d}
              fill="none"
              strokeWidth={4}
              strokeDasharray="2 10"
              strokeLinecap="round"
              mask={`url(#${maskId})`}
              className="stroke-accent"
            />
          </svg>
        )}

        <ol className="relative space-y-6 md:space-y-10">
          {days.map((day, i) => {
            const flip = i % 2 === 1;
            const accent = accentClasses[accentAt(i)];
            const departure = day.overnight === null;
            const onPhoto = day.photo !== null;
            return (
              <li key={day.day} data-day-index={i} className="relative md:grid md:grid-cols-2 md:gap-14">
                <article
                  className={cn(
                    "relative isolate flex flex-col overflow-hidden rounded-card shadow-card",
                    flip && "md:col-start-2",
                    onPhoto ? "min-h-[20rem] justify-end text-cream sm:min-h-[22rem]" : "bg-cream",
                  )}
                >
                  {onPhoto ? (
                    <>
                      <Image
                        src={day.photo!}
                        alt=""
                        fill
                        sizes="(min-width: 1280px) 34vw, (min-width: 768px) 46vw, 92vw"
                        className="-z-20 object-cover"
                      />
                      {/* Dark from the bottom, where the text sits, so it stays legible on any photo. */}
                      <div
                        aria-hidden
                        className="absolute inset-0 -z-10 bg-linear-to-t from-charcoal-950/90 from-35% via-charcoal-950/55 via-65% to-charcoal-950/10"
                      />
                    </>
                  ) : null}

                  <span
                    className={cn(
                      "absolute top-4 left-4 inline-flex items-baseline gap-1 rounded-full px-3 py-1 font-display font-extrabold shadow-float",
                      onPhoto ? "bg-cream text-charcoal-900" : "bg-charcoal-900 text-cream",
                    )}
                  >
                    <span className="label-caps text-[0.6rem]">Day</span>
                    <span className="text-lg leading-none">{String(day.day).padStart(2, "0")}</span>
                  </span>

                  <div className={cn("p-5 sm:p-6", !onPhoto && "pt-16 sm:pt-16")}>
                    <p className={cn("label-caps", onPhoto ? "text-gold-300" : accent.text)}>
                      Day {day.day} of {days.length}
                    </p>
                    <h3 className={cn("mt-1 text-xl leading-snug sm:text-2xl", onPhoto ? "text-cream" : "text-primary")}>
                      {day.title}
                    </h3>
                    <p
                      className={cn(
                        "mt-2 text-sm leading-relaxed sm:text-[0.95rem]",
                        onPhoto ? "text-cream/90" : "text-charcoal-600",
                      )}
                    >
                      {day.description}
                    </p>
                    <p
                      className={cn(
                        "mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold",
                        onPhoto ? "bg-cream/15 text-cream ring-1 ring-cream/25 backdrop-blur-sm" : "bg-ivory-100 text-charcoal-800",
                      )}
                    >
                      {departure ? (
                        <>
                          <Plane aria-hidden className="size-3.5" /> Departure day
                        </>
                      ) : (
                        <>
                          <Moon aria-hidden className="size-3.5" /> Overnight: {day.overnight}
                        </>
                      )}
                    </p>
                  </div>
                </article>
                {/* Route pin on the card's inner edge, outside the clipped card. */}
                <span
                  data-pin
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute top-1/2 left-1/2 hidden size-5 -translate-y-1/2 rounded-full border-4 border-cream shadow-float transition-colors duration-300 md:block",
                    // Half the 3.5rem column gap: the pin sits on the card's inner edge.
                    flip ? "translate-x-[calc(1.75rem-50%)]" : "-translate-x-[calc(1.75rem+50%)]",
                    i <= active ? "bg-accent" : "bg-ivory-300",
                  )}
                />
              </li>
            );
          })}
        </ol>
      </div>

      <aside aria-label="Route progress" className="hidden xl:block">
        <div className="sticky top-8 space-y-3">
          <MapCard title="Your route" stops={stops} route activeIndex={active} caption="Illustrative map, not to scale" />
          {current && (
            <div className="card p-4">
              <p className="label-caps text-accent-ink">
                Day {current.day} of {days.length}
              </p>
              <p className="mt-1 font-display font-bold text-charcoal-900">{current.title}</p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
