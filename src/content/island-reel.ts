/**
 * Slides for the homepage photo reel, in order. `photo` is the folder in
 * public/images/destinations/{photo}/hero.webp; a slide whose file is missing
 * is skipped. Name, region and tagline come from the matching place in
 * src/content (destinations.ts / places.ts); only the two short facts live
 * here, taken from the place pages.
 */
export const islandReel: { photo: string; facts: [string, string] }[] = [
  { photo: "sigiriya", facts: ["5th-century citadel", "UNESCO, 1982"] },
  { photo: "ella", facts: ["About 1,000 m", "Nine Arches Bridge"] },
  { photo: "kandy", facts: ["Last royal capital", "UNESCO, 1988"] },
  { photo: "mirissa", facts: ["Whales Nov–Apr", "South coast"] },
  { photo: "galle", facts: ["Dutch ramparts", "UNESCO, 1988"] },
  { photo: "nuwara-eliya", facts: ["About 1,900 m", "Highest tea estates"] },
  { photo: "polonnaruwa", facts: ["12th-century capital", "UNESCO, 1982"] },
  { photo: "yala", facts: ["Leopards & elephants", "South-east coast"] },
  { photo: "negombo", facts: ["Lagoon & canal", "Near the airport"] },
];
