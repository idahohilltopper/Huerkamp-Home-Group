// Errors that visitors' browsers hit on the site (src/components/ErrorReporter.astro), so problems show up even when
// our own tests don't hit them. POST stores one report (Netlify Blobs store "client-errors", one key per report,
// grouped by day); GET returns the last 7 days grouped by message and page, for the daily site check.
// Nothing personal is stored: no IP address, no query string (only the page path), no form contents; the browser is
// reduced to its family and whether it's a phone.
import { getStore } from '@netlify/blobs';

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const clip = (v, n) => String(v ?? '').replace(/[\u0000-\u001f]+/g, ' ').slice(0, n);
const browser = (ua) => {
  const b = /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /SamsungBrowser/.test(ua) ? 'Samsung' : /Firefox\//.test(ua) ? 'Firefox'
    : /CriOS|Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'Other';
  return `${b}${/Mobi|iPhone|Android/.test(ua) ? ' (phone)' : ''}`;
};
const BOTS = /bot|crawl|spider|slurp|headless|lighthouse|playwright|puppeteer/i;
const DAYS = 7;

export default async (req) => {
  const store = getStore('client-errors');
  if (req.method === 'POST') {
    const ua = req.headers.get('user-agent') ?? '';
    if (BOTS.test(ua)) return json(202, { ok: true });
    let b; try { b = JSON.parse((await req.text()).slice(0, 4000)); } catch { return json(400, { ok: false }); }
    const page = clip(b.page, 200).split(/[?#]/)[0];
    if (!page.startsWith('/')) return json(400, { ok: false });
    const at = new Date().toISOString();
    await store.setJSON(`${at.slice(0, 10)}/${at}-${crypto.randomUUID().slice(0, 8)}`, {
      at, page, kind: clip(b.kind, 20), msg: clip(b.msg, 300), src: clip(b.src, 200).split(/[?#]/)[0], line: Number(b.line) || null,
      browser: browser(ua), width: Number(b.width) || null,
    });
    return json(202, { ok: true });
  }
  if (req.method !== 'GET') return json(405, { ok: false });
  // ?hours=N: only the last N hours (the hourly check looks for a sudden jump); otherwise the last 7 days.
  const hours = Math.min(Number(new URL(req.url).searchParams.get('hours')) || 0, DAYS * 24);
  const since = hours ? new Date(Date.now() - hours * 3600e3).toISOString() : '';
  const groups = new Map();
  for (let d = 0; d < (hours ? Math.ceil(hours / 24) + 1 : DAYS); d++) {
    const day = new Date(Date.now() - d * 864e5).toISOString().slice(0, 10);
    const { blobs } = await store.list({ prefix: `${day}/` });
    for (const { key } of blobs.slice(0, 500)) {
      const e = await store.get(key, { type: 'json' }).catch(() => null);
      if (!e || (since && e.at < since)) continue;
      const k = `${e.kind}|${e.msg}|${e.page}`;
      const g = groups.get(k) ?? { kind: e.kind, msg: e.msg, page: e.page, src: e.src, line: e.line, count: 0, last: e.at, browsers: {} };
      g.count++; if (e.at > g.last) g.last = e.at;
      g.browsers[e.browser] = (g.browsers[e.browser] ?? 0) + 1;
      groups.set(k, g);
    }
  }
  const errors = [...groups.values()].sort((a, b) => b.count - a.count);
  return json(200, { ok: true, days: hours ? hours / 24 : DAYS, ...(hours ? { hours } : {}), total: errors.reduce((s, g) => s + g.count, 0), errors: errors.slice(0, 50) });
};

export const config = { path: '/api/client-error' };
