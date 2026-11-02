import { destinations } from "./destinations";
import type { Place, RoutePlace } from "./types";

/**
 * Overnight stops on the sample tours that are not featured destinations.
 * Facts are limited to widely documented information (UNESCO inscriptions,
 * history, seasons); seasonal notes are deliberately general.
 */
export const routePlaces: RoutePlace[] = [
  {
    slug: "nuwara-eliya",
    name: "Nuwara Eliya",
    region: "Hill Country",
    tagline: "Cool air, tea estates and a colonial-era hill station",
    summary:
      "Sri Lanka's best-known hill station, set high among tea estates, with gardens, a lake and the gateway to Horton Plains.",
    description: [
      "Nuwara Eliya sits at roughly 1,900 metres in the central highlands, among some of the island's highest tea estates. Developed as a hill station in the nineteenth century, it keeps reminders of that era in its gardens, golf course and old guesthouses.",
      "The town is a natural stop for a tea factory visit and tasting, a walk around Gregory Lake and an early start for Horton Plains National Park, part of the Central Highlands of Sri Lanka World Heritage Site inscribed by UNESCO in 2010.",
      "Nanu Oya station, a short drive away, is where many travellers join the hill-country train towards Ella.",
    ],
    highlights: [
      { title: "Tea factory and tasting", text: "See how leaf becomes tea on the estates around town, then taste the result." },
      { title: "Horton Plains", text: "An early walk across high grassland and cloud forest to the World's End escarpment." },
      { title: "Gregory Lake", text: "An easy lakeside walk in the cool of the late afternoon." },
      { title: "Train from Nanu Oya", text: "Join the scenic railway towards Ella; reserved seats are subject to availability." },
    ],
    bestTime:
      "Generally driest from around January to April. Evenings are cool all year, and mist and showers are possible in any month.",
    gettingThere: "Around 3 hours by road from Kandy, climbing through tea country. Nanu Oya is the nearest railway station.",
    interests: ["nature", "rail"],
    coordinates: { lat: 6.9497, lng: 80.7891 },
  },
  {
    slug: "anuradhapura",
    name: "Anuradhapura",
    region: "Cultural Triangle",
    tagline: "The first great capital and a sacred city of stupas",
    summary:
      "Sri Lanka's first great capital, a sacred Buddhist city of vast stupas, monasteries and the revered Sri Maha Bodhi tree.",
    description: [
      "For well over a thousand years Anuradhapura was the capital of the island's early kingdoms. Today its monasteries, reservoirs and great brick stupas, including Ruwanwelisaya and Jetavanaramaya, are spread across a wide, green sacred precinct. The Sacred City of Anuradhapura was inscribed as a UNESCO World Heritage Site in 1982.",
      "At its heart grows the Jaya Sri Maha Bodhi, revered as a tree grown from a cutting of the tree under which the Buddha attained enlightenment. It remains an active place of pilgrimage, so modest dress is required.",
      "Mihintale, a short drive east, is traditionally regarded as the place where Buddhism was introduced to Sri Lanka.",
    ],
    highlights: [
      { title: "Sri Maha Bodhi", text: "One of Buddhism's most revered sites, still visited daily by pilgrims bearing flowers." },
      { title: "The great stupas", text: "Ruwanwelisaya and Jetavanaramaya rise above the plain, best seen in the soft early or late light." },
      { title: "Isurumuniya", text: "A rock temple known for its fine stone carvings, beside a small pond." },
      { title: "Mihintale", text: "A hilltop monastery reached by long stone stairways, a short drive from the city." },
    ],
    bestTime:
      "Visitable year-round. The dry zone is generally drier from around May to September; heavier showers are possible from October to January.",
    gettingThere: "Around 4 to 5 hours by road from the airport, or about 2 hours from the Sigiriya area.",
    interests: ["culture"],
    coordinates: { lat: 8.3114, lng: 80.4037 },
  },
  {
    slug: "polonnaruwa",
    name: "Polonnaruwa",
    region: "Cultural Triangle",
    tagline: "A medieval royal capital beside a great reservoir",
    summary:
      "The island's medieval capital, with palaces, temples and the rock-cut Buddhas of Gal Vihara, best explored at an easy pace.",
    description: [
      "Polonnaruwa became the royal capital after the decline of Anuradhapura and flourished in the twelfth century, notably under King Parakramabahu I. The Ancient City of Polonnaruwa was inscribed as a UNESCO World Heritage Site in 1982.",
      "Its ruins are compact and well laid out: the royal palace and council chamber, the sacred Quadrangle with its circular Vatadage, and Gal Vihara, where great figures of the Buddha are carved from a single granite face.",
      "The vast Parakrama Samudra reservoir borders the old city, and the site is about an hour from the Sigiriya area, so it pairs well with an elephant safari in Minneriya or Kaudulla.",
    ],
    highlights: [
      { title: "Gal Vihara", text: "Rock-cut Buddha figures, seated, standing and reclining, carved from one granite outcrop." },
      { title: "The Quadrangle", text: "A dense cluster of shrines and relic houses, including the circular Vatadage." },
      { title: "Royal palace ruins", text: "The remains of the palace and council chamber of the medieval kings." },
      { title: "By bicycle", text: "The flat, shaded site is pleasant to explore by bicycle in the cooler hours." },
    ],
    bestTime:
      "Visitable year-round. Generally driest from around February to September; heavier showers are possible between October and January.",
    gettingThere: "About an hour by road from the Sigiriya area, or roughly 5 hours from the airport.",
    interests: ["culture", "wildlife"],
    coordinates: { lat: 7.9403, lng: 81.0188 },
  },
  {
    slug: "negombo",
    name: "Negombo",
    region: "West Coast",
    tagline: "A fishing town of lagoon, canal and churches near the airport",
    summary:
      "A relaxed coastal town close to the international airport, ideal for the first or last night of a journey.",
    description: [
      "Negombo lies on the west coast a short drive from Bandaranaike International Airport, which makes it a natural place to rest after a long flight or before heading home.",
      "The town has a long fishing tradition and a strong Catholic heritage, reflected in its many churches. A Dutch-era canal runs south from the lagoon, and the early-morning fish market shows the town at its busiest.",
      "Beaches and the lagoon offer an easy, low-key day, without the longer drive to the south coast.",
    ],
    highlights: [
      { title: "Negombo Lagoon", text: "Boat trips among fishing boats and mangroves, best early or late in the day." },
      { title: "Fish market", text: "The busy morning market where the night's catch is landed, sold and dried." },
      { title: "Dutch canal", text: "A colonial-era canal running south from the lagoon past homes and villages." },
      { title: "Churches", text: "Many churches reflect the town's Catholic heritage, including St Mary's Church." },
    ],
    bestTime: "Generally driest from around December to April. The south-west monsoon brings more rain from about May to September.",
    gettingThere: "Usually around 20 to 30 minutes by road from Bandaranaike International Airport.",
    interests: ["beach", "culture", "food"],
    coordinates: { lat: 7.2008, lng: 79.8737 },
  },
  // Overnight "Mirissa" days still map to the South Coast destination for routes
  // and maps; the Mirissa page finds those tours by name.
  {
    slug: "mirissa",
    name: "Mirissa",
    region: "South Coast",
    tagline: "A crescent beach and the south coast's whale-watching harbour",
    summary:
      "A palm-backed bay on the southern coast, known for its beach, its relaxed pace and seasonal whale-watching trips from the harbour.",
    description: [
      "Mirissa sits on Sri Lanka's southern coast between Weligama and Matara, a curve of sand backed by coconut palms with a small fishing harbour at its western end.",
      "From roughly November to April, boats leave the harbour in search of whales and dolphins, including blue whales. Sightings depend on the sea and the season, and choosing an operator that follows responsible viewing guidelines matters.",
      "Away from the boats, days are slow: swimming when the sea is calm, short walks to the headlands at either end of the bay, and fresh seafood at beachside restaurants in the evening.",
    ],
    highlights: [
      { title: "Whale watching", text: "Seasonal boat trips, typically between November and April, with responsible operators." },
      { title: "Mirissa beach", text: "A sheltered crescent of sand for swimming and sunsets when the sea is calm." },
      { title: "Coconut Tree Hill", text: "A palm-covered headland and a popular viewpoint over the bay." },
      { title: "Seafood by the sea", text: "The day's catch grilled at small restaurants along the beach." },
    ],
    bestTime:
      "Generally driest and calmest from around December to April, which is also the main whale-watching season. The south-west monsoon brings rougher seas from about May to September, when boat trips may not run.",
    gettingThere: "Around 3 hours from the airport via the Southern Expressway, and about 45 minutes from Galle.",
    interests: ["beach", "wildlife"],
    coordinates: { lat: 5.9483, lng: 80.4716 },
  },
];

