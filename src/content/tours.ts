import type { Tour } from "./types";

/**
 * Itineraries. Routes are suggestions that are adjusted to each traveller's
 * plans. Prices are not stored here; they are calculated from durationDays
 * using the confirmed rate in src/config/pricing.ts.
 */

/** Confirmed by the business: what the published tour price includes, for every tour. */
const standardIncluded = [
  "Private air-conditioned vehicle with an English-speaking chauffeur-guide",
  "Airport pickup and drop-off",
  "Fuel, highway tolls and parking",
  "Bottled water in the vehicle",
];

/** Confirmed by the business: not included in the tour price, for every tour. */
const standardExcluded = [
  "Hotels",
  "Meals",
  "Entrance fees",
  "Safari jeeps",
  "International flights",
  "Visa / ETA",
  "Tips",
];

const standardPickup =
  "Bandaranaike International Airport (CMB), or any hotel in Colombo or Negombo. Alternative pickup points can be arranged.";

export const tours: Tour[] = [
  {
    slug: "cultural-triangle-and-kandy",
    title: "Cultural Triangle & Kandy",
    summary:
      "A short, rich introduction to Sri Lanka's ancient cities and its last royal capital.",
    description: [
      "Ideal for a first visit or a short stopover, this journey combines the rock fortress of Sigiriya and the cave temple of Dambulla with the temples, lake and gardens of Kandy.",
      "Every itinerary is private and can be adjusted: add a night, swap a visit or slow the pace.",
    ],
    durationDays: 5,
    destinations: ["sigiriya-and-dambulla", "kandy"],
    interests: ["culture", "nature"],
    style: "Culture & heritage",
    itinerary: [
      {
        day: 1,
        title: "Arrival and drive to the Cultural Triangle",
        description:
          "Meet your chauffeur-guide at the airport and drive north through countryside to your hotel near Sigiriya. Afternoon at leisure.",
        overnight: "Sigiriya area",
      },
      {
        day: 2,
        title: "Sigiriya and Dambulla",
        description:
          "Climb Sigiriya Rock Fortress in the cool of the early morning, then visit the painted caves of the Dambulla cave temple in the afternoon.",
        overnight: "Sigiriya area",
      },
      {
        day: 3,
        title: "To Kandy via a spice garden",
        description:
          "Drive south to Kandy, stopping at a spice garden near Matale. Evening visit to the Temple of the Sacred Tooth Relic.",
        overnight: "Kandy",
      },
      {
        day: 4,
        title: "Kandy and Peradeniya",
        description:
          "Morning at the Royal Botanic Gardens, Peradeniya, a walk around Kandy Lake and an evening performance of Kandyan dance.",
        overnight: "Kandy",
      },
      {
        day: 5,
        title: "Departure",
        description: "Transfer to the airport for your onward flight.",
        overnight: null,
      },
    ],
    included: standardIncluded,
    excluded: standardExcluded,
    pickup: standardPickup,
    image: "dambullaCave",
    isSample: true,
  },
  {
    slug: "hill-country-rail-and-southern-shores",
    title: "Hill Country Rail & Southern Shores",
    summary:
      "Kandy, tea country and the scenic train to Ella, ending with Galle Fort and the southern coast.",
    description: [
      "This week-long journey follows the island's most scenic route: from Kandy into the cool tea country, by train to Ella, then down to the coast and the ramparts of Galle.",
      "Train seats are subject to availability; if reserved seats cannot be secured we travel the same route by road.",
    ],
    durationDays: 7,
    destinations: ["kandy", "ella", "galle", "south-coast"],
    interests: ["rail", "nature", "beach", "culture"],
    style: "Scenic & coastal",
    itinerary: [
      {
        day: 1,
        title: "Arrival and drive to Kandy",
        description:
          "Meet your chauffeur-guide at the airport and drive into the hills to Kandy. Evening visit to the Temple of the Sacred Tooth Relic.",
        overnight: "Kandy",
      },
      {
        day: 2,
        title: "Kandy",
        description:
          "Royal Botanic Gardens, Peradeniya, the lakeside and an evening of Kandyan dance.",
        overnight: "Kandy",
      },
      {
        day: 3,
        title: "Into tea country",
        description:
          "Climb through tea estates to Nuwara Eliya, with a tea factory visit and tasting on the way.",
        overnight: "Nuwara Eliya",
      },
      {
        day: 4,
        title: "The train to Ella",
        description:
          "Board the train at Nanu Oya for the celebrated ride to Ella. Your driver meets you at the station.",
        overnight: "Ella",
      },
      {
        day: 5,
        title: "Ella",
        description:
          "Morning walk up Little Adam's Peak and a visit to the Nine Arches Bridge. Afternoon at leisure.",
        overnight: "Ella",
      },
      {
        day: 6,
        title: "To Galle",
        description:
          "Descend from the hills to the southern coast. Late-afternoon walk on the ramparts of Galle Fort.",
        overnight: "Galle",
      },
      {
        day: 7,
        title: "Departure",
        description: "Transfer to the airport via the Southern Expressway.",
        overnight: null,
      },
    ],
    included: standardIncluded,
    excluded: standardExcluded,
    pickup: standardPickup,
    image: "ellaTrain",
    isSample: true,
  },
  {
    slug: "classic-sri-lanka",
    title: "Classic Sri Lanka",
    summary:
      "Ancient cities, the hill country, a Yala safari and Galle: the island's highlights in ten days.",
    description: [
      "Our most balanced journey brings together the island's great themes: heritage in the Cultural Triangle, tea and rail in the highlands, wildlife in Yala and history on the southern coast.",
      "Pacing allows for two nights in most places, with time to rest between the highlights.",
    ],
    durationDays: 10,
    destinations: ["sigiriya-and-dambulla", "kandy", "ella", "yala", "galle"],
    interests: ["culture", "wildlife", "rail", "nature", "beach"],
    style: "Highlights",
    itinerary: [
      {
        day: 1,
        title: "Arrival in Negombo",
        description: "Meet your chauffeur-guide at the airport and transfer to a hotel in Negombo to rest after your flight.",
        overnight: "Negombo",
      },
      {
        day: 2,
        title: "To the Cultural Triangle",
        description: "Drive north to Sigiriya. Afternoon village walk or sunset at a nearby reservoir.",
        overnight: "Sigiriya area",
      },
      {
        day: 3,
        title: "Sigiriya and Pidurangala",
        description: "Early climb of Sigiriya Rock Fortress. Optional sunset climb of Pidurangala Rock.",
        overnight: "Sigiriya area",
      },
      {
        day: 4,
        title: "Dambulla and an elephant safari",
        description:
          "Visit the Dambulla cave temple, then an afternoon jeep safari in Minneriya or Kaudulla, depending on the season.",
        overnight: "Sigiriya area",
      },
      {
        day: 5,
        title: "To Kandy",
        description: "Drive to Kandy via a spice garden. Evening visit to the Temple of the Sacred Tooth Relic.",
        overnight: "Kandy",
      },
      {
        day: 6,
        title: "Tea country",
        description: "Drive into the highlands to Nuwara Eliya, stopping at a tea factory along the way.",
        overnight: "Nuwara Eliya",
      },
      {
        day: 7,
        title: "The train to Ella",
        description: "Scenic train from Nanu Oya to Ella. Afternoon visit to the Nine Arches Bridge.",
        overnight: "Ella",
      },
      {
        day: 8,
        title: "To Yala and an afternoon safari",
        description: "Drive down to the south-east for an afternoon jeep safari in Yala National Park.",
        overnight: "Yala / Tissamaharama area",
      },
      {
        day: 9,
        title: "Along the coast to Galle",
        description: "Drive west along the southern coast to Galle. Sunset on the fort ramparts.",
        overnight: "Galle",
      },
      {
        day: 10,
        title: "Departure",
        description: "Transfer to the airport via the Southern Expressway.",
        overnight: null,
      },
    ],
    included: standardIncluded,
    excluded: standardExcluded,
    pickup: standardPickup,
    image: "minneriyaElephants",
    isSample: true,
  },
  {
    slug: "ancient-kingdoms-and-wild-places",
    title: "Ancient Kingdoms & Wild Places",
    summary:
      "Anuradhapura, Polonnaruwa and Sigiriya, the highlands and two safari regions, ending on the southern coast.",
    description: [
      "For travellers with a deeper interest in history and wildlife, this journey adds the ancient sacred city of Anuradhapura and the medieval capital of Polonnaruwa, with safaris in both the north-central plains and Yala.",
      "The pace is relaxed, with time on the coast at the end.",
    ],
    durationDays: 12,
    destinations: ["sigiriya-and-dambulla", "kandy", "ella", "yala", "south-coast"],
    interests: ["culture", "wildlife", "nature", "rail", "beach"],
    style: "Heritage & wildlife",
    itinerary: [
      { day: 1, title: "Arrival in Negombo", description: "Airport welcome and transfer to Negombo to rest.", overnight: "Negombo" },
      {
        day: 2,
        title: "To Anuradhapura",
        description: "Drive to the ancient sacred city of Anuradhapura. Afternoon among its great stupas.",
        overnight: "Anuradhapura",
      },
      {
        day: 3,
        title: "Anuradhapura to Sigiriya",
        description: "Morning visit to the sacred Bodhi tree, then continue to the Sigiriya area.",
        overnight: "Sigiriya area",
      },
      {
        day: 4,
        title: "Sigiriya and Dambulla",
        description: "Early climb of Sigiriya, afternoon at the Dambulla cave temple.",
        overnight: "Sigiriya area",
      },
      {
        day: 5,
        title: "Polonnaruwa and an elephant safari",
        description: "Explore the medieval capital of Polonnaruwa, then an afternoon safari in Minneriya or Kaudulla.",
        overnight: "Sigiriya area",
      },
      { day: 6, title: "To Kandy", description: "Drive to Kandy. Evening temple visit.", overnight: "Kandy" },
      {
        day: 7,
        title: "Kandy",
        description: "Royal Botanic Gardens, Peradeniya, and a Kandyan dance performance.",
        overnight: "Kandy",
      },
      {
        day: 8,
        title: "Tea country",
        description: "Drive to Nuwara Eliya with a tea factory visit.",
        overnight: "Nuwara Eliya",
      },
      {
        day: 9,
        title: "The train to Ella",
        description: "Scenic train to Ella. Afternoon at leisure or a walk to the Nine Arches Bridge.",
        overnight: "Ella",
      },
      {
        day: 10,
        title: "To Yala",
        description: "Drive to the Yala area for an afternoon jeep safari.",
        overnight: "Yala / Tissamaharama area",
      },
      {
        day: 11,
        title: "Morning safari and the south coast",
        description: "Optional early safari, then continue west to Mirissa.",
        overnight: "Mirissa",
      },
      { day: 12, title: "Departure", description: "Transfer to the airport via the Southern Expressway.", overnight: null },
    ],
    included: standardIncluded,
    excluded: standardExcluded,
    pickup: standardPickup,
    image: "safariElephant",
    isSample: true,
  },
  {
    slug: "grand-tour-of-sri-lanka",
    title: "The Grand Tour of Sri Lanka",
    summary:
      "Fifteen unhurried days through ancient cities, cloud forest, wildlife parks and the southern coast.",
    description: [
      "Our most complete journey gives time for everything: the ancient cities, Kandy, the highlands including Horton Plains, a Yala safari, whale watching in season, and several restful days by the sea.",
      "It is a natural starting point for a fully tailored itinerary.",
    ],
    durationDays: 15,
    destinations: ["sigiriya-and-dambulla", "kandy", "ella", "yala", "south-coast", "galle"],
    interests: ["culture", "wildlife", "nature", "rail", "beach", "wellness"],
    style: "Comprehensive",
    itinerary: [
      { day: 1, title: "Arrival in Negombo", description: "Airport welcome and transfer to Negombo.", overnight: "Negombo" },
      { day: 2, title: "To Anuradhapura", description: "Drive to Anuradhapura and explore its ancient stupas.", overnight: "Anuradhapura" },
      { day: 3, title: "To Sigiriya", description: "Continue to the Sigiriya area. Sunset at Pidurangala Rock.", overnight: "Sigiriya area" },
      { day: 4, title: "Sigiriya and Dambulla", description: "Climb Sigiriya and visit the Dambulla cave temple.", overnight: "Sigiriya area" },
      {
        day: 5,
        title: "Polonnaruwa and an elephant safari",
        description: "Medieval Polonnaruwa, then an afternoon jeep safari in Minneriya or Kaudulla.",
        overnight: "Sigiriya area",
      },
      { day: 6, title: "To Kandy", description: "Drive to Kandy via a spice garden. Evening temple visit.", overnight: "Kandy" },
      { day: 7, title: "Kandy", description: "Peradeniya gardens, the lake and Kandyan dance.", overnight: "Kandy" },
      { day: 8, title: "Tea country", description: "Drive to Nuwara Eliya with a tea estate visit.", overnight: "Nuwara Eliya" },
      {
        day: 9,
        title: "Horton Plains and the train to Ella",
        description: "Early walk on Horton Plains, then the scenic train onwards to Ella.",
        overnight: "Ella",
      },
      { day: 10, title: "Ella", description: "Little Adam's Peak, the Nine Arches Bridge and Ravana Falls.", overnight: "Ella" },
      { day: 11, title: "To Yala", description: "Drive to Yala for an afternoon jeep safari.", overnight: "Yala / Tissamaharama area" },
      {
        day: 12,
        title: "Morning safari and the south coast",
        description: "Optional early safari, then continue to Mirissa.",
        overnight: "Mirissa",
      },
      {
        day: 13,
        title: "Mirissa",
        description: "Optional whale-watching trip in season (roughly November to April), or a day on the beach.",
        overnight: "Mirissa",
      },
      { day: 14, title: "Galle", description: "Short drive to Galle. Explore the fort lanes and ramparts.", overnight: "Galle" },
      { day: 15, title: "Departure", description: "Transfer to the airport via the Southern Expressway.", overnight: null },
    ],
    included: standardIncluded,
    excluded: standardExcluded,
    pickup: standardPickup,
    image: "galleLighthouse",
    isSample: true,
  },
];

export function getTour(slug: string): Tour | undefined {
  return tours.find((t) => t.slug === slug);
}

export function toursForDestination(slug: string): Tour[] {
  return tours.filter((t) => t.destinations.includes(slug));
}
