-- Theju Lanka Tours: business rules enforced in the database
-- Public RPC functions here are executable ONLY by service_role (trusted server
-- code). Visitors never call them directly; the Next.js server validates input,
-- applies spam checks and rate limits, then calls them with the secret key.

-- ---------------------------------------------------------------------------
-- Booking references: TLT-XXXX-XXXX from a 31-character alphabet with no
-- look-alikes (0/O, 1/I/L). Rejection sampling avoids modulo bias.
-- 31^8 ≈ 8.5 × 10^11 combinations; references are random, never sequential.
-- ---------------------------------------------------------------------------
create function private.generate_booking_reference() returns text
language plpgsql volatile set search_path = '' as $$
declare
  alphabet constant text := '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  buf  bytea;
  code text := '';
  b    integer;
begin
  while length(code) < 8 loop
    buf := extensions.gen_random_bytes(16);
    for i in 0..15 loop
      b := get_byte(buf, i);
      if b < 248 and length(code) < 8 then          -- 248 = 31 × 8
        code := code || substr(alphabet, (b % 31) + 1, 1);
      end if;
    end loop;
  end loop;
  return 'TLT-' || substr(code, 1, 4) || '-' || substr(code, 5, 4);
end $$;

-- ---------------------------------------------------------------------------
-- Rate limiting (fixed window). Called by the server in its own transaction
-- before processing a submission, so every attempt counts, including invalid ones.
-- ---------------------------------------------------------------------------
create function public.consume_rate_limit(p_bucket text, p_max_hits integer, p_window_seconds integer)
returns boolean
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_window timestamptz;
  v_hits   integer;
begin
  if p_bucket is null or length(p_bucket) not between 1 and 200 then
    raise exception 'invalid_bucket' using errcode = '22023';
  end if;
  if p_max_hits < 1 or p_window_seconds not between 1 and 86400 then
    raise exception 'invalid_rate_limit' using errcode = '22023';
  end if;
  v_window := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  insert into public.rate_limits as rl (bucket, window_start, hits)
  values (p_bucket, v_window, 1)
  on conflict (bucket, window_start) do update set hits = rl.hits + 1
  returning rl.hits into v_hits;
  return v_hits <= p_max_hits;
end $$;

create function public.purge_expired_rate_limits() returns integer
language sql volatile security definer set search_path = '' as $$
  with deleted as (
    delete from public.rate_limits where window_start < now() - interval '2 days' returning 1
  )
  select count(*)::integer from deleted
$$;

-- ---------------------------------------------------------------------------
-- Create a booking enquiry. Re-validates everything the server checked,
-- resolves the tour from published data, snapshots a price estimate from
-- pricing_settings (never from the client), and returns only the reference.
-- Error codes are stable strings the server maps to friendly messages.
-- ---------------------------------------------------------------------------
create function public.create_booking_enquiry(p jsonb, p_submitter_hash text default null)
returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_key          uuid;
  v_existing     text;
  v_today        date := (now() at time zone 'Asia/Colombo')::date;
  v_arrival      date;
  v_departure    date;
  v_tour         public.tours%rowtype;
  v_tour_slug    text;
  v_destinations text[];
  v_unknown      text;
  v_interests    public.interest[];
  v_email        text;
  v_days         integer;
  v_pricing      public.pricing_settings%rowtype;
  v_has_pricing  boolean := false;
  v_estimate_status text := 'unavailable';
  v_adults       smallint;
  v_children     smallint;
  v_base         integer;
  v_discount     integer;
  v_charges      integer;
  v_reference    text;
  v_booking_id   uuid;
  v_attempt      integer := 0;
