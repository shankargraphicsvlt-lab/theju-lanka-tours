# Phase status

## Confirmed group pricing

- USD 65/day is the **total for a group of exactly 2 people**, 15% off (USD 55.25/day; discount changed from 25% on 2026-10-31). It is labelled "For 2 people" wherever a price appears and is never multiplied by the number of travellers.
- Solo travellers, groups of 3+, and any party with children see **"Custom quote required"**. No child or larger-group pricing has been invented.
- The same rule is enforced in the (not yet applied) database migrations.

## Phase D preparation (local only, awaiting approval to connect)

### Application code (written and tested locally, switched off)

- **Booking persistence:** the `/plan-your-trip` form posts to a server action ([`actions.ts`](../src/app/(site)/plan-your-trip/actions.ts)) → [`submitEnquiry`](../src/lib/booking/submit-enquiry.ts): per-IP rate limit (hashed IP, counted before validation), honeypot + minimum fill time, the shared Zod schema, an idempotency key per filled-in form, then `create_booking_enquiry` with the secret key. Database error codes are mapped to friendly messages; raw errors are never shown. The visitor sees their `TLT-XXXX-XXXX` reference and "an enquiry is not a confirmed booking".
- **Off by default.** It runs only when `BOOKING_SUBMISSIONS_ENABLED=true` **and** the Supabase URL, publishable key, secret key and hash salt are all set. Otherwise the form behaves exactly as before ("nothing is sent or stored").
- **Staff sign-in:** `/admin/login` (email + password, one generic failure message, 5 attempts per 15 min per IP), `/admin` enquiry list read with the signed-in user's session so RLS applies. Every page and action calls `requireStaff()`: user verified with the Auth server, then an active `admin_profiles` row checked by `current_admin_role()`. Not signed in → sign-in page; signed in without access → 404. `proxy.ts` only refreshes the session cookie. The staff area returns 404 entirely until Supabase is configured.
- The secret key is only read in modules marked `server-only` (a build error if imported into browser code).
- Tests: 12 unit tests for the submission logic (fake store), 5 integration tests running it against the real migrations in PGlite.
- **Not yet verified against a real Supabase project** (sign-in, cookies, Data API). That happens after the project exists and you approve connecting.

### Database

- Three SQL migrations in `supabase/migrations/` (schema, access control, business rules) and a seed generated from the site content (`npm run db:seed:generate`).
- Design documented in [database-and-security.md](database-and-security.md); setup steps in [supabase-setup-windows.md](supabase-setup-windows.md).
- 91 database tests in `tests/db/` run the real migrations in an in-process Postgres (PGlite): RLS on every table, visitor / signed-in / staff / admin access, enquiry creation, idempotency, validation, lookup privacy, rate limiting, status rules, and "no confirmation without a verified payment".
- **No Supabase project exists yet; nothing has been connected or applied remotely. With no Supabase settings, the website does not use the database.**

## Phase C (partial): confirmed pricing and trip estimator

- Central pricing settings in `src/config/pricing.ts`: USD 65.00/day, no additional charges; the discount (15%) is `DISCOUNT_PERCENT` in `src/config/site.ts`.
- Calculator in `src/lib/pricing.ts` (integer cents, validated inputs, optional disclosed extras).
- Tour cards show the discounted price, the struck-through original and a "15% off" badge. Tour pages show the full breakdown: original price (days × rate), discount %, discount amount, discounted price, per-day equivalent and the disclosure.
- Live estimator in the `/plan-your-trip` form (days from the visitor's dates, inclusive; falls back to the selected tour). The estimate is also included in the form result and the "email these details" summary.
- Tour inclusion and exclusion lists relabelled as unconfirmed samples; no "all-inclusive" wording anywhere.
- Destination search (text across names, descriptions and highlights) plus region and interest filters on `/destinations`.
- Tour filters for package duration, destination and experience type on `/tours`.
- Filters are server-rendered from the URL: they work without JavaScript, produce shareable links, ignore unknown values, and show result counts and empty states.
- Package duration ("10-day package") and hotel nights ("9 hotel nights", counted from the itinerary's overnight stops) are shown separately. Prices are based on package days.
- Pricing basis is a setting (`basis` in `src/config/pricing.ts`). It was `"unconfirmed"` at the end of Phase C and has since been confirmed as `"per-group"` for 2 people (see "Confirmed group pricing" above).
- Images are served as WebP only (AVIF removed: much slower to encode on a cold self-hosted server).
- Tests: 78 unit tests; 46 Playwright end-to-end tests (search, filters, no-JS fallback, tour-detail navigation, price display) on desktop and mobile.

### Not implemented (do not claim otherwise)

Booking persistence, customer accounts, admin authentication/authorisation, email sending and payment processing do not exist yet. The enquiry form validates input and stores nothing.

## Phase B: visual foundation and public pages (complete, awaiting review)

### Works

- All required public routes render: `/`, `/destinations`, `/destinations/[slug]` (6), `/experiences`, `/experiences/[slug]` (6), `/tours`, `/tours/[slug]` (5), `/plan-your-trip`, `/about`, `/gallery`, `/contact`, `/booking/[reference]`, `/privacy`, `/terms`, `/cancellation-policy`, plus a custom 404 and error page.
- Destination, experience and tour pages are statically generated; unknown slugs return 404.
- Homepage: hero, trip finder (plain GET form, works without JavaScript), featured destinations, signature experiences, sample tours, interactive destination map, approach/trust section built on process commitments (no unverified claims), FAQ, contact CTA and footer. No testimonials section, because no verified testimonials exist.
- Trip finder choices pre-fill the enquiry form; query values are whitelisted.
- Enquiry, contact and booking-lookup forms validate with shared Zod schemas, show an error summary and per-field errors, and clearly state that **nothing is sent or stored**. If a business email is configured, visitors can send the details by email instead.
- Booking-lookup page: requires reference **and** email, only pre-fills well-formed references, is `noindex`, and reveals nothing.
- Accessibility: skip link, semantic landmarks, labelled controls, visible focus styles, keyboard-accessible mobile menu (focus trap, Escape, focus return, `inert` when closed), keyboard-accessible map pins, native `<details>` FAQ, reduced-motion support for all CSS and GSAP animation.
- SEO: per-page titles, descriptions, canonical URLs, Open Graph (with images), sitemap, robots.txt, BreadcrumbList structured data.
- Images: 15 verified, locally stored Unsplash photos with blur placeholders and responsive AVIF/WebP.

### Not implemented yet (by design)

- Searchable / filterable listings and the trip-estimate calculator (Phase C)
- Supabase schema, RLS, admin authentication, booking storage, booking references, rate limiting (Phase D)
- Email notifications and PayHere sandbox payments (Phase E)
- 3D scene (Phase F)
- Playwright end-to-end test suite, Content-Security-Policy (Phase G)

### Known limitations

- Git is not installed, so no repository has been initialised.
- Legal pages are drafts with placeholders.
- The map outline is a simplified, hand-traced illustration.
- `NEXT_PUBLIC_SITE_URL` defaults to `http://localhost:3000` when unset, so canonical/OG URLs in local builds point there.
