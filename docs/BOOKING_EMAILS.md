# Automatic booking notifications

New rows in `public.bookings` atomically queue an alert in `private.booking_email_outbox`. A minute-based Supabase Cron job calls the `booking-email-notifications` Edge Function. The recipient and sender are fixed to `primexpress33@gmail.com`. Messages contain only the booking reference and a link to the website's administrator login; customer contact details stay in the portal. No frontend changes are needed and historical bookings are not backfilled.

## Deployment and activation

Apply the booking email migrations in timestamp order, then deploy the files under `supabase/functions/booking-email-notifications`. The function uses custom worker-key authentication; `supabase/config.toml` sets `verify_jwt=false`. Do not remove its RPC authorization. Add the secret `BOOKING_GMAIL_APP_PASSWORD` in Supabase Edge Function Secrets using a Google App Password for the sender address. Authentication SMTP settings do not automatically expose their password to Edge Functions. Never commit the password or use a `VITE_` environment variable for it.

The migration starts with sending disabled. After the function is deployed, enable dispatch as the database owner:

```sql
update private.booking_email_config set enabled=true where singleton;
```

The live project has the queue and dispatcher installed and enabled. Credential entry and the SMTP delivery test were still pending when this document was written. One clearly labelled test alert is queued without creating a customer booking.

## Delivery and security

- Only new committed bookings queue an alert; updates and rollbacks do not. A unique booking ID prevents duplicate enqueueing.
- Only the service role can execute claim/finish RPCs. The Edge Function validates an independent random worker key through the claim RPC. The key is stored in a private table, never returned to customers or included in source code.
- Dispatch includes the worker key in pg_net request headers. Hosted pg_net objects are owned by `supabase_admin`; the follow-up migration's revokes do not override that owner's PUBLIC grants on this project. The verified client boundary is API schema isolation: a REST request for `net` returns 406/PGRST106, and only `public` and `graphql_public` are exposed. Never expose `net` through the Data API or grant untrusted users direct database sessions. Database administrators can inspect queued headers. The follow-up migration also rotates the worker key.
- Cron checks once per minute. One due message is sent per invocation. Busy queues may take longer; SMTP acceptance is not a guarantee of inbox delivery.
- Jobs are leased for five minutes. Temporary failures retry with backoff up to one hour. A lost acknowledgement after SMTP acceptance can cause a duplicate email; stable Message-ID values help identify retries but do not guarantee deduplication.
- Missing credentials leave jobs queued. Gmail's provider limits or spam filtering can delay/reject delivery. Inspect pending jobs and provider delivery failures when investigating missing alerts.
- The function uses Gmail TLS on port 465 with certificate verification, bounded timeouts, and no message attachment/file/URL fetching. HTTP callers cannot supply recipients or email content.
- The outbox stores IDs and delivery metadata, not customer data. Intentional private-table RLS with no public policies denies client access. Do not grant application users access to the outbox or configuration.

Safe status query (does not reveal credentials or customer details):

```sql
select count(*) filter(where sent_at is null) as pending,
       count(*) filter(where sent_at is not null) as accepted_by_smtp,
       count(*) filter(where last_error_code is not null) as retrying
from private.booking_email_outbox;
```

Tests cover authentication, fixed recipient, failed delivery, lost acknowledgements, queue transaction boundaries, role grants, leases and retry backoff. Runtime entrypoint is checked by Edge Function deployment; browser TypeScript checks exclude that Deno entrypoint while checking the shared worker module.
