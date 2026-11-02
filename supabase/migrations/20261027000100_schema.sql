-- Theju Lanka Tours: core schema
-- Tables, types, constraints and indexes. Security (grants, RLS) is in the next migration.
-- Written for Supabase Postgres 15+. Do not add customer data here.

create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

-- Internal helpers live in a schema that is never exposed through the Data API.
create schema if not exists private;

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------
create type public.booking_status as enum (
  'pending', 'reviewing', 'quoted', 'awaiting_payment', 'confirmed', 'cancelled', 'completed'
);
create type public.payment_status as enum (
  'initiated', 'pending', 'succeeded', 'failed', 'cancelled', 'refunded', 'charged_back'
);
create type public.admin_role as enum ('admin', 'staff');
create type public.interest as enum ('culture', 'wildlife', 'nature', 'beach', 'rail', 'wellness', 'food');
create type public.region as enum ('Cultural Triangle', 'Hill Country', 'South Coast', 'Deep South');
create type public.pricing_basis as enum ('unconfirmed', 'per-person', 'per-group');
create type public.charge_period as enum ('trip', 'day');
create type public.enquiry_status as enum ('new', 'in_progress', 'closed');

create function private.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- Editorial content
-- ---------------------------------------------------------------------------
create table public.destinations (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 80),
  name          text not null check (length(name) between 1 and 120),
  region        public.region not null,
  tagline       text not null default '' check (length(tagline) <= 200),
  summary       text not null default '' check (length(summary) <= 600),
  description   text[] not null default '{}',
  highlights    jsonb not null default '[]' check (jsonb_typeof(highlights) = 'array'),
  best_time     text not null default '',
  getting_there text not null default '',
  interests     public.interest[] not null default '{}',
  hero_image    text not null,                -- image key bundled with the site, e.g. 'sigiriyaAerial'
  gallery       text[] not null default '{}',
  latitude      numeric(8, 5) check (latitude between -90 and 90),
  longitude     numeric(8, 5) check (longitude between -180 and 180),
  sort_order    integer not null default 0,
  is_published  boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.experiences (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 80),
  title          text not null check (length(title) between 1 and 160),
  category       public.interest not null,
  summary        text not null default '' check (length(summary) <= 600),
  description    text[] not null default '{}',
  what_to_expect text[] not null default '{}',
  good_to_know   text[] not null default '{}',
  duration_label text not null default '',
  image          text not null,
  sort_order     integer not null default 0,
  is_published   boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table public.experience_destinations (
  experience_id  uuid not null references public.experiences (id) on delete cascade,
  destination_id uuid not null references public.destinations (id) on delete cascade,
  primary key (experience_id, destination_id)
);
create index on public.experience_destinations (destination_id);

-- Tours store no price: prices are calculated from duration_days and pricing_settings.
create table public.tours (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 80),
  title         text not null check (length(title) between 1 and 160),
  summary       text not null default '' check (length(summary) <= 600),
  description   text[] not null default '{}',
  duration_days smallint not null check (duration_days between 1 and 61),
  style         text not null default '',
  interests     public.interest[] not null default '{}',
  pickup        text not null default '',
  included      text[] not null default '{}',   -- sample lists until confirmed by the business
  excluded      text[] not null default '{}',
  image         text not null,
  is_sample     boolean not null default true,
  sort_order    integer not null default 0,
  is_published  boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.tour_destinations (
  tour_id        uuid not null references public.tours (id) on delete cascade,
  destination_id uuid not null references public.destinations (id) on delete restrict,
  position       smallint not null check (position >= 0),
  primary key (tour_id, destination_id),
  unique (tour_id, position)
);
create index on public.tour_destinations (destination_id);

create table public.tour_itinerary_days (
  id          uuid primary key default gen_random_uuid(),
  tour_id     uuid not null references public.tours (id) on delete cascade,
  day_number  smallint not null check (day_number between 1 and 61),
  title       text not null check (length(title) between 1 and 200),
  description text not null default '' check (length(description) <= 2000),
  overnight   text check (overnight is null or length(overnight) <= 120),   -- null = no hotel night
  unique (tour_id, day_number)
);

