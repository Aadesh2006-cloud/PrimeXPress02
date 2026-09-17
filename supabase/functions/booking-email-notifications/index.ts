import nodemailer from 'npm:nodemailer@10.0.10';
import { createHandler, ADMIN_EMAIL } from './worker.ts';

const projectUrl = Deno.env.get('SUPABASE_URL')!;
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}').default;
const password = Deno.env.get('BOOKING_GMAIL_APP_PASSWORD')?.replace(/\s/g, '');
async function rpc(name: string, body: Record<string, unknown>) {
  const response = await fetch(`${projectUrl}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: serviceKey,
      ...(serviceKey.startsWith('sb_secret_') ? {} : { Authorization: `Bearer ${serviceKey}` }) },
    body: JSON.stringify(body), signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error('Booking email RPC failed');
  return await response.json();
}
const transport = nodemailer.createTransport({
  host: 'smtp.gmail.com', port: 465, secure: true,
  auth: { user: ADMIN_EMAIL, pass: password },
  connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 20000,
  tls: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
  disableFileAccess: true, disableUrlAccess: true,
});
Deno.serve(createHandler({
  configured: () => Boolean(password && serviceKey && projectUrl),
  claim: (key) => rpc('claim_booking_email', { p_worker_key: key }),
  finish: (job, sent) => rpc('finish_booking_email', { p_id: job.id, p_claim_token: job.claimToken, p_sent: sent }),
  send: async (message) => {
    const result = await transport.sendMail(message);
    if (!result.accepted?.includes(ADMIN_EMAIL)) throw new Error('SMTP did not accept recipient');
  },
}));
