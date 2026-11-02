import type { Metadata } from "next";
import Image from "next/image";
import { allImages, images } from "@/content/images";
import { PageHero } from "@/components/sections/PageHero";
import { ContactCta } from "@/components/sections/ContactCta";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photographs of Sri Lanka's destinations: Sigiriya, Kandy, Ella, Galle, Yala and the south coast.",
  alternates: { canonical: "/gallery" },
};

export default function GalleryPage() {
  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title="Sri Lanka in pictures"
        intro="A glimpse of the places our journeys visit, from ancient rock fortresses to quiet southern shores."
        image={images.ellaTrain}
        crumbs={[{ label: "Gallery", href: "/gallery" }]}
      />

      <section className="py-16 sm:py-24" aria-label="Photographs">
        <div className="container-page columns-1 gap-4 sm:columns-2 lg:columns-3">
          {allImages.map((img) => (
            <figure key={img.unsplashUrl} className="mb-4 break-inside-avoid">
              <Image
                src={img.src}
                alt={img.alt}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                placeholder="blur"
                className="h-auto w-full bg-forest-900"
              />
              <figcaption className="mt-2 text-xs text-charcoal-600">{img.location}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="bg-ivory-100 py-16 sm:py-24" aria-labelledby="credits-title">
        <div className="container-page">
          <SectionHeading
            id="credits-title"
            eyebrow="Photo credits"
            title="With thanks to the photographers"
            intro="Photographs are used under the Unsplash License. Attribution is not required by the licence, but we are glad to credit the photographers."
          />
          <ul className="mt-10 grid gap-x-10 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
            {allImages.map((img) => (
              <li key={img.unsplashUrl} className="text-charcoal-700">
                <a href={img.unsplashUrl} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
                  {img.location}
                </a>{" "}
                by{" "}
                <a href={img.profile} target="_blank" rel="noopener noreferrer" className="text-forest-800 underline underline-offset-2">
                  {img.photographer}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ContactCta />
    </>
  );
}
