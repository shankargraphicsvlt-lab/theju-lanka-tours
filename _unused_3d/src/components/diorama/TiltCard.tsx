"use client";

import { useRef } from "react";
import { cn } from "@/lib/cn";

const MAX_TILT_DEG = 5;

/**
 * Subtle hover tilt for cards. Mouse only; touch and reduced-motion users get
 * the static card (the transform transition is disabled globally for them).
 */
export function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = el.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    el.style.transform = `perspective(900px) rotateX(${(-y * MAX_TILT_DEG).toFixed(2)}deg) rotateY(${(x * MAX_TILT_DEG).toFixed(2)}deg) translateY(-4px)`;
  };
  const reset = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      className={cn("transition-transform duration-300 ease-out will-change-transform", className)}
    >
      {children}
    </div>
  );
}
