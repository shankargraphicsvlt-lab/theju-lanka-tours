import Image from "next/image";
import { CalendarCheck, FileText, Route, ShieldCheck } from "lucide-react";
import { images } from "@/content/images";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { accentAt, accentClasses } from "@/components/ui/accents";
import { cn } from "@/lib/cn";
import { siteConfig } from "@/config/site";

/**
 * Trust section built on commitments the planning process itself enforces,
 * not on unverified claims such as customer counts, awards or ratings.
 */
const commitments = [
  {
    icon: Route,
    title: "Private by design",
    text: "Every journey is planned for your group alone, with your own vehicle and a pace you choose.",
  },
  {
    icon: FileText,
    title: "Clear, written quotations",
    text: "You receive an itemised quotation explaining exactly what is and is not included before anything is booked.",
  },
  {
    icon: ShieldCheck,
    title: "Nothing confirmed without you",
    text: "An enquiry is never treated as a booking. Your trip is confirmed only after you accept the quotation.",
  },
  {
    icon: CalendarCheck,
    title: "Planned around the seasons",
    text: "Routes follow Sri Lanka's two monsoons, park closures and festival dates so each place is seen at its best.",
  },
];

/** Bento of commitment cards around a photo card. */
export function Approach() {
  const img = images.teaPlucking;
  return (
    <section aria-labelledby="approach-title" className="py-4">
      <div className="container-page grid gap-4 lg:grid-cols-12">
        <Reveal className="card flex flex-col justify-between p-7 sm:p-10 lg:col-span-7">
          <div>
            <p className="label-caps text-accent-ink">Our approach</p>
            <h2 id="approach-title" className="mt-3 text-[2rem] leading-tight text-primary sm:text-[2.6rem]">
              Travel planned the way you would plan it yourself, with local knowledge.
            </h2>
            <p className="mt-5 max-w-xl leading-relaxed text-charcoal-600">
              {siteConfig.name} designs private journeys around the things that matter to you, whether that is
              climbing Sigiriya at first light, a slow train through tea country or a week of doing very little by
              the sea.
            </p>
          </div>
          <ButtonLink href="/about" variant="outline" className="mt-8 self-start">
            About {siteConfig.name}
          </ButtonLink>
        </Reveal>
        <div className="relative min-h-72 overflow-hidden rounded-card shadow-card lg:col-span-5">
          <Image src={img.src} alt={img.alt} fill sizes="(min-width: 1024px) 40vw, 100vw" placeholder="blur" className="object-cover" />
          <p className="absolute right-3 bottom-2 rounded-full bg-charcoal-900/60 px-2 py-0.5 text-[0.65rem] text-cream">
            Photo: {img.photographer} / Unsplash
          </p>
        </div>
        <Reveal stagger className="grid gap-4 sm:grid-cols-2 lg:col-span-12 lg:grid-cols-4">
          {commitments.map(({ icon: Icon, title, text }, i) => {
            const a = accentClasses[accentAt(i)];
            return (
              <div key={title} className="card p-6">
                <span className={cn("grid size-11 place-items-center rounded-xl", a.soft)}>
                  <Icon aria-hidden className={cn("size-5", a.text)} />
                </span>
                <h3 className="mt-4 text-base text-primary">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-charcoal-600">{text}</p>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
