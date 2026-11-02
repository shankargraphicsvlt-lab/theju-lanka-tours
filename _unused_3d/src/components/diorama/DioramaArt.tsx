import Image from "next/image";
import type { Diorama } from "@/content/dioramas";
import { cn } from "@/lib/cn";

interface DioramaArtProps {
  diorama: Diorama;
  sizes: string;
  priority?: boolean;
  /** Decorative when the surrounding card already names the place. */
  decorative?: boolean;
  className?: string;
  /** Marks the element that morphs into the destination hero (see TransitionLink). */
  transitionName?: string;
}

/**
 * A diorama image on its own soft shadow, or, until the artwork is supplied,
 * an ivory terrain plinth carrying the place name. Never a stand-in photo.
 */
export function DioramaArt({ diorama, sizes, priority = false, decorative = false, className, transitionName }: DioramaArtProps) {
  return (
    <div
      data-diorama
      className={cn("relative aspect-[4/3] w-full", className)}
      style={transitionName ? { viewTransitionName: transitionName } : undefined}
    >
      {diorama.src ? (
        <Image
          src={diorama.src}
          alt={decorative ? "" : `Miniature diorama of ${diorama.label}`}
          fill
          sizes={sizes}
          preload={priority}
          className="object-contain drop-shadow-[0_28px_24px_rgb(70_45_20/0.28)]"
        />
      ) : (
        <DioramaPlaceholder label={diorama.label} decorative={decorative} />
      )}
    </div>
  );
}

function DioramaPlaceholder({ label, decorative }: { label: string; decorative: boolean }) {
  return (
    <div
      className="absolute inset-0"
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : `${label} (illustration to come)`}
      aria-hidden={decorative || undefined}
    >
      <svg viewBox="0 0 400 300" className="absolute inset-0 size-full" aria-hidden>
        {/* Ground shadow */}
        <ellipse cx="200" cy="264" rx="120" ry="10" className="fill-soil/10" />
        {/* Soil edge */}
        <path d="M40 146 v34 a160 66 0 0 0 320 0 v-34 Z" className="fill-soil" />
        <path d="M40 166 a160 66 0 0 0 320 0 v14 a160 66 0 0 1 -320 0 Z" className="fill-soil-700/55" />
        <ellipse cx="200" cy="152" rx="160" ry="66" className="fill-forest-600" />
        {/* Terrain top */}
        <ellipse cx="200" cy="146" rx="160" ry="66" className="fill-ivory-200" />
        <ellipse cx="200" cy="146" rx="118" ry="46" fill="none" strokeWidth="1.5" strokeDasharray="3 7" className="stroke-soil/30" />
        <ellipse cx="200" cy="146" rx="70" ry="26" fill="none" strokeWidth="1.5" strokeDasharray="3 7" className="stroke-soil/25" />
      </svg>
      <span className="absolute top-[45%] left-1/2 max-w-[80%] -translate-x-1/2 -translate-y-1/2 truncate rounded-full bg-cream px-3.5 py-1.5 text-center font-display text-sm font-bold text-forest-900 shadow-float">
        {label}
      </span>
    </div>
  );
}
