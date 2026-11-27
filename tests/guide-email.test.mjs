// Free-guide emails (src/lib/guide-email.mjs): only real guides are sent, to a valid address, with the guide's link.
import test from 'node:test';
import assert from 'node:assert/strict';
import { guideFor, guideEmail, sendGuideEmail } from '../src/lib/guide-email.mjs';

test('finds a published guide by its tag, and nothing else', () => {
  assert.equal(guideFor('VA Loan Guide')?.slug, 'va-loans-in-minnesota');
  assert.equal(guideFor('anything else'), null);
  assert.equal(guideFor(''), null);
});

test('the email links to the guide PDF and escapes the name', () => {
  const g = guideFor('25 Insider Secrets on Home Buying');
  const e = guideEmail({ firstName: '<b>Ann</b>' }, g);
  assert.match(e.subject, /25 Insider Secrets/);
  assert.match(e.html, /https:\/\/www\.huerkamphomes\.com\/free-guides\/25-insider-secrets-on-home-buying\.pdf/);
  assert.ok(!e.html.includes('<b>Ann</b>'));
  assert.match(e.text, /Hi <b>Ann<\/b>,/); // plain text is not HTML
});

test('sends only for a known guide and a valid email', async () => {
  const sent = [];
  const mail = async (m) => { sent.push(m); return { ok: true }; };
  assert.deepEqual(await sendGuideEmail({ guide: 'nope', email: 'a@b.co' }, mail), { sent: false, why: 'unknown-guide' });
  assert.deepEqual(await sendGuideEmail({ guide: 'VA Loan Guide', email: 'not-an-email' }, mail), { sent: false, why: 'bad-email' });
  assert.deepEqual(await sendGuideEmail({ guide: 'VA Loan Guide', email: 'a@b.co', firstName: 'Sam' }, mail), { sent: true });
  assert.equal(sent.length, 1);
  assert.equal(sent[0].to, 'a@b.co');
});
