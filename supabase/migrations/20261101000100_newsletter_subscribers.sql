-- GSKT Lanka Tours: newsletter sign-ups (added 2026-11-01).
-- Same rules as the other tables: RLS on, nothing granted to visitors; the
-- website adds addresses only through subscribe_newsletter() as service_role,
-- and staff can read the list.

create table public.newsletter_subscribers (
  id             uuid primary key default gen_random_uuid(),
  email          text not null unique
                   check (length(email) <= 254 and email = lower(email) and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  submitter_hash text check (length(submitter_hash) <= 128),
  created_at     timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;
revoke all on public.newsletter_subscribers from anon, authenticated;
grant all on public.newsletter_subscribers to service_role;

grant select on public.newsletter_subscribers to authenticated;
create policy "Staff read newsletter subscribers" on public.newsletter_subscribers
  for select to authenticated using ((select public.is_staff()));

-- Returns {"ok": true, "duplicate": false} for a new address and
-- {"ok": true, "duplicate": true} when it is already on the list.
create function public.subscribe_newsletter(p_email text, p_submitter_hash text default null) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_id    uuid;
begin
  if length(v_email) > 254 or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'invalid_email' using errcode = '22023';
  end if;
  insert into public.newsletter_subscribers (email, submitter_hash)
  values (v_email, p_submitter_hash)
  on conflict (email) do nothing
  returning id into v_id;
  return jsonb_build_object('ok', true, 'duplicate', v_id is null);
end $$;

revoke all on function public.subscribe_newsletter(text, text) from public, anon, authenticated;
grant execute on function public.subscribe_newsletter(text, text) to service_role;
