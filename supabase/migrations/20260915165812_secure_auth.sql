-- Apply as database owner after reviewing the deployed schema. No data is deleted.
begin;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(), user_id text,
  customer_name text not null, customer_email text not null, customer_phone text not null,
  service_type text not null, property_type text default 'Residential', address text,
  preferred_date text, preferred_time_slot text, additional_notes text,
  status text default 'pending', created_at timestamptz default now()
);
alter table public.bookings add column if not exists estimated_price_cad numeric;
alter table public.bookings add column if not exists approved_at timestamptz;
alter table public.bookings add column if not exists approved_by text;
alter table public.bookings add column if not exists consumer_confirmation_sent boolean default false;
create index if not exists bookings_user_id_idx on public.bookings(user_id);
create index if not exists bookings_email_idx on public.bookings(lower(customer_email));

-- The old anonymous UPDATE policy allowed changing ownership and approval
-- fields. Preserve existing rows, but do not trust them for customer access or
-- verified reviews until the owner has reconciled them. Only capture once.
do $$ begin
  if to_regclass('private.legacy_booking_quarantine') is null then
    create table private.legacy_booking_quarantine (
      booking_id uuid primary key references public.bookings(id) on delete cascade,
      captured_at timestamptz not null default now()
    );
    insert into private.legacy_booking_quarantine(booking_id) select id from public.bookings;
  end if;
end $$;

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(), user_id text,
  author_name text not null, rating integer default 5, service text not null,
  neighborhood text, comment text, verified boolean default false, created_at timestamptz default now()
);
alter table public.reviews alter column verified set default false;
create table if not exists private.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists private.guest_booking_access (
  booking_id uuid primary key references public.bookings(id) on delete cascade,
  token_hash text not null, expires_at timestamptz not null default now() + interval '7 days'
);
revoke all on all tables in schema private from public, anon, authenticated;
alter table private.admin_users enable row level security;
alter table private.guest_booking_access enable row level security;
alter table private.legacy_booking_quarantine enable row level security;

create or replace function public.is_verified_user() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from auth.users u where u.id = auth.uid()
    and u.email_confirmed_at is not null and u.email is not null and not coalesce(u.is_anonymous, false)
    and u.deleted_at is null and (u.banned_until is null or u.banned_until <= now())
    and exists (select 1 from auth.sessions s where s.user_id=u.id
      and s.id::text=auth.jwt()->>'session_id' and (s.not_after is null or s.not_after>now())));
$$;
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select public.is_verified_user() and exists (
    select 1 from private.admin_users a where a.user_id = auth.uid());
$$;
revoke all on function public.is_verified_user(), public.is_admin() from public, anon;
grant execute on function public.is_verified_user(), public.is_admin() to authenticated;

