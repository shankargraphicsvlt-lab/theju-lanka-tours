import type { Metadata } from "next";
import { Clock } from "lucide-react";
import { PageHero } from "@/components/sections/PageHero";
import { BrandVideoLoop } from "@/components/sections/BrandVideoLoop";
import { ContactDetails } from "@/components/layout/ContactDetails";
import { ContactForm } from "@/components/forms/ContactForm";
import { ButtonLink } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${siteConfig.name} to start planning a private journey in Sri Lanka.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="We would love to hear from you"
        intro="Questions about a suggested tour, ideas for a custom journey or just wondering when to go? Send us a message."
        media={<BrandVideoLoop />}
        crumbs={[{ label: "Contact", href: "/contact" }]}
      />
      <section className="py-16 sm:py-24">
        <div className="container-page grid gap-14 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-20">
          <aside className="space-y-10">
            <div>
              <h2 className="text-3xl text-primary">Contact details</h2>
              <ContactDetails className="mt-6 text-base" />
            </div>
            <div className="flex gap-3 text-sm leading-relaxed text-charcoal-600">
              <Clock aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-700" />
              <p>Sri Lanka is on Sri Lanka Standard Time (UTC+5:30). We reply to messages as soon as we can.</p>
            </div>
            <div className="card p-7">
              <h2 className="text-lg text-primary">Ready to plan?</h2>
              <p className="mt-2 text-sm leading-relaxed text-charcoal-600">
                The trip enquiry form helps us prepare a more accurate quotation.
              </p>
              <ButtonLink href="/plan-your-trip" variant="dark" className="mt-5">
                Plan your trip
              </ButtonLink>
            </div>
          </aside>
          <div>
            <h2 className="mb-8 text-3xl text-primary">Send a message</h2>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
