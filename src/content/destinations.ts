import type { Destination } from "./types";

/**
 * Editorial destination content. Facts are limited to widely documented,
 * checkable information (UNESCO inscriptions, history, seasons). Seasonal
 * notes are deliberately general; conditions vary year to year.
 */
export const destinations: Destination[] = [
  {
    slug: "sigiriya-and-dambulla",
    name: "Sigiriya & Dambulla",
    region: "Cultural Triangle",
    tagline: "A fortress in the sky and a temple carved into rock",
    summary:
      "Climb the fifth-century rock citadel of Sigiriya and step into the painted cave temples of Dambulla, two UNESCO World Heritage Sites at the heart of the island.",
    description: [
      "Rising abruptly from the plains of the central dry zone, Sigiriya was transformed into a royal citadel by King Kashyapa in the late fifth century. A path climbs past landscaped water gardens, a gallery of painted frescoes and the polished Mirror Wall to the great Lion Gate, where only the carved paws remain, and finally to the palace ruins on the summit. Sigiriya was inscribed as a UNESCO World Heritage Site in 1982.",
      "Half an hour away, the Dambulla cave temple has been a place of Buddhist worship for more than two thousand years. Its five caves hold well over a hundred statues of the Buddha and ceilings densely painted with murals. The site was inscribed by UNESCO in 1991.",
      "The surrounding countryside of reservoirs, paddy fields and forest makes this an easy base for Polonnaruwa, the medieval capital, and for elephant safaris in the nearby Minneriya and Kaudulla national parks.",
    ],
    highlights: [
      {
        title: "Sigiriya Rock Fortress",
        text: "An early start beats the heat and the crowds on the climb of roughly 1,200 steps to the summit.",
      },
      {
        title: "Dambulla Cave Temple",
        text: "Five painted caves filled with Buddha statues, reached by a short climb with views across the plains.",
      },
      {
        title: "Pidurangala at sunrise",
        text: "A neighbouring rock with a scramble to the top and a celebrated view of Sigiriya at first light.",
      },
      {
        title: "Elephants of Minneriya",
        text: "Late in the dry season, typically around July to October, elephants gather on the shores of the Minneriya reservoir.",
      },
    ],
    bestTime:
      "Visitable year-round. Generally driest from around February to September; heavier showers are possible between October and January.",
    gettingThere:
      "Around 4 to 5 hours by road from Bandaranaike International Airport, depending on traffic and stops.",
    interests: ["culture", "wildlife", "nature"],
    heroImage: "sigiriyaAerial",
    gallery: ["sigiriyaRock", "dambullaCave", "minneriyaElephants"],
    coordinates: { lat: 7.957, lng: 80.76 },
  },
  {
    slug: "kandy",
    name: "Kandy",
    region: "Hill Country",
    tagline: "The last royal capital, set around a lake",
    summary:
      "Sri Lanka's cultural heart and home of the Temple of the Sacred Tooth Relic, framed by forested hills at the gateway to tea country.",
    description: [
      "Kandy was the capital of the last Sinhalese kingdom until 1815. At its centre stands the Temple of the Sacred Tooth Relic, Sri Dalada Maligawa, which enshrines a relic revered by Buddhists around the world. Daily rituals, accompanied by drumming, draw pilgrims and visitors alike. The Sacred City of Kandy was inscribed as a UNESCO World Heritage Site in 1988.",
      "A walk around Kandy Lake, created in the early nineteenth century, reveals the town at an unhurried pace, while the Royal Botanic Gardens at Peradeniya, a short drive away, are known for their orchid house and avenues of royal palms.",
      "Each year, usually in July or August, the Esala Perahera fills the streets with dancers, drummers and caparisoned elephants over several nights. Exact dates follow the lunar calendar and accommodation is in high demand.",
    ],
    highlights: [
      {
        title: "Temple of the Sacred Tooth Relic",
        text: "Visit during an evening ritual to hear the drums and see offerings of flowers. Modest dress is required.",
      },
      {
        title: "Royal Botanic Gardens, Peradeniya",
        text: "Spacious, shaded gardens on a bend of the Mahaweli River, a short drive from town.",
      },
      {
        title: "Kandyan dance",
        text: "A cultural performance of traditional dance and drumming, often including fire walking.",
      },
      {
        title: "Esala Perahera",
        text: "One of Asia's great processions, held over several nights, usually in July or August.",
      },
    ],
    bestTime:
      "Pleasant year-round thanks to its altitude. January to April is typically the driest period; plan well ahead for Perahera season.",
    gettingThere:
      "About 3 to 4 hours by road from the airport. Kandy is also on the main railway line from Colombo.",
    interests: ["culture", "nature"],
    heroImage: "kandyTemple",
    gallery: ["kandyPerahera", "teaPlucking"],
    coordinates: { lat: 7.2936, lng: 80.6413 },
  },
  {
    slug: "ella",
    name: "Ella",
    region: "Hill Country",
    tagline: "Mist, tea terraces and the bridge in the sky",
    summary:
      "A small hill-country town surrounded by tea estates and walking trails, reached by one of the world's most scenic railway journeys.",
    description: [
      "Set at roughly 1,000 metres in the Badulla District, Ella is surrounded by steep green valleys, tea estates and waterfalls. Cooler air and easy walks make it a favourite pause in any itinerary.",
      "The Nine Arches Bridge at Demodara, a colonial-era railway viaduct built from stone, brick and cement, is one of the island's most photographed sights, best seen when a train curves across it through the jungle.",
      "The railway journey from Kandy or Nanu Oya to Ella winds through tea country, tunnels and cloud forest. Reserved seats are limited and sell quickly, so tickets are subject to availability.",
    ],
    highlights: [
      {
        title: "Nine Arches Bridge",
        text: "A short walk through tea and forest leads to viewpoints over the viaduct; train times vary.",
      },
      {
        title: "Little Adam's Peak",
        text: "An easy hike of about an hour with sweeping views across the Ella Gap.",
      },
      {
        title: "The hill-country train",
        text: "A slow, beautiful ride past tea estates and misty ridges, often counted among the world's great rail journeys.",
      },
      {
        title: "Ravana Falls",
        text: "A tiered waterfall beside the road below Ella, at its fullest after rain.",
      },
    ],
    bestTime:
      "Generally driest from January to April. Mist and showers are possible at any time of year, and evenings can be cool.",
    gettingThere:
      "By train from Kandy or Nanu Oya, or around 5 to 6 hours by road from Kandy. Roughly 2 to 3 hours by road to Yala.",
    interests: ["nature", "rail"],
    heroImage: "ellaAerial",
    gallery: ["ellaTrain", "teaPlucking"],
    coordinates: { lat: 6.8667, lng: 81.0466 },
  },
  {
    slug: "galle",
    name: "Galle",
    region: "South Coast",
    tagline: "A walled sea-port of ramparts and quiet lanes",
    summary:
      "Wander the ramparts, churches and boutiques of Galle Fort, a living colonial-era town on the southern coast and a UNESCO World Heritage Site.",
    description: [
      "First fortified by the Portuguese in the sixteenth century, Galle was extensively rebuilt by the Dutch in the seventeenth century, whose ramparts still encircle the old town today. The Old Town of Galle and its Fortifications was inscribed as a UNESCO World Heritage Site in 1988.",
      "Inside the walls, narrow streets of low colonial houses hold cafés, galleries and small hotels alongside homes, schools and places of worship. The ramparts, the white lighthouse and the clock tower are at their most atmospheric in the late afternoon.",
      "Galle makes a relaxed base for the beaches of the south-west coast, including Unawatuna, and is around two hours from Colombo via the Southern Expressway.",
    ],
    highlights: [
      {
        title: "Sunset on the ramparts",
        text: "Walk the walls from the clock tower to the lighthouse as the sun drops into the Indian Ocean.",
      },
      {
        title: "Fort lanes and architecture",
        text: "Colonial churches, merchant houses and courtyards, best explored slowly on foot.",
      },
      {
        title: "Galle Lighthouse",
        text: "The white lighthouse on the south-eastern corner of the fort, framed by palms and sea.",
      },
      {
        title: "Nearby beaches",
        text: "Unawatuna and the coves along the coast are a short drive away.",
      },
    ],
    bestTime:
      "December to April usually brings the calmest seas and sunniest weather on the south-west coast. May to September can be wetter with rougher seas.",
    gettingThere:
      "Around 2 hours from Colombo and roughly 2.5 hours from the airport via the Southern Expressway.",
    interests: ["culture", "beach", "food"],
    heroImage: "galleClockTower",
    gallery: ["galleLighthouse", "mirissaShore"],
    coordinates: { lat: 6.0261, lng: 80.217 },
  },
  {
    slug: "yala",
    name: "Yala",
    region: "Deep South",
    tagline: "Leopards, elephants and wild coastal scrub",
    summary:
      "Explore Yala National Park by jeep in search of leopards, elephants, sloth bears and remarkable birdlife in Sri Lanka's dry south-east.",
    description: [
      "Yala National Park stretches across scrub jungle, lagoons, rocky outcrops and coastline in the island's south-east. It is one of Sri Lanka's most visited parks and is renowned for its leopards, alongside Asian elephants, sloth bears, crocodiles, water buffalo, spotted deer and peafowl.",
      "Safaris take place by jeep, usually in the early morning and late afternoon when animals are most active. Sightings are never guaranteed, and a respectful driver who keeps a proper distance makes for a better experience for visitors and wildlife alike.",
      "Parts of the park have historically closed for several weeks late in the dry season, often around September and October. Closure dates vary, so they are confirmed before any safari is booked.",
    ],
    highlights: [
      {
        title: "Morning jeep safari",
        text: "Enter at opening time for cooler air and the best chance of seeing wildlife on the move.",
      },
      {
        title: "Birdlife",
        text: "Painted storks, bee-eaters, eagles and waders gather around the park's lagoons and waterholes.",
      },
      {
        title: "Coastal landscapes",
        text: "Rocky outcrops, dunes and empty beaches give the park a character unlike any other in Sri Lanka.",
      },
      {
        title: "Responsible wildlife viewing",
        text: "We favour unhurried safaris that respect park rules and give animals space.",
      },
    ],
    bestTime:
      "Usually best from around February to June, when water is scarcer and animals gather. Check seasonal closures before booking.",
    gettingThere:
      "Around 2 to 3 hours by road from Ella, or about 4 to 5 hours from Colombo via the Southern Expressway.",
    interests: ["wildlife", "nature"],
    heroImage: "yalaLeopard",
    gallery: ["safariElephant", "minneriyaElephants"],
    coordinates: { lat: 6.42, lng: 81.42 },
  },
  {
    slug: "south-coast",
    name: "South Coast",
    region: "South Coast",
    tagline: "Palm-fringed bays, whales and slow days by the sea",
    summary:
      "From Mirissa's crescent beach to the quiet sands of Tangalle, the southern coast is the place to unwind at the end of a journey.",
    description: [
      "The stretch of coast between Galle and Tangalle is lined with bays, headlands and fishing villages. Mirissa's crescent beach is the liveliest, Weligama's wide bay is known for beginner-friendly surf, and Tangalle offers long, quiet stretches of sand.",
      "From roughly November to April, boats leave Mirissa harbour in search of whales and dolphins, including blue whales. Choosing an operator that follows responsible viewing guidelines matters, and sightings depend on the sea and the season.",
      "Along the coast near Koggala and Ahangama you may see traditional stilt fishing. Today many of the stilt fishermen pose for photographs for a fee, but the practice remains a striking reminder of the coast's fishing heritage.",
    ],
    highlights: [
      {
        title: "Whale watching from Mirissa",
        text: "Seasonal boat trips, typically between November and April, with responsible operators.",
      },
      {
        title: "Surfing at Weligama",
        text: "A gentle, sandy-bottomed bay well suited to first lessons.",
      },
      {
        title: "Quiet Tangalle",
        text: "Long, uncrowded beaches and secluded stays further east along the coast.",
      },
      {
        title: "Coastal food",
        text: "Fresh seafood, hoppers and rice and curry in small beachside restaurants.",
      },
    ],
    bestTime:
      "December to April is generally the best season for calm seas and whale watching. The south-west monsoon brings rougher water from about May to September.",
    gettingThere:
      "Mirissa is around 3 hours from the airport via the Southern Expressway, and about 45 minutes from Galle.",
    interests: ["beach", "wildlife", "wellness", "food"],
    heroImage: "mirissaBeach",
    gallery: ["mirissaShore", "galleLighthouse"],
    coordinates: { lat: 5.948, lng: 80.458 },
  },
];

export function getDestination(slug: string): Destination | undefined {
  return destinations.find((d) => d.slug === slug);
}
