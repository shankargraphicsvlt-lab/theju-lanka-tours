import { cn } from "@/lib/cn";

/**
 * Thin decorative divider echoing the waves under the logo: a green stroke
 * over a blue one. It stretches to the width of its container.
 */
export function WaveDivider({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1200 28"
      preserveAspectRatio="none"
      className={cn("block h-5 w-full sm:h-7", className)}
    >
      <path
        d="M0 15 C 180 3, 360 3, 560 11 S 940 21, 1200 6"
        fill="none"
        className="stroke-green"
        strokeWidth="2.5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M0 23 C 220 12, 420 13, 620 19 S 1000 27, 1200 13"
        fill="none"
        className="stroke-blue"
        strokeWidth="2.5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
