// Emails a person the free guide they asked for (/free-guides), right after their form reaches Follow Up Boss
// (netlify/functions/lead.mjs). Only guides listed in src/data/free-guides.json are sent, so the form can't be used to
// email anything else. Uses src/lib/mail.mjs (Resend); without RESEND_API_KEY nothing is sent.
import guides from '../data/free-guides.json' with { type: 'json' };
import { sendMail } from './mail.mjs';

const SITE = 'https://www.huerkamphomes.com';
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** The guide a form asked for (its "guide" field is the guide's tag), or null. */
export const guideFor = (tag) => guides.find((g) => !g.draft && g.tag === String(tag ?? '').trim()) ?? null;

/** The email for one person and one guide. */
export function guideEmail(fields, g) {
  const first = String(fields?.firstName ?? '').trim().slice(0, 40);
  const url = `${SITE}${g.pdf}`;
  const page = `${SITE}/free-guides`;
  const subject = `Your free guide: ${g.title}`;
  const text = `${first ? `Hi ${first},` : 'Hi,'}\n\nThanks for downloading "${g.title}" from Huerkamp Home Group. Here's your copy:\n${url}\n\nMore free guides: ${page}\n\nQuestions? Call or text us at (612) 502-7653. We've helped Twin Cities buyers and sellers since 2002.\n\nHuerkamp Home Group, Keller Williams Preferred Realty\n14300 Nicollet Ct, Ste 208, Burnsville, MN 55306\n\nYou're getting this email because you asked for this guide on huerkamphomes.com.`;
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;color:#1b1819;max-width:560px;margin:0 auto;line-height:1.55">
  <p style="margin:0 0 4px;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#d40000;font-weight:700">Free guide</p>
  <h1 style="font-family:Georgia,serif;font-weight:400;font-size:26px;margin:0 0 16px">${esc(g.title)}</h1>
  <p>${first ? `Hi ${esc(first)},` : 'Hi,'}</p>
  <p>Thanks for downloading our guide. Here's your copy:</p>
  <p style="margin:22px 0"><a href="${esc(url)}" style="background:#d40000;color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;display:inline-block">Download the guide (PDF)</a></p>
  <p>Want more? See <a href="${esc(page)}" style="color:#d40000">all our free guides</a> for Twin Cities buyers and sellers.</p>
  <p>Questions? Call or text us at <a href="tel:+16125027653" style="color:#d40000">(612) 502-7653</a>. We've helped Twin Cities buyers and sellers since 2002.</p>
  <p style="margin-top:28px;padding-top:14px;border-top:1px solid #e6ded3;font-size:12px;color:#5d5658">Huerkamp Home Group, Keller Williams Preferred Realty<br>14300 Nicollet Ct, Ste 208, Burnsville, MN 55306<br>You're getting this email because you asked for this guide on huerkamphomes.com.</p>
</div>`;
  return { subject, text, html };
}

/** Send the guide to the person who asked for it. Returns { sent, why }. */
export async function sendGuideEmail(fields, mail = sendMail) {
  const g = guideFor(fields?.guide);
  const to = String(fields?.email ?? '').trim();
  if (!g) return { sent: false, why: 'unknown-guide' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return { sent: false, why: 'bad-email' };
  const r = await mail({ to, ...guideEmail(fields, g) });
  return r.ok ? { sent: true } : { sent: false, why: r.error };
}
