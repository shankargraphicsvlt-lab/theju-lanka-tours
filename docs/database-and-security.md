# Database and security design (Phase D)

**Status:** designed and tested locally. **Not applied to any Supabase project.** The website code that uses the database (enquiry submission, staff sign-in) is written but stays switched off until Supabase is configured; see [phase-status.md](phase-status.md).

**IP addresses:** the server reads the client IP from `X-Forwarded-For`, which Vercel sets. On a host that does not overwrite this header, visitors could spoof it to evade the per-IP limit (the per-email cap still applies). IPs are only stored as salted SHA-256 hashes.

- Migrations: [`supabase/migrations/`](../supabase/migrations/)
- Seed (generated from the site content): [`supabase/seed.sql`](../supabase/seed.sql), regenerate with `npm run db:seed:generate`
- Tests: [`tests/db/`](../tests/db/). They run the real migrations in PGlite (Postgres compiled to WebAssembly, in-process, no network) with stand-ins for Supabase's roles and `auth.uid()`.

## 1. Tables

| Table | Purpose | Notes |
| --- | --- | --- |
| `destinations` | Editorial destination pages | `is_published` controls visibility |
| `experiences` | Signature experiences | |
| `experience_destinations` | Experience ↔ destination links | |
| `tours` | Sample tours | **No price column.** Price = `duration_days` × `pricing_settings` |
| `tour_destinations` | Tour ↔ destination, ordered | |
| `tour_itinerary_days` | Day-by-day itinerary | `overnight` null = no hotel night (hotel nights ≠ package days) |
| `pricing_settings` | Single row: USD 65/day for a group of 2, 15% off (set by migration `20261031000100_discount_15_percent.sql`) (`basis = 'per-group'`, `group_size = 2`) | Mirrors `src/config/pricing.ts` and `DISCOUNT_PERCENT` in `src/config/site.ts` |
| `pricing_additional_charges` | Optional disclosed extras | None active |
| `bookings` | Booking enquiries | Status machine below; estimate snapshot; random `reference` |
| `booking_status_history` | Every status change, who and when | Written by trigger only |
| `booking_notes` | Internal staff notes | Insert-only, author = signed-in user |
| `payments` | Provider payments (PayHere) | Written only by server code after signature verification |
| `payment_events` | Raw, sanitised provider notifications | Unique `event_key` makes callbacks idempotent |
| `contact_enquiries` | Contact form messages (backup copy; each message is also emailed to the business through Resend) | |
| `newsletter_subscribers` | Newsletter sign-ups: unique lower-case email, `created_at` (migration `20261101000100_newsletter_subscribers.sql`). Added only through `subscribe_newsletter()` as service_role; staff can read | |
| `admin_profiles` | Who is staff, and their role | **Being signed in is not enough** |
| `rate_limits` | Fixed-window counters | No API access |
| `audit_log` | Changes to content, pricing, staff, payments | Written by trigger only |

Traveller details are stored as counts (adults, children) on the booking. A per-traveller table (names, passports) is deliberately **not** included: it isn't needed for enquiries and would add sensitive personal data. It can be added when confirmed bookings require it.

## 2. Roles

| Role | Who | Key used |
| --- | --- | --- |
| `anon` | Website visitors | Publishable key (`sb_publishable_…`), safe in the browser |
| `authenticated` | Anyone signed in via Supabase Auth | Publishable key + user session |
| staff (`admin_profiles.role = 'staff'`) | Booking handlers | Signed-in session |
| admin (`admin_profiles.role = 'admin'`) | Owner / managers | Signed-in session |
| `service_role` | Trusted server code only | Secret key (`sb_secret_…`), **server only**, bypasses RLS |

## 3. Access matrix (enforced by grants + Row Level Security)

| | Visitor (`anon`) | Signed in, not staff | Staff | Admin | Server (secret key) |
| --- | --- | --- | --- | --- | --- |
| Published content, pricing | Read | Read | Read (+ drafts) | Read + write | All |
| Bookings | — | — (0 rows) | Read; change status and quote only | Same as staff | Create via function |
| Customer details on a booking | — | — | Read only (cannot edit) | Read only | — |
| Status history | — | — | Read | Read | — |
| Notes | — | — | Read; add as self | Same | — |
| Payments | — | — | Read | Read | Write (after verification) |
| Payment events | — | — | — | Read | Write |
| Contact enquiries | — | — | Read; change status | Same | Create via function |
| Admin profiles | — | Own row | Own row | All rows (read) | — |
| Audit log | — | — | — | Read | — |
| Grant admin rights | — | — | — | **No** (SQL editor only) | — |

Design rules:

- **Deny by default.** All privileges are revoked from `anon` and `authenticated`, then the minimum is granted back. RLS is enabled on every table (a test fails if any table lacks it).
- **Visitors never touch admin logic.** Public read policies for `anon` are plain `is_published` checks. (A test caught an earlier version where visitor reads called the staff check and would have failed with "permission denied".)
- **Column-level grants.** Staff can update only `status`, `quoted_total_cents` and `quoted_currency` on bookings; admins can update only `daily_rate_cents`, `discount_percent`, `basis` and `group_size` on pricing.
- **Admin checks** (`is_staff()`, `is_admin()`) are `SECURITY DEFINER` with `search_path = ''`, look up `admin_profiles` by `auth.uid()`, and require `is_active`. Deactivating a profile removes access immediately.
- **Internal helpers** live in a `private` schema that the Data API doesn't expose and API roles can't execute.

