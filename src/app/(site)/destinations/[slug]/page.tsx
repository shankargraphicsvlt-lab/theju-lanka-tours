import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Car,
  Compass,
  Landmark,
  Map as MapIcon,
  Moon,
  Mountain,
  PawPrint,
  Star,
  Sun,
  TrainFront,
  Trees,
  Waves,
  type LucideIcon,
} from "lucide-react";
import { experiences } from "@/content/experiences";
import { destinationAliases, getPlace, placeForOvernight, places } from "@/content/places";
import { tours } from "@/content/tours";
import { images } from "@/content/images";
import type { Interest, Place } from "@/content/types";
import { interestOptions } from "@/lib/validation/enquiry";
import { photosForPlace, placePhoto } from "@/lib/destination-photos";
import { PhotoHero } from "@/components/destination/PhotoHero";
import { Breadcrumbs } from "@/components/sections/Breadcrumbs";
import { ExperienceCard, TourCard } from "@/components/sections/Cards";
import { ContactCta } from "@/components/sections/ContactCta";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { TicketCard } from "@/components/ui/TicketCard";
import { MapCard } from "@/components/ui/MapCard";
import { InfoCard } from "@/components/ui/InfoCard";
import { accentAt, accentClasses } from "@/components/ui/accents";
import { cn } from "@/lib/cn";
import { itineraryWording } from "@/config/site";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  const base = places.map((p) => ({ slug: p.slug }));
  const aliases = Object.keys(destinationAliases).map((slug) => ({ slug }));
  return [...base, ...aliases];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const place = getPlace(slug);
  if (!place) return {};
  const img = place.featured ? images[place.heroImage] : null;
  const hero = photosForPlace(place.slug, []).hero;
  const ogImage = img
    ? { url: img.src.src, width: img.src.width, height: img.src.height, alt: img.alt }
    : hero
      ? { url: hero, alt: place.name }
      : null;
  return {
    title: `${place.name}: ${place.tagline}`,
    description: place.summary,
    alternates: { canonical: `/destinations/${place.slug}` },
    openGraph: {
      title: place.name,
      description: place.summary,
      ...(ogImage && { images: [ogImage] }),
    },
  };
}

const passByInterest: Record<Interest, { pass: string; icon: LucideIcon }> = {
  culture: { pass: "Heritage pass", icon: Landmark },
  wildlife: { pass: "Safari pass", icon: PawPrint },
  nature: { pass: "Highland pass", icon: Mountain },
  beach: { pass: "Coast pass", icon: Waves },
  rail: { pass: "Rail pass", icon: TrainFront },
  wellness: { pass: "Slow-travel pass", icon: Sun },
  food: { pass: "Food pass", icon: Star },
};
const highlightIcons: LucideIcon[] = [Star, Compass, Trees, Sun];

/** An overnight stop at this place, by mapping (e.g. "Sigiriya area") or by exact name (standalone pages). */
function staysAt(overnight: string | null, place: Place): boolean {
  return overnight === place.name || placeForOvernight(overnight)?.slug === place.slug;
}

/** Tours whose route includes this place, as a listed destination or an overnight stop. */
function toursVisiting(place: Place) {
  return tours.filter((t) => t.destinations.includes(place.slug) || t.itinerary.some((d) => staysAt(d.overnight, place)));
}

/** "2–3 nights" across the sample routes, counted from the itineraries. */
function nightsOnRoutes(place: Place): string | null {
  const counts = tours
    .map((t) => t.itinerary.filter((d) => staysAt(d.overnight, place)).length)
    .filter((n) => n > 0);
  if (counts.length === 0) return null;
  const min = Math.min(...counts);
  const max = Math.max(...counts);
  const unit = max === 1 ? "night" : "nights";
  return min === max ? `${min} ${unit}` : `${min}–${max} ${unit}`;
}

