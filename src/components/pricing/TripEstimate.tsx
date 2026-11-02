import { Calculator, MessageSquareQuote } from "lucide-react";
import { calculateTourPrice, customQuoteMessage, priceEligibility, type Party } from "@/lib/pricing";
import { pluralize } from "@/lib/format";
import { PriceBreakdown } from "./PriceBreakdown";

export interface EstimateBasis {
  days: number;
  source: "dates" | "tour";
}

/**
 * Live estimate shown inside the enquiry form. Updates as dates, tour or
 * party size change. Parties the published rate does not cover get
 * "Custom quote required" instead of a price.
 */
export function TripEstimate({ basis, party }: { basis: EstimateBasis | null; party: Party }) {
  const eligibility = priceEligibility(party);
  return (
    <section
      aria-labelledby="estimate-title"
      aria-live="polite"
      data-testid="trip-estimate"
      className="rounded-card bg-forest-800 p-6 text-ivory-50 shadow-card sm:p-8"
    >
      <h2 id="estimate-title" className="flex items-center gap-2 text-lg">
        <Calculator aria-hidden className="size-4 text-gold-400" /> Estimated tour price
      </h2>
      {!eligibility.eligible ? (
        <div className="mt-4">
          <p className="flex items-center gap-2 font-display text-3xl text-ivory-50">
            <MessageSquareQuote aria-hidden className="size-6 text-gold-400" /> Custom quote required
          </p>
          <p className="mt-3 text-sm leading-relaxed text-ivory-100/75">{customQuoteMessage(eligibility.reason, party)}</p>
          <p className="mt-2 text-xs leading-relaxed text-ivory-100/60">
            Send your enquiry and we will reply with a written quotation for your group.
          </p>
        </div>
      ) : basis ? (
        <>
          <p className="mt-2 text-xs text-ivory-100/70">
            {basis.source === "dates"
              ? `Based on your dates: ${basis.days} package days (${pluralize(basis.days - 1, "night")}), counting arrival and departure days.`
              : `Based on the selected tour: ${basis.days}-day package. Add your dates to update this estimate.`}
          </p>
          <PriceBreakdown price={calculateTourPrice(basis.days)} tone="dark" className="mt-5" />
        </>
      ) : (
        <p className="mt-3 text-sm leading-relaxed text-ivory-100/75">
          Choose your arrival and departure dates, or a suggested tour, to see an estimate.
        </p>
      )}
    </section>
  );
}
