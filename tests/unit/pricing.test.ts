import { DISCOUNT_PERCENT } from "@/config/site";
import { describe, expect, it } from "vitest";
import { basisLabel, pricingConfig, type PricingConfig } from "@/config/pricing";
import { tours } from "@/content/tours";
import { formatMoney } from "@/lib/format";
import {
  calculateTourPrice,
  customQuoteMessage,
  MAX_PRICED_DAYS,
  priceEligibility,
  tripDaysFromDates,
} from "@/lib/pricing";

describe("confirmed pricing settings", () => {
  it("uses USD 65.00 per day for a group of 2, with a 15% discount and no extra charges", () => {
    expect(pricingConfig.currency).toBe("USD");
    expect(pricingConfig.basis).toBe("per-group");
    expect(pricingConfig.groupSize).toBe(2);
    expect(pricingConfig.dailyRateCents).toBe(6500);
    expect(DISCOUNT_PERCENT).toBe(15);
    expect(pricingConfig.discountPercent).toBe(DISCOUNT_PERCENT);
    expect(pricingConfig.additionalCharges).toEqual([]);
  });

  it("gives a discounted daily rate of USD 55.25", () => {
    expect(calculateTourPrice(1).discountedDailyRateCents).toBe(5525);
    expect(calculateTourPrice(1).totalCents).toBe(5525);
  });
});

describe("calculateTourPrice: confirmed examples", () => {
  // [days, base, discount, final, final shown, per person shown] in cents
  const examples: Array<[number, number, number, number, string, string]> = [
    [5, 32500, 4875, 27625, "US$276.25", "US$138.13"],
    [7, 45500, 6825, 38675, "US$386.75", "US$193.38"],
    [10, 65000, 9750, 55250, "US$552.50", "US$276.25"],
    [12, 78000, 11700, 66300, "US$663.00", "US$331.50"],
    [15, 97500, 14625, 82875, "US$828.75", "US$414.38"],
  ];

  it.each(examples)("%i days → base %i, discount %i, final %i (%s, %s per person)", (days, base, discount, final, display, perPerson) => {
    const price = calculateTourPrice(days);
    expect(price.days).toBe(days);
    expect(price.baseCents).toBe(base); // days × 65
    expect(price.discountCents).toBe(discount); // 15% of base
    expect(price.discountedTourCents).toBe(final); // base − discount
    expect(price.totalCents).toBe(final); // nothing added on top
    expect(price.additionalCharges).toEqual([]);
    expect(formatMoney(price.totalCents, price.currency)).toBe(display);
    // Per person for the 2-person group: half the total, rounded to the cent (as on the tour cards).
    expect(formatMoney(Math.round(price.totalCents / price.groupSize), price.currency)).toBe(perPerson);
  });

  it("matches days × discounted daily rate for every example", () => {
    for (const [days, , , final] of examples) {
      expect(days * calculateTourPrice(1).discountedDailyRateCents).toBe(final);
    }
  });

  it("prices every sample tour from its duration", () => {
    const totals = Object.fromEntries(tours.map((t) => [t.durationDays, calculateTourPrice(t.durationDays).totalCents]));
    expect(totals).toEqual({ 5: 27625, 7: 38675, 10: 55250, 12: 66300, 15: 82875 });
  });
});

describe("calculateTourPrice: configuration and validation", () => {
  const base: PricingConfig = {
    currency: "USD",
    basis: "per-group",
    groupSize: 2,
    dailyRateCents: 6500,
    discountPercent: 15,
    additionalCharges: [],
  };

  it("follows a changed daily rate and discount", () => {
    const price = calculateTourPrice(10, { ...base, dailyRateCents: 8000, discountPercent: 10 });
    expect(price.baseCents).toBe(80000);
    expect(price.discountCents).toBe(8000);
    expect(price.totalCents).toBe(72000);
  });

  it("handles a zero discount", () => {
    const price = calculateTourPrice(5, { ...base, discountPercent: 0 });
    expect(price.discountCents).toBe(0);
    expect(price.totalCents).toBe(32500);
  });

  it("rounds fractional-cent discounts to the nearest cent", () => {
    // 3 days × $33.33 = $99.99; 12.5% = 1249.875¢ → 1250¢
    const price = calculateTourPrice(3, { ...base, dailyRateCents: 3333, discountPercent: 12.5 });
    expect(price.discountCents).toBe(1250);
    expect(price.totalCents).toBe(8749);
  });

  it("lists configured additional charges separately and adds them to the total", () => {
    const price = calculateTourPrice(5, {
      ...base,
      additionalCharges: [
        { label: "Airport transfer", amountCents: 3000, per: "trip" },
        { label: "Guide supplement", amountCents: 1000, per: "day" },
      ],
    });
    expect(price.discountedTourCents).toBe(27625);
    expect(price.additionalCharges).toEqual([
      { label: "Airport transfer", amountCents: 3000 },
      { label: "Guide supplement (5 days)", amountCents: 5000 },
    ]);
    expect(price.totalCents).toBe(27625 + 3000 + 5000);
  });

  it("rejects invalid durations", () => {
    expect(() => calculateTourPrice(0)).toThrow(RangeError);
    expect(() => calculateTourPrice(-3)).toThrow(RangeError);
    expect(() => calculateTourPrice(2.5)).toThrow(RangeError);
    expect(() => calculateTourPrice(Number.NaN)).toThrow(RangeError);
    expect(() => calculateTourPrice(MAX_PRICED_DAYS + 1)).toThrow(RangeError);
  });

  it("rejects invalid settings", () => {
    expect(() => calculateTourPrice(5, { ...base, discountPercent: 101 })).toThrow();
    expect(() => calculateTourPrice(5, { ...base, discountPercent: -5 })).toThrow();
    expect(() => calculateTourPrice(5, { ...base, dailyRateCents: 65.5 })).toThrow();
    expect(() => calculateTourPrice(5, { ...base, groupSize: 0 })).toThrow();
  });
});

