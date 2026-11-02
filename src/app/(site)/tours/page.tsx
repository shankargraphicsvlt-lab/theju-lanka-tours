import type { Metadata } from "next";
import { tours } from "@/content/tours";
import { destinations } from "@/content/destinations";
import { images } from "@/content/images";
import { Car, Route, Users } from "lucide-react";
import { pricingConfig } from "@/config/pricing";
import { pluralize } from "@/lib/format";
import { interestOptions } from "@/lib/validation/enquiry";
import { durationBuckets, filterTours, hasActiveFilters, parseTourFilters, type SearchParamsRecord } from "@/lib/filters";
import { PageHero } from "@/components/sections/PageHero";
import { TourCard } from "@/components/sections/Cards";
import { ContactCta } from "@/components/sections/ContactCta";
import { FilterBar } from "@/components/filters/FilterBar";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Tour Packages",
  description:
    "Suggested private Sri Lanka itineraries from 5 to 15 days, combining ancient cities, tea country, wildlife and the southern coast. Every tour can be tailored.",
  alternates: { canonical: "/tours" },
};

const sorted = [...tours].sort((a, b) => a.durationDays - b.durationDays);

/** What every price covers, who it is for, and that routes are flexible. */
const highlights = [
  { icon: Car, text: "Price covers vehicle, driver-guide, fuel, tolls and airport transfers" },
  { icon: Users, text: `Prices shown are for ${pricingConfig.groupSize} people. Other group sizes: custom quote` },
  { icon: Route, text: "Suggested routes, change anything you like" },
];
const usedInterests = new Set(tours.flatMap((t) => t.interests));

export default async function ToursPage({ searchParams }: { searchParams: Promise<SearchParamsRecord> }) {
  const filters = parseTourFilters(await searchParams, destinations.map((d) => d.slug));
  const results = filterTours(sorted, filters);
  const filtered = hasActiveFilters(filters);

  return (
    <>
      <PageHero
        eyebrow="Private tours"
        title="Private Sri Lanka tours, your way"
        intro="From a five-day introduction to a fifteen-day grand tour. Every journey is private, and every detail can be changed."
        image={images.safariElephant}
        crumbs={[{ label: "Tours", href: "/tours" }]}
      />
      <section className="pb-16 sm:pb-24">
        <div className="container-page">
          <ul className="card grid gap-4 p-5 sm:p-6 md:grid-cols-3 md:gap-6">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-[0.9375rem] leading-snug text-ink">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-teal-800 text-gold">
                  <Icon aria-hidden className="size-[1.1rem]" />
                </span>
                {text}
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <FilterBar
              label="Filter tours"
              fields={[
                {
                  type: "select",
                  name: "duration",
                  label: "Package duration",
                  allLabel: "Any length",
                  options: durationBuckets.map((b) => ({ value: b.value, label: b.label })),
                },
                {
                  type: "select",
                  name: "destination",
                  label: "Destination",
                  allLabel: "Any destination",
                  options: destinations.map((d) => ({ value: d.slug, label: d.name })),
                },
                {
                  type: "select",
                  name: "experience",
                  label: "Experience type",
                  allLabel: "Any experience",
                  options: interestOptions.filter((o) => usedInterests.has(o.value)).map((o) => ({ value: o.value, label: o.label })),
                },
              ]}
            />
            <p aria-live="polite" className="mt-5 text-sm text-charcoal-600" data-testid="result-count">
              {filtered ? `${pluralize(results.length, "tour")} found` : `Showing all ${pluralize(results.length, "tour")}`}
            </p>
          </div>

          {results.length === 0 ? (
            <div className="mx-auto max-w-xl py-16 text-center">
              <h2 className="text-3xl text-primary">No suggested tours match these filters</h2>
              <p className="mt-3 text-charcoal-600">
                Try fewer filters, or tell us what you have in mind and we will design a journey around it.
              </p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <ButtonLink href="/tours" variant="outline">
                  Clear filters
                </ButtonLink>
                <ButtonLink href="/plan-your-trip" variant="dark">
                  Plan a custom journey
                </ButtonLink>
              </div>
            </div>
          ) : (
            <ul className="mt-8 space-y-6">
              {results.map((t, i) => (
                <li key={t.slug}>
                  <TourCard tour={t} priority={i === 0} index={i} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
      <ContactCta title="Prefer something different?" intro="Tell us what you would love to see and we will design a journey from scratch." />
    </>
  );
}
