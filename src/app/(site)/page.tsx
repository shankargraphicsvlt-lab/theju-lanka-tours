import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { destinations } from "@/content/destinations";
import { getPlace, places } from "@/content/places";
import { getTour } from "@/content/tours";
import { faqs } from "@/content/faqs";
import { images } from "@/content/images";
import { islandReel } from "@/content/island-reel";
import { bannerPhoto, curatedTours, inspirePlaces, stories } from "@/content/home";
import { testimonials, testimonialsAreSample } from "@/content/testimonials";
import { SHOW_BLOG, SHOW_TESTIMONIALS, siteConfig } from "@/config/site";
import { heroFor, photosForPlace } from "@/lib/destination-photos";
import { calculateTourPrice } from "@/lib/pricing";
import { hotelNights } from "@/lib/tours";
import { todayIso } from "@/lib/dates";
import { serif } from "@/lib/fonts";
import { IslandReel, type ReelScene } from "@/components/home/IslandReel";
import { HeroFeatures } from "@/components/home/HeroFeatures";
import { TripSearch } from "@/components/home/TripSearch";
import { WaveDivider } from "@/components/ui/WaveDivider";
import { Testimonials } from "@/components/home/Testimonials";
import {
  CuratedTours,
  HomeHeading,
  IslandCalling,
  NewsletterStrip,
  PlacesInspire,
  Stories,
  WhyTravelWithUs,
  type CuratedTour,
} from "@/components/home/HomeSections";
import { DestinationExplorer } from "@/components/home/DestinationExplorer";
import { PlaceCard } from "@/components/sections/PlaceCard";
import { FaqList } from "@/components/sections/FaqList";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { DemoNotice } from "@/components/ui/Badges";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/** Short tag per interest for destination cards ("Beaches • Culture"). */
const shortTag: Record<string, string> = {
  culture: "Culture",
  wildlife: "Wildlife",
  nature: "Nature",
  beach: "Beaches",
  rail: "Scenic rail",
  wellness: "Wellness",
  food: "Food",
};

