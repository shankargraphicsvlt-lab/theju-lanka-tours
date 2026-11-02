import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, MapPin, MessageCircle, Minus, Moon } from "lucide-react";
import { getTour, tours } from "@/content/tours";
import { getDestination } from "@/content/destinations";
import { airport, placeForOvernight } from "@/content/places";
import { images } from "@/content/images";
import { formatMoney, pluralize } from "@/lib/format";
import { hotelNights, packageLabel } from "@/lib/tours";
import { calculateTourPrice } from "@/lib/pricing";
import { heroForOvernight } from "@/lib/destination-photos";
import { routeStops } from "@/lib/route";
import { ItineraryJourney, type JourneyDay } from "@/components/itinerary/ItineraryJourney";
import { PageHero } from "@/components/sections/PageHero";
import { ContactCta } from "@/components/sections/ContactCta";
import { ButtonLink, buttonClasses } from "@/components/ui/Button";
import { siteConfig, whatsappHref } from "@/config/site";
import { PriceBreakdown } from "@/components/pricing/PriceBreakdown";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return tours.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tour = getTour(slug);
  if (!tour) return {};
  const img = images[tour.image];
  return {
    title: `${tour.title} (${tour.durationDays}-day package)`,
    description: tour.summary,
    alternates: { canonical: `/tours/${tour.slug}` },
    openGraph: {
      title: tour.title,
      description: tour.summary,
      images: [{ url: img.src.src, width: img.src.width, height: img.src.height, alt: img.alt }],
    },
  };
}

