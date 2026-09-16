import { it } from 'node:test';
import assert from 'node:assert/strict';
import { createMailto } from '../src/utils/mailto';

it('mailto encodes one recipient without adding query headers', () => {
  const link = new URL(createMailto('?bcc=other+tag@example.test', 'Confirmation', 'Details &bcc=other@example.test'));
  assert.equal(decodeURIComponent(link.pathname), '?bcc=other+tag@example.test');
  assert.equal(link.searchParams.has('bcc'), false);
  assert.equal(link.searchParams.get('body'), 'Details &bcc=other@example.test');
});
it('mailto rejects additional recipients, display names, newlines and invalid domains', () => {
  for (const email of ['a@example.test?bcc=x@example.test', 'a@example.test,b@example.test',
    'a@example.test;b@example.test', 'Name <a@example.test>', 'a@example.test\r\nBcc:b@example.test',
    'missing-at', 'a@localhost', '.a@example.test', 'a..b@example.test']) assert.equal(createMailto(email), '');
});
it('mailto preserves normal plus addresses and body line breaks but removes subject controls', () => {
  const link = new URL(createMailto('person+booking@example.test', 'Hello\r\nBcc: injected', 'Line 1\nLine 2'));
  assert.equal(decodeURIComponent(link.pathname), 'person+booking@example.test');
  assert.equal(link.searchParams.get('subject'), 'Hello  Bcc: injected');
  assert.equal(link.searchParams.get('body'), 'Line 1\nLine 2');
});
