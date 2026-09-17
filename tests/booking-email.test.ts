import { it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { createHandler, ADMIN_EMAIL, type Dependencies } from '../supabase/functions/booking-email-notifications/worker';
const key = 'a'.repeat(64);
const job = { id:'11111111-1111-4111-8111-111111111111', bookingId:'22222222-2222-4222-8222-222222222222', claimToken:'33333333-3333-4333-8333-333333333333', isTest:false };
const request = () => new Request('https://example.test', { method:'POST', headers:{'X-Booking-Worker-Key':key}, body:JSON.stringify({to:'attacker@example.test',text:'spoof'}) });
function deps(overrides:Partial<Dependencies> = {}): Dependencies {
  return {configured:()=>true,claim:async()=>job,finish:async()=>true,send:async()=>{},...overrides};
}
it('email worker rejects unauthenticated requests before accessing queue', async()=>{
  let called=false;
  const handler=createHandler(deps({claim:async()=>{called=true;return job;}}));
  assert.equal((await handler(new Request('https://example.test',{method:'POST'}))).status,401);
  assert.equal(called,false);
  assert.equal((await handler(new Request('https://example.test'))).status,405);
});
it('email worker rejects a forged worker key and leaves jobs untouched',async()=>{
  let sent=false;
  const handler=createHandler(deps({claim:async()=>{throw Error('Unauthorized');},send:async()=>{sent=true;}}));
  assert.equal((await handler(request())).status,403); assert.equal(sent,false);
});
it('email worker sends only to fixed admin, ignores request content and acknowledges delivery',async()=>{
  let message:any; let acknowledged=false;
  const handler=createHandler(deps({send:async value=>{message=value;},finish:async(value,sent)=>{assert.equal(value.claimToken,job.claimToken);acknowledged=sent;return true;}}));
  assert.equal((await handler(request())).status,200);
  assert.equal(message.to,ADMIN_EMAIL); assert.equal(message.text.includes('spoof'),false); assert.equal(message.text.includes(job.bookingId),true); assert.equal(acknowledged,true);
});
it('failed SMTP delivery remains retryable instead of reporting success',async()=>{
  let acknowledged:any;
  const handler=createHandler(deps({send:async()=>{throw Error('SMTP down');},finish:async(_,sent)=>{acknowledged=sent;return true;}}));
  assert.equal((await handler(request())).status,502); assert.equal(acknowledged,false);
});
it('missing SMTP configuration does not consume a queued job',async()=>{
  let called=false;
  const handler=createHandler(deps({configured:()=>false,claim:async()=>{called=true;return job;}}));
  assert.equal((await handler(request())).status,503); assert.equal(called,false);
});
it('a lost delivery acknowledgement does not record SMTP failure',async()=>{
  const acknowledgements:boolean[]=[];
  const handler=createHandler(deps({finish:async(_,sent)=>{acknowledgements.push(sent);throw Error('offline');}}));
  assert.equal((await handler(request())).status,503); assert.deepEqual(acknowledgements,[true]);
});

const db = new PGlite();
async function scalar(sql:string,params:unknown[]=[]){const result=await db.query(sql,params);return Object.values(result.rows[0] as object)[0] as any;}
before(async()=>{
  await db.exec('create role anon; create role authenticated; create role service_role; create schema private; revoke all on schema private from public; create table public.bookings(id uuid primary key);');
  const name=fs.readdirSync('supabase/migrations').find(n=>n.endsWith('_booking_email_notifications.sql'));
  const sql=fs.readFileSync(process.env.BOOKING_MIGRATION_PATH || `supabase/migrations/${name}`,'utf8');
  await db.exec(sql.split('-- Hosting integration:')[0]+'\ncommit;');
  await db.query('update private.booking_email_config set enabled=true,worker_key=$1',[key]);
});
after(()=>db.close());
it('new bookings queue once, updates do not queue, and rolled-back bookings do not notify',async()=>{
  await db.query('insert into public.bookings values($1)',[job.bookingId]);
  await db.query('update public.bookings set id=id where id=$1',[job.bookingId]);
  assert.equal(await scalar('select count(*)::int from private.booking_email_outbox'),1);
  await db.exec('begin; insert into public.bookings values(gen_random_uuid()); rollback;');
  assert.equal(await scalar('select count(*)::int from private.booking_email_outbox'),1);
});
it('public and customer roles cannot read notification secrets or run worker RPCs',async()=>{
  for(const role of ['anon','authenticated']){
    await db.exec(`set role ${role}`);
    try{
      await assert.rejects(()=>db.query('select * from private.booking_email_config'),/permission denied/);
      await assert.rejects(()=>db.query('select public.claim_booking_email($1)',[key]),/permission denied/);
      await assert.rejects(()=>db.query('select public.finish_booking_email($1,$2,true)',[job.id,job.claimToken]),/permission denied/);
    }finally{await db.exec('reset role');}
  }
});
it('worker authentication, exclusive lease, stale acknowledgement and retry backoff are enforced',async()=>{
  await assert.rejects(()=>db.query('select public.claim_booking_email($1)',['b'.repeat(64)]),/Unauthorized/);
  const first=await scalar('select public.claim_booking_email($1)',[key]);
  assert.equal(first.bookingId,job.bookingId);
  assert.equal(await scalar('select public.claim_booking_email($1)',[key]),null);
  assert.equal(await scalar('select public.finish_booking_email($1,$2,true)',[first.id,job.claimToken]),false);
  assert.equal(await scalar('select public.finish_booking_email($1,$2,false)',[first.id,first.claimToken]),true);
  assert.equal(await scalar('select public.claim_booking_email($1)',[key]),null);
  await db.exec("update private.booking_email_outbox set next_attempt_at=now()-interval '1 minute'");
  const retry=await scalar('select public.claim_booking_email($1)',[key]);
  assert.notEqual(first.claimToken,retry.claimToken);
  assert.equal(await scalar('select public.finish_booking_email($1,$2,true)',[first.id,first.claimToken]),false);
  assert.equal(await scalar('select public.finish_booking_email($1,$2,true)',[retry.id,retry.claimToken]),true);
  assert.equal(await scalar('select public.claim_booking_email($1)',[key]),null);
});
