import type { Metadata } from "next";
import { destinations } from "@/content/destinations";
import { tours } from "@/content/tours";
import { interestOptions } from "@/lib/validation/enquiry";
import { todayIso } from "@/lib/dates";
import { onlineEnquiriesEnabled } from "@/lib/booking/availability";
import { PageHero } from "@/components/sections/PageHero";
import { EnquiryForm, type EnquiryDefaults } from "@/components/forms/EnquiryForm";
import { ContactDetails } from "@/components/layout/ContactDetails";
import { itineraryWording } from "@/config/site";

export const metadata: Metadata = {
  title: "Plan Your Trip",
  description:
    "Tell us about your dream Sri Lanka journey: dates, travellers, interests and places. We reply with ideas and a written quotation.",
  alternates: { canonical: "/plan-your-trip" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** Only accept known values from the query string; ignore everything else. */
function parseDefaults(params: Record<string, string | string[] | undefined>): EnquiryDefaults {
  const tour = first(params.tour);
  const destination = first(params.destination);
  const interest = first(params.interest);
  const adults = Number(first(params.adults));
  const month = first(params.month);

  let arrivalDate: string | undefined;
  if (month && /^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    const candidate = `${month}-01`;
    const today = todayIso();
    arrivalDate = candidate >= today ? candidate : month === today.slice(0, 7) ? today : undefined;
  }

  return {
    tour: tours.some((t) => t.slug === tour) ? tour : undefined,
    destinations: destinations.some((d) => d.slug === destination) && destination ? [destination] : [],
    interests: interestOptions.some((o) => o.value === interest) && interest ? [interest] : [],
    adults: Number.isInteger(adults) && adults >= 1 && adults <= 20 ? adults : undefined,
    arrivalDate,
  };
}

const steps = [
  { title: "Share your ideas", text: "Tell us your dates, who is travelling and what you would love to see." },
  { title: "Receive a written quotation", text: "We suggest a route and send an itemised quotation, usually with options." },
  { title: "Refine together", text: "Adjust anything you like until the journey feels right." },
  { title: "Confirm when ready", text: "Your trip is confirmed only after you accept the quotation and its terms." },
];

export default async function PlanYourTripPage({ searchParams }: { searchParams: SearchParams }) {
  const defaults = parseDefaults(await searchParams);
  return (
    <>
      <PageHero
        eyebrow="Plan your trip"
        title="Tell us about your journey"
        intro="Share as much or as little as you like. We use it to suggest a route and prepare a written quotation, with no obligation."
        crumbs={[{ label: "Plan your trip", href: "/plan-your-trip" }]}
      />
      <section className="py-16 sm:py-24">
        <div className="container-page grid gap-14 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:gap-20">
          <EnquiryForm
            defaults={defaults}
            onlineEnabled={onlineEnquiriesEnabled()}
            tourOptions={tours.map((t) => ({
              value: t.slug,
              label: `${t.title} (${t.durationDays} days, ${itineraryWording.word} itinerary)`,
              durationDays: t.durationDays,
            }))}
            destinationOptions={destinations.map((d) => ({ value: d.slug, label: d.name }))}
          />
          <aside className="space-y-10 lg:sticky lg:top-28 lg:h-fit">
            <div>
              <h2 className="text-3xl text-primary">How it works</h2>
              <ol className="mt-6 space-y-6">
                {steps.map((s, i) => (
                  <li key={s.title} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3">
                    <span className="flex size-9 items-center justify-center rounded-full border border-gold-500 font-display text-lg text-forest-900">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="text-lg text-primary">{s.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-charcoal-600">{s.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="card p-7">
              <h2 className="text-lg text-primary">Prefer to talk?</h2>
              <ContactDetails className="mt-4" />
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
