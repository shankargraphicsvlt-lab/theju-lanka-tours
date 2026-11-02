import type { Metadata } from "next";
import { experiences } from "@/content/experiences";
import { images } from "@/content/images";
import { PageHero } from "@/components/sections/PageHero";
import { ExperienceCard } from "@/components/sections/Cards";
import { ContactCta } from "@/components/sections/ContactCta";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Experiences",
  description:
    "Signature Sri Lanka experiences: ancient cities, leopard and elephant safaris, the hill-country train, tea estates, whale watching and sacred Kandy.",
  alternates: { canonical: "/experiences" },
};

export default function ExperiencesPage() {
  return (
    <>
      <PageHero
        eyebrow="Experiences"
        title="The moments a journey is built around"
        intro="Each experience can be woven into any itinerary and timed for the right season, the right light and the fewest crowds."
        image={images.kandyPerahera}
        crumbs={[{ label: "Experiences", href: "/experiences" }]}
      />
      <section className="py-20 sm:py-28">
        <Reveal stagger className="container-page grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {experiences.map((e) => (
            <ExperienceCard key={e.slug} experience={e} tone="light" />
          ))}
        </Reveal>
      </section>
      <ContactCta />
    </>
  );
}