begin
  if p is null or jsonb_typeof(p) <> 'object' then
    raise exception 'invalid_payload' using errcode = '22023';
  end if;

  begin
    v_key := (p ->> 'idempotencyKey')::uuid;
  exception when others then
    raise exception 'invalid_idempotency_key' using errcode = '22023';
  end;
  if v_key is null then
    raise exception 'invalid_idempotency_key' using errcode = '22023';
  end if;

  -- Duplicate submission (double click, retry): return the original reference.
  select b.reference into v_existing from public.bookings b where b.idempotency_key = v_key;
  if found then
    return jsonb_build_object('ok', true, 'reference', v_existing, 'duplicate', true);
  end if;

  if coalesce(p -> 'consent' = 'true'::jsonb, false) is not true then
    raise exception 'consent_required' using errcode = '22023';
  end if;

  begin
    v_arrival   := (p ->> 'arrivalDate')::date;
    v_departure := (p ->> 'departureDate')::date;
  exception when others then
    raise exception 'invalid_dates' using errcode = '22023';
  end;
  if v_arrival is null or v_departure is null then
    raise exception 'invalid_dates' using errcode = '22023';
  end if;
  if v_arrival < v_today then
    raise exception 'arrival_in_past' using errcode = '22023';
  end if;
  if v_arrival > v_today + 730 then
    raise exception 'arrival_too_far_ahead' using errcode = '22023';
  end if;
  if v_departure <= v_arrival then
    raise exception 'departure_not_after_arrival' using errcode = '22023';
  end if;
  if v_departure - v_arrival > 60 then
    raise exception 'trip_too_long' using errcode = '22023';
  end if;

  v_tour_slug := nullif(trim(coalesce(p ->> 'tour', '')), '');
  if v_tour_slug = 'custom' then
    v_tour_slug := null;
  end if;
  if v_tour_slug is not null then
    select * into v_tour from public.tours t where t.slug = v_tour_slug and t.is_published;
    if not found then
      raise exception 'unknown_tour' using errcode = '22023';
    end if;
  end if;

  if jsonb_typeof(coalesce(p -> 'destinations', '[]'::jsonb)) <> 'array'
     or jsonb_typeof(coalesce(p -> 'interests', '[]'::jsonb)) <> 'array' then
    raise exception 'invalid_payload' using errcode = '22023';
  end if;

  v_destinations := array(
    select distinct x from jsonb_array_elements_text(coalesce(p -> 'destinations', '[]'::jsonb)) as x
  );
  select d into v_unknown
  from unnest(v_destinations) as d
  where not exists (select 1 from public.destinations x where x.slug = d and x.is_published)
  limit 1;
  if v_unknown is not null then
    raise exception 'unknown_destination' using errcode = '22023';
  end if;

  begin
    v_interests := array(
      select distinct x::public.interest from jsonb_array_elements_text(coalesce(p -> 'interests', '[]'::jsonb)) as x
    );
  exception when invalid_text_representation then
    raise exception 'unknown_interest' using errcode = '22023';
  end;

  v_email := lower(trim(coalesce(p ->> 'email', '')));

  -- Per-email cap, in addition to the server's per-IP rate limit.
  if (select count(*) from public.bookings b
      where lower(b.email) = v_email and b.created_at > now() - interval '24 hours') >= 5 then
    return jsonb_build_object('ok', false, 'error', 'too_many_requests');
  end if;

  begin
    v_adults   := (p ->> 'adults')::smallint;
    v_children := coalesce((p ->> 'children')::smallint, 0);
  exception when others then
    raise exception 'invalid_travellers' using errcode = '22023';
  end;

  -- Estimate: package days counted inclusively (arrival and departure days),
  -- matching src/lib/pricing.ts. On the per-group basis the rate is the total
  -- for exactly group_size adults: it is never multiplied, and any other party
  -- (different size, or with children, whose pricing is not set) gets a
  -- custom quote instead of an estimate, exactly as on the website.
  v_days := (v_departure - v_arrival) + 1;
  select * into v_pricing from public.pricing_settings ps where ps.id = 1;
  if found and v_pricing.basis = 'per-group'
     and (v_children > 0 or v_adults is distinct from v_pricing.group_size) then
    v_estimate_status := 'custom_quote_required';
  elsif found and v_days <= 61 then
    v_has_pricing := true;
    v_estimate_status := 'estimated';
    v_base     := v_days * v_pricing.daily_rate_cents;
    v_discount := round(v_base * v_pricing.discount_percent / 100.0);
    select coalesce(sum(case when c.period = 'day' then c.amount_cents * v_days else c.amount_cents end), 0)
      into v_charges
    from public.pricing_additional_charges c
    where c.is_active;
  end if;

  loop
    v_attempt   := v_attempt + 1;
    v_reference := private.generate_booking_reference();
    begin
      insert into public.bookings (
        reference, customer_name, email, country_code, phone,
        arrival_date, departure_date, adults, children,
        tour_id, tour_slug, tour_title, destination_slugs, interests,
        pickup_location, accommodation_preference, transport_preference, special_requests,
        consent_at, privacy_notice_version,
        estimate_status, estimate_group_size,
        estimate_days, estimate_currency, estimate_daily_rate_cents, estimate_discount_percent,
        estimate_base_cents, estimate_discount_cents, estimate_charges_cents, estimate_total_cents, estimate_basis,
        idempotency_key, submitter_hash
      ) values (
        v_reference,
        trim(coalesce(p ->> 'fullName', '')),
        v_email,
        trim(coalesce(p ->> 'countryCode', '')),
        regexp_replace(coalesce(p ->> 'phone', ''), '[\s()-]', '', 'g'),
        v_arrival, v_departure,
        v_adults,
        v_children,
        v_tour.id, v_tour.slug, v_tour.title, v_destinations, v_interests,
        trim(coalesce(p ->> 'pickupLocation', '')),
        coalesce(nullif(p ->> 'accommodation', ''), 'no-preference'),
        coalesce(nullif(p ->> 'transport', ''), 'no-preference'),
        trim(coalesce(p ->> 'specialRequests', '')),
        now(),
        nullif(trim(coalesce(p ->> 'privacyNoticeVersion', '')), ''),
        v_estimate_status,
        case when v_has_pricing then v_pricing.group_size end,
        case when v_has_pricing then v_days end,
        case when v_has_pricing then v_pricing.currency end,
        case when v_has_pricing then v_pricing.daily_rate_cents end,
        case when v_has_pricing then v_pricing.discount_percent end,
        v_base, v_discount, v_charges,
        case when v_has_pricing then v_base - v_discount + v_charges end,
        case when v_has_pricing then v_pricing.basis end,
        v_key, p_submitter_hash
      )
      returning id into v_booking_id;
      exit;
    exception when unique_violation then
      -- Same idempotency key submitted concurrently: return the winner's reference.
      select b.reference into v_existing from public.bookings b where b.idempotency_key = v_key;
      if found then
        return jsonb_build_object('ok', true, 'reference', v_existing, 'duplicate', true);
      end if;
      -- Otherwise the random reference collided; try again a few times.
      if v_attempt >= 5 then
        raise;
      end if;
    end;
  end loop;

  insert into public.booking_status_history (booking_id, from_status, to_status, changed_by)
  values (v_booking_id, null, 'pending', null);

  return jsonb_build_object('ok', true, 'reference', v_reference, 'duplicate', false);
