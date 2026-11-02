import { DISCOUNT_PERCENT, siteConfig } from "./site";

/**
 * Central pricing settings. Change the daily rate or group size here, and the
 * discount with DISCOUNT_PERCENT in src/config/site.ts; every price on the site
 * (tour cards, tour pages, trip estimator) updates.
 *
 * Amounts are stored in the smallest currency unit (cents) to avoid
 * floating-point rounding errors.
 */

export interface AdditionalCharge {
  /** Shown to visitors as its own line, e.g. "Airport transfer". */
  label: string;
  amountCents: number;
  per: "trip" | "day";
}

/**
 * Who the daily rate applies to.
 * - "per-group": the rate is the TOTAL for a party of exactly `groupSize`
 *   adults. It is never multiplied by the number of travellers, and parties of
 *   any other size, or with children, need a custom quote.
 * - "per-person" / "unconfirmed": kept for completeness; not in use.
 */
export type PricingBasis = "unconfirmed" | "per-person" | "per-group";

export interface PricingConfig {
  currency: "USD";
  basis: PricingBasis;
  /** Party size the group rate covers (per-group basis only). */
  groupSize: number;
  dailyRateCents: number;
  /** 0–100. Applied to the base tour price. */
  discountPercent: number;
  /**
   * Extra charges added on top of the discounted tour price. Empty by
   * default; anything added here is listed separately wherever prices appear.
   */
  additionalCharges: AdditionalCharge[];
}

/** Confirmed by the business: USD 65 per day for a group of exactly 2 people, less DISCOUNT_PERCENT. */
export const pricingConfig: PricingConfig = {
  currency: "USD",
  basis: "per-group",
  groupSize: 2,
  dailyRateCents: 6500, // USD 65.00 per day, total for the 2-person group
  discountPercent: DISCOUNT_PERCENT,
  additionalCharges: [],
};

export function basisLabel(config: Pick<PricingConfig, "basis" | "groupSize"> = pricingConfig): {
  short: string;
  long: string;
} {
  switch (config.basis) {
    case "per-group":
      return {
        short: `For ${config.groupSize} people`,
        long: `Total price for a group of ${config.groupSize} people, not per person. Larger groups, solo travellers and parties with children receive a custom quote.`,
      };
    case "per-person":
      return { short: "Per person", long: "Price per person." };
    case "unconfirmed":
      return {
        short: "Basis awaiting confirmation",
        long: `Whether this rate is per person or per group is awaiting confirmation by ${siteConfig.name}.`,
      };
  }
}

/** Shown next to every price: what the confirmed tour price covers (see the lists in src/content/tours.ts). */
export const pricingDisclosure = "Includes vehicle, driver-guide and transfers. Hotels and entrance fees are quoted separately.";
