-- Run only as the database owner after the intended administrator verifies
-- their Auth account. Never expose this operation through a public RPC.
with chosen as (
  select id from auth.users
  where lower(email) = 'primexpress33@gmail.com'
    and email_confirmed_at is not null and deleted_at is null
    and not coalesce(is_anonymous, false)
    and (banned_until is null or banned_until <= now())
)
insert into private.admin_users(user_id)
select id from chosen where (select count(*) from chosen) = 1
on conflict (user_id) do nothing;

-- To revoke a specific account, an owner removes its private.admin_users row
-- and revokes that user's Auth sessions. No application role can edit this table.
