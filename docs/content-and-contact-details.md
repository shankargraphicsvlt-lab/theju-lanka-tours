# Updating contact details, legal details and content

## Contact and legal details

Phone, WhatsApp, email and address are set in one file, [`src/config/contact.ts`](../src/config/contact.ts). Every WhatsApp link (top bar, contact page, footer, "Chat on WhatsApp" buttons) and phone link reads from it. Legal and licensing details are three constants at the top of [`src/config/site.ts`](../src/config/site.ts). Change a value there and rebuild/redeploy.

| Field | Current value | Where it appears |
| --- | --- | --- |
| `phone` | 071 878 2006 (`tel:+94718782006`) | Footer, contact page |
| `whatsapp` | 071 878 2006 (`https://wa.me/94718782006`) | Top bar, footer, contact page, "Chat on WhatsApp" buttons |
| `email` | not confirmed (`null`) | Footer, contact page, "email these details" buttons |
| `address` | not confirmed (`null`) | Footer, contact and privacy pages |
| `LEGAL_ENTITY` (site.ts) | empty | Footer copyright, privacy and terms pages, About "Registration & licensing" |
| `COMPANY_REG_NO` (site.ts) | empty | About "Registration & licensing" |
| `SLTDA_REG_NO` (site.ts) | empty | About "Registration & licensing", footer bottom row ("SLTDA Reg. No: …") |

While `email` or `address` is `null`, that row is hidden in the footer and on the contact page. While `LEGAL_ENTITY` is empty, the copyright line reads "© {year} Theju Lanka Tours" (the privacy and terms pages still show a labelled placeholder). On the About page each registration row appears only once its value is set, and the whole "Registration & licensing" section is hidden while all three are empty.

Social profile links and `NEXT_PUBLIC_SITE_URL` (canonical URLs, sitemap, Open Graph) are still environment variables; see `.env.example`.

## Placeholders still in the code

These need real information from the business before launch:

- **About page:** founder story / team introduction; tourism authority registration.
- **Privacy policy:** named service providers and their locations; data retention periods.
- **Terms:** deposit and balance terms; liability; governing law.
- **Cancellation policy:** notice periods and charges; amendment fees; refund terms if the business cancels.

Search the code for `to be confirmed` or `to be provided` to find them all.

## Editorial content

| What | File |
| --- | --- |
| Destinations | `src/content/destinations.ts` |
| Experiences | `src/content/experiences.ts` |
| Sample tours, itineraries, demo prices | `src/content/tours.ts` |
| FAQs | `src/content/faqs.ts` |

Rules:

- Keep `isSample: true` until the business confirms an itinerary. While it is true, a "Sample itinerary" badge appears automatically.
- Tours do **not** store a price. Prices are calculated from `durationDays` (see "Pricing" below).
- Each tour must have exactly one itinerary entry per day, and the last day has `overnight: null`. `npm test` checks this.
- Stick to facts that can be checked. Seasonal and travel-time notes are deliberately general.

## Pricing

All prices come from [`src/config/pricing.ts`](../src/config/pricing.ts), except the discount, which is `DISCOUNT_PERCENT` in [`src/config/site.ts`](../src/config/site.ts).

| Setting | Current value | Meaning |
| --- | --- | --- |
| `basis` | `"per-group"` | Confirmed: the rate is the **total for the group**, never multiplied by travellers |
| `groupSize` | `2` | The party the rate covers: exactly 2 adults. Anything else shows "Custom quote required" |
| `dailyRateCents` | `6500` | USD 65.00 per package day for the 2-person group (amounts are in cents) |
| `DISCOUNT_PERCENT` (site.ts) | `15` | Discount applied to the base price (0–100); `discountPercent` in pricing.ts reads it |
| `additionalCharges` | `[]` | Optional extras, each shown as its own line; none configured |
| `pricingDisclosure` | text | Shown under every price breakdown |

Calculation (in [`src/lib/pricing.ts`](../src/lib/pricing.ts)):

```
base price      = days × daily rate
discount        = discountPercent % of base price (rounded to the nearest cent)
discounted price = base price − discount
total           = discounted price + any configured additional charges
```

| Days | Original | Discount (15%) | Discounted price | ≈ Per person (÷ 2) |
| --- | --- | --- | --- | --- |
| 5 | US$325.00 | −US$48.75 | **US$276.25** | US$138.13 |
| 7 | US$455.00 | −US$68.25 | **US$386.75** | US$193.38 |
| 10 | US$650.00 | −US$97.50 | **US$552.50** | US$276.25 |
| 12 | US$780.00 | −US$117.00 | **US$663.00** | US$331.50 |
| 15 | US$975.00 | −US$146.25 | **US$828.75** | US$414.38 |

Per-person amounts are shown on tour cards as "≈ … per person" and are rounded to the nearest cent, so two of them sum to one cent more than the group total.

Every price is labelled **"For 2 people"**. The published price applies only to **exactly 2 adults with no children**. Solo travellers, groups of 3 or more, and any party with children see **"Custom quote required"** instead of a price. Child pricing and larger-group pricing have not been set; add rules here once the business confirms them. The database applies the same rule when it snapshots an estimate (`estimate_status = 'custom_quote_required'`).

The trip estimator on `/plan-your-trip` counts days **inclusively** from the visitor's dates (arriving 10 Jan and departing 14 Jan = 5 days). If no valid dates are entered, it uses the selected sample tour's duration.

To change the rate or discount, edit `dailyRateCents` or `DISCOUNT_PERCENT`, run `npm run db:seed:generate`, add a Supabase migration that updates `public.pricing_settings` to match (the database calculates enquiry estimates from it), run `npm test` (the tests in `tests/unit/pricing.test.ts` pin the current examples and will need updating to the new values), then rebuild. Adding an extra charge, for example `{ label: "Airport transfer", amountCents: 3000, per: "trip" }`, makes it appear as a separate disclosed line on every price.

**Do not describe prices as all-inclusive** until the business confirms what the daily rate covers. The tour pages' inclusion and exclusion lists are labelled as unconfirmed samples.

In Phase D this content moves into the Supabase database with an admin editor; the data shapes in `src/content/types.ts` are the starting point for the schema.
