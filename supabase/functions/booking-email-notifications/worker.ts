export const ADMIN_EMAIL = 'primexpress33@gmail.com';
type Job = { id: string; bookingId: string; claimToken: string; isTest: boolean };
type Message = { from: string; to: string; subject: string; text: string; messageId: string };
export type Dependencies = {
  claim: (key: string) => Promise<Job | null>;
  finish: (job: Job, sent: boolean) => Promise<boolean>;
  send: (message: Message) => Promise<void>;
  configured: () => boolean;
};
export function bookingMessage(job: Job): Message {
  return {
    from: `PrimeXPress Cleaning INC <${ADMIN_EMAIL}>`, to: ADMIN_EMAIL,
    subject: `${job.isTest ? '[TEST] ' : ''}New service booking — PrimeXPress`,
    text: job.isTest
      ? 'This is a test of PrimeXPress booking email notifications. No customer booking was created.\n\nFuture new bookings will send an alert to this address.'
      : `A new service booking has been received.\n\nBooking reference: ${job.bookingId}\n\nOpen https://primexpress.vercel.app and choose Admin Login in the footer to review the booking details.`,
    messageId: `<booking-${job.id}@primexpress.vercel.app>`,
  };
}
export function createHandler(deps: Dependencies) {
  return async (request: Request): Promise<Response> => {
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
    const key = request.headers.get('X-Booking-Worker-Key') || '';
    if (!/^[a-f0-9]{64}$/.test(key)) return new Response('Unauthorized', { status: 401 });
    // No caller-provided email addresses, booking payloads or SMTP settings.
    if (!deps.configured()) return new Response('Email service is not configured', { status: 503 });
    let job: Job | null;
    try { job = await deps.claim(key); } catch { return new Response('Worker unavailable or unauthorized', { status: 403 }); }
    if (!job) return new Response(null, { status: 204 });
    try {
      await deps.send(bookingMessage(job));
    } catch {
      await deps.finish(job, false).catch(() => false);
      return new Response('Delivery will be retried', { status: 502 });
    }
    // Do not mark an accepted SMTP message as failed if recording its receipt
    // fails. A lost acknowledgement can still cause a retry after the lease.
    try {
      if (!await deps.finish(job, true)) return new Response('Delivery acknowledgement pending', { status: 503 });
    } catch { return new Response('Delivery acknowledgement pending', { status: 503 }); }
    return Response.json({ sent: true });
  };
}
