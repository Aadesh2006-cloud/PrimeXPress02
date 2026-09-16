const SINGLE_MAILBOX = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

// A customer-controlled recipient must never become mailto query parameters
// or additional recipients. Body newlines are allowed; header newlines are not.
export function createMailto(recipient: string, subject?: string, body?: string): string {
  const email = recipient.trim();
  const local = email.split('@')[0];
  if (email.length > 254 || local.length > 64 || !SINGLE_MAILBOX.test(email)
      || local.startsWith('.') || local.endsWith('.') || local.includes('..')) return '';
  const parameters: string[] = [];
  if (subject !== undefined) parameters.push(`subject=${encodeURIComponent(subject.replace(/[\u0000-\u001f\u007f]/g, ' '))}`);
  if (body !== undefined) parameters.push(`body=${encodeURIComponent(body)}`);
  return `mailto:${encodeURIComponent(email)}${parameters.length ? `?${parameters.join('&')}` : ''}`;
}
