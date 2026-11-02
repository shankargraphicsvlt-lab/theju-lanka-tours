import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, CalendarDays, Compass, HeartHandshake, Leaf, Mail, Moon, Route } from "lucide-react";
import type { Tour } from "@/content/types";
import type { TourPriceBreakdown } from "@/lib/pricing";
import { formatMoney, pluralize } from "@/lib/format";
import { tourHref } from "@/lib/tours";
import { pricingConfig } from "@/config/pricing";
import { cn } from "@/lib/cn";
import { ButtonLink } from "@/components/ui/Button";
import { DemoNotice } from "@/components/ui/Badges";
import { NewsletterForm } from "./NewsletterForm";
import { itineraryWording } from "@/config/site";

/** Serif section heading with an eyebrow and an optional link on the right. */
export function HomeHeading({
  id,
  eyebrow,
  title,
  intro,
  action,
  tone = "light",
}: {
  id: string;
  eyebrow: string;
  title: string;
  intro?: string;
  action?: { href: string; label: string };
  tone?: "light" | "dark";
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p className={cn("label-caps", tone === "dark" ? "text-gold-300" : "text-accent-ink")}>{eyebrow}</p>
        <h2
          id={id}
          className={cn(
            "mt-2 font-serif text-4xl leading-[1.02] font-bold tracking-normal sm:text-5xl",
            tone === "dark" ? "text-cream" : "text-primary",
          )}
        >
          {title}
        </h2>
        {intro && <p className={cn("mt-3 leading-relaxed", tone === "dark" ? "text-cream/80" : "text-charcoal-600")}>{intro}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-forest-800 underline decoration-forest-800/30 underline-offset-4 hover:decoration-forest-800"
        >
          {action.label} <ArrowRight aria-hidden className="size-4" />
        </Link>
      )}
    </div>
  );
}

/** A short handwritten aside with a looping arrow. Decorative tone, real text. */
export function HandNote({ children, className, tone = "light" }: { children: React.ReactNode; className?: string; tone?: "light" | "dark" }) {
  return (
    <p className={cn("flex items-start gap-2 font-script text-3xl leading-none font-bold", tone === "dark" ? "text-gold-300" : "text-accent-ink", className)}>
      <svg aria-hidden viewBox="0 0 60 40" className="mt-1 h-7 w-10 shrink-0 -scale-x-100 fill-none stroke-current" strokeWidth={2.2} strokeLinecap="round">
        <path d="M4 34 C 14 6, 40 4, 52 18 C 58 26, 46 32, 40 22" />
        <path d="M4 34 l 2 -9 M4 34 l 8 -3" />
      </svg>
      <span className="-rotate-3">{children}</span>
    </p>
  );
}

function SampleNote({ children }: { children: React.ReactNode }) {
  return <DemoNotice className="mt-6">{children}</DemoNotice>;
}

/* 3. Places That Inspire */

