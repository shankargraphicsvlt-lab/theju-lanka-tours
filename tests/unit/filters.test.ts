import { describe, expect, it } from "vitest";
import { destinations } from "@/content/destinations";
import { tours } from "@/content/tours";
import {
  filterDestinations,
  filterTours,
  hasActiveFilters,
  normalize,
  parseDestinationFilters,
  parseTourFilters,
  type DestinationFilters,
  type TourFilters,
} from "@/lib/filters";

const noDest: DestinationFilters = { q: "", region: "", interest: "" };
const noTour: TourFilters = { duration: "", destination: "", experience: "" };
const slugs = (list: { slug: string }[]) => list.map((x) => x.slug);
const destinationSlugs = destinations.map((d) => d.slug);

describe("normalize", () => {
  it("lower-cases, trims and strips accents", () => {
    expect(normalize("  SÍGIRÍYA ")).toBe("sigiriya");
  });
});

describe("destination search", () => {
  it("returns every destination, in editorial order, when no filters are set", () => {
    expect(slugs(filterDestinations(destinations, noDest))).toEqual(destinationSlugs);
  });

  it("matches names case-insensitively", () => {
    expect(slugs(filterDestinations(destinations, { ...noDest, q: "KANDY" }))).toContain("kandy");
    expect(slugs(filterDestinations(destinations, { ...noDest, q: "galle" }))).toContain("galle");
  });

  it("searches descriptions and highlights, not just names", () => {
    expect(slugs(filterDestinations(destinations, { ...noDest, q: "leopard" }))).toContain("yala");
    expect(slugs(filterDestinations(destinations, { ...noDest, q: "nine arches" }))).toEqual(["ella"]);
    expect(slugs(filterDestinations(destinations, { ...noDest, q: "whale" }))).toContain("south-coast");
  });

  it("requires every word to match", () => {
    expect(slugs(filterDestinations(destinations, { ...noDest, q: "lighthouse ramparts" }))).toEqual(["galle"]);
    expect(filterDestinations(destinations, { ...noDest, q: "lighthouse leopard" })).toEqual([]);
  });

  it("returns nothing for an unmatched query", () => {
    expect(filterDestinations(destinations, { ...noDest, q: "glacier" })).toEqual([]);
  });

  it("filters by region", () => {
    expect(slugs(filterDestinations(destinations, { ...noDest, region: "Hill Country" }))).toEqual(["kandy", "ella"]);
    expect(slugs(filterDestinations(destinations, { ...noDest, region: "Deep South" }))).toEqual(["yala"]);
  });

  it("filters by interest", () => {
    const beach = slugs(filterDestinations(destinations, { ...noDest, interest: "beach" }));
    expect(beach).toEqual(["galle", "south-coast"]);
    expect(slugs(filterDestinations(destinations, { ...noDest, interest: "rail" }))).toEqual(["ella"]);
  });

  it("combines search, region and interest", () => {
    expect(slugs(filterDestinations(destinations, { q: "fort", region: "South Coast", interest: "culture" }))).toEqual(["galle"]);
    expect(filterDestinations(destinations, { q: "", region: "Hill Country", interest: "beach" })).toEqual([]);
  });
});

describe("parseDestinationFilters", () => {
  it("accepts known values", () => {
    expect(parseDestinationFilters({ q: " temple ", region: "Hill Country", interest: "culture" })).toEqual({
      q: "temple",
      region: "Hill Country",
      interest: "culture",
    });
  });

  it("ignores unknown values and takes the first of repeated params", () => {
    expect(parseDestinationFilters({ region: "Atlantis", interest: "casino" })).toEqual(noDest);
    expect(parseDestinationFilters({ q: ["ella", "kandy"] }).q).toBe("ella");
  });

  it("caps the search length", () => {
    expect(parseDestinationFilters({ q: "x".repeat(500) }).q).toHaveLength(80);
  });
});

describe("tour filters", () => {
  it("returns every tour when no filters are set", () => {
    expect(filterTours(tours, noTour)).toHaveLength(tours.length);
  });

  it("filters by package duration bucket", () => {
    const days = (f: TourFilters["duration"]) => filterTours(tours, { ...noTour, duration: f }).map((t) => t.durationDays).sort((a, b) => a - b);
    expect(days("up-to-7")).toEqual([5, 7]);
    expect(days("8-11")).toEqual([10]);
    expect(days("12-plus")).toEqual([12, 15]);
  });

  it("filters by destination", () => {
    expect(slugs(filterTours(tours, { ...noTour, destination: "galle" })).sort()).toEqual(
      ["classic-sri-lanka", "grand-tour-of-sri-lanka", "hill-country-rail-and-southern-shores"].sort(),
    );
    expect(filterTours(tours, { ...noTour, destination: "kandy" })).toHaveLength(5);
  });

  it("filters by experience type", () => {
    const wildlife = slugs(filterTours(tours, { ...noTour, experience: "wildlife" }));
    expect(wildlife.sort()).toEqual(["ancient-kingdoms-and-wild-places", "classic-sri-lanka", "grand-tour-of-sri-lanka"].sort());
    expect(slugs(filterTours(tours, { ...noTour, experience: "wellness" }))).toEqual(["grand-tour-of-sri-lanka"]);
  });

  it("combines all three filters", () => {
    expect(slugs(filterTours(tours, { duration: "up-to-7", destination: "ella", experience: "rail" }))).toEqual([
      "hill-country-rail-and-southern-shores",
    ]);
    expect(filterTours(tours, { duration: "up-to-7", destination: "yala", experience: "" })).toEqual([]);
  });

  it("every result actually satisfies the filters (exhaustive check)", () => {
    for (const duration of ["", "up-to-7", "8-11", "12-plus"] as const)
      for (const destination of ["", ...destinationSlugs])
        for (const experience of ["", "culture", "wildlife", "beach", "rail"] as const) {
          for (const t of filterTours(tours, { duration, destination, experience })) {
            if (destination) expect(t.destinations).toContain(destination);
            if (experience) expect(t.interests).toContain(experience);
          }
        }
  });
});

describe("parseTourFilters", () => {
  it("accepts known values and rejects others", () => {
    expect(parseTourFilters({ duration: "8-11", destination: "yala", experience: "wildlife" }, destinationSlugs)).toEqual({
      duration: "8-11",
      destination: "yala",
      experience: "wildlife",
    });
    expect(parseTourFilters({ duration: "99", destination: "mars", experience: "<script>" }, destinationSlugs)).toEqual(noTour);
  });
});

describe("hasActiveFilters", () => {
  it("detects any non-empty value", () => {
    expect(hasActiveFilters(noTour)).toBe(false);
    expect(hasActiveFilters({ ...noTour, destination: "ella" })).toBe(true);
  });
});
