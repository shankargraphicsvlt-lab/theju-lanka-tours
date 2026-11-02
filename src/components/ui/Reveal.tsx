"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/cn";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Animate direct children one after another instead of the wrapper as a whole. */
  stagger?: boolean;
}

/**
 * Fades content up as it scrolls into view. Content is fully visible in the
 * server-rendered HTML; the animation is only applied after hydration, only
 * for elements still below the fold, and never when reduced motion is preferred.
 */
export function Reveal({ children, className, stagger = false }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Skip anything already on screen to avoid a visible flash on load.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;

    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const targets = stagger ? Array.from(el.children) : el;
      gsap.from(targets, {
        autoAlpha: 0,
        y: 28,
        duration: 0.9,
        ease: "power2.out",
        stagger: stagger ? 0.12 : 0,
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
    });
    return () => mm.revert();
  }, [stagger]);

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
