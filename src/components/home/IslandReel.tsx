"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { cn } from "@/lib/cn";
import { serif } from "@/lib/fonts";
import { ButtonLink, buttonClasses } from "@/components/ui/Button";
import { VideoModal } from "@/components/ui/VideoModal";

export interface ReelScene {
  slug: string;
  name: string;
  region: string;
  tagline: string;
  facts: [string, string];
  src: string;
}

const DURATION_MS = 1400;
const AUTOPLAY_MS = 6000;
const CARD_RADIUS = 18;
/** The search card overlaps the stage bottom by 56px (page.tsx); the controls row sits above it, the card row above that. */
const CONTROLS_BOTTOM = 112;
const CONTROLS_HEIGHT = 44;
/** Matches slot(): waiting cards are at most 120px wide on small screens and 190px from lg. */
const CARD_SIZES = "(min-width: 64rem) 190px, 120px";

const mod = (n: number, m: number) => ((n % m) + m) % m;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/** Card j in the waiting row (0 = next up), in stage pixels. */
function slot(width: number, height: number, j: number) {
  // Below Tailwind's lg the copy sits at the top and the cards start at the left edge.
  const small = !window.matchMedia("(min-width: 64rem)").matches;
  const w = small ? Math.min(width * 0.28, 120) : Math.min(width * 0.13, 190);
  const h = w * 1.45;
  const gap = small ? 8 : 14;
  const x0 = small ? 24 : width * 0.5;
  // Room at the bottom for the controls and for the search card that overlaps the stage edge.
  return { x: x0 + j * (w + gap), y: height - h - CONTROLS_BOTTOM - CONTROLS_HEIGHT - 16, w, h };
}

/**
 * Homepage photo reel: the current scene fills the stage, the rest wait as a
 * row of cards, and moving on grows the next card into the full picture.
 * Navigation is by buttons, arrow keys (while focus is inside) or a
 * horizontal swipe; page scrolling is never captured. Autoplay pauses on
 * hover, focus, when off screen or on request, and is off for reduced motion,
 * where scenes change without animation.
 */
