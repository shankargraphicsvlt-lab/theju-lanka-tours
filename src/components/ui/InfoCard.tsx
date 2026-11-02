import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { accentClasses, type Accent } from "./accents";

/** Small floating card: icon tile, caps label, short text. */
export function InfoCard({
  icon: Icon,
  label,
  children,
  accent = "forest",
  className,
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
  accent?: Accent;
  className?: string;
}) {
  const a = accentClasses[accent];
  return (
    <div className={cn("card flex gap-3 p-4", className)}>
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", a.soft)}>
        <Icon aria-hidden className={cn("size-5", a.text)} />
      </span>
      <div className="min-w-0">
        <p className="label-caps text-charcoal-500">{label}</p>
        <div className="mt-1 text-sm leading-snug text-charcoal-800">{children}</div>
      </div>
    </div>
  );
}
