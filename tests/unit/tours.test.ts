import { describe, expect, it } from "vitest";
import { tours, getTour } from "@/content/tours";
import { basisLabel, pricingConfig, type PricingConfig } from "@/config/pricing";
import { calculateTourPrice } from "@/lib/pricing";
import { hotelNights, packageLabel, tourHref } from "@/lib/tours";

describe("tour detail navigation", () => {
  it("links every tour to /tours/<its own slug>", () => {
    for (const tour of tours) expect(tourHref(tour)).toBe(`/tours/${tour.slug}`);
  });

  it("resolves every link back to the same tour", () => {
    for (const tour of tours) {
      const slug = decodeURIComponent(tourHref(tour).replace("/tours/", ""));
      expect(getTour(slug)).toBe(tour);
    }
  });

  it("uses URL-safe slugs", () => {
    for (const tour of tours) expect(tour.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("returns undefined for unknown slugs (rendered as 404)", () => {
    expect(getTour("not-a-tour")).toBeUndefined();
  });
});

describe("package duration vs hotel nights", () => {
  it("counts hotel nights from the itinerary's overnight stops", () => {
    expect(hotelNights({ itinerary: [{ day: 1, title: "", description: "", overnight: "Kandy" }, { day: 2, title: "", description: "", overnight: null }] })).toBe(1);
  });

  it("has one fewer hotel night than package days for every sample tour", () => {
    for (const tour of tours) expect(hotelNights(tour)).toBe(tour.durationDays - 1);
  });

  it("labels package days and hotel nights separately", () => {
    const tour = getTour("classic-sri-lanka")!;
    expect(packageLabel(tour)).toBe("10-day package · 9 hotel nights");
  });

  it("prices by package days, not hotel nights", () => {
    const tour = getTour("classic-sri-lanka")!;
    expect(calculateTourPrice(tour.durationDays).baseCents).toBe(10 * 6500);
  });
});

describe("pricing basis", () => {
  it("is confirmed as a group rate for 2 people", () => {
    expect(pricingConfig.basis).toBe("per-group");
    expect(basisLabel().short).toBe("For 2 people");
    expect(calculateTourPrice(5).basis).toBe("per-group");
  });

  it("does not change the tour price amounts", () => {
    const base: PricingConfig = { ...pricingConfig, additionalCharges: [] };
    const amounts = (basis: PricingConfig["basis"]) => {
      const p = calculateTourPrice(10, { ...base, basis });
      return [p.baseCents, p.discountCents, p.discountedTourCents, p.discountedDailyRateCents, p.totalCents];
    };
    expect(amounts("per-person")).toEqual(amounts("unconfirmed"));
    expect(amounts("per-group")).toEqual(amounts("unconfirmed"));
  });
});