describe("group pricing (USD 65/day for exactly 2 people)", () => {
  it("is a group total: the same for the group, never multiplied by travellers", () => {
    const price = calculateTourPrice(10);
    expect(price.groupSize).toBe(2);
    expect(price.basis).toBe("per-group");
    expect(price.totalCents).toBe(55250); // not 2 × 55250
  });

  it("labels every price 'For 2 people'", () => {
    expect(basisLabel().short).toBe("For 2 people");
    expect(basisLabel().long).toMatch(/not per person/);
  });

  it("applies to exactly 2 adults", () => {
    expect(priceEligibility({ adults: 2, children: 0 })).toEqual({ eligible: true });
  });

  it.each([
    [{ adults: 1, children: 0 }, "group-size"],
    [{ adults: 3, children: 0 }, "group-size"],
    [{ adults: 4, children: 0 }, "group-size"],
    [{ adults: 12, children: 0 }, "group-size"],
    [{ adults: 1, children: 1 }, "children"],
    [{ adults: 2, children: 1 }, "children"],
    [{ adults: 2, children: 2 }, "children"],
    [{ adults: 0, children: 0 }, "invalid-party"],
    [{ adults: Number.NaN, children: 0 }, "invalid-party"],
    [{ adults: 2.5, children: 0 }, "invalid-party"],
  ] as const)("requires a custom quote for %o (%s)", (party, reason) => {
    expect(priceEligibility(party)).toEqual({ eligible: false, reason });
  });

  it("explains why a custom quote is needed, without inventing child pricing", () => {
    expect(customQuoteMessage("group-size", { adults: 4, children: 0 })).toMatch(/exactly 2 people.*group of 4/);
    expect(customQuoteMessage("group-size", { adults: 1, children: 0 })).toMatch(/solo traveller/);
    expect(customQuoteMessage("children", { adults: 2, children: 1 })).toMatch(/Child pricing has not been confirmed/);
  });

  it("follows a different configured group size", () => {
    const four: PricingConfig = { ...pricingConfig, groupSize: 4 };
    expect(priceEligibility({ adults: 4, children: 0 }, four)).toEqual({ eligible: true });
    expect(priceEligibility({ adults: 2, children: 0 }, four)).toEqual({ eligible: false, reason: "group-size" });
    expect(basisLabel(four).short).toBe("For 4 people");
  });
});

describe("tripDaysFromDates", () => {
  it("counts days inclusively (arrival and departure days)", () => {
    expect(tripDaysFromDates("2027-01-10", "2027-01-14")).toBe(5);
    expect(tripDaysFromDates("2027-01-10", "2027-01-11")).toBe(2);
    expect(tripDaysFromDates("2027-02-25", "2027-03-06")).toBe(10);
  });

  it("returns null for missing, invalid, reversed or same-day dates", () => {
    expect(tripDaysFromDates("", "2027-01-14")).toBeNull();
    expect(tripDaysFromDates("2027-02-30", "2027-03-02")).toBeNull();
    expect(tripDaysFromDates("2027-01-14", "2027-01-10")).toBeNull();
    expect(tripDaysFromDates("2027-01-10", "2027-01-10")).toBeNull();
  });

  it("returns null when the stay exceeds the maximum priced length", () => {
    expect(tripDaysFromDates("2027-01-01", "2027-03-02")).toBe(61);
    expect(tripDaysFromDates("2027-01-01", "2027-03-03")).toBeNull();
  });
});
