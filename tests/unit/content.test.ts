import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import credits from "@/content/image-credits.json";
import { destinations } from "@/content/destinations";
import { experiences } from "@/content/experiences";
import { tours } from "@/content/tours";
import { getPlace, placeForOvernight, places } from "@/content/places";
import { placePhotoKey } from "@/content/destination-photos";
import { islandReel } from "@/content/island-reel";
import { testimonials } from "@/content/testimonials";
import { MAP_VIEWBOX, project } from "@/lib/map";

// Image modules are imported by Next.js at build time; here we check the files and credits directly.

const unique = (values: string[]) => new Set(values).size === values.length;
const destinationSlugs = destinations.map((d) => d.slug);

describe("content integrity", () => {
  it("uses unique slugs", () => {
    expect(unique(destinationSlugs)).toBe(true);
    expect(unique(experiences.map((e) => e.slug))).toBe(true);
    expect(unique(tours.map((t) => t.slug))).toBe(true);
  });

  it("covers the required sample durations", () => {
    expect(tours.map((t) => t.durationDays).sort((a, b) => a - b)).toEqual([5, 7, 10, 12, 15]);
  });

  it("has one itinerary day per tour day, numbered in order, with no overnight on the last day", () => {
    for (const tour of tours) {
      expect(tour.itinerary).toHaveLength(tour.durationDays);
      tour.itinerary.forEach((day, i) => expect(day.day).toBe(i + 1));
      expect(tour.itinerary.at(-1)?.overnight).toBeNull();
    }
  });

  it("marks every itinerary as a sample until confirmed", () => {
    for (const tour of tours) expect(tour.isSample).toBe(true);
  });

  it("only references destinations that exist", () => {
    for (const t of tours) for (const d of t.destinations) expect(destinationSlugs).toContain(d);
    for (const e of experiences) for (const d of e.destinations) expect(destinationSlugs).toContain(d);
  });

  it("gives every place page a unique slug and a photo, except those still awaiting one", () => {
    expect(unique(places.map((p) => p.slug))).toBe(true);
    const awaitingPhoto: string[] = [];
    for (const p of places) {
      const file = path.resolve("public/images/destinations", placePhotoKey[p.slug] ?? p.slug, "hero.webp");
      expect(existsSync(file), p.slug).toBe(!awaitingPhoto.includes(p.slug));
    }
  });

  it("has complete testimonials with 1-5 star ratings and existing photos", () => {
    for (const t of testimonials) {
      expect(t.name && t.country && t.text, t.name).toBeTruthy();
      expect(Number.isInteger(t.rating) && t.rating >= 1 && t.rating <= 5, t.name).toBe(true);
      if (t.photo) expect(existsSync(path.join("public", t.photo)), t.photo).toBe(true);
    }
  });

  it("keeps no 3D or diorama assets in the public folder", () => {
    expect(existsSync(path.resolve("public/dioramas"))).toBe(false);
    expect(existsSync(path.resolve("public/models"))).toBe(false);
  });

  it("lists Mirissa as a place but keeps it out of the featured destinations (filters and seed)", () => {
    expect(getPlace("mirissa")?.name).toBe("Mirissa");
    expect(destinationSlugs).not.toContain("mirissa");
    // Mirissa nights still belong to the South Coast destination on routes and maps.
    expect(placeForOvernight("Mirissa")?.slug).toBe("south-coast");
  });

  it("matches every homepage reel slide to a place", () => {
    for (const { photo } of islandReel) {
      expect(getPlace(photo), photo).toBeDefined();
    }
  });

  it("places every destination pin inside the map bounds", () => {
    for (const d of places) {
      const { x, y } = project(d.coordinates.lat, d.coordinates.lng);
      expect(x).toBeGreaterThan(0);
      expect(x).toBeLessThan(MAP_VIEWBOX.width);
      expect(y).toBeGreaterThan(0);
      expect(y).toBeLessThan(MAP_VIEWBOX.height);
    }
  });
});

describe("image credits", () => {
  it("has a downloaded file, photographer and alt text for every credited image", () => {
    for (const c of credits) {
      expect(existsSync(path.resolve("src/assets/images", c.file)), c.file).toBe(true);
      expect(c.photographer.length).toBeGreaterThan(0);
      expect(c.alt.length).toBeGreaterThan(10);
      expect(c.profile).toMatch(/^https:\/\/unsplash\.com\/@/);
    }
  });
});
