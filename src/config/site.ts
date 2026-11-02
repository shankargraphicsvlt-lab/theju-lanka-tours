import { contact } from "./contact";

/**
 * Discount on the tour rate, in percent (0–100). The one place to change it:
 * every sale price, "% off" badge, struck-through original, per-person price,
 * enquiry estimate and the database seed are calculated from this value.
 */
export const DISCOUNT_PERCENT = 15;

/**
 * Legal and licensing details. Leave a value empty ("") until it is confirmed:
 * empty rows are hidden on the About page, and if all three are empty the
 * whole "Registration & licensing" section is hidden. The SLTDA number also
 * appears in the footer once set; the legal entity name is used in the
 * copyright line and on the privacy and terms pages.
 */
export const LEGAL_ENTITY = "";
export const COMPANY_REG_NO = "";
export const SLTDA_REG_NO = "";

/**
 * Central site configuration. Contact and legal details live in
 * src/config/contact.ts; a value of `null` there means "not confirmed yet".
 *
 * NEXT_PUBLIC_* variables must be read with static property access so that
 * Next.js can inline them at build time.
 */

function clean(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function cleanUrl(value: string | undefined): string {
  const url = clean(value) ?? "http://localhost:3000";
  return url.replace(/\/+$/, "");
}

/** Accepts only absolute https links, so a typo never becomes a broken or relative link. */
function cleanHttps(value: string | undefined): string | null {
  const url = clean(value);
  return url && /^https:\/\/[^\s]+$/.test(url) ? url : null;
}

export const siteConfig = {
  /** Brand name and logo tagline: change them here and every page, title and share text follows. */
  name: "GSKT Lanka Tours",
  shortName: "GSKT Lanka",
  tagline: "Experience the Real Sri Lanka",
  /** Homepage headline and footer heading. */
  slogan: "Discover Sri Lanka, Your Way.",
  description:
    "Private, tailor-made journeys across Sri Lanka: ancient cities, hill-country rail, wildlife safaris and quiet southern beaches, planned around you.",
  url: cleanUrl(process.env.NEXT_PUBLIC_SITE_URL),
  locale: "en_GB",
  contact: {
    whatsapp: contact.whatsapp.number,
    whatsappDisplay: contact.whatsapp.display,
    email: contact.email,
    phone: contact.phone.display,
    phoneHref: contact.phone.href,
    address: contact.address,
  },
  /** Social profiles; icons appear in the footer only for the ones set. */
  social: {
    instagram: cleanHttps(process.env.NEXT_PUBLIC_INSTAGRAM_URL),
    facebook: cleanHttps(process.env.NEXT_PUBLIC_FACEBOOK_URL),
    tiktok: cleanHttps(process.env.NEXT_PUBLIC_TIKTOK_URL),
    youtube: cleanHttps(process.env.NEXT_PUBLIC_YOUTUBE_URL),
  },
  legal: {
    entityName: clean(LEGAL_ENTITY),
    registrationNumber: clean(COMPANY_REG_NO),
    sltdaNumber: clean(SLTDA_REG_NO),
  },
  /**
   * Feature flags: flipped on only once each integration is built and tested.
   * Online enquiry submission is controlled on the server by
   * BOOKING_SUBMISSIONS_ENABLED (see src/lib/booking/availability.ts).
   */
  features: {
    bookingLookup: false,
    payments: false,
  },
} as const;

/**
 * Homepage testimonials section (reviews in src/content/testimonials.ts).
 * Off while the reviews are samples; set to true once real guest reviews are in.
 */
export const SHOW_TESTIMONIALS = false;

/**
 * Homepage "Stories to Fuel Your Next Trip" travel-guides section (articles in
 * src/content/home.ts). Off while the articles are samples.
 */
export const SHOW_BLOG = false;

/** How the site describes its ready-made itineraries: "suggested" (a starting point), never "sample". */
export const itineraryWording = {
  word: "suggested",
  label: "Suggested itinerary",
  journeys: "Suggested journeys",
  journey: "Suggested journey",
  route: "suggested route",
  toursLink: "Tour packages",
} as const;

export const placeholders = {
  email: "Business email to be confirmed",
  address: "Business address to be confirmed",
  entityName: "[Legal entity name: to be confirmed]",
} as const;

/** Brand video (public/video/): full version with sound, silent loop and poster frame. */
export const brandVideo = {
  full: "/video/gskt-story-1080.mp4",
  loop: "/video/gskt-story-loop-720.mp4",
  poster: "/video/gskt-story-poster.jpg",
  label: `${siteConfig.name} brand video`,
} as const;

/** Opening line for every "Chat on WhatsApp" link. */
export const whatsappGreeting = `Hello ${siteConfig.name}, I would like to plan a trip to Sri Lanka.`;

export function whatsappHref(message?: string): string | null {
  const number: string | null = siteConfig.contact.whatsapp;
  if (!number) return null;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${number}${text}`;
}

/** Navbar links. "Island Map" and "Services" are sections of the homepage. */
export const mainNav = [
  { label: "Home", href: "/" },
  { label: "Destinations", href: "/destinations" },
  { label: "Tour Packages", href: "/tours" },
  { label: "Island Map", href: "/#island-map" },
  { label: "Services", href: "/#services" },
  { label: "Contact", href: "/contact" },
] as const;

/** Further pages, listed in the mobile menu and the footer. */
export const moreNav = [
  { label: "Experiences", href: "/experiences" },
  { label: "Gallery", href: "/gallery" },
  { label: "Saved", href: "/saved" },
  { label: "About", href: "/about" },
] as const;