export function PlacesInspire({ items }: { items: { slug: string; name: string; tags: string[]; src: string }[] }) {
  return (
    <section aria-labelledby="inspire-title" className="py-16 sm:py-24">
      <div className="container-page">
        <HomeHeading
          id="inspire-title"
          eyebrow="Destinations"
          title="Places That Inspire"
          action={{ href: "/destinations", label: "View all destinations" }}
        />
        <ul className="-mx-6 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0 [scrollbar-width:thin]">
          {items.map((p) => (
            <li key={p.slug} className="w-[68%] shrink-0 snap-start sm:w-[40%] lg:w-auto">
              <article className="group relative aspect-[3/4] overflow-hidden rounded-card bg-charcoal-900 shadow-card">
                <Image
                  src={p.src}
                  alt={p.name}
                  fill
                  sizes="(min-width: 1280px) 240px, (min-width: 1024px) 18vw, (min-width: 640px) 40vw, 68vw"
                  className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.05]"
                />
                <div aria-hidden className="absolute inset-0 bg-linear-to-t from-charcoal-950/85 via-charcoal-950/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-cream">
                  <div>
                    <h3 className="font-serif text-2xl leading-none font-bold">
                      <Link href={`/destinations/${p.slug}`} className="after:absolute after:inset-0">
                        {p.name}
                      </Link>
                    </h3>
                    <p className="mt-1.5 text-xs text-cream/80">{p.tags.join(" • ")}</p>
                  </div>
                  <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-cream text-charcoal-900 transition-transform group-hover:-rotate-45">
                    <ArrowRight className="size-4" />
                  </span>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* 4. More Than Just Trips */

const promises = [
  { icon: Route, title: "Planned around you", text: "Your dates, your pace and the places you care about." },
  { icon: Compass, title: "Private driver-guides", text: "One knowledgeable local companion for the whole journey." },
  { icon: Leaf, title: "Lighter footsteps", text: "Responsible wildlife viewing and locally run stays where we can." },
  { icon: HeartHandshake, title: "Honest quotations", text: "A written, itemised quote before anything is confirmed." },
];

export function WhyTravelWithUs() {
  return (
    <section id="services" aria-labelledby="why-title" className="pb-16 sm:pb-24">
      <div className="container-page grid gap-10 lg:grid-cols-[1fr_16rem] lg:items-center">
        <div>
          <HomeHeading id="why-title" eyebrow="Why travel with us" title="More Than Just Trips" />
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {promises.map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <span className="grid size-12 place-items-center rounded-full border-2 border-gold bg-teal-800 text-gold">
                  <Icon aria-hidden className="size-5" />
                </span>
                <h3 className="mt-4 text-xl text-primary">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-charcoal-600">{text}</p>
              </li>
            ))}
          </ul>
        </div>
        <HandNote className="lg:justify-self-end">Travel a kinder you</HandNote>
      </div>
    </section>
  );
}

/* 5. Curated Just for You */

/** Badge colours by label; anything not listed (e.g. "Short break") is blue. */
function badgeClasses(badge: string) {
  switch (badge.toLowerCase()) {
    case "best seller":
      return "bg-gold-gradient text-teal-900";
    case "popular":
      return "bg-green text-green-ink";
    case "new":
      return "bg-teal-800 text-gold";
    default:
      return "bg-blue text-blue-ink";
  }
}

export interface CuratedTour {
  tour: Tour;
  badge: string;
  src: string;
  nights: number;
  price: TourPriceBreakdown;
}

export function CuratedTours({ items }: { items: CuratedTour[] }) {
  return (
    <section aria-labelledby="curated-title" className="pb-16 sm:pb-24">
      <div className="container-page">
        <HomeHeading
          id="curated-title"
          eyebrow={itineraryWording.journeys}
          title="Curated Just for You"
          action={{ href: "/tours", label: "View all tours" }}
        />
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ tour, badge, src, nights, price }) => {
            const money = (cents: number) => formatMoney(cents, price.currency);
            return (
              <li key={tour.slug}>
                <article className="group card relative flex h-full flex-col p-3">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[1.1rem] bg-ivory-200">
                    <Image
                      src={src}
                      alt=""
                      fill
                      sizes="(min-width: 1280px) 290px, (min-width: 1024px) 22vw, (min-width: 640px) 45vw, calc(100vw - 48px)"
                      className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.05]"
                    />
                    <span className={cn("absolute top-3 left-3 rounded-full px-2.5 py-1 text-xs font-bold", badgeClasses(badge))}>{badge}</span>
                  </div>
                  <div className="flex flex-1 flex-col px-2 pt-4 pb-2">
                    <h3 className="font-serif text-2xl leading-tight font-bold text-primary">
                      <Link href={tourHref(tour)} className="after:absolute after:inset-0">
                        {tour.title}
                      </Link>
                    </h3>
                    <p className="mt-2 flex gap-4 text-xs text-charcoal-600">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays aria-hidden className="size-3.5" /> {pluralize(tour.durationDays, "day")}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Moon aria-hidden className="size-3.5" /> {pluralize(nights, "night")}
                      </span>
                    </p>
                    <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                      <p>
                        <span className="block text-xs text-charcoal-600">
                          {price.discountCents > 0 && (
                            <>
                              <s>
                                <span className="sr-only">Was </span>
                                {money(price.baseCents)}
                              </s>{" "}
                              <span className="rounded-full bg-discount px-2 py-0.5 font-semibold text-discount-ink">{price.discountPercent}% off</span>
                            </>
                          )}
                        </span>
                        <span className="font-display text-2xl font-bold text-forest-900">{money(price.totalCents)}</span>
                        <span className="block text-xs text-charcoal-600">
                          {price.basis === "per-group" ? `Total for ${price.groupSize} people` : "Per person"}
                        </span>
                      </p>
                      <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-teal-800 text-gold transition-transform group-hover:-rotate-45">
                        <ArrowRight className="size-4" />
                      </span>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
        <p className="mt-6 text-sm text-muted">
          Prices are for {pricingConfig.groupSize} people and cover vehicle, driver-guide, fuel, tolls and airport transfers.
          Other group sizes: custom quote.
        </p>
      </div>
    </section>
  );
}

/* 6. The Island Is Calling */

export function IslandCalling({ src }: { src: string }) {
  return (
    <section aria-labelledby="calling-title" className="pb-16 sm:pb-24">
      <div className="container-page">
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-charcoal-950">
          <Image src={src} alt="" fill sizes="100vw" className="-z-10 object-cover" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-r from-charcoal-950/80 via-charcoal-950/45 to-charcoal-950/10" />
          <div className="grid gap-8 px-6 py-16 sm:px-12 sm:py-24 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-xl">
              <h2 id="calling-title" className="font-serif text-5xl leading-[0.95] font-bold tracking-normal text-cream sm:text-6xl">
                The Island Is Calling
              </h2>
              <p className="mt-4 max-w-md leading-relaxed text-cream/85">
                Misty tea hills at dawn, leopards in the scrub and warm evenings by the sea. Tell us what you dream of and we
                will shape the route.
              </p>
              <ButtonLink href="/plan-your-trip" variant="light" size="lg" className="mt-7">
                Start planning <ArrowUpRight aria-hidden className="size-4" />
              </ButtonLink>
            </div>
            <HandNote tone="dark">See you in Sri Lanka</HandNote>
          </div>
        </div>
      </div>
    </section>
  );
}

/* 8. Stories to Fuel Your Next Trip */

export function Stories({ items, isSample }: { items: { title: string; date: string; src: string; href: string }[]; isSample: boolean }) {
  const dateLabel = (iso: string) =>
    new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));
  return (
    <section aria-labelledby="stories-title" className="pb-16 sm:pb-24">
      <div className="container-page">
        <HomeHeading id="stories-title" eyebrow="Travel guides" title="Stories to Fuel Your Next Trip" />
        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {items.map((s) => (
            <li key={s.title}>
              <article className="group card relative flex h-full flex-col overflow-hidden">
                <div className="relative aspect-[16/10] overflow-hidden bg-ivory-200">
                  <Image
                    src={s.src}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 30vw, 100vw"
                    className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.05]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs text-charcoal-600">
                    <time dateTime={s.date}>{dateLabel(s.date)}</time>
                  </p>
                  <h3 className="mt-2 font-serif text-2xl leading-tight font-bold text-primary">{s.title}</h3>
                  <Link
                    href={s.href}
                    className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-accent-ink after:absolute after:inset-0"
                  >
                    Read more<span className="sr-only">: {s.title}</span> <ArrowRight aria-hidden className="size-4" />
                  </Link>
                </div>
              </article>
            </li>
          ))}
        </ul>
        {isSample && (
          <SampleNote>
            Sample articles: titles and dates are placeholders until the blog launches. Each one links to the page it would
            summarise.
          </SampleNote>
        )}
      </div>
    </section>
  );
}

/* 9. Newsletter */

export function NewsletterStrip() {
  return (
    <section aria-labelledby="newsletter-title" className="pb-16 sm:pb-20">
      <div className="container-page">
        <div className="flex flex-col gap-6 rounded-[2rem] bg-ivory-100 px-6 py-8 sm:px-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-accent text-charcoal-950">
              <Mail aria-hidden className="size-6" />
            </span>
            <div>
              <h2 id="newsletter-title" className="font-serif text-3xl leading-tight font-bold text-primary">
                Let&apos;s Stay in Touch
              </h2>
              <p className="text-sm text-charcoal-600">Seasonal tips and new journeys, a few times a year.</p>
            </div>
          </div>
          <NewsletterForm />
        </div>
      </div>
    </section>
  );
}
