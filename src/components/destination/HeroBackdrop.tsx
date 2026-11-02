"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Full-bleed hero image with a slow Ken Burns zoom (CSS, motion-safe only) and
 * a subtle scroll parallax (GSAP, only when motion is allowed). The two
 * effects sit on separate wrappers so their transforms never conflict.
 */
export function HeroBackdrop({ src, alt }: { src: string; alt: string }) {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = parallaxRef.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.to(el, {
        yPercent: 10,
        ease: "none",
        scrollTrigger: { trigger: el.parentElement, start: "top top", end: "bottom top", scrub: true },
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Taller than the frame so the parallax shift never reveals an edge. */}
      <div ref={parallaxRef} className="absolute inset-x-0 -top-[6%] -bottom-[6%] will-change-transform">
        <div className="absolute inset-0 motion-safe:animate-ken-burns">
          <Image src={src} alt={alt} fill preload fetchPriority="high" sizes="100vw" className="object-cover object-center" />
        </div>
      </div>
    </div>
  );
}
