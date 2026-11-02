"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { Diorama, DioramaFx } from "@/content/dioramas";
import { cn } from "@/lib/cn";
import { DioramaArt } from "./DioramaArt";

const MAX_TILT_DEG = 8;
/** Fraction of the remaining distance covered per frame: a soft spring. */
const EASE = 0.085;

interface DioramaSceneProps {
  diorama: Diorama;
  fx?: DioramaFx;
  sizes: string;
  priority?: boolean;
  transitionName?: string;
  /** Floating cards: wrap each in <DioramaLayer>. */
  children?: React.ReactNode;
  className?: string;
  artClassName?: string;
}

/**
 * The 3D feel: the diorama tilts towards the pointer (or device tilt on
 * phones) inside a CSS perspective, while floating cards drift at their own
 * depth. Pointer position is published as --mx / --my in [-1, 1]; layers read
 * those variables, so nothing re-renders while moving. With reduced motion
 * nothing is attached and the layout is static.
 *
 * Below `lg` the cards sit in a grid under the diorama; from `lg` they float
 * over it (the grid uses `lg:contents`, so the layers' own absolute positions
 * take over).
 */
export function DioramaScene({
  diorama,
  fx,
  sizes,
  priority,
  transitionName,
  children,
  className,
  artClassName,
}: DioramaSceneProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let frame = 0;

    const tick = () => {
      current.x += (target.x - current.x) * EASE;
      current.y += (target.y - current.y) * EASE;
      root.style.setProperty("--mx", current.x.toFixed(4));
      root.style.setProperty("--my", current.y.toFixed(4));
      const settled = Math.abs(target.x - current.x) < 0.001 && Math.abs(target.y - current.y) < 0.001;
      frame = settled ? 0 : requestAnimationFrame(tick);
    };
    const aim = (x: number, y: number) => {
      target.x = Math.max(-1, Math.min(1, x));
      target.y = Math.max(-1, Math.min(1, y));
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const rect = root.getBoundingClientRect();
      aim(((event.clientX - rect.left) / rect.width) * 2 - 1, ((event.clientY - rect.top) / rect.height) * 2 - 1);
    };
    const onPointerLeave = () => aim(0, 0);
    // Android reports orientation without a permission prompt; iOS needs one, so it simply stays still.
    const onOrientation = (event: DeviceOrientationEvent) => {
      if (event.gamma === null || event.beta === null) return;
      aim(event.gamma / 25, (event.beta - 45) / 25);
    };

    const coarse = window.matchMedia("(pointer: coarse)").matches;
    root.addEventListener("pointermove", onPointerMove, { passive: true });
    root.addEventListener("pointerleave", onPointerLeave);
    if (coarse) window.addEventListener("deviceorientation", onOrientation);
    return () => {
      cancelAnimationFrame(frame);
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("deviceorientation", onOrientation);
    };
  }, []);

  return (
    <div ref={rootRef} className={cn("relative [--mx:0] [--my:0]", className)}>
      <div className={cn("relative isolate [perspective:1200px]", artClassName)}>
        {fx?.clouds && (
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1/2 animate-drift opacity-80">
            <Image src={fx.clouds} alt="" fill sizes={sizes} className="object-contain" />
          </div>
        )}
        <div
          className="transition-transform duration-75 [transform-style:preserve-3d]"
          style={{
            transform: `rotateX(calc(var(--my) * ${-MAX_TILT_DEG}deg)) rotateY(calc(var(--mx) * ${MAX_TILT_DEG}deg))`,
          }}
        >
          <div className="animate-bob">
            <DioramaArt diorama={diorama} sizes={sizes} priority={priority} transitionName={transitionName} />
          </div>
        </div>
        {/* Shadow shifts against the tilt, as if lit from above. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-[18%] bottom-[2%] -z-10 h-[8%] rounded-[50%] bg-soil/20 blur-xl"
          style={{ transform: "translate(calc(var(--mx) * -18px), calc(var(--my) * -6px))" }}
        />
        {fx?.birds && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-[10%] top-[4%] h-1/4"
            style={{ transform: "translate3d(calc(var(--mx) * -26px), calc(var(--my) * -14px), 0)" }}
          >
            <Image src={fx.birds} alt="" fill sizes={sizes} className="object-contain" />
          </div>
        )}
      </div>
      {children && <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:contents">{children}</div>}
    </div>
  );
}

/**
 * A floating card at a given parallax depth (1 = subtle, 3 = strong).
 * `order` staggers the entry animation.
 */
export function DioramaLayer({
  depth = 1,
  order = 0,
  className,
  children,
}: {
  depth?: number;
  order?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const px = depth * 9;
  return (
    <div
      className={cn("animate-rise lg:absolute lg:z-10", className)}
      style={{ animationDelay: `${150 + order * 120}ms` }}
    >
      <div style={{ transform: `translate3d(calc(var(--mx) * ${-px}px), calc(var(--my) * ${-px}px), 0)` }}>
        {children}
      </div>
    </div>
  );
}
