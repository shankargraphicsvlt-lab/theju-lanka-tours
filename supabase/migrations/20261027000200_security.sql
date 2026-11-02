-- Theju Lanka Tours: access control
-- Principle: deny by default. Every table has RLS enabled, all privileges are
-- revoked from the API roles, then only the minimum is granted back.
--
-- Roles (provided by Supabase):
--   anon          visitors using the publishable key, not signed in
--   authenticated signed-in users (being signed in does NOT make you staff)
--   service_role  trusted server code using the secret key (bypasses RLS)

-- ---------------------------------------------------------------------------
-- Admin checks. SECURITY DEFINER so they can read admin_profiles without
-- recursing through its own RLS policy; search_path pinned to ''.
-- ---------------------------------------------------------------------------
create function public.current_admin_role() returns public.admin_role
language sql stable security definer set search_path = '' as $$
  select ap.role
  from public.admin_profiles ap
  where ap.user_id = (select auth.uid()) and ap.is_active
$$;

-- Any active staff member (admin or staff).
create function public.is_staff() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce(public.current_admin_role() is not null, false)
$$;

-- Full administrators only (content, pricing, payments detail, audit log).
create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce(public.current_admin_role() = 'admin', false)
$$;

-- ---------------------------------------------------------------------------
-- Lock everything down first.
-- ---------------------------------------------------------------------------
revoke all on all tables    in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on all functions in schema public from public, anon, authenticated;
revoke all on schema private from public, anon, authenticated;
revoke all on all functions in schema private from public, anon, authenticated;

alter default privileges in schema public revoke all on tables    from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke all on functions from public, anon, authenticated;

-- Trusted server code keeps full table access (it bypasses RLS by design).
grant usage on schema public to service_role;
grant all on all tables    in schema public to service_role;
grant all on all sequences in schema public to service_role;

-- Policy helpers must be executable by signed-in users (anon never needs them).
grant execute on function public.current_admin_role(), public.is_staff(), public.is_admin() to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Enable RLS on every table.
-- ---------------------------------------------------------------------------
alter table public.destinations               enable row level security;
alter table public.experiences                enable row level security;
alter table public.experience_destinations    enable row level security;
alter table public.tours                      enable row level security;
alter table public.tour_destinations          enable row level security;
alter table public.tour_itinerary_days        enable row level security;
alter table public.pricing_settings           enable row level security;
alter table public.pricing_additional_charges enable row level security;
alter table public.bookings                   enable row level security;
alter table public.booking_status_history     enable row level security;
alter table public.booking_notes              enable row level security;
alter table public.payments                   enable row level security;
alter table public.payment_events             enable row level security;
alter table public.contact_enquiries          enable row level security;
alter table public.admin_profiles             enable row level security;
alter table public.rate_limits                enable row level security;
alter table public.audit_log                  enable row level security;

-- ---------------------------------------------------------------------------
-- Public content: anyone may read published rows; only full admins may write.
-- ---------------------------------------------------------------------------
grant select on public.destinations, public.experiences, public.experience_destinations,
  public.tours, public.tour_destinations, public.tour_itinerary_days,
  public.pricing_settings, public.pricing_additional_charges
  to anon, authenticated;

grant insert, update, delete on public.destinations, public.experiences, public.experience_destinations,
  public.tours, public.tour_destinations, public.tour_itinerary_days, public.pricing_additional_charges
  to authenticated;
grant update (daily_rate_cents, discount_percent, basis, group_size) on public.pricing_settings to authenticated;

-- Read policies are split by role: visitors only ever evaluate the plain
-- publication check and never touch the admin helper functions.
create policy "Published destinations are public" on public.destinations
  for select to anon using (is_published);
create policy "Signed-in users see published destinations; staff see drafts" on public.destinations
  for select to authenticated using (is_published or (select public.is_staff()));
create policy "Admins manage destinations" on public.destinations
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Published experiences are public" on public.experiences
  for select to anon using (is_published);
create policy "Signed-in users see published experiences; staff see drafts" on public.experiences
  for select to authenticated using (is_published or (select public.is_staff()));
create policy "Admins manage experiences" on public.experiences
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Links between published content are public" on public.experience_destinations
  for select to anon using (
    exists (select 1 from public.experiences e where e.id = experience_id and e.is_published)
    and exists (select 1 from public.destinations d where d.id = destination_id and d.is_published)
  );
