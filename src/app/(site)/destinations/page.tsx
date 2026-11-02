import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { destinations } from "@/content/destinations";
import { routePlaces } from "@/content/places";
import { images } from "@/content/images";
import { interestOptions } from "@/lib/validation/enquiry";
import { filterDestinations, hasActiveFilters, parseDestinationFilters, regions, type SearchParamsRecord } from "@/lib/filters";
import { pluralize } from "@/lib/format";
import { placePhoto } from "@/lib/destination-photos";
import { PageHero } from "@/components/sections/PageHero";
import { ContactCta } from "@/components/sections/ContactCta";
import { PlaceCard } from "@/components/sections/PlaceCard";
import { FilterBar } from "@/components/filters/FilterBar";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Destinations",
  description:
    "Explore Sri Lanka's highlights: Sigiriya and Dambulla, Kandy, Ella, Galle, Yala National Park and the south coast.",
  alternates: { canonical: "/destinations" },
};

const usedInterests = new Set(destinations.flatMap((d) => d.interests));

export default async function DestinationsPage({ searchParams }: { searchParams: Promise<SearchParamsRecord> }) {
  const filters = parseDestinationFilters(await searchParams);
  const results = filterDestinations(destinations, filters);
  const filtered = hasActiveFilters(filters);

  return (
    <>
      <PageHero
        eyebrow="Destinations"
        title="Six regions, one remarkable island"
        intro="From the ancient cities of the dry zone to the cool hill country, wild national parks and the southern coast, these are the places our journeys are built around."
        image={images.ellaAerial}
        crumbs={[{ label: "Destinations", href: "/destinations" }]}
      />

      <section className="pb-10 sm:pb-12">
        <div className="container-page">
          <FilterBar
            label="Search destinations"
            fields={[
              { type: "search", name: "q", label: "Search", placeholder: "Try “temple”, “leopard” or “beach”" },
              {
                type: "select",
                name: "region",
                label: "Region",
                allLabel: "All regions",
                options: regions.map((r) => ({ value: r, label: r })),
              },
              {
                type: "select",
                name: "interest",
                label: "Interest",
                allLabel: "All interests",
                options: interestOptions.filter((o) => usedInterests.has(o.value)).map((o) => ({ value: o.value, label: o.label })),
              },
            ]}
          />
          <p aria-live="polite" className="mt-5 text-sm text-charcoal-600" data-testid="result-count">
            {filtered
              ? `${pluralize(results.length, "destination")} found`
              : `Showing all ${pluralize(results.length, "destination")}`}
          </p>
        </div>
      </section>

      <section className="pb-16 sm:pb-24">
        <div className="container-page">
          {results.length === 0 ? (
            <div className="mx-auto max-w-xl py-10 text-center">
              <h2 className="text-3xl text-primary">No destinations match your search</h2>
              <p className="mt-3 text-charcoal-600">Try a different word, or clear the filters to see every destination.</p>
              <ButtonLink href="/destinations" variant="outline" className="mt-6">
                Clear search and filters
              </ButtonLink>
            </div>
          ) : (
            <ul className="space-y-6 sm:space-y-8">
              {results.map((d, index) => {
                const flip = index % 2 === 1;
                return (
                  <li key={d.slug}>
                      <article className="group card grid items-stretch gap-6 p-3 sm:p-4 lg:grid-cols-2 lg:gap-12">
                        <PhotoFrame
                          src={placePhoto(d.slug)}
                          name={d.name}
                          sizes="(min-width: 1024px) 45vw, 100vw"
                          preload={index === 0}
                          decorative
                          className={cn("aspect-[4/3] rounded-[1.25rem] lg:aspect-auto lg:min-h-[22rem]", flip && "lg:order-2")}
                        />
                        <div className={cn("px-3 pb-5 lg:px-6 lg:py-6", flip && "lg:order-1")}>
                          <p className="label-caps text-accent-ink">{d.region}</p>
                          <h2 className="mt-2 text-[2rem] leading-tight text-primary sm:text-[2.6rem]">{d.name}</h2>
                          <p className="mt-2 font-display text-lg font-semibold text-charcoal-700">{d.tagline}</p>
                          <p className="mt-4 max-w-xl leading-relaxed text-charcoal-600">{d.summary}</p>
                          <ul className="mt-5 flex flex-wrap gap-2">
                            {d.highlights.slice(0, 3).map((h) => (
                              <li key={h.title} className="rounded-full bg-ivory-100 px-3 py-1 text-xs font-medium text-charcoal-700">
                                {h.title}
                              </li>
                            ))}
                          </ul>
                          <ButtonLink href={`/destinations/${d.slug}`} variant="dark" className="mt-6">
                            Discover {d.name} <ArrowRight aria-hidden className="size-4" />
                          </ButtonLink>
                        </div>
                      </article>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {!filtered && (
        <section className="pb-16 sm:pb-24" aria-labelledby="route-places-title">
          <div className="container-page">
            <SectionHeading
              id="route-places-title"
              eyebrow="Along the way"
              title="More stops on our routes"
              intro="Places our suggested itineraries stay in overnight, each a world of its own."
            />
            {/* Five stops: two wide cards over three at lg, so no row is left with a single card. */}
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
              {routePlaces.map((p, i) => (
                <PlaceCard key={p.slug} place={p} className={i < 2 ? "lg:col-span-3" : "lg:col-span-2"} />
              ))}
            </div>
          </div>
        </section>
      )}

      <ContactCta />
    </>
  );
}
