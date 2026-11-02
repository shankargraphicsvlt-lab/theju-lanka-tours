# GSKT Lanka Tours

*Discover Sri Lanka, Your Way.*

Website for GSKT Lanka Tours: private, tailor-made journeys across Sri Lanka. Built with Next.js (App Router), TypeScript, Tailwind CSS and GSAP.

> **Status: Phase B (visual foundation and public pages).**
> Booking submission, booking lookup, payments, email and the admin dashboard are **not implemented yet**. Forms validate input in the browser but **send and store nothing**. Tour prices use the confirmed daily rate (USD 65/day, 15% discount; see `src/config/pricing.ts` and `DISCOUNT_PERCENT` in `src/config/site.ts`); itineraries and inclusion lists are **samples**.

## Requirements

- Node.js 20.9 or newer (developed on Node 24)
- npm 10 or newer
- Windows PowerShell, macOS or Linux

## Getting started (Windows PowerShell)

```powershell
cd "F:\Theju Lanka Tours"
npm install
Copy-Item .env.example .env.local   # then edit .env.local (optional for local dev)
npm run dev                          # http://localhost:3000
```

The site runs without any environment variables. Missing contact and legal details appear as clearly labelled placeholders.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) |
| `npm run lint` | ESLint (Next.js core-web-vitals + TypeScript rules) |
| `npm test` | Unit tests (Vitest) |
| `npm run check` | Typecheck, lint and tests together |
| `npm run test:e2e` | Playwright end-to-end tests (desktop + mobile) against the production build; see below |
| `npm run images:fetch` | Re-download the credited Unsplash photos (`-- --force` to overwrite) |

## End-to-end tests (Windows)

```powershell
npm run build
npm start -- -p 3100          # terminal 1 (optional: Playwright starts a server if none is running)
npm run test:e2e              # terminal 2
```

The suite runs with **one worker** locally. On the Windows development machine, running browsers in parallel intermittently stalled first page loads: with 3 workers, 3–5 of 46 tests failed on each run (different tests each time); with 1 worker, all 46 passed. The website code was not the cause, but the root cause was not pinned down. CI on Linux has not been tried yet.

## Project structure

```
src/
  app/
    (site)/            public pages, sharing the header + footer layout
    layout.tsx         fonts, global metadata
    sitemap.ts, robots.ts, not-found.tsx, icon.svg, opengraph-image.jpg
  assets/images/       locally stored, compressed photographs
  components/
    home/              homepage sections (hero, trip finder, map explorer)
    sections/          shared page sections and cards
    forms/             enquiry, contact and booking-lookup forms
    layout/            header, footer, logo, contact details
    ui/                buttons, headings, badges, scroll reveal
  config/site.ts       brand, contact details, feature flags
  content/             destinations, experiences, sample tours, FAQs, image credits
  lib/                 validation schemas (Zod), dates, formatting, map projection
tests/unit/            Vitest unit tests
scripts/               image download/compression script
docs/                  project documentation
```

## Documentation

- [docs/content-and-contact-details.md](docs/content-and-contact-details.md): updating contact details, legal placeholders and content
- [docs/media-credits.md](docs/media-credits.md): photo sources and licensing
- [docs/deployment-vercel.md](docs/deployment-vercel.md): deploying to Vercel and connecting a domain
- [docs/phase-status.md](docs/phase-status.md): what works, what doesn't, and what's next
- [docs/database-and-security.md](docs/database-and-security.md): schema, Row Level Security, admin authorisation, booking and payment rules
- [docs/supabase-setup-windows.md](docs/supabase-setup-windows.md): creating and connecting the Supabase project (not done yet)

## Honesty rules for content

- Never publish invented customer counts, reviews, ratings, awards, partnerships or licences.
- Prices are calculated only from `src/config/pricing.ts`. Never hard-code a price, and never call it all-inclusive until inclusions are confirmed.
- Itineraries stay flagged `isSample: true` until the business confirms them.
- Testimonials are only added when real, verified testimonials are supplied.
- Legal pages are **drafts** and must be reviewed by a qualified professional before launch.
