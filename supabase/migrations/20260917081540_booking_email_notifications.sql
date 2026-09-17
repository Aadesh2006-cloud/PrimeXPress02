begin;
create table private.booking_email_config (
  singleton boolean primary key default true check (singleton),
  worker_key text not null default replace(gen_random_uuid()::text,'-','') || replace(gen_random_uuid()::text,'-',''),
  enabled boolean not null default false
);
insert into private.booking_email_config(singleton) values (true);
create table private.booking_email_outbox (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique,
  is_test boolean not null default false,
  created_at timestamptz not null default now(),
  attempts integer not null default 0,
  next_attempt_at timestamptz not null default now(),
  leased_until timestamptz,
  claim_token uuid,
  sent_at timestamptz,
  last_error_code text
);
create index booking_email_due on private.booking_email_outbox(next_attempt_at) where sent_at is null;
alter table private.booking_email_config enable row level security;
alter table private.booking_email_outbox enable row level security;
revoke all on private.booking_email_config, private.booking_email_outbox from public, anon, authenticated, service_role;

create function private.queue_booking_email() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into private.booking_email_outbox(booking_id) values(new.id) on conflict(booking_id) do nothing;
  return new;
end $$;
revoke all on function private.queue_booking_email() from public, anon, authenticated, service_role;
create trigger queue_new_booking_email after insert on public.bookings
  for each row execute function private.queue_booking_email();

-- Only the server service role can call these RPCs. The independent worker
-- key authenticates the HTTP caller before any job is claimed or disclosed.
create function public.claim_booking_email(p_worker_key text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare job private.booking_email_outbox;
begin
  if p_worker_key is null or length(p_worker_key) <> 64 or not exists (
    select 1 from private.booking_email_config where singleton and enabled and worker_key=p_worker_key
  ) then raise exception 'Unauthorized worker' using errcode='42501'; end if;
  select * into job from private.booking_email_outbox
    where sent_at is null and next_attempt_at<=now() and (leased_until is null or leased_until<now())
    order by next_attempt_at,created_at for update skip locked limit 1;
  if not found then return null; end if;
  update private.booking_email_outbox set attempts=attempts+1, claim_token=gen_random_uuid(),
    leased_until=now()+interval '5 minutes' where id=job.id returning * into job;
  return jsonb_build_object('id',job.id,'bookingId',job.booking_id,'claimToken',job.claim_token,'isTest',job.is_test);
end $$;

create function public.finish_booking_email(p_id uuid,p_claim_token uuid,p_sent boolean,p_error_code text default null) returns boolean
language plpgsql security definer set search_path = '' as $$
declare changed integer;
begin
  update private.booking_email_outbox set
    sent_at=case when p_sent is true then now() else null end,
    next_attempt_at=now()+make_interval(secs=>least(3600,60*power(2,least(attempts,6))::integer)),
    last_error_code=case when p_sent is true then null else 'SMTP_DELIVERY_FAILED' end,
    leased_until=null,claim_token=null
    where id=p_id and claim_token=p_claim_token and sent_at is null;
  get diagnostics changed=row_count;
  return changed=1;
end $$;
revoke all on function public.claim_booking_email(text), public.finish_booking_email(uuid,uuid,boolean,text) from public,anon,authenticated;
grant execute on function public.claim_booking_email(text), public.finish_booking_email(uuid,uuid,boolean,text) to service_role;

-- Hosting integration: pg_net sends after commit; the durable outbox remains
-- available if networking or the SMTP provider fails. No historical backfill.
create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron with schema pg_catalog;
create function private.dispatch_booking_emails() returns bigint
language plpgsql security definer set search_path = '' as $$
declare key text; request_id bigint;
begin
  select worker_key into key from private.booking_email_config where singleton and enabled;
  if key is null or not exists(select 1 from private.booking_email_outbox where sent_at is null
    and next_attempt_at<=now() and (leased_until is null or leased_until<now())) then return null; end if;
  select net.http_post(
    url:='https://wzjfoimorynzpupjcaah.supabase.co/functions/v1/booking-email-notifications',
    headers:=jsonb_build_object('Content-Type','application/json','X-Booking-Worker-Key',key),
    body:='{}'::jsonb,timeout_milliseconds:=120000) into request_id;
  return request_id;
end $$;
revoke all on function private.dispatch_booking_emails() from public,anon,authenticated,service_role;
select cron.schedule('primexpress-booking-emails','* * * * *','select private.dispatch_booking_emails();');
commit;
