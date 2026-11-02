import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { isValidReference, normalizeReference } from "@/lib/validation/booking-lookup";
import { PageHero } from "@/components/sections/PageHero";
import { BookingLookupForm } from "@/components/forms/BookingLookupForm";

export const metadata: Metadata = {
  title: "Booking Status",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ reference: string }> };

export default async function BookingStatusPage({ params }: Props) {
  const { reference } = await params;
  // Only pre-fill a well-formed reference; never echo arbitrary path input.
  const decoded = (() => {
    try {
      return decodeURIComponent(reference);
    } catch {
      return "";
    }
  })();
  const initialReference = isValidReference(decoded) ? normalizeReference(decoded) : "";

  return (
    <>
      <PageHero eyebrow="Booking status" title="Check your booking" />
      <section className="py-16 sm:py-24">
        <div className="container-page grid max-w-5xl gap-12 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
          <div className="card p-7 sm:p-10">
            <BookingLookupForm initialReference={initialReference} />
          </div>
          <div className="flex gap-4 text-sm leading-relaxed text-charcoal-600">
            <ShieldCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-forest-600" />
            <div className="space-y-3">
              <h2 className="text-xl text-primary">Your privacy</h2>
              <p>
                To protect your details, booking status is only shown when the reference and the email address on the
                booking match. A reference on its own never reveals any information.
              </p>
              <p>A submitted enquiry is not a confirmed booking until you have accepted a written quotation.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
