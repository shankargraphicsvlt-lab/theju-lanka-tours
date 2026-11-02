import type { Experience } from "./types";

export const experiences: Experience[] = [
  {
    slug: "ancient-cities-of-the-cultural-triangle",
    title: "Ancient Cities of the Cultural Triangle",
    category: "culture",
    summary:
      "Royal citadels, sacred cave temples and medieval capitals, explored with a guide at an unhurried pace.",
    description: [
      "The Cultural Triangle holds several of Sri Lanka's UNESCO World Heritage Sites within a few hours' drive of each other: the rock fortress of Sigiriya, the cave temple of Dambulla, the medieval city of Polonnaruwa and the ancient sacred city of Anuradhapura.",
      "We plan visits for the cooler hours of the day, allow time to linger, and pair the major sites with quieter places such as village walks and reservoir-side sunsets.",
    ],
    whatToExpect: [
      "Early-morning climb of Sigiriya to avoid the midday heat",
      "Guided visit to the painted caves of Dambulla",
      "Cycling or driving among the ruins of Polonnaruwa",
      "Time to rest between visits at a countryside hotel",
    ],
    goodToKnow: [
      "Shoulders and knees should be covered at temples, and shoes and hats removed.",
      "Sigiriya involves around 1,200 steps and some exposed stairways.",
      "Site entrance fees are set by the authorities and may change.",
    ],
    destinations: ["sigiriya-and-dambulla"],
    duration: "2–4 days",
    image: "sigiriyaRock",
  },
  {
    slug: "leopard-and-elephant-safaris",
    title: "Leopard & Elephant Safaris",
    category: "wildlife",
    summary:
      "Jeep safaris in Yala and the elephant parks of the north-central plains, planned around the seasons.",
    description: [
      "Sri Lanka packs remarkable wildlife into a small island. Yala is renowned for its leopards, while Minneriya and Kaudulla are famous for the elephant herds that gather on their reservoirs late in the dry season.",
      "We choose parks according to the time of year and favour drivers who respect park rules and keep a proper distance from wildlife.",
    ],
    whatToExpect: [
      "Early-morning or late-afternoon jeep safaris",
      "Leopards, elephants, sloth bears, crocodiles and abundant birdlife",
      "Choice of park depending on season and closures",
    ],
    goodToKnow: [
      "Wildlife sightings are never guaranteed.",
      "Parts of Yala have historically closed for several weeks late in the dry season.",
      "Bring a hat, sun protection and binoculars if you have them.",
    ],
    destinations: ["yala", "sigiriya-and-dambulla"],
    duration: "Half day to 2 days",
    image: "safariElephant",
  },
  {
    slug: "hill-country-rail-journey",
    title: "The Hill-Country Rail Journey",
    category: "rail",
    summary:
      "Ride the celebrated railway through tea country and cloud forest to Ella, with your vehicle meeting you at the other end.",
    description: [
      "The railway from Kandy through Nanu Oya to Ella climbs through tea estates, tunnels and misty ridges. It is slow, open-windowed and quite unlike any road journey.",
      "Your driver takes your luggage by road and meets you at the station, so you can travel light and simply enjoy the view.",
    ],
    whatToExpect: [
      "A scenic train journey of several hours through the highlands",
      "Views of tea estates, waterfalls and mountain villages",
      "Station pick-up by your driver on arrival",
    ],
    goodToKnow: [
      "Reserved seats are limited and released on a fixed schedule; tickets are subject to availability.",
      "Trains frequently run late. We build in flexibility.",
      "The most popular stretch is between Nanu Oya and Ella.",
    ],
    destinations: ["kandy", "ella"],
    duration: "Half day to full day",
    image: "ellaTrain",
  },
  {
    slug: "tea-country-estates",
    title: "Tea Country Estates",
    category: "nature",
    summary:
      "Rolling estates, cool mountain air and a closer look at how Ceylon tea is grown, plucked and processed.",
    description: [
      "Tea has shaped the landscape and communities of Sri Lanka's highlands since the nineteenth century. Around Nuwara Eliya, Talawakelle and Ella, estates cover the slopes in neat green terraces.",
      "A visit to a working tea factory shows the journey from leaf to cup, and estate bungalows offer a peaceful place to stay among the plantations.",
    ],
    whatToExpect: [
      "Tea factory visit and tasting",
      "Walks through estate paths and viewpoints",
      "Optional stay in a converted planter's bungalow",
    ],
    goodToKnow: [
      "Evenings in the highlands can be cool, so pack a warm layer.",
      "Please ask before photographing tea pluckers at work.",
    ],
    destinations: ["ella", "kandy"],
    duration: "1–3 days",
    image: "teaPlucking",
  },
  {
    slug: "south-coast-and-whale-watching",
    title: "South Coast & Whale Watching",
    category: "beach",
    summary:
      "Beach time on the southern coast with optional seasonal whale-watching from Mirissa.",
    description: [
      "After the highlands, the south coast is the place to slow down. Choose between the lively crescent of Mirissa, the surf of Weligama or the quiet beaches of Tangalle.",
      "In season, roughly November to April, boats from Mirissa head out in search of blue whales, sperm whales and dolphins. We recommend operators who follow responsible viewing guidelines.",
    ],
    whatToExpect: [
      "Relaxed days on the beach with optional excursions",
      "Morning whale-watching boat trip in season",
      "Galle Fort and coastal villages nearby",
    ],
    goodToKnow: [
      "Sea conditions can be rough; trips may be cancelled for safety.",
      "Sightings depend on the season and are never guaranteed.",
    ],
    destinations: ["south-coast", "galle"],
    duration: "2–5 days",
    image: "mirissaShore",
  },
  {
    slug: "sacred-kandy",
    title: "Sacred Kandy",
    category: "culture",
    summary:
      "Temple rituals, traditional dance and the botanical gardens of Sri Lanka's last royal capital.",
    description: [
      "Kandy's rhythm is set by the drums of the Temple of the Sacred Tooth Relic. An evening visit, followed by a performance of Kandyan dance, is one of the most memorable introductions to Sri Lankan culture.",
      "If your travel dates allow, the Esala Perahera procession, usually in July or August, is an extraordinary spectacle, though it requires planning well in advance.",
    ],
    whatToExpect: [
      "Evening visit to the Temple of the Sacred Tooth Relic",
      "Kandyan dance and drumming performance",
      "Royal Botanic Gardens, Peradeniya",
    ],
    goodToKnow: [
      "Modest dress is required at the temple.",
      "Perahera dates follow the lunar calendar and are confirmed each year.",
    ],
    destinations: ["kandy"],
    duration: "1–2 days",
    image: "kandyPerahera",
  },
];

export function getExperience(slug: string): Experience | undefined {
  return experiences.find((e) => e.slug === slug);
}
