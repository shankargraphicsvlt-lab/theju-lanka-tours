import { Users } from "lucide-react";
import { basisLabel, pricingDisclosure } from "@/config/pricing";
import type { TourPriceBreakdown } from "@/lib/pricing";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/cn";

/** "For 2 people" badge shown with every price. */
export function GroupBadge({ price, tone = "light" }: { price: TourPriceBreakdown; tone?: "light" | "dark" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold",
        tone === "dark" ? "bg-gold-300 text-forest-950" : "bg-gold-300/40 text-forest-900",
      )}
    >
      <Users aria-hidden className="size-3.5" />
      {basisLabel(price).short}
    </span>
  );
}

/** Compact price for cards: final price, who it covers, original struck through, discount badge. */
export function PriceSummary({ price, className }: { price: TourPriceBreakdown; className?: string }) {
  const money = (cents: number) => formatMoney(cents, price.currency);
  const hasDiscount = price.discountCents > 0;
  return (
    <div className={className}>
      <p className="text-xs text-charcoal-600">Tour price, {price.days}-day package</p>
      <p className="mt-0.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-display text-3xl text-forest-900">{money(price.totalCents)}</span>
        <GroupBadge price={price} />
        {hasDiscount && (
          <>
            <s className="text-sm text-charcoal-500">
              <span className="sr-only">Original price </span>
              {money(price.baseCents)}
            </s>
            <span className="rounded-full bg-discount px-2 py-0.5 text-xs font-semibold text-discount-ink">
              {price.discountPercent}% off
            </span>
          </>
        )}
      </p>
      {price.basis === "per-group" && (
        <>
          <p className="mt-1 text-[0.8125rem] font-medium text-primary">
            ≈ {money(Math.round(price.totalCents / price.groupSize))} per person
          </p>
          <p className="mt-1 text-xs text-charcoal-600">Total for the group, not per person. Other group sizes: custom quote.</p>
        </>
      )}
    </div>
  );
}

/** Full itemised breakdown: base, discount, discounted price, extras and total. */
export function PriceBreakdown({
  price,
  tone = "light",
  showDisclosure = true,
  className,
}: {
  price: TourPriceBreakdown;
  tone?: "light" | "dark";
  showDisclosure?: boolean;
  className?: string;
}) {
  const money = (cents: number) => formatMoney(cents, price.currency);
  const dark = tone === "dark";
  const muted = dark ? "text-ivory-100/70" : "text-charcoal-600";
  const strong = dark ? "text-ivory-50" : "text-forest-900";
  const rule = dark ? "border-ivory-50/15" : "border-ivory-300";
  const perGroup = price.basis === "per-group";

  return (
    <div className={className}>
      <GroupBadge price={price} tone={tone} />
      <dl className="mt-4 space-y-2.5 text-sm">
        <div className="flex justify-between gap-4">
          <dt className={muted}>
            Original price
            <span className="block text-xs">
              {price.days} package {price.days === 1 ? "day" : "days"} × {money(price.dailyRateCents)}
              {perGroup && ` (group rate for ${price.groupSize})`}
            </span>
          </dt>
          <dd className={cn("tabular-nums", muted, price.discountCents > 0 && "line-through")}>{money(price.baseCents)}</dd>
        </div>
        {price.discountCents > 0 && (
          <div className="flex justify-between gap-4">
            <dt className={dark ? "text-gold-300" : "text-forest-700"}>Discount ({price.discountPercent}%)</dt>
            <dd className={cn("tabular-nums", dark ? "text-gold-300" : "text-forest-700")}>
              −{money(price.discountCents)}
            </dd>
          </div>
        )}
        {price.additionalCharges.length > 0 && (
          <>
            <div className={cn("flex justify-between gap-4 border-t pt-2.5", rule)}>
              <dt className={muted}>Discounted tour price</dt>
              <dd className={cn("tabular-nums", muted)}>{money(price.discountedTourCents)}</dd>
            </div>
            {price.additionalCharges.map((c) => (
              <div key={c.label} className="flex justify-between gap-4">
                <dt className={muted}>+ {c.label}</dt>
                <dd className={cn("tabular-nums", muted)}>{money(c.amountCents)}</dd>
              </div>
            ))}
          </>
        )}
        <div className={cn("flex items-baseline justify-between gap-4 border-t pt-3", rule)}>
          <dt className={cn("font-semibold", strong)}>
            {price.additionalCharges.length > 0 ? "Total" : "Discounted price"}
            {perGroup && <span className={cn("block text-xs font-normal", muted)}>{basisLabel(price).short}</span>}
          </dt>
          <dd className={cn("font-display text-4xl tabular-nums", strong)}>{money(price.totalCents)}</dd>
        </div>
      </dl>
      {price.discountCents > 0 && (
        <p className={cn("mt-1 text-right text-xs", muted)}>
          Equivalent to {money(price.discountedDailyRateCents)} per day{perGroup && ` for ${price.groupSize} people`}
        </p>
      )}
      <p className={cn("mt-4 text-xs leading-relaxed", dark ? "text-gold-300" : "text-gold-700")}>{basisLabel(price).long}</p>
      {showDisclosure && <p className={cn("mt-2 text-xs leading-relaxed", muted)}>{pricingDisclosure}</p>}
    </div>
  );
}
