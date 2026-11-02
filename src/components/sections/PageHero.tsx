import Image from "next/image";
import type { SiteImage } from "@/content/types";
import { cn } from "@/lib/cn";
import { Breadcrumbs, type Crumb } from "./Breadcrumbs";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  intro?: string;
  image?: SiteImage;
  /** Instead of a photo: any media (e.g. a video) in the same rounded 16:9 frame. */
  media?: React.ReactNode;
  crumbs?: Crumb[];
  size?: "md" | "lg";
  children?: React.ReactNode;
}

/** Opening block for interior pages: text on ivory, with an optional photo (or media) card beside it. */
export function PageHero({ eyebrow, title, intro, image, media, crumbs, size = "md", children }: PageHeroProps) {
  const aside = Boolean(image || media);
  return (
    <section className="container-page pt-2 pb-10 lg:pt-10 lg:pb-14">
      <div className={cn("grid items-center gap-6", aside && "lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] lg:gap-10", image && "items-stretch")}>
        <div className="flex flex-col justify-center py-4 lg:py-8">
          {crumbs && <Breadcrumbs items={crumbs} className="mb-5" />}
          {eyebrow && <p className="label-caps mb-3 animate-rise text-accent-ink">{eyebrow}</p>}
          <h1 className="max-w-4xl animate-rise text-[2.5rem] leading-[1.05] text-primary sm:text-6xl">{title}</h1>
          {intro && (
            <p className="mt-5 max-w-2xl animate-rise text-lg leading-relaxed text-charcoal-600 [animation-delay:120ms]">
              {intro}
            </p>
          )}
          {children && <div className="mt-7 animate-rise [animation-delay:220ms]">{children}</div>}
        </div>
        {media && !image && (
          <div className="relative aspect-video animate-rise overflow-hidden rounded-[2rem] bg-teal-900 shadow-card [animation-delay:120ms]">
            {media}
          </div>
        )}
        {image && (
          <div
            className={cn(
              "relative animate-rise overflow-hidden rounded-[2rem] bg-ivory-200 shadow-card [animation-delay:120ms]",
              size === "lg" ? "min-h-[22rem] lg:min-h-[30rem]" : "min-h-64 lg:min-h-[24rem]",
            )}
          >
            <Image src={image.src} alt={image.alt} fill preload fetchPriority="high" placeholder="blur" sizes="(min-width: 1280px) 600px, (min-width: 1024px) 45vw, calc(100vw - 48px)" className="object-cover" />
            <p className="absolute right-3 bottom-3 rounded-full bg-charcoal-900/60 px-2.5 py-0.5 text-[0.65rem] text-cream">
              Photo: {image.photographer} / Unsplash
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
