import { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';
import { register, signIn, signInAdmin, requireAdmin, verifiedUser } from '../src/services/authService';
const user = { id: 'customer', email: 'customer@example.test', email_confirmed_at: '2026-01-01', is_anonymous: false, user_metadata: {} };
function client(overrides: any = {}) {
  let signOuts = 0; let submitted: any;
  const auth = {
    signInWithPassword: async () => ({ data: { user, session: { user } }, error: null }),
    getUser: async () => ({ data: { user }, error: null }),
    signUp: async (input: any) => { submitted = input; return { data: { user, session: null }, error: null }; },
    signOut: async () => { signOuts++; return { error: null }; }, ...overrides.auth,
  };
  return { auth, rpc: overrides.rpc || (async () => ({ data: false, error: null })), get signOuts(){return signOuts;}, get submitted(){return submitted;} } as any;
}
describe('Supabase authentication fails closed', () => {
  it('verified customers can sign in repeatedly without a new email challenge', async () => {
    const c = client();
    for (let i = 0; i < 2; i++) {
      assert.deepEqual(await signIn(c, 'customer@example.test', 'a password'), { success: true });
    }
    assert.equal(c.signOuts, 0);
    assert.equal(c.submitted, undefined);
  });
  it('only unconfirmed email errors ask for initial verification', async () => {
    const pending = client({ auth: { signInWithPassword: async () => ({ data: {}, error: { code: 'email_not_confirmed' } }) } });
    assert.match((await signIn(pending, 'customer@example.test', 'a password')).error!, /verify your email/);
    const wrong = client({ auth: { signInWithPassword: async () => ({ data: {}, error: { code: 'invalid_credentials' } }) } });
    assert.doesNotMatch((await signIn(wrong, 'customer@example.test', 'wrong password')).error!, /verify|confirm/);
  });
  it('accepts a confirmed user with a real session', async () => assert.equal((await signIn(client(), 'customer@example.test','a password')).success,true));
  it('rejects incorrect credentials without local fallback', async () => {
    const c = client({ auth: { signInWithPassword: async () => ({ data: {}, error: { message: 'Invalid login credentials' } }) } });
    assert.equal((await signIn(c,'customer@example.test','wrong-but-long-enough')).success,false);
  });
  it('rejects network failure', async () => {
    const c=client({auth:{signInWithPassword:async()=>{throw new Error('offline');}}});
    assert.equal((await signIn(c,'customer@example.test','long-password')).success,false);
  });
  it('rejects a user object without a session',async()=>{
    const c=client({auth:{signInWithPassword:async()=>({data:{user,session:null},error:null})}});
    assert.equal((await signIn(c,'customer@example.test','long-password')).success,false);
  });
  it('rejects and clears an unconfirmed session',async()=>{
    const c=client({auth:{signInWithPassword:async()=>({data:{user:{...user,email_confirmed_at:null},session:{}},error:null})}});
    assert.equal((await signIn(c,'customer@example.test','long-password')).success,false); assert.equal(c.signOuts,1);
  });
  it('does not accept local identity when server validation fails',async()=>{
    const c=client({auth:{getUser:async()=>({data:{user},error:{message:'expired'}})}});
    assert.equal(await verifiedUser(c),null);
  });
  it('does not grant admin access based on editable metadata',async()=>{
    const c=client({auth:{getUser:async()=>({data:{user:{...user,user_metadata:{role:'admin'}}},error:null})}});
    await assert.rejects(()=>requireAdmin(c),/not authorized/);
  });
  it('rejects admin role lookup failures',async()=>{
    const c=client({rpc:async()=>({data:true,error:{message:'unavailable'}})});
    assert.equal((await signInAdmin(c,'admin@example.test','long-password')).success,false); assert.equal(c.signOuts,1);
  });
  it('rejects a customer logging into admin and clears the admin client',async()=>{
    const c=client(); assert.equal((await signInAdmin(c,'customer@example.test','long-password')).success,false); assert.equal(c.signOuts,1);
  });
  it('accepts a server-authorized administrator',async()=>{
    const c=client({rpc:async()=>({data:true,error:null})}); assert.equal((await signInAdmin(c,'admin@example.test','long-password')).success,true);
  });
});
describe('Registration',()=>{
  (globalThis as any).window={location:{origin:'https://app.example.test'}};
  after(() => { delete (globalThis as any).window; });
  it('requires at least twelve characters',async()=>assert.equal((await register(client(),'a@example.test','123456','Alice')).success,false));
  it('keeps email confirmation pending instead of manufacturing login',async()=>{
    const c=client(); const r=await register(c,'A@example.test','twelve-characters','Alice');
    assert.equal(r.success,true); assert.equal(r.requiresEmailConfirmation,true);
    assert.equal(c.submitted.email,'a@example.test'); assert.equal(c.submitted.options.data.role,undefined);
  });
  it('reports signup backend failure',async()=>{
    const c=client({auth:{signUp:async()=>({data:{},error:{message:'rejected'}})}});
    assert.equal((await register(c,'a@example.test','twelve-characters','Alice')).success,false);
  });
  it('reports signup network failure',async()=>{
    const c=client({auth:{signUp:async()=>{throw new Error('offline');}}});
    assert.equal((await register(c,'a@example.test','twelve-characters','Alice')).success,false);
  });
});
