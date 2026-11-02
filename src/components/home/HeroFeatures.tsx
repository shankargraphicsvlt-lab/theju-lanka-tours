import { Headset, Map, ShieldCheck, Users } from "lucide-react";
import { cn } from "@/lib/cn";

const features = [
  { icon: Map, label: "Curated tours" },
  { icon: ShieldCheck, label: "Safe travel" },
  { icon: Users, label: "Local guides" },
  { icon: Headset, label: "24/7 support" },
];

/** Four small promises in a row under the search card; on phones the row scrolls sideways. */
export function HeroFeatures({ className }: { className?: string }) {
  return (
    <ul
      aria-label="Why travel with us"
      className={cn("-mx-6 flex snap-x gap-3 overflow-x-auto px-6 pb-1 sm:mx-0 sm:justify-between sm:overflow-visible sm:px-2", className)}
    >
      {features.map(({ icon: Icon, label }) => (
        <li key={label} className="flex shrink-0 snap-start items-center gap-2.5 text-sm font-semibold whitespace-nowrap text-text">
          <span className="grid size-10 shrink-0 place-items-center rounded-full border-2 border-gold bg-teal-800 text-gold">
            <Icon aria-hidden className="size-[1.1rem]" />
          </span>
          {label}
        </li>
      ))}
    </ul>
  );
}