end $$;

-- ---------------------------------------------------------------------------
-- Booking status lookup: requires BOTH reference and email. Returns minimal,
-- safe fields, or null; never reveals whether a reference exists on its own.
-- The server rate-limits calls per IP and per reference.
-- ---------------------------------------------------------------------------
create function public.lookup_booking_status(p_reference text, p_email text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'reference', b.reference,
    'status', b.status,
    'arrivalDate', b.arrival_date,
    'departureDate', b.departure_date,
    'tourTitle', b.tour_title,
    'adults', b.adults,
    'children', b.children,
    'submittedAt', b.created_at
  )
  from public.bookings b
  where b.reference = upper(replace(trim(coalesce(p_reference, '')), ' ', ''))
    and lower(b.email) = lower(trim(coalesce(p_email, '')))
$$;

-- ---------------------------------------------------------------------------
-- Contact enquiries
-- ---------------------------------------------------------------------------
create function public.create_contact_enquiry(p jsonb, p_submitter_hash text default null) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_key   uuid;
  v_email text;
  v_id    uuid;
begin
  if p is null or jsonb_typeof(p) <> 'object' then
    raise exception 'invalid_payload' using errcode = '22023';
  end if;
  begin
    v_key := (p ->> 'idempotencyKey')::uuid;
  exception when others then
    raise exception 'invalid_idempotency_key' using errcode = '22023';
  end;
  if v_key is null then
    raise exception 'invalid_idempotency_key' using errcode = '22023';
  end if;
  if exists (select 1 from public.contact_enquiries c where c.idempotency_key = v_key) then
    return jsonb_build_object('ok', true, 'duplicate', true);
  end if;
  if coalesce(p -> 'consent' = 'true'::jsonb, false) is not true then
    raise exception 'consent_required' using errcode = '22023';
  end if;

  v_email := lower(trim(coalesce(p ->> 'email', '')));
  if (select count(*) from public.contact_enquiries c
      where lower(c.email) = v_email and c.created_at > now() - interval '24 hours') >= 5 then
    return jsonb_build_object('ok', false, 'error', 'too_many_requests');
  end if;

  insert into public.contact_enquiries (
    full_name, email, subject, message, consent_at, privacy_notice_version, idempotency_key, submitter_hash
  ) values (
    trim(coalesce(p ->> 'fullName', '')), v_email,
    trim(coalesce(p ->> 'subject', '')), trim(coalesce(p ->> 'message', '')),
    now(), nullif(trim(coalesce(p ->> 'privacyNoticeVersion', '')), ''),
    v_key, p_submitter_hash
  )
  returning id into v_id;
  return jsonb_build_object('ok', true, 'duplicate', false);
