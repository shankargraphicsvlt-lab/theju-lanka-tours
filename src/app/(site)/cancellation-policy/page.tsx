import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { LegalPage } from "@/components/sections/LegalPage";
import { Placeholder } from "@/components/ui/Badges";

export const metadata: Metadata = {
  title: "Cancellation Policy",
  description: `Cancellation and change terms for trips booked with ${siteConfig.name}.`,
  alternates: { canonical: "/cancellation-policy" },
};

const tiers = [
  "[More than X days before arrival]",
  "[Between X and Y days before arrival]",
  "[Fewer than Y days before arrival / no-show]",
];

export default function CancellationPolicyPage() {
  return (
    <LegalPage
      title="Cancellation Policy"
      href="/cancellation-policy"
      intro="What happens if you need to change or cancel your trip."
      sections={[
        {
          heading: "Cancelling your trip",
          body: (
            <>
              <p>Cancellations must be made in writing. Charges depend on how far in advance you cancel:</p>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
                  <caption className="sr-only">Cancellation charges</caption>
                  <thead>
                    <tr className="border-b border-ivory-300">
                      <th scope="col" className="py-3 pr-4 font-semibold text-forest-900">Notice given</th>
                      <th scope="col" className="py-3 font-semibold text-forest-900">Charge</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tiers.map((t) => (
                      <tr key={t} className="border-b border-ivory-200">
                        <td className="py-3 pr-4"><Placeholder>{t}</Placeholder></td>
                        <td className="py-3"><Placeholder>[To be confirmed]</Placeholder></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ),
        },
        {
          heading: "Changes to your booking",
          body: (
            <p>
              We will always try to accommodate changes. Where hotels or other suppliers charge for changes, these costs
              may be passed on. <Placeholder>[Amendment fees, if any: to be confirmed]</Placeholder>
            </p>
          ),
        },
        {
          heading: "Third-party terms",
          body: (
            <p>
              Some hotels, trains and activities have their own non-refundable conditions, particularly at peak times
              such as the Esala Perahera. Any such conditions will be shown in your quotation.
            </p>
          ),
        },
        {
          heading: "If we need to make changes",
          body: (
            <p>
              Occasionally we may need to change an itinerary because of weather, safety, park closures or other
              circumstances beyond our control. We will offer a suitable alternative where possible.{" "}
              <Placeholder>[Refund terms if we cancel: to be confirmed]</Placeholder>
            </p>
          ),
        },
      ]}
    />
  );
}
