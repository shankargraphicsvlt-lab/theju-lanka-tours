import { ArrowRight, CalendarDays, Compass, MapPin, Users } from "lucide-react";
import { destinations } from "@/content/destinations";
import { interestOptions } from "@/lib/validation/enquiry";
import { buttonClasses } from "@/components/ui/Button";

const labelClass = "flex items-center gap-2 text-[0.7rem] font-semibold tracking-[0.18em] text-charcoal-600 uppercase";

/**
 * A plain GET form that hands the visitor's choices to the planner page.
 * Works without JavaScript; nothing is submitted or stored here.
 */
export function TripFinder() {
  return (
    <section id="trip-finder" aria-labelledby="trip-finder-title" className="relative z-10">
      <div className="container-page">
        <form
          action="/plan-your-trip"
          method="get"
          className="card grid gap-5 p-6 sm:grid-cols-2 sm:p-8 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto] lg:items-end lg:gap-6"
        >
          <div className="sm:col-span-2 lg:col-span-5">
            <p className="label-caps text-accent-ink">Trip finder</p>
            <h2 id="trip-finder-title" className="mt-1 text-2xl text-primary">
              Start shaping your journey
            </h2>
          </div>
          <div className="space-y-2">
            <label htmlFor="tf-destination" className={labelClass}>
              <MapPin aria-hidden className="size-3.5 text-gold-700" /> Where
            </label>
            <select id="tf-destination" name="destination" className="field" defaultValue="">
              <option value="">Anywhere in Sri Lanka</option>
              {destinations.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="tf-month" className={labelClass}>
              <CalendarDays aria-hidden className="size-3.5 text-gold-700" /> Arrival month
            </label>
            <input id="tf-month" name="month" type="month" className="field" />
          </div>
          <div className="space-y-2">
            <label htmlFor="tf-travellers" className={labelClass}>
              <Users aria-hidden className="size-3.5 text-gold-700" /> Travellers
            </label>
            <select id="tf-travellers" name="adults" className="field" defaultValue="2">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "adult" : "adults"}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="tf-interest" className={labelClass}>
              <Compass aria-hidden className="size-3.5 text-gold-700" /> Interest
            </label>
            <select id="tf-interest" name="interest" className="field" defaultValue="">
              <option value="">Open to ideas</option>
              {interestOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className={buttonClasses("dark", "lg", "w-full sm:col-span-2 lg:col-span-1 lg:w-auto")}>
            Continue <ArrowRight aria-hidden className="size-4" />
          </button>
        </form>
      </div>
    </section>
  );
}
