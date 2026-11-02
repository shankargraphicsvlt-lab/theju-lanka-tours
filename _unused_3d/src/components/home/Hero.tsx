import { ArrowRight, CalendarDays, Compass, MapPinned, Plane, Sun } from "lucide-react";
import { getTour } from "@/content/tours";
import { places } from "@/content/places";
import { getDiorama, getDioramaFx } from "@/lib/dioramas";
import { routeStops } from "@/lib/route";
import { ButtonLink } from "@/components/ui/Button";
import { DioramaLayer, DioramaScene } from "@/components/diorama/DioramaScene";
import { TicketCard } from "@/components/ui/TicketCard";
import { MapCard } from "@/components/ui/MapCard";
import { InfoCard } from "@/components/ui/InfoCard";

const ROUTE_TOUR = "classic-sri-lanka";

/** Greeting plus the island diorama with its ticket, route map and best-time cards. */
export function Hero() {
  const routeTour = getTour(ROUTE_TOUR);
  const stops = routeTour ? routeStops(routeTour) : [];

  return (
    <section aria-labelledby="hero-title" className="container-page pt-2 pb-14 lg:pt-10 lg:pb-20">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="animate-rise text-base font-semibold text-charcoal-600 sm:text-lg">
            Ayubowan, Explorer{" "}
            <span role="img" aria-label="waving hand">
              👋
            </span>
          </p>
          <h1
            id="hero-title"
            className="mt-2 animate-rise text-[2.5rem] leading-[1.04] text-charcoal-900 [animation-delay:80ms] sm:text-6xl xl:text-[4.25rem]"
          >
            Ready for your <span className="whitespace-nowrap text-forest-700">Sri Lanka</span> adventure?
          </h1>
          <p className="mt-4 max-w-xl animate-rise leading-relaxed text-charcoal-600 [animation-delay:160ms]">
            Ancient rock fortresses, misty tea country, leopards in the wild and quiet southern bays, woven into a
            private itinerary that moves at your pace.
          </p>
        </div>
        <div className="flex animate-rise flex-col gap-3 [animation-delay:240ms] sm:flex-row lg:shrink-0">
          <ButtonLink href="/plan-your-trip" size="lg">
            Plan your journey <ArrowRight aria-hidden className="size-4" />
          </ButtonLink>
          <ButtonLink href="/tours" variant="outline" size="lg">
            Explore sample tours
          </ButtonLink>
        </div>
      </div>

      <DioramaScene
        diorama={getDiorama("hero", "Sri Lanka")}
        fx={getDioramaFx()}
        sizes="(min-width: 1024px) 60vw, 100vw"
        priority
        className="mt-8 lg:mt-4 lg:min-h-[36rem]"
        artClassName="mx-auto max-w-[46rem] lg:w-[62%] lg:pt-6"
      >
        <DioramaLayer depth={2} order={0} className="lg:top-[10%] lg:left-0 lg:w-[21rem]">
          <TicketCard
            pass="Island pass"
            title="Sri Lanka"
            region="Indian Ocean"
            as="h2"
            stats={[
              { icon: CalendarDays, label: "Days", value: "5–15" },
              { icon: MapPinned, label: "Stops", value: `${places.length} places` },
              { icon: Compass, label: "Style", value: "Private" },
            ]}
            stubIcon={Plane}
            stubLabel="CMB"
          />
        </DioramaLayer>
        <DioramaLayer depth={3} order={1} className="lg:top-0 lg:right-0 lg:w-56">
          <MapCard title="Classic route" stops={stops} route caption="Sample route, illustrative map" />
        </DioramaLayer>
        <DioramaLayer depth={1.5} order={2} className="lg:bottom-[6%] lg:left-[3%] lg:w-[19rem] sm:col-span-2 lg:col-span-1">
          <InfoCard icon={Sun} label="Best time to visit" accent="gold">
            <strong className="font-semibold">Dec–Apr</strong> for the west and south coasts;{" "}
            <strong className="font-semibold">Feb–Sep</strong> is generally driest in the Cultural Triangle.
          </InfoCard>
        </DioramaLayer>
      </DioramaScene>
    </section>
  );
}