create policy "Signed-in users see published links; staff see all" on public.experience_destinations
  for select to authenticated using (
    (select public.is_staff())
    or (
      exists (select 1 from public.experiences e where e.id = experience_id and e.is_published)
      and exists (select 1 from public.destinations d where d.id = destination_id and d.is_published)
    )
  );
create policy "Admins manage experience links" on public.experience_destinations
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Published tours are public" on public.tours
  for select to anon using (is_published);
create policy "Signed-in users see published tours; staff see drafts" on public.tours
  for select to authenticated using (is_published or (select public.is_staff()));
create policy "Admins manage tours" on public.tours
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Destinations of published tours are public" on public.tour_destinations
  for select to anon using (exists (select 1 from public.tours t where t.id = tour_id and t.is_published));
create policy "Signed-in users see published tour destinations; staff see all" on public.tour_destinations
  for select to authenticated using (
    (select public.is_staff())
    or exists (select 1 from public.tours t where t.id = tour_id and t.is_published)
  );
create policy "Admins manage tour destinations" on public.tour_destinations
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Itineraries of published tours are public" on public.tour_itinerary_days
  for select to anon using (exists (select 1 from public.tours t where t.id = tour_id and t.is_published));
create policy "Signed-in users see published itineraries; staff see all" on public.tour_itinerary_days
  for select to authenticated using (
    (select public.is_staff())
    or exists (select 1 from public.tours t where t.id = tour_id and t.is_published)
  );
create policy "Admins manage itineraries" on public.tour_itinerary_days
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Pricing settings are public" on public.pricing_settings
  for select to anon, authenticated using (true);
create policy "Admins update pricing" on public.pricing_settings
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Active extra charges are public" on public.pricing_additional_charges
  for select to anon using (is_active);
create policy "Signed-in users see active charges; staff see all" on public.pricing_additional_charges
  for select to authenticated using (is_active or (select public.is_staff()));
create policy "Admins manage extra charges" on public.pricing_additional_charges
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Bookings: no direct access for visitors at all. Enquiries are created only
-- by trusted server code via public.create_booking_enquiry(). Staff may read,
-- change status and record a quote; customer details are not editable via the API.
-- ---------------------------------------------------------------------------
grant select on public.bookings to authenticated;
grant update (status, quoted_total_cents, quoted_currency) on public.bookings to authenticated;

create policy "Staff read bookings" on public.bookings
  for select to authenticated using ((select public.is_staff()));
create policy "Staff update booking status and quote" on public.bookings
  for update to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));

grant select on public.booking_status_history to authenticated;
create policy "Staff read status history" on public.booking_status_history
  for select to authenticated using ((select public.is_staff()));

grant select, insert on public.booking_notes to authenticated;
create policy "Staff read notes" on public.booking_notes
  for select to authenticated using ((select public.is_staff()));
create policy "Staff add their own notes" on public.booking_notes
  for insert to authenticated with check ((select public.is_staff()) and author_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Payments: read-only for staff. Only server code (secret key) writes them,
-- after verifying the provider signature, amount and currency.
-- ---------------------------------------------------------------------------
grant select on public.payments to authenticated;
create policy "Staff read payments" on public.payments
  for select to authenticated using ((select public.is_staff()));

grant select on public.payment_events to authenticated;
create policy "Admins read payment events" on public.payment_events
  for select to authenticated using ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Contact enquiries
-- ---------------------------------------------------------------------------
grant select on public.contact_enquiries to authenticated;
grant update (status) on public.contact_enquiries to authenticated;
create policy "Staff read contact enquiries" on public.contact_enquiries
  for select to authenticated using ((select public.is_staff()));
create policy "Staff update enquiry status" on public.contact_enquiries
  for update to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));

-- ---------------------------------------------------------------------------
-- Admin profiles: users can see their own row; admins can see all.
-- No API writes at all. Staff are added by the owner in the SQL editor.
-- ---------------------------------------------------------------------------
grant select on public.admin_profiles to authenticated;
create policy "Users read own admin profile; admins read all" on public.admin_profiles
  for select to authenticated using (user_id = (select auth.uid()) or (select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Audit log: admins read; written only by triggers.
-- rate_limits: no API access (RLS enabled, no policies, no grants).
-- ---------------------------------------------------------------------------
grant select on public.audit_log to authenticated;
create policy "Admins read audit log" on public.audit_log
  for select to authenticated using ((select public.is_admin()));