-- ---------------------------------------------------------------------------
-- Pricing (single row). Mirrors src/config/pricing.ts.
-- ---------------------------------------------------------------------------
create table public.pricing_settings (
  id                smallint primary key default 1 check (id = 1),
  currency          char(3) not null default 'USD' check (currency = 'USD'),
  daily_rate_cents  integer not null check (daily_rate_cents >= 0),
  discount_percent  numeric(5, 2) not null check (discount_percent between 0 and 100),
  -- 'per-group': daily_rate_cents is the TOTAL for exactly group_size adults.
  -- Other party sizes and parties with children get a custom quote.
  basis             public.pricing_basis not null default 'per-group',
  group_size        smallint not null default 2 check (group_size between 1 and 20),
  updated_at        timestamptz not null default now(),
  updated_by        uuid
);
insert into public.pricing_settings (id, currency, daily_rate_cents, discount_percent, basis, group_size)
values (1, 'USD', 6500, 25, 'per-group', 2)
on conflict (id) do nothing;

create table public.pricing_additional_charges (
  id           uuid primary key default gen_random_uuid(),
  label        text not null check (length(label) between 1 and 120),
  amount_cents integer not null check (amount_cents >= 0),
  period       public.charge_period not null,
  is_active    boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Bookings (enquiries). An enquiry is never a confirmed reservation.
-- ---------------------------------------------------------------------------
create table public.bookings (
  id                        uuid primary key default gen_random_uuid(),
  reference                 text not null unique
                              check (reference ~ '^TLT-[2-9A-HJKMNP-Z]{4}-[2-9A-HJKMNP-Z]{4}$'),
  status                    public.booking_status not null default 'pending',

  customer_name             text not null check (length(customer_name) between 2 and 120),
  email                     text not null check (length(email) <= 254 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  country_code              text not null check (country_code ~ '^\+[0-9]{1,4}$'),
  phone                     text not null check (phone ~ '^[0-9]{6,15}$'),

  arrival_date              date not null,
  departure_date            date not null,
  adults                    smallint not null check (adults between 1 and 20),
  children                  smallint not null default 0 check (children between 0 and 20),

  tour_id                   uuid references public.tours (id) on delete set null,
  tour_slug                 text,          -- snapshot at submission; null = custom journey
  tour_title                text,
  destination_slugs         text[] not null default '{}' check (cardinality(destination_slugs) <= 10),
  interests                 public.interest[] not null default '{}',
  pickup_location           text not null default '' check (length(pickup_location) <= 200),
  accommodation_preference  text not null default 'no-preference'
                              check (accommodation_preference in ('no-preference', 'comfort', 'boutique', 'luxury')),
  transport_preference      text not null default 'no-preference'
                              check (transport_preference in ('no-preference', 'car', 'van')),
  special_requests          text not null default '' check (length(special_requests) <= 2000),

  consent_at                timestamptz not null,
  privacy_notice_version    text not null check (length(privacy_notice_version) between 1 and 40),

  -- Estimate snapshot calculated in the database from pricing_settings at submission time.
  -- 'custom_quote_required' when the party is not covered by the published rate
  -- (per-group basis: not exactly group_size adults, or children included).
  estimate_status           text not null default 'unavailable'
                              check (estimate_status in ('estimated', 'custom_quote_required', 'unavailable')),
  estimate_group_size       smallint,
  estimate_days             smallint check (estimate_days between 1 and 61),
  estimate_currency         char(3),
  estimate_daily_rate_cents integer,
  estimate_discount_percent numeric(5, 2),
  estimate_base_cents       integer,
  estimate_discount_cents   integer,
  estimate_charges_cents    integer,
  estimate_total_cents      integer,
  estimate_basis            public.pricing_basis,

  -- Set by staff when a written quotation is issued.
  quoted_total_cents        integer check (quoted_total_cents > 0),
  quoted_currency           char(3) check (quoted_currency = 'USD'),

  idempotency_key           uuid not null unique,
  submitter_hash            text check (length(submitter_hash) <= 128),   -- salted hash of IP; abuse handling only

  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),

  constraint bookings_dates_order    check (departure_date > arrival_date),
  constraint bookings_trip_length    check (departure_date - arrival_date <= 60),
  constraint bookings_travellers_max check (adults + children <= 20),
  constraint bookings_quote_pair     check ((quoted_total_cents is null) = (quoted_currency is null))
);
create index on public.bookings (status, created_at desc);
create index on public.bookings (lower(email));
create index on public.bookings (created_at desc);

create table public.booking_status_history (
  id          bigint generated always as identity primary key,
  booking_id  uuid not null references public.bookings (id) on delete restrict,
  from_status public.booking_status,
  to_status   public.booking_status not null,
  changed_by  uuid,            -- auth user id; null = system / customer submission
  created_at  timestamptz not null default now()
);
create index on public.booking_status_history (booking_id, created_at);

create table public.booking_notes (
  id         bigint generated always as identity primary key,
  booking_id uuid not null references public.bookings (id) on delete restrict,
  author_id  uuid not null,
  body       text not null check (length(body) between 1 and 5000),
  created_at timestamptz not null default now()
);
create index on public.booking_notes (booking_id, created_at);

-- ---------------------------------------------------------------------------
-- Payments. Written only by trusted server code (secret key) after verifying
-- the provider's signature. Card numbers and CVV are never stored.
-- ---------------------------------------------------------------------------
create table public.payments (
  id                  uuid primary key default gen_random_uuid(),
  booking_id          uuid not null references public.bookings (id) on delete restrict,
  provider            text not null check (provider in ('payhere')),
  order_id            text not null unique check (length(order_id) between 1 and 64),
  provider_payment_id text unique,
  amount_cents        integer not null check (amount_cents > 0),
  currency            char(3) not null,
  status              public.payment_status not null default 'initiated',
  provider_status     text,
  verified_at         timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint payments_success_is_verified check (status <> 'succeeded' or verified_at is not null)
);
create index on public.payments (booking_id);

create table public.payment_events (
  id              bigint generated always as identity primary key,
  provider        text not null,
  event_key       text not null unique,   -- idempotency key derived from the notification
  payment_id      uuid references public.payments (id) on delete set null,
  signature_valid boolean not null,
  payload         jsonb not null,         -- sanitised notification; never card data
  received_at     timestamptz not null default now(),
  processed_at    timestamptz
);

-- ---------------------------------------------------------------------------
-- Contact enquiries
-- ---------------------------------------------------------------------------
create table public.contact_enquiries (
  id                     uuid primary key default gen_random_uuid(),
  full_name              text not null check (length(full_name) between 2 and 120),
  email                  text not null check (length(email) <= 254 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  subject                text not null check (length(subject) between 2 and 150),
  message                text not null check (length(message) between 10 and 3000),
  consent_at             timestamptz not null,
  privacy_notice_version text not null,
  status                 public.enquiry_status not null default 'new',
  idempotency_key        uuid not null unique,
  submitter_hash         text check (length(submitter_hash) <= 128),
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create index on public.contact_enquiries (status, created_at desc);

-- ---------------------------------------------------------------------------
-- Admin profiles. Being signed in is NOT enough: only users with an active
-- row here are staff. Rows are created by the owner in the SQL editor.
-- ---------------------------------------------------------------------------
create table public.admin_profiles (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  role         public.admin_role not null,
  display_name text not null default '' check (length(display_name) <= 120),
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Rate limiting and audit
-- ---------------------------------------------------------------------------
create table public.rate_limits (
  bucket       text not null check (length(bucket) <= 200),
  window_start timestamptz not null,
  hits         integer not null default 0,
  primary key (bucket, window_start)
);

create table public.audit_log (
  id         bigint generated always as identity primary key,
  actor_id   uuid,
  action     text not null,
  table_name text not null,
  record_id  text,
  old_data   jsonb,
  new_data   jsonb,
  created_at timestamptz not null default now()
);
create index on public.audit_log (table_name, created_at desc);

-- updated_at maintenance
create trigger set_updated_at before update on public.destinations for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.experiences for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.tours for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.pricing_settings for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.pricing_additional_charges for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.bookings for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.payments for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.contact_enquiries for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.admin_profiles for each row execute function private.set_updated_at();
