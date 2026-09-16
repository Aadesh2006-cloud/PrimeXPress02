import { before, after, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
const db = new PGlite();
const A='11111111-1111-4111-8111-111111111111', B='22222222-2222-4222-8222-222222222222';
const ADMIN='33333333-3333-4333-8333-333333333333', UNVERIFIED='44444444-4444-4444-8444-444444444444';
const token='a'.repeat(64), wrong='b'.repeat(64);
const LEGACY_OWN='55555555-5555-4555-8555-555555555555', LEGACY_GUEST='66666666-6666-4666-8666-666666666666';
let aBooking:string, bBooking:string, guestBooking:string, expiringBooking:string;
const booking = (email:string)=>({customer_name:'Test Customer',customer_email:email,customer_phone:'2045550100',service_type:'Air Duct Cleaning',address:'Synthetic test address'});
async function as(role:string,id:string|null,fn:()=>Promise<void>) {
  await db.exec(`set role ${role}`);
  await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id||'']);
  try { await fn(); } finally { await db.exec('reset role'); }
}
async function scalar(sql:string,params:any[]=[]) {
  const r=await db.query(sql,params); return Object.values(r.rows[0] as any)[0] as any;
}
before(async()=>{
  // Supabase-compatible identity boundary backed by PostgreSQL roles. All
  // fixtures are disposable and never touch the real Supabase project.
  await db.exec(`create role anon; create role authenticated;
    create schema auth; grant usage on schema auth to anon, authenticated;
    create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,is_anonymous boolean default false,raw_user_meta_data jsonb default '{}',deleted_at timestamptz,banned_until timestamptz);
    create table auth.sessions(id uuid primary key,user_id uuid,not_after timestamptz);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    create function auth.jwt() returns jsonb language sql stable as $$ select jsonb_build_object('session_id',auth.uid()::text) $$;
    insert into auth.users(id,email,email_confirmed_at) values
      ('${A}','a@example.test',now()),('${B}','b@example.test',now()),('${ADMIN}','admin@example.test',now()),('${UNVERIFIED}','u@example.test',null);`);
  await db.exec('insert into auth.sessions(id,user_id) select id,id from auth.users');
  // Mirror live NOT NULL constraints and previously unauthenticated ownership.
  await db.exec(`create table public.bookings (
    id uuid primary key default gen_random_uuid(), user_id text,
    customer_name text not null, customer_email text not null, customer_phone text not null,
    service_type text not null, property_type text default 'Residential',address text not null,
    preferred_date text not null, preferred_time_slot text, additional_notes text,
    status text default 'pending',created_at timestamptz default now());
    insert into public.bookings(id,user_id,customer_name,customer_email,customer_phone,service_type,address,preferred_date,status) values
      ('${LEGACY_OWN}','${A}','Legacy','a@example.test','2045550100','Test','Test','Test','completed'),
      ('${LEGACY_GUEST}',null,'Legacy guest','a@example.test','2045550100','Test','Test','Test','pending');`);
  await db.exec(fs.readFileSync('supabase/migrations/20260915165812_secure_auth.sql','utf8'));
  await db.query('insert into private.admin_users(user_id) values ($1)',[ADMIN]);
  await as('authenticated',A,async()=>{aBooking=await scalar('select public.submit_booking($1::jsonb,$2)',[booking('spoof@example.test'),token]);});
  await as('authenticated',B,async()=>{bBooking=await scalar('select public.submit_booking($1::jsonb,$2)',[booking('b@example.test'),token]);});
  await as('anon',null,async()=>{guestBooking=await scalar('select public.submit_booking($1::jsonb,$2)',[booking('a@example.test'),token]);expiringBooking=await scalar('select public.submit_booking($1::jsonb,$2)',[booking('guest@example.test'),token]);});
});
after(()=>db.close());
it('customers only read their own rows even with an unfiltered query',async()=>{
 await as('authenticated',A,async()=>{const r=await db.query('select id,customer_email from public.bookings');assert.equal(r.rows.length,1);assert.equal((r.rows[0] as any).id,aBooking);assert.equal((r.rows[0] as any).customer_email,'a@example.test');});
});
it('anonymous callers cannot select booking records',async()=>{
 await as('anon',null,async()=>{await assert.rejects(()=>db.query('select * from public.bookings'),/permission denied/);});
});
it('direct inserts cannot bypass constrained booking submission',async()=>{
 await as('authenticated',A,async()=>{await assert.rejects(()=>db.query("insert into public.bookings(customer_name,customer_email,customer_phone,service_type,status) values('x','x@y.test','2045550100','x','approved')"),/permission denied/);});
});
it('customer cannot approve a booking or alter ownership',async()=>{
 await as('authenticated',A,async()=>{const r=await db.query("update public.bookings set status='approved',user_id=$1 where id=$2 returning id",[B,aBooking]);assert.equal(r.rows.length,0);});
});
it('customer cannot delete bookings',async()=>{
 await as('authenticated',A,async()=>{const r=await db.query('delete from public.bookings where id=$1 returning id',[aBooking]);assert.equal(r.rows.length,0);});
});
it('private role membership is inaccessible and cannot be self-granted',async()=>{
 await as('authenticated',A,async()=>{await assert.rejects(()=>db.query('insert into private.admin_users(user_id) values ($1)',[A]),/permission denied/);assert.equal(await scalar('select public.is_admin()'),false);});
});
it('editable user metadata does not confer an admin role',async()=>{
 await db.query("update auth.users set raw_user_meta_data='{"+'"role":"admin"'+"}' where id=$1",[A]);
 await as('authenticated',A,async()=>assert.equal(await scalar('select public.is_admin()'),false));
});
it('administrator can read all bookings and server stamps approval identity',async()=>{
 await as('authenticated',ADMIN,async()=>{assert.equal(await scalar('select count(*)::int from public.bookings'),6);await db.query("update public.bookings set status='approved',approved_by='spoof' where id=$1",[aBooking]);assert.equal(await scalar('select approved_by from public.bookings where id=$1',[aBooking]),'admin@example.test');});
});
it('legacy ownership is quarantined while original data remains available to admins',async()=>{
 await as('authenticated',A,async()=>{
   assert.equal(await scalar('select public.owns_booking($1)',[LEGACY_OWN]),false);
   assert.equal(await scalar('select public.cancel_booking($1,null)',[LEGACY_GUEST]),false);
 });
 await as('authenticated',ADMIN,async()=>{
   assert.equal(await scalar('select status from public.bookings where id=$1',[LEGACY_OWN]),'completed');
   assert.equal(await scalar('select user_id from public.bookings where id=$1',[LEGACY_OWN]),A);
 });
});
it('administrator membership revocation takes effect immediately',async()=>{
 await db.query('delete from private.admin_users where user_id=$1',[ADMIN]);
 await as('authenticated',ADMIN,async()=>assert.equal(await scalar('select public.is_admin()'),false));
 await db.query('insert into private.admin_users(user_id) values($1)',[ADMIN]);
});
it('revoked sessions immediately lose database and admin access',async()=>{
 await db.query('delete from auth.sessions where user_id=$1',[ADMIN]);
 await as('authenticated',ADMIN,async()=>{assert.equal(await scalar('select public.is_admin()'),false);assert.equal(await scalar('select count(*)::int from public.bookings'),0);});
 await db.query('insert into auth.sessions(id,user_id) values($1,$1)',[ADMIN]);
});
it('banned users cannot access customer data',async()=>{
 await db.query("update auth.users set banned_until=now()+interval '1 day' where id=$1",[A]);
 await as('authenticated',A,async()=>assert.equal(await scalar('select count(*)::int from public.bookings'),0));
 await db.query('update auth.users set banned_until=null where id=$1',[A]);
});
it('unconfirmed accounts cannot submit bookings or read records',async()=>{
 await as('authenticated',UNVERIFIED,async()=>{assert.equal(await scalar('select count(*)::int from public.bookings'),0);await assert.rejects(()=>scalar('select public.submit_booking($1::jsonb,$2)',[booking('u@example.test'),token]),/Verified account/);});
});
it('correct guest capability retrieves only its one record',async()=>{
 await as('anon',null,async()=>{assert.equal((await scalar('select public.get_guest_booking($1,$2)',[guestBooking,token])).id,guestBooking);assert.equal(await scalar('select public.get_guest_booking($1,$2)',[guestBooking,wrong]),null);assert.equal(await scalar('select public.get_guest_booking($1,$2)',[aBooking,token]),null);});
});
it('expired guest capabilities cannot retrieve records',async()=>{
 await db.query("update private.guest_booking_access set expires_at=now()-interval '1 minute' where booking_id=$1",[expiringBooking]);
 await as('anon',null,async()=>assert.equal(await scalar('select public.get_guest_booking($1,$2)',[expiringBooking,token]),null));
});
it('customers cannot cancel someone else’s booking',async()=>{
 await as('authenticated',A,async()=>assert.equal(await scalar('select public.cancel_booking($1,null)',[bBooking]),false));
});
it('guest cancellation requires the matching capability',async()=>{
 await as('anon',null,async()=>{assert.equal(await scalar('select public.cancel_booking($1,$2)',[guestBooking,wrong]),false);assert.equal(await scalar('select public.cancel_booking($1,$2)',[guestBooking,token]),true);});
});
it('owner can cancel their own booking',async()=>{
 await as('authenticated',B,async()=>assert.equal(await scalar('select public.cancel_booking($1,null)',[bBooking]),true));
});
it('claim uses verified server identity and invalidates guest capability',async()=>{
 await as('authenticated',B,async()=>assert.equal(await scalar('select public.claim_guest_bookings()'),0));
 await as('authenticated',A,async()=>assert.equal(await scalar('select public.claim_guest_bookings()'),1));
 await as('anon',null,async()=>assert.equal(await scalar('select public.get_guest_booking($1,$2)',[guestBooking,token]),null));
});
it('review verification cannot be supplied by the customer',async()=>{
 await as('authenticated',A,async()=>{const id=await scalar('select public.submit_review($1::jsonb)',[{author_name:'Test',rating:5,service:'Air Duct Cleaning',comment:'Test only',verified:true,user_id:B}]);assert.equal(await scalar('select verified from public.reviews where id=$1',[id]),false);await assert.rejects(()=>db.query('select user_id from public.reviews'),/permission denied/);});
});
it('anonymous users can read public review fields, but cannot write reviews',async()=>{
 await as('anon',null,async()=>{assert.equal(await scalar('select rating from public.reviews limit 1'),5);await assert.rejects(()=>scalar('select public.submit_review($1::jsonb)',[{}]),/permission denied/);});
});
it('migration is repeatable without deleting booking data or administrators',async()=>{
 await db.exec(fs.readFileSync('supabase/migrations/20260915165812_secure_auth.sql','utf8'));
 assert.equal(await scalar('select count(*)::int from public.bookings'),6);
 assert.equal(await scalar('select count(*)::int from private.admin_users'),1);
 assert.equal(await scalar('select count(*)::int from private.legacy_booking_quarantine'),2);
 await as('authenticated',A,async()=>assert.equal(await scalar('select public.owns_booking($1)',[aBooking]),true));
});
