import { MAP_VIEWBOX, SRI_LANKA_PATH, project } from "@/lib/map";
import { cn } from "@/lib/cn";

export interface MapStop {
  name: string;
  coordinates: { lat: number; lng: number };
}

interface MapCardProps {
  title: string;
  stops: MapStop[];
  /** Join the stops with a dashed route line. */
  route?: boolean;
  /** Highlighted stop; defaults to the last one for a single location. */
  activeIndex?: number;
  caption?: string;
  className?: string;
}

/**
 * Mini map of Sri Lanka with pins. Pure markup (no hooks), so it renders on
 * the server and inside client components such as the itinerary progress map.
 */
export function MapCard({ title, stops, route = false, activeIndex, caption, className }: MapCardProps) {
  const points = stops.map((s) => project(s.coordinates.lat, s.coordinates.lng));
  const active = activeIndex ?? (stops.length === 1 ? 0 : -1);
  const routePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const activeStop = stops[active];

  return (
    <div className={cn("card p-4", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="label-caps text-charcoal-500">{title}</p>
        {activeStop && <p className="truncate text-xs font-semibold text-charcoal-900">{activeStop.name}</p>}
      </div>
      <svg
        viewBox={`-10 -10 ${MAP_VIEWBOX.width + 20} ${MAP_VIEWBOX.height + 20}`}
        className="mx-auto mt-2 block h-40 w-auto"
        role="img"
        aria-label={`Illustrative map of Sri Lanka showing ${stops.map((s) => s.name).join(", ")}`}
      >
        <path d={SRI_LANKA_PATH} className="fill-ivory-200 stroke-secondary/35" strokeWidth={2} />
        {route && points.length > 1 && (
          <path
            d={routePath}
            fill="none"
            strokeWidth={4}
            strokeDasharray="2 10"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-accent"
          />
        )}
        {points.map((p, i) => {
          const isActive = i === active;
          return (
            <g key={`${stops[i]!.name}-${i}`} className="transition-transform duration-300">
              {isActive && <circle cx={p.x} cy={p.y} r={18} className="fill-accent/20" />}
              <circle
                cx={p.x}
                cy={p.y}
                r={isActive ? 9 : 6}
                strokeWidth={3}
                className={cn("stroke-cream", isActive ? "fill-accent" : "fill-forest-700")}
              />
            </g>
          );
        })}
      </svg>
      {caption && <p className="mt-2 text-center text-[0.65rem] text-charcoal-500">{caption}</p>}
    </div>
  );
}
