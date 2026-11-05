// Emails the website sends about form submissions (pure builders, tested without sending):
//   estimateEmail: to the homeowner, with their instant estimate (netlify/functions/estimate.mjs).
//   leadEmail:     to the team inbox, a copy of every website lead (netlify/functions/lead.mjs), as a backup to
//                  Follow Up Boss's own alerts. Sent only when RESEND_API_KEY is set (src/lib/mail.mjs).
// The estimate email shows only the price range and how many sales it used, never the sold homes themselves
// (NorthstarMLS sold data stays on the website), and always carries SOLD_DISCLAIMER.
import { SOLD_DISCLAIMER } from './sold.mjs';

export const SITE = { name: 'Huerkamp Home Group', brokerage: 'Keller Williams Preferred Realty', street: '14300 Nicollet Ct, Ste 208',
  cityStateZip: 'Burnsville, MN 55306', phone: '(612) 502-7653', url: 'https://www.huerkamphomes.com' };

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (n) => `$${Math.round(n).toLocaleString('en-US')}`;
const footer = `${SITE.name} · ${SITE.brokerage}\n${SITE.street}, ${SITE.cityStateZip} · ${SITE.phone}`;
const htmlWrap = (paras) => `<div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.5;color:#1b1819;max-width:560px">${paras}`
  + `<p style="font-size:13px;color:#5e5856">${esc(SITE.name)} · ${esc(SITE.brokerage)}<br>${esc(SITE.street)}, ${esc(SITE.cityStateZip)} · ${esc(SITE.phone)}</p></div>`;

/**
 * The homeowner's email. `result` is the /api/estimate answer ({ ok, low, mid, high, n, months, zip } or an error).
 * Returns { subject, message, text, html, link }: `message` + `link` for a Repliers message, text/html for Resend.
 */
export function estimateEmail(person, address, result) {
  const hi = person.firstName ? `Hi ${person.firstName},` : 'Hi,';
  const where = address || (result?.zip ? `your home in ${result.zip}` : 'your home');
  const link = `${SITE.url}/home-estimate`;
  let subject, body;
  if (result?.ok) {
    subject = `Your home value estimate for ${where}`;
    body = [
      `Thanks for asking what ${where} could sell for. Your instant estimate is ${money(result.low)} to ${money(result.high)}, with the middle of the range at ${money(result.mid)}.`,
      `It's based on ${result.n} similar homes that sold in ZIP ${result.zip} in the last ${result.months} months. ${SOLD_DISCLAIMER}`,
      `Updates, condition and your exact location can move the number, so one of our agents will reach out to fine-tune it with you, free. Questions sooner? Call or text us at ${SITE.phone}, or just reply to this email.`,
    ];
  } else if (result?.error === 'not-enough-sales') {
    subject = `We're preparing your home value for ${where}`;
    body = [
      `Thanks for asking what ${where} could sell for. There haven't been enough recent sales of homes like yours nearby for an instant estimate, so one of our agents will prepare your value by hand from the best comparable sales and send it to you.`,
      `Questions sooner? Call or text us at ${SITE.phone}, or just reply to this email.`,
    ];
  } else {
    subject = `We got your home value request for ${where}`;
    body = [
      `Thanks for asking what ${where} could sell for. Our instant estimate wasn't available just now, so one of our agents will send you a value for your home shortly.`,
      `Questions sooner? Call or text us at ${SITE.phone}, or just reply to this email.`,
    ];
  }
  const message = `${hi} ${body.join(' ').replace(/^Thanks/, 'thanks')}`;
  const text = `${hi}\n\n${body.join('\n\n')}\n\n${footer}`;
  const html = htmlWrap(`<p>${esc(hi)}</p>${body.map((p) => `<p>${esc(p)}</p>`).join('')}`);
  return { subject, message, text, html, link };
}

const LABELS = { address: 'Property address', zip: 'ZIP', homeType: 'Kind of home', beds: 'Bedrooms', baths: 'Bathrooms', sqft: 'Finished sq ft',
  timeline: 'Timeline', message: 'Message', notes: 'Notes', community: 'Community', listing: 'Listing', priceRange: 'Price range' };

/** The team's copy of a website lead. `delivered` says whether Follow Up Boss accepted it. */
export function leadEmail(label, fields = {}, page = '', delivered = true) {
  const name = [fields.firstName, fields.lastName].filter(Boolean).join(' ') || 'Someone';
  const subject = `${delivered ? '' : 'ACTION NEEDED: '}New website lead: ${label} from ${name}`;
  const rows = [['Name', name], ['Email', fields.email], ['Phone', fields.phone],
    ...Object.entries(fields).filter(([k, v]) => !['firstName', 'lastName', 'email', 'phone', 'smsConsent', 'website_url'].includes(k) && String(v ?? '').trim())
      .map(([k, v]) => [LABELS[k] ?? k, v]),
    ['Page', page ? `${SITE.url}${page}` : '']].filter(([, v]) => String(v ?? '').trim());
  const status = delivered ? 'This lead was also sent to Follow Up Boss.' : 'Follow Up Boss did NOT accept this lead. Please add it by hand and follow up.';
  const text = `${label}\n\n${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\n${status}`;
  const html = htmlWrap(`<p><strong>${esc(label)}</strong></p><table style="border-collapse:collapse">${rows.map(([k, v]) => `<tr><td style="padding:3px 12px 3px 0;color:#5e5856">${esc(k)}</td><td style="padding:3px 0">${esc(v)}</td></tr>`).join('')}</table>`
    + `<p style="${delivered ? '' : 'color:#d40000;font-weight:bold'}">${esc(status)}</p>`);
  return { subject, text, html };
}