## 4. Booking enquiry flow (implemented in `src/lib/booking/`, off until configured)

1. Visitor submits the form. The browser sends an `idempotencyKey` (UUID created when the form loads) and the privacy-notice version.
2. Next.js **server action**:
   - checks the honeypot field and a minimum fill time;
   - calls `consume_rate_limit('booking:ip:<hash>', N, window)` in its own transaction (counts every attempt);
   - validates with the same Zod schema as the browser;
   - calls `create_booking_enquiry(payload, submitter_hash)` with the secret key.
3. `create_booking_enquiry` (database):
   - returns the original reference if the idempotency key was seen before (double-click safe);
   - re-checks consent, dates (arrival not in the past in Sri Lanka time, ≤ 2 years ahead, ≤ 60 nights), tour (must be published), destinations and interests;
   - caps 5 enquiries per email per 24 h;
   - **calculates the estimate from `pricing_settings`** (inclusive package days, same as the site) and stores a snapshot; any price sent by the client is ignored. If the party is not exactly 2 adults, it stores no price and sets `estimate_status = 'custom_quote_required'`;
   - generates a random `TLT-XXXX-XXXX` reference (31-character alphabet, no 0/O/1/I/L, rejection sampling, retry on collision);
   - inserts with status `pending` and returns `{ ok, reference, duplicate }` (never the internal id).
4. The visitor sees the reference. **An enquiry is not a confirmed booking.**

Stable error codes (e.g. `arrival_in_past`, `unknown_tour`, `too_many_requests`) are mapped to friendly messages by the server; raw database errors are never shown.

## 5. Booking status lookup

`lookup_booking_status(reference, email)` (server only):

- returns data only when **both** the reference and the booking email match (case-insensitive);
- returns minimal fields: reference, status, dates, tour title, traveller counts, submitted date. No email, phone, requests or prices;
- returns `null` otherwise, so it never reveals whether a reference exists.

The server will rate-limit lookups per IP and per reference. A stronger option, emailing a one-time link instead of showing status immediately, can be added in Phase E once email is set up.

## 6. Status rules and payments

```
pending → reviewing | cancelled
reviewing → quoted | cancelled
quoted → reviewing | awaiting_payment | cancelled
awaiting_payment → quoted | confirmed | cancelled
confirmed → completed | cancelled
cancelled, completed → final
```

Enforced by trigger, whoever makes the change:

- `quoted` and `awaiting_payment` require a quote amount.
- The quote can only change while `reviewing` or `quoted`.
- **`confirmed` requires a payment with status `succeeded`, a `verified_at` timestamp, and an amount and currency exactly matching the quote.** Staff cannot "mark as paid": they have no write access to `payments`.
- A `succeeded` payment must have `verified_at` (table constraint) and must match the quote (trigger). It can only move on to `refunded` or `charged_back`.
- Every status change is written to `booking_status_history` with the user id.

Payments are written only by the PayHere notification handler (Phase E), after checking the signature, amount, currency and order reference, and recording the raw (sanitised) notification in `payment_events` with a unique key so repeated notifications are processed once. Card numbers and CVV are never stored.

## 7. Admin authentication and authorisation (implemented in `src/lib/admin/` and `src/app/admin/`, untested against a real project)

- **Sign-in:** Supabase Auth, email and password for staff. **Public sign-up disabled**; staff are invited from the dashboard.
- **Who is staff:** only users with an active `admin_profiles` row. The first admin is added in the SQL editor ([setup guide](supabase-setup-windows.md#7-create-the-first-admin)). No API path can create or promote staff.
- **Next.js enforcement:** the session is refreshed in `proxy.ts` (Next 16's replacement for middleware). The `/admin` layout **and every admin server action** verify the user on the server and call `current_admin_role()`; anything else gets a not-found response. Hiding buttons is never relied on.
- **Admin pages use the signed-in user's session**, so RLS applies to every staff query. The secret key is used only for enquiry creation, lookup, rate limiting and payment notifications, in server-only modules.
- **Recommended before launch:** require multi-factor authentication (TOTP) for admin accounts. The admin check can be tightened to require an `aal2` session once MFA is enrolled.

## 8. Decisions still needed from the business

1. **Pricing beyond 2 adults.** The basis is confirmed: USD 65/day is the total for exactly 2 people (`basis = 'per-group'`, `group_size = 2`). Child pricing and pricing for solo travellers or larger groups are **not set**. Those enquiries are stored with `estimate_status = 'custom_quote_required'` and no price.
2. **Deposits:** confirmation currently requires a payment equal to the full quote. If deposits are wanted, the rule needs a deposit amount.
3. **Offline payments** (bank transfer, cash): there is deliberately no way to record these yet, so a booking paid offline cannot be confirmed. Options: an admin-only "record offline payment" action with a mandatory reference and audit entry, or keeping confirmation online-only.
4. **Data retention:** how long to keep enquiries, cancelled bookings and rate-limit data (purge function exists for rate limits).

## 9. Known limitations of the local tests

- PGlite runs PostgreSQL 18 as a superuser; Supabase runs Postgres 15/17 with migrations executed by the `postgres` role. Syntax used is compatible with 15+, but **the migrations have not yet been run on a real Supabase project.** The first remote step should be a dry run.
- `auth.uid()` and the API roles are stand-ins that mimic Supabase's behaviour.
- The Data API (PostgREST) layer isn't exercised; tests run SQL directly as each role.
