import type { Metadata } from "next";
import Image from "next/image";
import { images } from "@/content/images";
import { siteConfig } from "@/config/site";
import { PageHero } from "@/components/sections/PageHero";
import { ContactCta } from "@/components/sections/ContactCta";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Placeholder } from "@/components/ui/Badges";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "About Us",
  description: `${siteConfig.name} plans private, tailor-made journeys across Sri Lanka. Learn how we work.`,
  alternates: { canonical: "/about" },
};

const values = [
  {
    title: "Your journey, your pace",
    text: "We design around how you like to travel: early starts or slow mornings, many places or a few, comfortable or indulgent.",
  },
  {
    title: "Honest advice",
    text: "We will tell you when a place is better in another season, when a drive is too long, or when an experience may not be what you expect.",
  },
  {
    title: "Transparent quotations",
    text: "Every quotation sets out what is included, what is not, and the terms that apply, before you commit to anything.",
  },
  {
    title: "Respect for people and places",
    text: "We favour responsible wildlife viewing, modest dress at sacred sites and local businesses wherever we can.",
  },
];

export default function AboutPage() {
  const img = images.kandyTemple;
  const { entityName, registrationNumber, sltdaNumber } = siteConfig.legal;
  // Only confirmed details are listed; with none, the section is left out.
  const credentials = [
    { label: "Legal entity", value: entityName },
    { label: "Company registration", value: registrationNumber },
    { label: "SLTDA registration", value: sltdaNumber },
  ].filter((c): c is { label: string; value: string } => Boolean(c.value));
  return (
    <>
      <PageHero
        eyebrow="About us"
        title="Sri Lanka, planned around you"
        intro={`${siteConfig.name} designs private journeys for travellers who want to see the island properly: its heritage, its wild places and its quiet corners.`}
        image={images.sigiriyaRock}
        crumbs={[{ label: "About", href: "/about" }]}
      />

      <section className="py-20 sm:py-28">
        <div className="container-page grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading eyebrow="Our story" title="Why we do this" />
            <div className="prose-editorial mt-8 text-charcoal-700">
              <p>
                Sri Lanka rewards travellers who take their time. In a single journey you can climb a fifth-century
                citadel, ride a slow train through tea country, watch elephants gather at dusk and end the day by the
                Indian Ocean.
              </p>
              <p>
                {siteConfig.name} exists to make that journey feel effortless, with private transport, thoughtfully
                chosen places to stay and an itinerary shaped by the seasons and by you.
              </p>
              <p>
                <Placeholder>[Founder story and team introduction: to be provided by the business]</Placeholder>
              </p>
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-ivory-200 shadow-card">
            <Image src={img.src} alt={img.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" placeholder="blur" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="py-4" aria-labelledby="values-title">
        <div className="container-page">
          <div className="rounded-[2rem] bg-forest-900 px-5 py-14 text-cream sm:px-10 sm:py-20">
            <SectionHeading id="values-title" tone="dark" eyebrow="How we work" title="What you can expect from us" />
            <Reveal stagger className="mt-10 grid gap-4 sm:grid-cols-2">
              {values.map((v) => (
                <div key={v.title} className="rounded-card bg-forest-800 p-7 sm:p-9">
                  <h3 className="text-xl text-cream">{v.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ivory-100/75">{v.text}</p>
                </div>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      {credentials.length > 0 && (
        <section className="py-20 sm:py-28" aria-labelledby="credentials-title">
          <div className="container-page max-w-3xl">
            <SectionHeading id="credentials-title" eyebrow="Business details" title="Registration & licensing" />
            <dl className="mt-8 divide-y divide-ivory-200 border-y border-ivory-200 text-sm">
              {credentials.map((c) => (
                <div key={c.label} className="grid gap-2 py-4 sm:grid-cols-[14rem_minmax(0,1fr)]">
                  <dt className="font-semibold text-forest-900">{c.label}</dt>
                  <dd className="text-charcoal-700">{c.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      <ContactCta />
    </>
  );
}
