import type { Metadata } from "next";
import Link from "next/link";
import { placeholders, siteConfig } from "@/config/site";
import { LegalPage } from "@/components/sections/LegalPage";
import { Placeholder } from "@/components/ui/Badges";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: `Terms and conditions for enquiries and bookings with ${siteConfig.name}.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  const entity = siteConfig.legal.entityName ?? placeholders.entityName;
  return (
    <LegalPage
      title="Terms & Conditions"
      href="/terms"
      sections={[
        {
          heading: "About these terms",
          body: (
            <p>
              These terms apply to enquiries and bookings made with <Placeholder>{entity}</Placeholder>, trading as{" "}
              {siteConfig.name}. Your written quotation may include additional terms specific to your trip.
            </p>
          ),
        },
        {
          heading: "Enquiries and quotations",
          body: (
            <>
              <p>
                Sending an enquiry does not create a booking or reserve any service. We respond with a written quotation
                that sets out the itinerary, inclusions, exclusions, price and payment terms.
              </p>
              <p>
                Itineraries shown on this website are suggestions and can be changed. Prices shown are calculated from the published daily tour
                rate and any stated discount; they cover the tour rate only and do not constitute an offer until
                confirmed in your quotation.
              </p>
            </>
          ),
        },
        {
          heading: "Confirming a booking",
          body: (
            <p>
              A booking is confirmed only when you have accepted the quotation and the payment terms stated in it have
              been met, and we have confirmed the booking to you in writing.
            </p>
          ),
        },
        {
          heading: "Prices and payment",
          body: (
            <p>
              Prices are quoted in the currency stated in your quotation. Entrance fees, park fees and taxes set by
              third parties may change outside our control. <Placeholder>[Deposit and balance terms: to be confirmed]</Placeholder>
            </p>
          ),
        },
        {
          heading: "Changes and cancellations",
          body: (
            <p>
              Please see our{" "}
              <Link href="/cancellation-policy" className="text-forest-800 underline">
                cancellation policy
              </Link>
              . We may need to adjust an itinerary for safety, weather, park closures or other circumstances beyond our
              control, in which case we will offer a suitable alternative where possible.
            </p>
          ),
        },
        {
          heading: "Travel documents and insurance",
          body: (
            <p>
              You are responsible for holding a valid passport and any visa or travel authorisation required for Sri
              Lanka. We strongly recommend comprehensive travel insurance covering medical costs and cancellation.
            </p>
          ),
        },
        {
          heading: "Liability",
          body: (
            <p>
              <Placeholder>[Liability terms: to be drafted with legal advice]</Placeholder>
            </p>
          ),
        },
        {
          heading: "Governing law",
          body: (
            <p>
              <Placeholder>[Governing law and jurisdiction: to be confirmed]</Placeholder>
            </p>
          ),
        },
      ]}
    />
  );
}