export function IslandReel({ scenes, title }: { scenes: ReelScene[]; title: string }) {
  const count = scenes.length;
  const stageRef = useRef<HTMLDivElement>(null);
  const sceneRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [shown, setShown] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inView, setInView] = useState(true);
  const [storyOpen, setStoryOpen] = useState(false);
  // Waiting cards load card-sized photos; a scene switches to the full-size photo while it is next up,
  // so it is ready before it grows. Only the first scene loads full size before the page has loaded.
  const [fullSize, setFullSize] = useState<ReadonlySet<number>>(() => new Set([0]));

  // The animation runs outside React: one effect owns the frame loop and hands out `step`.
  const step = useRef<(steps: number) => void>(() => {});

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let pos = 0;
    let target = 0;
    let anim: { from: number; to: number; start: number; duration: number } | null = null;
    let frame = 0;
    let reducedMotion = false;

    const draw = () => {
      const W = stage.clientWidth;
      const H = stage.clientHeight;
      const base = Math.floor(pos + 1e-6);
      const f = Math.max(0, pos - base);

      sceneRefs.current.forEach((el, i) => {
        if (!el) return;
        const rel = mod(i - base, count);
        let r = { x: 0, y: 0, w: W, h: H };
        let radius = 0;
        let opacity = 1;
        let shade = 1;
        let z = 1;
        let card = false;
        if (rel === 1) {
          const c = slot(W, H, 0);
          r = { x: lerp(c.x, 0, f), y: lerp(c.y, 0, f), w: lerp(c.w, W, f), h: lerp(c.h, H, f) };
          radius = lerp(CARD_RADIUS, 0, f);
          shade = f;
          z = 20;
          card = f < 0.2;
        } else if (rel > 1) {
          const a = slot(W, H, rel - 1);
          const b = slot(W, H, rel - 2);
          r = { x: lerp(a.x, b.x, f), y: a.y, w: a.w, h: a.h };
          radius = CARD_RADIUS;
          // The scene that was full a moment ago rejoins the end of the row.
          opacity = rel === count - 1 ? f : 1;
          shade = 0;
          z = 20 + rel;
          card = true;
        }
        el.style.transform = `translate(${r.x}px, ${r.y}px)`;
        el.style.width = `${r.w}px`;
        el.style.height = `${r.h}px`;
        el.style.borderRadius = `${radius}px`;
        el.style.opacity = String(opacity);
        el.style.zIndex = String(z);
        el.style.boxShadow = radius > 1 ? "0 18px 40px rgb(0 0 0 / 0.45)" : "none";
        el.style.setProperty("--shade", String(shade));
        el.dataset.card = String(card);
        el.dataset.rel = String(rel);
      });

      setShown(mod(f > 0.55 ? base + 1 : base, count));
    };

    const tick = (now: number) => {
      if (anim) {
        const t = Math.min((now - anim.start) / anim.duration, 1);
        pos = lerp(anim.from, anim.to, easeInOut(t));
        if (t >= 1) anim = null;
      }
      draw();
      frame = anim ? requestAnimationFrame(tick) : 0;
    };

    step.current = (steps) => {
      // Keep at most one lap queued, however fast the clicks come.
      target = Math.max(pos - count + 1, Math.min(pos + count - 1, target + steps));
      if (reducedMotion) {
        anim = null;
        pos = target;
        draw();
        return;
      }
      const distance = Math.abs(target - pos);
      anim = { from: pos, to: target, start: performance.now(), duration: DURATION_MS * Math.sqrt(Math.max(distance, 0.5)) };
      if (!frame) frame = requestAnimationFrame(tick);
    };

    draw();
    const resize = new ResizeObserver(draw);
    resize.observe(stage);
    const visible = new IntersectionObserver(([entry]) => setInView(entry?.isIntersecting ?? true), { threshold: 0.25 });
    visible.observe(stage);
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => {
      reducedMotion = motion.matches;
      setReduced(motion.matches);
    };
    syncMotion();
    motion.addEventListener("change", syncMotion);
    return () => {
      resize.disconnect();
      visible.disconnect();
      motion.removeEventListener("change", syncMotion);
      cancelAnimationFrame(frame);
      step.current = () => {};
    };
  }, [count]);

  useEffect(() => {
    const next = mod(shown + 1, count);
    const promote = () =>
      setFullSize((prev) => (prev.has(shown) && prev.has(next) ? prev : new Set([...prev, shown, next])));
    if (document.readyState === "complete") return promote();
    window.addEventListener("load", promote, { once: true });
    return () => window.removeEventListener("load", promote);
  }, [shown, count]);

  const autoplay = !reduced && !paused && !hovering && !focused && inView && !storyOpen;
  useEffect(() => {
    if (!autoplay) return;
    const id = window.setInterval(() => step.current(1), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [autoplay]);

  const touch = useRef<{ x: number; y: number } | null>(null);
  const scene = scenes[shown];
  if (!scene) return null;

  return (
    <section
      aria-labelledby="hero-title"
      aria-roledescription="carousel"
      className={serif.variable}
      onKeyDown={(e) => {
        // Keys inside the story video (rendered in a portal) still bubble here; leave them to the player.
        if (storyOpen) return;
        if (e.key === "ArrowRight") step.current(1);
        else if (e.key === "ArrowLeft") step.current(-1);
      }}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
      }}
    >
      {/* Full-bleed: edge to edge, filling the screen below the announcement bar and navbar. */}
      <div
        ref={stageRef}
        className="relative isolate h-[max(720px,100svh)] overflow-hidden bg-teal-radial text-cream"
        onPointerEnter={(e) => e.pointerType === "mouse" && setHovering(true)}
        onPointerLeave={(e) => e.pointerType === "mouse" && setHovering(false)}
        onTouchStart={(e) => {
          const t = e.touches[0];
          touch.current = t ? { x: t.clientX, y: t.clientY } : null;
        }}
        onTouchEnd={(e) => {
          const t = e.changedTouches[0];
          if (!touch.current || !t) return;
          const dx = t.clientX - touch.current.x;
          const dy = t.clientY - touch.current.y;
          touch.current = null;
          if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) step.current(dx < 0 ? 1 : -1);
        }}
      >
        {scenes.map((s, i) => (
          <div
            key={s.slug}
            ref={(el) => {
              sceneRefs.current[i] = el;
            }}
            className="group absolute top-0 left-0 overflow-hidden will-change-transform"
            style={i === 0 ? { width: "100%", height: "100%" } : { opacity: 0 }}
          >
            <Image
              src={s.src}
              alt={i === shown ? s.name : ""}
              fill
              preload={i === 0}
              fetchPriority={i === 0 ? "high" : undefined}
              loading={i === 0 ? undefined : "lazy"}
              sizes={fullSize.has(i) ? "100vw" : CARD_SIZES}
              className="object-cover"
            />
            {/* Legibility wash, faded in as the scene becomes the full picture. */}
            <div aria-hidden className="absolute inset-0 opacity-(--shade)">
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,35,29,.78)_0%,rgba(20,35,29,.45)_40%,rgba(20,35,29,0)_70%)]" />
              <div className="absolute inset-x-0 bottom-0 h-[35%] bg-[linear-gradient(0deg,rgba(20,35,29,.55),transparent)]" />
            </div>
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-charcoal-950/70 to-transparent opacity-0 transition-opacity group-data-[card=true]:opacity-100" />
            {/* Mouse shortcut only; the arrow buttons give the same control to everyone. */}
            <button
              type="button"
              tabIndex={-1}
              aria-hidden
              onClick={(e) => step.current(Number(e.currentTarget.parentElement?.dataset.rel ?? 0))}
              className="pointer-events-none absolute inset-0 flex cursor-pointer items-end p-3 text-left font-serif text-lg leading-none font-semibold opacity-0 transition-opacity group-data-[card=true]:pointer-events-auto group-data-[card=true]:opacity-100"
            >
              {s.name}
            </button>
          </div>
        ))}

        <div className="pointer-events-none absolute inset-x-6 top-6 z-40 sm:top-10 lg:inset-x-auto lg:top-auto lg:bottom-56 lg:left-[max(24px,calc((100%-1280px)/2+24px))] lg:max-w-[min(36rem,calc(50%-5rem))]">
          {/* The page's h1, kept for screen readers and search engines; the scene name is the visible headline. */}
          <h1 id="hero-title" className="sr-only">
            {title}
          </h1>
          <div key={shown} aria-live={autoplay ? "off" : "polite"} className="motion-safe:animate-rise">
            <p className="label-caps text-gold-300">{scene.region}</p>
            <h2 className="mt-2 line-clamp-2 font-serif text-5xl leading-[0.92] font-bold tracking-normal text-balance sm:text-6xl lg:text-[5.5rem]">
              {scene.name}
            </h2>
            <p className={cn("mt-3 max-w-[38ch] text-sm leading-relaxed sm:mt-4 sm:text-base", heroText)}>{scene.tagline}</p>
            <p className={cn("mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs tabular-nums sm:mt-4 sm:text-sm", heroText)}>
              {scene.facts.map((fact) => (
                <span key={fact} className="hidden sm:inline">
                  {fact}
                </span>
              ))}
              <Link
                href={`/destinations/${scene.slug}`}
                className="pointer-events-auto font-semibold text-cream underline decoration-cream/40 underline-offset-4 hover:decoration-cream"
              >
                Discover {scene.name}
              </Link>
            </p>
          </div>
          <div className="pointer-events-auto mt-5 flex flex-wrap items-center gap-3 sm:mt-7">
            <ButtonLink href="/plan-your-trip">
              Plan your journey <ArrowRight aria-hidden className="size-4" />
            </ButtonLink>
            <button type="button" onClick={() => setStoryOpen(true)} className={buttonClasses("outline-light")}>
              <span className="grid size-6 place-items-center rounded-full bg-cream text-charcoal-950">
                <Play aria-hidden className="size-3 fill-current" />
              </span>
              Watch our story
            </button>
          </div>
        </div>

        {/* Gold frame around the slider. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-50 border-[3px] border-gold" />

        {/* Arrows, pause and counter on one line, clear of the search card below. */}
        <div
          className="absolute inset-x-6 z-40 flex items-center gap-2 lg:right-[max(24px,calc((100%-1280px)/2+24px))] lg:left-1/2"
          style={{ bottom: CONTROLS_BOTTOM, height: CONTROLS_HEIGHT }}
        >
          <button type="button" aria-label="Previous destination" onClick={() => step.current(-1)} className={controlClasses}>
            <ArrowLeft aria-hidden className="size-4" />
          </button>
          <button type="button" aria-label="Next destination" onClick={() => step.current(1)} className={controlClasses}>
            <ArrowRight aria-hidden className="size-4" />
          </button>
          {!reduced && (
            <button
              type="button"
              aria-label={paused ? "Play slideshow" : "Pause slideshow"}
              aria-pressed={paused}
              onClick={() => setPaused((p) => !p)}
              className={controlClasses}
            >
              {paused ? <Play aria-hidden className="size-4" /> : <Pause aria-hidden className="size-4" />}
            </button>
          )}
          <p className="ml-auto font-serif text-3xl leading-none font-semibold lining-nums tabular-nums drop-shadow-[0_2px_8px_rgb(0_0_0/0.55)] sm:text-4xl">
            <span className="sr-only">Destination </span>
            {String(shown + 1).padStart(2, "0")}
            <span className="text-cream/70">
              <span className="sr-only"> of</span> / {String(count).padStart(2, "0")}
            </span>
          </p>
        </div>
      </div>
      <VideoModal open={storyOpen} onClose={() => setStoryOpen(false)} />
    </section>
  );
}

const heroText = "text-ivory-50/90 [text-shadow:0_1px_12px_rgba(0,0,0,.45)]";

const controlClasses =
  "grid size-11 place-items-center rounded-full border border-cream/30 bg-charcoal-950/35 text-cream backdrop-blur-sm transition-colors hover:bg-charcoal-950/60";