/** Featured destinations first, then route places, in a sensible north-to-south order for browsing. */
export const places: Place[] = [
  ...destinations.map((d) => ({ ...d, featured: true as const })),
  ...routePlaces.map((p) => ({ ...p, featured: false as const, gallery: [] as [] })),
];

export const destinationAliases: Record<string, string> = {
  sigiriya: "sigiriya-and-dambulla",
  dambulla: "sigiriya-and-dambulla",
  nuwaraeliya: "nuwara-eliya",
};

export function getPlace(slug: string): Place | undefined {
  const resolvedSlug = destinationAliases[slug] ?? slug;
  return places.find((p) => p.slug === resolvedSlug);
}

/** Maps an itinerary's overnight text (e.g. "Sigiriya area") to a place. */
const overnightToSlug: Record<string, string> = {
  "Sigiriya area": "sigiriya-and-dambulla",
  Kandy: "kandy",
  "Nuwara Eliya": "nuwara-eliya",
  Ella: "ella",
  Galle: "galle",
  Negombo: "negombo",
  Anuradhapura: "anuradhapura",
  "Yala / Tissamaharama area": "yala",
  Mirissa: "south-coast",
};

export function placeForOvernight(overnight: string | null): Place | undefined {
  if (!overnight) return undefined;
  const slug = overnightToSlug[overnight];
  return slug ? getPlace(slug) : undefined;
}

/** Bandaranaike International Airport, for departure days. */
export const airport = { name: "Airport (CMB)", coordinates: { lat: 7.1808, lng: 79.8841 } } as const;
