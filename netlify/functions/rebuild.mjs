// Rebuilds the site every 8 hours (about 6 AM, 2 PM and 10 PM Central; the schedule is in UTC) so the listings stay
// current. NorthstarMLS Rule 12.2(f) requires refreshing at least every 12 hours; 8 leaves room for a failed build.
// Does nothing until both are set in Netlify:
//   MLS_PUBLIC = yes (or preview)  - the listing pages are switched on
//   BUILD_HOOK_URL                  - Site configuration > Build & deploy > Build hooks > Add build hook
// Netlify runs scheduled functions only on the published deploy.
const env = (k) => (globalThis.Netlify?.env?.get(k) ?? process.env[k] ?? '').trim();

export default async () => {
  const mode = env('MLS_PUBLIC').toLowerCase();
  const hook = env('BUILD_HOOK_URL');
  if (!['yes', 'preview'].includes(mode) || !/^https:\/\/api\.netlify\.com\/build_hooks\//.test(hook)) {
    console.log('rebuild skipped: MLS_PUBLIC or BUILD_HOOK_URL not set');
    return new Response('skipped');
  }
  const r = await fetch(`${hook}?trigger_title=${encodeURIComponent('MLS listings refresh (every 8 hours)')}`, { method: 'POST' });
  console.log(`rebuild requested: ${r.status}`);
  return new Response(`requested ${r.status}`);
};

export const config = { schedule: '0 3,11,19 * * *' };
