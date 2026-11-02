/**
 * Editable content for the homepage sections below the photo reel.
 *
 * Tours, destinations and prices come from the real data files
 * (tours.ts, places.ts, src/config/pricing.ts). Everything marked SAMPLE
 * below is placeholder content: the site labels it as a sample wherever it
 * appears. Replace it with real guest reviews and real articles before
 * launch, then set the matching `isSample` flag to false.
 */

/** Photo folders under public/images/destinations/{photo}/hero.webp. */
export const inspirePlaces: { slug: string; photo: string }[] = [
  { slug: "sigiriya-and-dambulla", photo: "sigiriya" },
  { slug: "ella", photo: "ella" },
  { slug: "galle", photo: "galle" },
  { slug: "yala", photo: "yala" },
  { slug: "mirissa", photo: "mirissa" },
];

/**
 * Tour cards for "Curated Just for You". Badges are SAMPLE labels until
 * the business confirms which tours sell best.
 */
export const curatedTours: { slug: string; photo: string; badge: string }[] = [
  { slug: "classic-sri-lanka", photo: "sigiriya", badge: "Best Seller" },
  { slug: "hill-country-rail-and-southern-shores", photo: "ella", badge: "Popular" },
  { slug: "cultural-triangle-and-kandy", photo: "kandy", badge: "Short break" },
  { slug: "ancient-kingdoms-and-wild-places", photo: "polonnaruwa", badge: "New" },
];

export const bannerPhoto = "nuwara-eliya";

/** SAMPLE travel guides: each links to the real page it summarises. */
export const stories = {
  isSample: true,
  items: [
    {
      title: "Riding the hill-country train to Ella",
      date: "2026-09-12",
      photo: "ella",
      href: "/experiences/hill-country-rail-journey",
    },
    {
      title: "When to see whales off Mirissa",
      date: "2026-08-28",
      photo: "mirissa",
      href: "/experiences/south-coast-and-whale-watching",
    },
    {
      title: "Climbing Sigiriya: what to know before you go",
      date: "2026-08-03",
      photo: "sigiriya",
      href: "/destinations/sigiriya-and-dambulla",
    },
  ],
};
