import type { LucideIcon } from "lucide-react";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/cn";
import { accentClasses, type Accent } from "./accents";

export interface TicketStat {
  icon: LucideIcon;
  label: string;
  value: string;
}

interface TicketCardProps {
  /** Letter-spaced label, e.g. "Safari pass". */
  pass: string;
  title: string;
  region?: string;
  stats: TicketStat[];
  /** Icon drawn on the tear-off stub. */
  stubIcon: LucideIcon;
  stubLabel?: string;
  accent?: Accent;
  as?: "h1" | "h2" | "h3" | "p";
  headingId?: string;
  className?: string;
}

/**
 * Boarding-pass style card: details on the left, a perforated tear line and
 * an illustrated stub on the right. The notches are cut with a CSS mask
 * (`ticket-perforated`), so the card keeps its soft shadow via a wrapper.
 */
export function TicketCard({
  pass,
  title,
  region,
  stats,
  stubIcon: StubIcon,
  stubLabel,
  accent = "accent",
  as: Heading = "h2",
  headingId,
  className,
}: TicketCardProps) {
  const a = accentClasses[accent];
  return (
    <div className={cn("drop-shadow-[0_14px_22px_rgb(8_37_41/0.12)]", className)}>
      <div className="ticket-perforated flex rounded-card bg-cream [--perf-x:74%]">
        <div className="min-w-0 flex-[0_0_74%] p-5 pr-4">
          <p className={cn("label-caps", a.text)}>{pass}</p>
          <Heading id={headingId} className="mt-1.5 font-display text-2xl leading-tight font-extrabold text-charcoal-900">
            {title}
          </Heading>
          {region && (
            <p className="mt-1 flex items-center gap-1 text-xs text-charcoal-600">
              <MapPin aria-hidden className="size-3.5" /> {region}
            </p>
          )}
          <dl className="mt-4 grid grid-cols-3 gap-2">
            {stats.map(({ icon: Icon, label, value }) => (
              <div key={label} className="min-w-0">
                <dt className="flex flex-col items-start gap-1 text-[0.6rem] font-semibold tracking-wider text-charcoal-500 uppercase">
                  <span className={cn("grid size-6 shrink-0 place-items-center rounded-full", a.soft)}>
                    <Icon aria-hidden className={cn("size-3.5", a.text)} />
                  </span>
                  {label}
                </dt>
                <dd className="mt-1 text-[0.8rem] leading-snug font-semibold text-charcoal-900">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="relative flex flex-1 flex-col items-center justify-center gap-2 border-l-2 border-dashed border-ivory-300 p-3">
          <span className={cn("grid size-12 place-items-center rounded-2xl", a.soft)}>
            <StubIcon aria-hidden className={cn("size-6", a.text)} strokeWidth={1.75} />
          </span>
          {stubLabel && <span className="label-caps text-center text-[0.6rem] text-charcoal-500">{stubLabel}</span>}
          {/* Barcode */}
          <span
            aria-hidden
            className="h-5 w-10 opacity-60 [background:repeating-linear-gradient(90deg,var(--color-charcoal-900)_0_1px,transparent_1px_3px,var(--color-charcoal-900)_3px_5px,transparent_5px_6px)]"
          />
        </div>
      </div>
    </div>
  );
}