create or replace function public.owns_booking(p_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select public.is_verified_user() and exists (
    select 1 from public.bookings b where b.id=p_id and b.user_id=auth.uid()::text
      and not exists (select 1 from private.legacy_booking_quarantine q where q.booking_id=b.id));
$$;
revoke all on function public.owns_booking(uuid) from public, anon, authenticated;
grant execute on function public.owns_booking(uuid) to authenticated;

alter table public.bookings enable row level security;
alter table public.reviews enable row level security;
-- Policies are OR-combined. Remove old permissive policies before replacing them.
do $$ declare p record; begin
  for p in select schemaname, tablename, policyname from pg_policies
    where schemaname = 'public' and tablename in ('bookings', 'reviews') loop
    execute format('drop policy %I on %I.%I', p.policyname, p.schemaname, p.tablename);
  end loop;
end $$;
revoke all on public.bookings, public.reviews from public, anon, authenticated;
grant select, update, delete on public.bookings to authenticated;
grant select (id, author_name, rating, service, neighborhood, comment, verified, created_at) on public.reviews to anon, authenticated;
create policy bookings_owner_or_admin on public.bookings for select to authenticated
  using ((select public.is_admin()) or public.owns_booking(id));
create policy bookings_admin_update on public.bookings for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy bookings_admin_delete on public.bookings for delete to authenticated using ((select public.is_admin()));
create policy reviews_public_read on public.reviews for select to anon, authenticated using (true);

-- Retire legacy alternative tables if they exist, without deleting their data.
do $$ declare t text; begin
  foreach t in array array['booking', 'users'] loop
    if exists (select 1 from pg_tables where schemaname='public' and tablename=t) then
      execute format('alter table public.%I enable row level security', t);
      execute format('revoke all on public.%I from public, anon, authenticated', t);
    end if;
  end loop;
end $$;

create or replace function public.submit_booking(p_booking jsonb, p_guest_token text default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid := gen_random_uuid(); v_uid uuid := auth.uid(); v_email text;
begin
  if jsonb_typeof(p_booking) is distinct from 'object' or octet_length(p_booking::text) > 20000 then
    raise exception 'Invalid booking';
  end if;
  if v_uid is not null then
    if not public.is_verified_user() then raise exception 'Verified account required'; end if;
    select lower(email) into v_email from auth.users where id=v_uid;
  else
    v_email := lower(trim(p_booking->>'customer_email'));
    if p_guest_token is null or p_guest_token !~ '^[0-9a-f]{64}$' then raise exception 'Invalid guest access'; end if;
  end if;
  if coalesce(v_email, '') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or length(v_email) > 254
    or length(trim(coalesce(p_booking->>'customer_name',''))) not between 1 and 200
    or length(trim(coalesce(p_booking->>'customer_phone',''))) not between 7 and 40
    or length(trim(coalesce(p_booking->>'service_type',''))) not between 1 and 300
    or length(coalesce(p_booking->>'address','')) > 1000
    or length(coalesce(p_booking->>'additional_notes','')) > 5000 then
    raise exception 'Invalid booking details';
  end if;
  -- Serialize per-email submission limits to avoid a concurrent-request bypass.
  perform pg_advisory_xact_lock(hashtextextended(v_email, 0));
  if (select count(*) from public.bookings where lower(customer_email)=v_email and created_at>now()-interval '1 hour') >= 5 then
    raise exception 'Too many requests. Please try later';
  end if;
  insert into public.bookings(id,user_id,customer_name,customer_email,customer_phone,service_type,property_type,address,preferred_date,preferred_time_slot,additional_notes,status,created_at,estimated_price_cad)
    values(v_id,v_uid::text,trim(p_booking->>'customer_name'),v_email,trim(p_booking->>'customer_phone'),p_booking->>'service_type',
      coalesce(p_booking->>'property_type','Residential'),coalesce(p_booking->>'address',''),coalesce(p_booking->>'preferred_date',''),p_booking->>'preferred_time_slot',
      p_booking->>'additional_notes','pending',now(),null);
  -- Price is an untrusted client estimate. Only admins can set the authoritative amount.
  if v_uid is null then
    insert into private.guest_booking_access(booking_id,token_hash)
      values(v_id,encode(sha256(convert_to(p_guest_token,'UTF8')),'hex'));
  end if;
  return v_id;
end $$;

create or replace function public.get_guest_booking(p_id uuid, p_token text)
returns jsonb language sql stable security definer set search_path = '' as $$
  select to_jsonb(b) from public.bookings b join private.guest_booking_access g on g.booking_id=b.id
  where b.id=p_id and b.user_id is null and g.expires_at>now()
    and not exists (select 1 from private.legacy_booking_quarantine q where q.booking_id=b.id)
    and length(p_token)=64 and g.token_hash=encode(sha256(convert_to(p_token,'UTF8')),'hex');
$$;

create or replace function public.claim_guest_bookings() returns integer
language plpgsql security definer set search_path = '' as $$
declare n integer; v_email text;
begin
  if not public.is_verified_user() then raise exception 'Verified account required'; end if;
  select lower(email) into v_email from auth.users where id=auth.uid();
  update public.bookings b set user_id=auth.uid()::text where user_id is null and lower(customer_email)=v_email
    and not exists (select 1 from private.legacy_booking_quarantine q where q.booking_id=b.id);
  get diagnostics n = row_count;
  return n;
end $$;

create or replace function public.cancel_booking(p_id uuid, p_token text default null) returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  update public.bookings b set status='cancelled'
  where b.id=p_id and b.status in ('pending','approved','confirmed')
    and not exists (select 1 from private.legacy_booking_quarantine q where q.booking_id=b.id) and (
    (auth.uid() is not null and public.is_verified_user() and b.user_id=auth.uid()::text)
    or (b.user_id is null and exists (select 1 from private.guest_booking_access g
      where g.booking_id=b.id and g.expires_at>now() and length(p_token)=64
      and g.token_hash=encode(sha256(convert_to(p_token,'UTF8')),'hex'))));
  return found;
end $$;

-- Approval attribution comes from the server, never from a posted admin email.
create or replace function private.stamp_booking_approval() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.status not in ('pending','approved','confirmed','completed','cancelled','deleted') then raise exception 'Invalid status'; end if;
  if new.status in ('approved','confirmed') and new.status is distinct from old.status then
    if not public.is_admin() then raise exception 'Administrator required'; end if;
    new.approved_at := now();
    select email into new.approved_by from auth.users where id=auth.uid();
  elsif not public.is_admin() then
    new.approved_at := old.approved_at; new.approved_by := old.approved_by;
  end if;
  return new;
end $$;
drop trigger if exists stamp_booking_approval on public.bookings;
create trigger stamp_booking_approval before update on public.bookings for each row execute function private.stamp_booking_approval();

create or replace function public.submit_review(p_review jsonb) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_id uuid := gen_random_uuid(); v_rating integer;
begin
  if not public.is_verified_user() then raise exception 'Verified account required'; end if;
  if jsonb_typeof(p_review) is distinct from 'object' or octet_length(p_review::text)>10000 then raise exception 'Invalid review'; end if;
  v_rating := (p_review->>'rating')::integer;
  if v_rating is null or v_rating not between 1 and 5 or length(trim(coalesce(p_review->>'author_name',''))) not between 1 and 200
    or length(trim(coalesce(p_review->>'service',''))) not between 1 and 300 or length(coalesce(p_review->>'comment',''))>5000 then raise exception 'Invalid review'; end if;
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text, 1));
  if exists(select 1 from public.reviews where user_id=auth.uid()::text and created_at>now()-interval '1 day') then raise exception 'Please wait before submitting another review'; end if;
  insert into public.reviews(id,user_id,author_name,rating,service,neighborhood,comment,verified)
    values(v_id,auth.uid()::text,p_review->>'author_name',v_rating,p_review->>'service',p_review->>'neighborhood',p_review->>'comment',
      exists(select 1 from public.bookings b where user_id=auth.uid()::text and status='completed'
        and not exists(select 1 from private.legacy_booking_quarantine q where q.booking_id=b.id)));
  return v_id;
end $$;

revoke all on function public.submit_booking(jsonb,text), public.get_guest_booking(uuid,text), public.cancel_booking(uuid,text), public.claim_guest_bookings(), public.submit_review(jsonb) from public, anon, authenticated;
grant execute on function public.submit_booking(jsonb,text), public.get_guest_booking(uuid,text), public.cancel_booking(uuid,text) to anon, authenticated;
grant execute on function public.claim_guest_bookings(), public.submit_review(jsonb) to authenticated;
revoke all on all functions in schema private from public, anon, authenticated;
commit;
