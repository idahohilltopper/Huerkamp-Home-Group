// IndexNow: after every successful production deploy, tell Bing (and the other IndexNow search engines,
// which share submissions) which pages are new or changed. ChatGPT search and Microsoft Copilot use Bing's index.
//
// Netlify runs a function named "deploy-succeeded" automatically when a deploy finishes.
// It reads the live sitemap, compares each page's last-changed date with what it sent last time
// (Netlify Blobs store "indexnow"), and submits only the differences. The first run sends everything.
//
// It does nothing until the site is live on www.huerkamphomegroup.com (preview and netlify.app deploys are
// skipped, because IndexNow only accepts pages on the host that serves the key file).
// Turn it off without a code change: set INDEXNOW=off in Netlify's environment variables.
// The key below is public by design; the same value is served at /<key>.txt.

import { getStore } from '@netlify/blobs';

const KEY = '56ee55cf631cd22cfd6bfd56e35556fa';
const HOST = 'www.huerkamphomegroup.com';
const ORIGIN = `https://${HOST}`;
const env = (k) => (globalThis.Netlify?.env?.get(k) ?? process.env[k] ?? '').trim();

const text = async (url) => {
  const r = await fetch(url, { headers: { 'cache-control': 'no-cache' } });
  if (!r.ok) throw new Error(`${url} → ${r.status}`);
  return r.text();
};

// Every <url> in every sitemap file: { loc: lastmod }.
async function readSitemap() {
  const index = await text(`${ORIGIN}/sitemap-index.xml`);
  const files = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const pages = {};
  for (const f of files) {
    const xml = await text(f);
    for (const m of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
      const loc = m[1].match(/<loc>([^<]+)<\/loc>/)?.[1];
      if (loc?.startsWith(ORIGIN)) pages[loc] = m[1].match(/<lastmod>([^<]+)<\/lastmod>/)?.[1] ?? '';
    }
  }
  return pages;
}

export default async (req) => {
  if (env('INDEXNOW').toLowerCase() === 'off') return new Response('IndexNow off');

  let payload = {};
  try { payload = (await req.json())?.payload ?? {}; } catch { /* no body */ }
  if (payload.context && payload.context !== 'production') return new Response('skipped: not production');

  // The live domain serves the key file only once it points at this Netlify site; until launch
  // www.huerkamphomegroup.com is still Squarespace, so this check also means "wait for launch".
  const served = await fetch(`${ORIGIN}/${KEY}.txt`, { headers: { 'cache-control': 'no-cache' } })
    .then((r) => (r.ok ? r.text() : '')).catch(() => '');
  if (served.trim() !== KEY) {
    console.log(`IndexNow skipped: ${HOST} is not serving this site yet`);
    return new Response('skipped: not live');
  }

  const pages = await readSitemap();
  const store = getStore('indexnow');
  const sent = (await store.get('sent', { type: 'json' })) ?? {};
  const changed = Object.keys(pages).filter((u) => sent[u] !== pages[u]);
  if (!changed.length) {
    console.log('IndexNow: nothing changed');
    return new Response('nothing changed');
  }

  // IndexNow accepts up to 10,000 addresses per request.
  let ok = 0;
  for (let i = 0; i < changed.length; i += 10000) {
    const urlList = changed.slice(i, i + 10000);
    const r = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `${ORIGIN}/${KEY}.txt`, urlList }),
    });
    console.log(`IndexNow: sent ${urlList.length} addresses → ${r.status}`);
    if (r.status === 200 || r.status === 202) {
      ok += urlList.length;
      for (const u of urlList) sent[u] = pages[u];
    }
  }
  // Forget pages that left the sitemap, so they're resent if they come back.
  for (const u of Object.keys(sent)) if (!(u in pages)) delete sent[u];
  await store.setJSON('sent', sent);
  return new Response(`IndexNow: ${ok} of ${changed.length} submitted`);
};
