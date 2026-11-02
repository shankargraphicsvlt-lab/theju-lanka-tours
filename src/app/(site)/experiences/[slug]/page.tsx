import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check, Info } from "lucide-react";
import { experiences, getExperience } from "@/content/experiences";
import { getDestination } from "@/content/destinations";
import { images } from "@/content/images";
import { tours } from "@/content/tours";
import { PageHero } from "@/components/sections/PageHero";
import { DestinationCard, TourCard } from "@/components/sections/Cards";
import { ContactCta } from "@/components/sections/ContactCta";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { itineraryWording } from "@/config/site";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return experiences.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const experience = getExperience(slug);
  if (!experience) return {};
  const img = images[experience.image];
  return {
    title: experience.title,
    description: experience.summary,
    alternates: { canonical: `/experiences/${experience.slug}` },
    openGraph: {
      title: experience.title,
      description: experience.summary,
      images: [{ url: img.src.src, width: img.src.width, height: img.src.height, alt: img.alt }],
    },
  };
}

export default async function ExperiencePage({ params }: Props) {
  const { slug } = await params;
  const experience = getExperience(slug);
  if (!experience) notFound();

  const places = experience.destinations.map(getDestination).filter((d) => d !== undefined);
  const relatedTour = tours.find((t) => experience.destinations.every((d) => t.destinations.includes(d)));

  return (
    <>
      <PageHero
        eyebrow={experience.duration}
        title={experience.title}
        intro={experience.summary}
        image={images[experience.image]}
        crumbs={[
          { label: "Experiences", href: "/experiences" },
          { label: experience.title, href: `/experiences/${experience.slug}` },
        ]}
      />

      <section className="py-20 sm:py-28">
        <div className="container-page grid gap-14 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:gap-20">
          <div>
            <div className="prose-editorial text-charcoal-700">
              {experience.description.map((p) => (
                <p key={p.slice(0, 32)}>{p}</p>
              ))}
            </div>
            <h2 className="mt-14 text-3xl text-primary">What to expect</h2>
            <ul className="mt-6 space-y-3">
              {experience.whatToExpect.map((item) => (
                <li key={item} className="flex gap-3 leading-relaxed text-charcoal-700">
                  <Check aria-hidden className="mt-1 size-4 shrink-0 text-forest-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <aside aria-labelledby="good-to-know" className="h-fit card p-7">
            <h2 id="good-to-know" className="text-lg text-primary">
              Good to know
            </h2>
            <ul className="mt-4 space-y-4 text-sm">
              {experience.goodToKnow.map((item) => (
                <li key={item} className="flex gap-3 leading-relaxed text-charcoal-600">
                  <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-700" />
                  {item}
                </li>
              ))}
            </ul>
            <ButtonLink href={`/plan-your-trip?interest=${experience.category}`} variant="dark" className="mt-7 w-full">
              Add to my enquiry
            </ButtonLink>
          </aside>
        </div>
      </section>

      {places.length > 0 && (
        <section className="bg-ivory-100 py-20 sm:py-28" aria-labelledby="where-title">
          <div className="container-page">
            <SectionHeading id="where-title" eyebrow="Where" title="Destinations for this experience" />
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {places.map((d) => (
                <DestinationCard key={d.slug} destination={d} />
              ))}
            </div>
          </div>
        </section>
      )}

      {relatedTour && (
        <section className="py-20 sm:py-28" aria-labelledby="tour-title">
          <div className="container-page">
            <SectionHeading id="tour-title" eyebrow={itineraryWording.journey} title="A tour that includes this experience" />
            <div className="mt-12">
              <TourCard tour={relatedTour} />
            </div>
          </div>
        </section>
      )}

      <ContactCta />
    </>
  );
}
