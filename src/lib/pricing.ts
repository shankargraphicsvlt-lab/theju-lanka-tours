import { pricingConfig, type PricingConfig } from "@/config/pricing";
import { daysBetween, isIsoDate } from "@/lib/dates";

export const MAX_PRICED_DAYS = 61;

export interface PriceLine {
  label: string;
  amountCents: number;
}

export interface TourPriceBreakdown {
  days: number;
  currency: PricingConfig["currency"];
  basis: PricingConfig["basis"];
  /** Party size the price covers (per-group basis). The price is the group total. */
  groupSize: number;
  dailyRateCents: number;
  discountPercent: number;
  /** days × daily rate */
  baseCents: number;
  /** discountPercent of the base price */
  discountCents: number;
  /** base − discount */
  discountedTourCents: number;
  /** daily rate after discount, for display ("USD 55.25 per day") */
  discountedDailyRateCents: number;
  /** configured extras, each disclosed as its own line */
  additionalCharges: PriceLine[];
  /** discounted tour price + additional charges */
  totalCents: number;
}

function percentOf(cents: number, percent: number): number {
  return Math.round((cents * percent) / 100);
}

export function assertValidConfig(config: PricingConfig): void {
  if (!Number.isInteger(config.dailyRateCents) || config.dailyRateCents < 0) {
    throw new Error("dailyRateCents must be a non-negative integer");
  }
  if (!Number.isFinite(config.discountPercent) || config.discountPercent < 0 || config.discountPercent > 100) {
    throw new Error("discountPercent must be between 0 and 100");
  }
  if (!Number.isInteger(config.groupSize) || config.groupSize < 1 || config.groupSize > 20) {
    throw new Error("groupSize must be a whole number from 1 to 20");
  }
  for (const charge of config.additionalCharges) {
    if (!Number.isInteger(charge.amountCents) || charge.amountCents < 0) {
      throw new Error(`Additional charge "${charge.label}" must be a non-negative integer amount`);
    }
  }
}

/**
 * Tour days for a stay, counted inclusively: arriving 10 Jan and departing
 * 14 Jan is 5 days (4 nights), matching how sample tours are described.
 * Returns null when the dates are missing, invalid, out of order or too long.
 */
export function tripDaysFromDates(arrival: string, departure: string): number | null {
  if (!isIsoDate(arrival) || !isIsoDate(departure)) return null;
  const nights = daysBetween(arrival, departure);
  if (nights < 1) return null;
  const days = nights + 1;
  return days <= MAX_PRICED_DAYS ? days : null;
}

export interface Party {
  adults: number;
  children: number;
}

export type PriceEligibility =
  | { eligible: true }
  | { eligible: false; reason: "group-size" | "children" | "invalid-party" };

/**
 * Whether the published price applies to this party. The group rate covers
 * exactly `groupSize` adults: it is never multiplied, never applied to other
 * party sizes, and child pricing is not invented, so any other party needs a
 * custom quote.
 */
export function priceEligibility(party: Party, config: PricingConfig = pricingConfig): PriceEligibility {
  const { adults, children } = party;
  if (!Number.isInteger(adults) || !Number.isInteger(children) || adults < 0 || children < 0 || adults + children < 1) {
    return { eligible: false, reason: "invalid-party" };
  }
  if (config.basis !== "per-group") return { eligible: true };
  if (children > 0) return { eligible: false, reason: "children" };
  if (adults !== config.groupSize) return { eligible: false, reason: "group-size" };
  return { eligible: true };
}

export function customQuoteMessage(
  reason: Exclude<PriceEligibility, { eligible: true }>["reason"],
  party: Party,
  config: PricingConfig = pricingConfig,
): string {
  const people = party.adults + party.children;
  switch (reason) {
    case "children":
      return "Child pricing has not been confirmed yet, so journeys including children receive a custom quote.";
    case "group-size":
      return `Our published rate covers a group of exactly ${config.groupSize} people. For ${people === 1 ? "a solo traveller" : `a group of ${people}`}, we'll prepare a custom quote.`;
    case "invalid-party":
      return "Enter the number of travellers to see an estimate.";
  }
}

export function calculateTourPrice(days: number, config: PricingConfig = pricingConfig): TourPriceBreakdown {
  if (!Number.isInteger(days) || days < 1 || days > MAX_PRICED_DAYS) {
    throw new RangeError(`days must be a whole number from 1 to ${MAX_PRICED_DAYS}`);
  }
  assertValidConfig(config);

  const baseCents = days * config.dailyRateCents;
  const discountCents = percentOf(baseCents, config.discountPercent);
  const discountedTourCents = baseCents - discountCents;
  const additionalCharges = config.additionalCharges.map((c) => ({
    label: c.per === "day" ? `${c.label} (${days} days)` : c.label,
    amountCents: c.per === "day" ? c.amountCents * days : c.amountCents,
  }));

  return {
    days,
    currency: config.currency,
    basis: config.basis,
    groupSize: config.groupSize,
    dailyRateCents: config.dailyRateCents,
    discountPercent: config.discountPercent,
    baseCents,
    discountCents,
    discountedTourCents,
    discountedDailyRateCents: config.dailyRateCents - percentOf(config.dailyRateCents, config.discountPercent),
    additionalCharges,
    totalCents: discountedTourCents + additionalCharges.reduce((sum, c) => sum + c.amountCents, 0),
  };
}