end $$;

-- ---------------------------------------------------------------------------
-- Booking status rules
--   pending → reviewing | cancelled
--   reviewing → quoted | cancelled
--   quoted → reviewing | awaiting_payment | cancelled
--   awaiting_payment → quoted | confirmed | cancelled
--   confirmed → completed | cancelled
--   cancelled, completed → (final)
-- 'quoted' and 'awaiting_payment' require a quote; 'confirmed' requires a
-- verified, succeeded payment matching the quote. Staff cannot "mark paid".
-- ---------------------------------------------------------------------------
create function private.booking_transition_allowed(p_from public.booking_status, p_to public.booking_status)
returns boolean
language sql immutable set search_path = '' as $$
  select (p_from::text || '>' || p_to::text) = any (array[
    'pending>reviewing', 'pending>cancelled',
    'reviewing>quoted', 'reviewing>cancelled',
    'quoted>reviewing', 'quoted>awaiting_payment', 'quoted>cancelled',
    'awaiting_payment>quoted', 'awaiting_payment>confirmed', 'awaiting_payment>cancelled',
    'confirmed>completed', 'confirmed>cancelled'
  ])
$$;

create function private.enforce_booking_rules() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.status is distinct from old.status then
    if not private.booking_transition_allowed(old.status, new.status) then
      raise exception 'invalid_status_transition: % -> %', old.status, new.status using errcode = 'P0001';
    end if;
    if new.status in ('quoted', 'awaiting_payment') and new.quoted_total_cents is null then
      raise exception 'quote_required' using errcode = 'P0001';
    end if;
    if new.status = 'confirmed' and not exists (
      select 1 from public.payments pm
      where pm.booking_id = new.id
        and pm.status = 'succeeded'
        and pm.verified_at is not null
        and pm.amount_cents = new.quoted_total_cents
        and pm.currency = new.quoted_currency
    ) then
      raise exception 'confirmation_requires_verified_payment' using errcode = 'P0001';
    end if;
  end if;

  -- The quote may only be set or changed while reviewing or quoting.
  if (new.quoted_total_cents is distinct from old.quoted_total_cents
      or new.quoted_currency is distinct from old.quoted_currency)
     and new.status not in ('reviewing', 'quoted') then
    raise exception 'quote_locked' using errcode = 'P0001';
  end if;
  return new;