export default async function TourPage({ params }: Props) {
  const { slug } = await params;
  const tour = getTour(slug);
  if (!tour) notFound();

  const places = tour.destinations.map(getDestination).filter((d) => d !== undefined);
  const price = calculateTourPrice(tour.durationDays);
  // Booking happens on WhatsApp; without a number configured, the enquiry form takes its place.
  const wa = whatsappHref(`Hello ${siteConfig.name}, I would like to book the "${tour.title}" tour (${tour.durationDays} days).`);
  const bookHref = wa ?? `/plan-your-trip?tour=${tour.slug}`;
  const stops = routeStops(tour);
  const journeyDays: JourneyDay[] = tour.itinerary.map((day) => {
    const place = placeForOvernight(day.overnight);
    return {
      ...day,
      photo: heroForOvernight(day.overnight, place?.slug),
      stop: place ? { name: place.name, coordinates: place.coordinates } : airport,
    };
  });

  return (
    <>
      <PageHero
        eyebrow={`${packageLabel(tour)} · ${tour.style}`}
        title={tour.title}
        intro={tour.summary}
        image={images[tour.image]}
        crumbs={[
          { label: "Tours", href: "/tours" },
          { label: tour.title, href: `/tours/${tour.slug}` },
        ]}
      />

      <section className="pb-16 sm:pb-20">
        <div className="container-page grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:gap-10">
          <div className="space-y-6">
            <div className="card p-7 sm:p-10">
              <p className="label-caps text-accent-ink">About this journey</p>
              <div className="prose-editorial mt-4 text-charcoal-700">
                {tour.description.map((p) => (
                  <p key={p.slice(0, 32)}>{p}</p>
                ))}
              </div>
              <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-charcoal-600">
                <span className="inline-flex items-center gap-1.5">
                  <Moon aria-hidden className="size-4 text-accent-ink" /> {pluralize(hotelNights(tour), "hotel night")}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin aria-hidden className="size-4 text-accent-ink" /> {stops.length} stops on the route
                </span>
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="card p-6">
                <h2 className="text-xl text-primary">What&apos;s included</h2>
                <ul className="mt-5 space-y-3 text-sm">
                  {tour.included.map((item) => (
                    <li key={item} className="flex gap-3 leading-relaxed text-charcoal-700">
                      <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-green" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card p-6">
                <h2 className="text-xl text-primary">Not included</h2>
                <ul className="mt-5 space-y-3 text-sm">
                  {tour.excluded.map((item) => (
                    <li key={item} className="flex gap-3 leading-relaxed text-charcoal-700">
                      <Minus aria-hidden className="mt-0.5 size-4 shrink-0 text-charcoal-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <section aria-labelledby="details-title" className="card p-6 sm:p-7">
              <h2 id="details-title" className="text-xl text-primary">Trip details</h2>
              <dl className="mt-5 grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="font-semibold text-forest-900">Package duration</dt>
                  <dd className="mt-1 text-charcoal-600">
                    {tour.durationDays} days, from arrival to departure. The tour price is based on package days.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-forest-900">Hotel nights</dt>
                  <dd className="mt-1 text-charcoal-600">
                    {pluralize(hotelNights(tour), "night")} of accommodation on this route. Hotels are not included and are
                    quoted separately.
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="font-semibold text-forest-900">Destinations</dt>
                  <dd className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                    {places.map((d) => (
                      <Link key={d.slug} href={`/destinations/${d.slug}`} className="inline-flex items-center gap-1 text-forest-800 underline-offset-4 hover:underline">
                        <MapPin aria-hidden className="size-3" /> {d.name}
                      </Link>
                    ))}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="font-semibold text-forest-900">Pickup</dt>
                  <dd className="mt-1 leading-relaxed text-charcoal-600">{tour.pickup}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-forest-900">Availability</dt>
                  <dd className="mt-1 leading-relaxed text-charcoal-600">
                    Private tour on dates of your choice, subject to confirmation of hotels and guides.
                  </dd>
                </div>
              </dl>
            </section>
          </div>

          {/* First on phones; sticky beside the content on desktop. */}
          <aside aria-label="Price and enquiry" className="order-first lg:sticky lg:top-6 lg:order-none lg:h-fit">
            <div className="card border-t-4 border-accent p-6 sm:p-7">
              <h2 className="label-caps font-sans text-accent-ink">Tour price</h2>
              <p className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-display text-3xl font-bold text-primary">{formatMoney(price.totalCents, price.currency)}</span>
                <span className="text-sm text-charcoal-600">total for {price.groupSize} people</span>
              </p>
              {/* Main action, at the top of the box so it is in view on load and while the box is sticky. */}
              <a href={bookHref} {...(wa ? { target: "_blank", rel: "noopener noreferrer" } : {})} className={buttonClasses("primary", "lg", "mt-5 w-full")}>
                <MessageCircle aria-hidden className="size-4" /> Book on WhatsApp
              </a>
              <PriceBreakdown price={price} className="mt-6 border-t border-ivory-300 pt-6" />

              <ButtonLink href={`/plan-your-trip?tour=${tour.slug}`} variant="dark" size="lg" className="mt-6 w-full">
                Enquire about this tour
              </ButtonLink>
            </div>
          </aside>
        </div>
      </section>

      <section className="pb-8" aria-labelledby="journey-title">
        <div className="container-page">
          <div className="mb-10 max-w-2xl">
            <p className="label-caps text-accent-ink">Day by day</p>
            <h2 id="journey-title" className="mt-2 text-[2rem] leading-tight text-primary sm:text-[2.6rem]">
              Your journey, stop by stop
            </h2>
            <p className="mt-3 text-sm text-charcoal-600">Route can be adjusted to your plans.</p>
          </div>
          <ItineraryJourney days={journeyDays} />
        </div>
      </section>

      <ContactCta title="Make this journey your own" />

      {/* Phones and tablets: the booking button stays on screen; the spacer keeps it off the footer. */}
      <div aria-hidden className="h-20 lg:hidden" />
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-teal-line bg-teal-900/95 px-4 py-3 backdrop-blur-sm lg:hidden">
        <a href={bookHref} {...(wa ? { target: "_blank", rel: "noopener noreferrer" } : {})} className={buttonClasses("primary", "md", "w-full")}>
          <MessageCircle aria-hidden className="size-4" /> Book on WhatsApp · {formatMoney(price.totalCents, price.currency)} for {price.groupSize}
        </a>
      </div>
    </>
  );
}
