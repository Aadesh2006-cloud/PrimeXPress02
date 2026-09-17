begin;
-- pg_net installs permissive grants; queued headers contain a private worker key.
revoke all on schema net from public, anon, authenticated;
revoke all on all tables in schema net from public, anon, authenticated;
revoke all on all functions in schema net from public, anon, authenticated;
update private.booking_email_config set worker_key=replace(gen_random_uuid()::text,'-','') || replace(gen_random_uuid()::text,'-','') where singleton;
commit;