export default function HomePage() {
  const explorerItems = destinations.map((d) => ({ destination: d, image: images[d.heroImage] }));
  const reelScenes: ReelScene[] = islandReel.flatMap(({ photo, facts }) => {
    // Photo folders double as place slugs or aliases (sigiriya → sigiriya-and-dambulla).
    const place = getPlace(photo);
    const src = place ? photosForPlace(place.slug, []).hero : null;
    return place && src ? [{ slug: place.slug, name: place.name, region: place.region, tagline: place.tagline, facts, src }] : [];
  });
  const showReel = reelScenes.length > 0;

  const inspire = inspirePlaces.flatMap(({ slug, photo }) => {
    const place = getPlace(slug);
    const src = heroFor(photo);
    return place && src ? [{ slug: place.slug, name: place.name, tags: place.interests.slice(0, 2).map((i) => shortTag[i] ?? i), src }] : [];
  });
  const curated: CuratedTour[] = curatedTours.flatMap(({ slug, photo, badge }) => {
    const tour = getTour(slug);
    const src = heroFor(photo);
    return tour && src ? [{ tour, badge, src, nights: hotelNights(tour), price: calculateTourPrice(tour.durationDays) }] : [];
  });
  const storyItems = stories.items.flatMap((s) => {
    const src = heroFor(s.photo);
    return src ? [{ ...s, src }] : [];
  });
  const banner = heroFor(bannerPhoto);

  return (
    <div className={serif.variable}>
      {/* 1. Photo reel; a plain heading only if no scene photo exists at all. */}
      {showReel ? (
        <>
          <IslandReel scenes={reelScenes} title={siteConfig.slogan} />
          <WaveDivider className="mt-2" />
        </>
      ) : (
        <section aria-labelledby="hero-title" className="container-page pt-6 pb-10">
          <h1 id="hero-title" className="font-serif text-5xl font-bold text-primary sm:text-6xl">
            {siteConfig.slogan}
          </h1>
        </section>
      )}

      {/* 2. Search card overlapping the bottom edge of the reel by 56px, with the four promises under it. */}
      <div className={cn("container-page relative z-10", showReel && "-mt-[5.25rem] sm:-mt-[5.75rem]")}>
        <div className="mx-auto max-w-5xl px-0 sm:px-6">
          <TripSearch destinationOptions={destinations.map((d) => ({ value: d.slug, label: d.name }))} today={todayIso()} />
          <HeroFeatures className="mt-6" />
        </div>
      </div>

      {inspire.length > 0 && <PlacesInspire items={inspire} />}
      <WhyTravelWithUs />
      {curated.length > 0 && <CuratedTours items={curated} />}
      {banner && <IslandCalling src={banner} />}

      {/* 7. Testimonials: hidden until SHOW_TESTIMONIALS is switched on in src/config/site.ts. */}
      {SHOW_TESTIMONIALS && testimonials.length > 0 && (
        <section aria-labelledby="stories-real-title" className="pb-16 sm:pb-24">
          <div className="container-page">
            <HomeHeading id="stories-real-title" eyebrow="Guest stories" title="Real Stories. Real Smiles." />
            <div className="mt-6">
              <Testimonials items={testimonials} labelledBy="stories-real-title" />
            </div>
            {testimonialsAreSample && (
              <DemoNotice className="mt-6">
                Sample testimonials: these are placeholders, not reviews from real guests. They will be replaced with genuine
                guest reviews before launch.
              </DemoNotice>
            )}
          </div>
        </section>
      )}

      {/* 8. Travel guides: hidden until SHOW_BLOG is switched on in src/config/site.ts. */}
      {SHOW_BLOG && storyItems.length > 0 && <Stories items={storyItems} isSample={stories.isSample} />}

      {/* Destination worlds: bento grid, first card large */}
      <section className="pb-16 sm:pb-24" aria-labelledby="destinations-title">
        <div className="container-page">
          <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              id="destinations-title"
              eyebrow="Destinations"
              title="Pick your little world"
              intro="Ancient capitals, cool highland tea estates, wild national parks and palm-fringed beaches, all on one island."
            />
            <ButtonLink href="/destinations" variant="outline" className="shrink-0">
              All destinations <ArrowRight aria-hidden className="size-4" />
            </ButtonLink>
          </Reveal>
          {/* Bento: a lead card (2×2 at lg), ten small cards and a closing tile fill whole rows at 2 and 3 columns. */}
          <Reveal stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {places.map((p, i) => (
              <PlaceCard
                key={p.slug}
                place={p}
                size={i === 0 ? "lg" : "md"}
                className={cn(i === 0 && "sm:col-span-2 lg:row-span-2")}
              />
            ))}
            <div className="flex flex-col justify-between gap-6 rounded-card bg-accent p-6 text-charcoal-950 shadow-card sm:col-span-2 sm:p-8 lg:col-span-1">
              <div>
                <p className="label-caps">Can&apos;t choose?</p>
                <p className="mt-2 max-w-md font-display text-2xl leading-tight font-bold sm:text-3xl">
                  Combine several worlds into one private journey.
                </p>
              </div>
              <ButtonLink href="/plan-your-trip" variant="dark" className="self-start">
                Plan your route <ArrowRight aria-hidden className="size-4" />
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Island map: dark band, the target of the navbar's "Island Map" link. */}
      <section id="island-map" className="pb-20 sm:pb-28" aria-labelledby="explorer-title">
        <div className="container-page">
          <div className="rounded-[2rem] bg-teal-radial px-5 py-14 text-ivory-50 sm:px-10 sm:py-16">
            <SectionHeading
              id="explorer-title"
              eyebrow="Explore the island"
              title="Where will your journey take you?"
              align="center"
              tone="dark"
              className="mb-12"
            />
            <DestinationExplorer items={explorerItems} />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="pb-16 sm:pb-24" aria-labelledby="faq-title">
        <div className="container-page grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16">
          <SectionHeading
            id="faq-title"
            eyebrow="Good to know"
            title="Frequently asked questions"
            intro="If your question is not answered here, we are happy to help."
          />
          <FaqList items={faqs} />
        </div>
      </section>

      <NewsletterStrip />
    </div>
  );
}
