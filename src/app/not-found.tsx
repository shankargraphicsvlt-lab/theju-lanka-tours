import type { Metadata } from "next";
import { heroFor } from "@/lib/destination-photos";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ButtonLink } from "@/components/ui/Button";
import { PhotoFrame } from "@/components/ui/PhotoFrame";

export const metadata: Metadata = {
  title: "Page not found",
  description: "Sorry, this page doesn't exist or has moved. Explore private Sri Lanka tours and destinations with GSKT Lanka Tours.",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <div>
        <main id="main" className="container-page flex min-h-[80svh] items-center py-10">
          <div className="mx-auto max-w-2xl text-center">
            <PhotoFrame
              src={heroFor("nuwara-eliya")}
              name="Nuwara Eliya"
              sizes="384px"
              decorative
              className="mx-auto aspect-[4/3] max-w-sm rounded-[1.5rem]"
            />
            <p className="label-caps mt-6 text-accent-ink">404</p>
            <h1 className="mt-3 text-[2.5rem] leading-tight text-primary sm:text-6xl">This path leads off the map</h1>
            <p className="mt-5 leading-relaxed text-charcoal-600">
              The page you were looking for doesn&rsquo;t exist or has moved. Let us take you somewhere beautiful instead.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink href="/" size="lg">
                Back to home
              </ButtonLink>
              <ButtonLink href="/destinations" variant="outline" size="lg">
                Explore destinations
              </ButtonLink>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