export default async function DestinationPage({ params }: Props) {
  const { slug } = await params;
  const place = getPlace(slug);
  if (!place) notFound();

  const index = places.findIndex((p) => p.slug === place.slug);
  const neighbours = [
    { place: places[(index - 1 + places.length) % places.length]!, label: "Previous destination", Icon: ArrowLeft },
    { place: places[(index + 1) % places.length]!, label: "Next destination", Icon: ArrowRight },
  ];
  const relatedTours = toursVisiting(place);
  const relatedExperiences = experiences.filter((e) => e.destinations.includes(place.slug));
  const interestLabels = place.interests.map((i) => interestOptions.find((o) => o.value === i)?.label).filter(Boolean);
  const primary = passByInterest[place.interests[0] ?? "culture"];
  const nights = nightsOnRoutes(place);
  const photos = photosForPlace(
    place.slug,
    place.highlights.map((h) => h.title),
  );
  const crumbs = [
    { label: "Destinations", href: "/destinations" },
    { label: place.name, href: `/destinations/${place.slug}` },
  ];

  return (
    <>
      {photos.hero ? (
        <PhotoHero
          place={place}
          photos={{ ...photos, hero: photos.hero }}
          crumbs={crumbs}
          rows={[
            { icon: Moon, label: "Suggested stay", value: nights ?? "Flexible" },
            { icon: Compass, label: "Best for", value: interestLabels.join(", ") },
            {
              icon: Star,
              label: "Highlights",
              value: place.highlights
                .slice(0, 2)
                .map((h) => h.title)
                .join(" · "),
            },
            { icon: MapIcon, label: "Region", value: place.region },
          ]}
          cta={
            relatedTours.length > 0
              ? { href: "#related-tours-title", label: "View tours" }
              : { href: "#highlights-title", label: "Explore" }
          }
        />
      ) : (
      <section aria-labelledby="place-title" className="container-page pt-2 pb-14 lg:pt-8 lg:pb-20">
        <Breadcrumbs items={crumbs} />
        {/* No photo yet: the same facts as flat cards. */}
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-[22rem_minmax(0,1fr)_14rem]">
          <TicketCard
            pass={primary.pass}
            title={place.name}
            region={place.region}
            as="h1"
            headingId="place-title"
            stats={[
              { icon: Moon, label: "Stay", value: nights ?? "Flexible" },
              { icon: Star, label: "Highlight", value: place.highlights[0]?.title ?? place.name },
              { icon: Compass, label: "Best for", value: interestLabels[0] ?? "Exploring" },
            ]}
            stubIcon={primary.icon}
            stubLabel={place.region}
          />
          <div className="grid gap-4">
            <InfoCard icon={Sun} label="Best time to visit" accent="gold">
              {place.bestTime}
            </InfoCard>
            <InfoCard icon={Car} label="Getting there" accent="bright">
              {place.gettingThere}
            </InfoCard>
          </div>
          <MapCard title="Location" stops={[{ name: place.name, coordinates: place.coordinates }]} caption="Illustrative map, not to scale" />
        </div>

        <div className="mx-auto mt-10 max-w-3xl text-center lg:mt-4">
          <p className="font-display text-2xl leading-snug font-bold text-charcoal-900 sm:text-3xl">{place.tagline}</p>
          <p className="mt-3 leading-relaxed text-charcoal-600">{place.summary}</p>
        </div>
      </section>
      )}

      {/* Highlights: icon cards */}
      <section className={cn("pb-20 sm:pb-24", photos.hero && "pt-16 sm:pt-20")} aria-labelledby="highlights-title">
        <div className="container-page">
          <SectionHeading id="highlights-title" eyebrow="Highlights" title={`Don't miss in ${place.name}`} />
          <Reveal stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {place.highlights.map((h, i) => {
              const a = accentClasses[accentAt(i)];
              const Icon = highlightIcons[i % highlightIcons.length]!;
              return (
                <div key={h.title} className="card p-6">
                  <span className={cn("grid size-11 place-items-center rounded-xl", a.soft)}>
                    <Icon aria-hidden className={cn("size-5", a.text)} />
                  </span>
                  <h3 className="mt-4 text-lg leading-snug text-primary">{h.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-charcoal-600">{h.text}</p>
                </div>
              );
            })}
          </Reveal>
        </div>
      </section>

      {/* Things to do: editorial copy beside travel notes */}
      <section className="pb-20 sm:pb-24" aria-labelledby="todo-title">
        <div className="container-page grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)]">
          <div className="card p-7 sm:p-10">
            <p className="label-caps text-accent-ink">Things to do</p>
            <h2 id="todo-title" className="mt-2 text-[2rem] leading-tight text-primary">
              Getting to know {place.name}
            </h2>
            <div className="prose-editorial mt-6 text-charcoal-700">
              {place.description.map((p) => (
                <p key={p.slice(0, 32)}>{p}</p>
              ))}
            </div>
          </div>
          <aside aria-label="Travel notes" className="flex flex-col gap-4">
            <InfoCard icon={Sun} label="When to go" accent="gold">
              {place.bestTime}
            </InfoCard>
            <InfoCard icon={Car} label="Getting there" accent="bright">
              {place.gettingThere}
            </InfoCard>
            <InfoCard icon={Compass} label="Best for" accent="forest">
              {interestLabels.join(", ")}
            </InfoCard>
            <p className="px-2 text-xs leading-relaxed text-charcoal-600">
              Seasons and travel times are general guidance and can vary. We confirm current conditions when planning your
              trip.
            </p>
          </aside>
        </div>
      </section>

      {place.gallery.length > 0 && (
        <section className="pb-20 sm:pb-24" aria-label={`${place.name} photographs`}>
          <div className="container-page grid gap-4 sm:grid-cols-3">
            {place.gallery.map((key) => {
              const img = images[key];
              return (
                <figure key={key} className="card p-2.5">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[1.1rem] bg-ivory-200">
                    <Image src={img.src} alt={img.alt} fill sizes="(min-width: 640px) 33vw, 100vw" placeholder="blur" className="object-cover" />
                  </div>
                  <figcaption className="px-2 pt-2 pb-1 text-xs text-charcoal-600">
                    {img.location} · Photo: {img.photographer} / Unsplash
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </section>
      )}

      {relatedExperiences.length > 0 && (
        <section className="pb-20 sm:pb-24" aria-labelledby="related-exp-title">
          <div className="container-page">
            <SectionHeading id="related-exp-title" eyebrow="Experiences" title={`Experiences in ${place.name}`} />
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedExperiences.map((e) => (
                <ExperienceCard key={e.slug} experience={e} tone="light" />
              ))}
            </div>
          </div>
        </section>
      )}

      {relatedTours.length > 0 && (
        <section className="pb-20 sm:pb-24" aria-labelledby="related-tours-title">
          <div className="container-page">
            <SectionHeading
              id="related-tours-title"
              eyebrow={itineraryWording.journeys}
              title={`Tours including ${place.name}`}
              intro={`${relatedTours.length} of our ${itineraryWording.word} itineraries include ${place.name}.`}
            />
            <div className="mt-10 space-y-6">
              {relatedTours.map((t, i) => (
                <TourCard key={t.slug} tour={t} index={i + 1} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Back / next destination */}
      <nav aria-label="More destinations" className="container-page">
        <ul className="grid gap-4 sm:grid-cols-2">
          {neighbours.map(({ place: p, label, Icon }, i) => (
            <li key={label} className="min-w-0">
              <article className="group card relative flex items-center gap-4 p-3 pr-6">
                <PhotoFrame src={placePhoto(p.slug)} name={p.name} sizes="160px" decorative className="aspect-[4/3] w-32 shrink-0 sm:w-40" />
                <div className={cn("min-w-0 flex-1", i === 1 && "sm:text-right")}>
                  <p className="label-caps flex items-center gap-1.5 text-charcoal-500 sm:inline-flex">
                    {i === 0 && <Icon aria-hidden className="size-3.5" />}
                    {label}
                    {i === 1 && <Icon aria-hidden className="size-3.5" />}
                  </p>
                  <p className="mt-1 truncate font-display text-xl font-bold text-charcoal-900">
                    <Link href={`/destinations/${p.slug}`} className="after:absolute after:inset-0 after:rounded-card">
                      {p.name}
                    </Link>
                  </p>
                  <p className="truncate text-sm text-charcoal-600">{p.region}</p>
                </div>
              </article>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-center">
          <Link href="/destinations" className="text-sm font-semibold text-forest-700 underline-offset-4 hover:underline">
            All destinations
          </Link>
        </p>
      </nav>

      <ContactCta title={`Include ${place.name} in your journey`} />
    </>
  );
}