end $$;

create function private.log_booking_status_change() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.status is distinct from old.status then
    insert into public.booking_status_history (booking_id, from_status, to_status, changed_by)
    values (new.id, old.status, new.status, (select auth.uid()));
  end if;
  return null;
end $$;

create trigger enforce_booking_rules before update on public.bookings
  for each row execute function private.enforce_booking_rules();
create trigger log_booking_status_change after update on public.bookings
  for each row execute function private.log_booking_status_change();

-- ---------------------------------------------------------------------------
-- Payment rules: a succeeded payment must be verified (table constraint) and
-- match the booking's quoted amount and currency exactly. A succeeded payment
-- can only move on to refunded or charged_back.
-- ---------------------------------------------------------------------------
create function private.enforce_payment_rules() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_quote    integer;
  v_currency char(3);
begin
  if new.status = 'succeeded' then
    select b.quoted_total_cents, b.quoted_currency into v_quote, v_currency
    from public.bookings b where b.id = new.booking_id;
    if v_quote is null or new.amount_cents <> v_quote or new.currency <> v_currency then
      raise exception 'payment_amount_mismatch' using errcode = 'P0001';
    end if;
  end if;
  if tg_op = 'UPDATE' and old.status = 'succeeded'
     and new.status not in ('succeeded', 'refunded', 'charged_back') then
    raise exception 'invalid_payment_transition' using errcode = 'P0001';
  end if;
  return new;
end $$;

create trigger enforce_payment_rules before insert or update on public.payments
  for each row execute function private.enforce_payment_rules();

-- ---------------------------------------------------------------------------
-- Audit trail for content, pricing, staff and payment changes.
-- ---------------------------------------------------------------------------
create function private.audit_row_change() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_row jsonb := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
begin
  insert into public.audit_log (actor_id, action, table_name, record_id, old_data, new_data)
  values (
    (select auth.uid()),
    tg_op,
    tg_table_name,
    coalesce(v_row ->> 'id', v_row ->> 'user_id'),
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end
  );
  return null;
end $$;

create trigger audit after insert or update or delete on public.pricing_settings
  for each row execute function private.audit_row_change();
create trigger audit after insert or update or delete on public.pricing_additional_charges
  for each row execute function private.audit_row_change();
create trigger audit after insert or update or delete on public.tours
  for each row execute function private.audit_row_change();
create trigger audit after insert or update or delete on public.destinations
  for each row execute function private.audit_row_change();
create trigger audit after insert or update or delete on public.experiences
  for each row execute function private.audit_row_change();
create trigger audit after insert or update or delete on public.admin_profiles
  for each row execute function private.audit_row_change();
create trigger audit after insert or update or delete on public.payments
  for each row execute function private.audit_row_change();

-- ---------------------------------------------------------------------------
-- Privileges for the functions above: service_role only.
-- ---------------------------------------------------------------------------
revoke all on all functions in schema private from public, anon, authenticated;
revoke all on function
  public.consume_rate_limit(text, integer, integer),
  public.purge_expired_rate_limits(),
  public.create_booking_enquiry(jsonb, text),
  public.lookup_booking_status(text, text),
  public.create_contact_enquiry(jsonb, text)
  from public, anon, authenticated;
grant execute on function
  public.consume_rate_limit(text, integer, integer),
  public.purge_expired_rate_limits(),
  public.create_booking_enquiry(jsonb, text),
  public.lookup_booking_status(text, text),
  public.create_contact_enquiry(jsonb, text)
  to service_role;
