// Rebuilds the site 4 times a day, at 6 AM, 11 AM, 4 PM and 9 PM Central, so the listings stay current. The longest gap
// (overnight) is 9 hours, inside NorthstarMLS Rule 12.2(f) (refresh at least every 12 hours). It was hourly (15 a day)
// until Nov 9, 2026, when the Netlify account ran past its plan's monthly usage and Netlify paused the site: every
// rebuild is a production deploy, which counts against the plan.
// Netlify runs schedules in UTC, so this runs at the top of every hour and checks the Minneapolis clock itself;
// that keeps 8 AM-10 PM right through daylight saving time changes.
// Does nothing until both are set in Netlify:
//   MLS_PUBLIC = yes (or preview)  - the listing pages are switched on
//   BUILD_HOOK_URL                  - Site configuration > Build & deploy > Build hooks > Add build hook
// Netlify runs scheduled functions only on the published deploy.
import { agentId } from './alerts.mjs';

const env = (k) => (globalThis.Netlify?.env?.get(k) ?? process.env[k] ?? '').trim();

export const HOURS = [6, 11, 16, 21]; // Central time

/** The hour (0-23) in Minneapolis right now. */
export const centralHour = (now = new Date()) =>
  Number(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', hour: 'numeric', hourCycle: 'h23' }).format(now));

export default async (_req, _ctx, now = new Date(), checkAgent = agentId) => {
  // Also each hour: keep the Repliers agent record's phone current (alerts.mjs syncAgentPhone). Never blocks the rebuild.
  const key = env('REPLIERS_API_KEY');
  if (key) await checkAgent(key, fetch).catch((err) => console.error('agent phone check', err?.message));
  const hour = centralHour(now);
  if (!HOURS.includes(hour)) return new Response('skipped: rebuilds run at 6 AM, 11 AM, 4 PM and 9 PM Central');
  const mode = env('MLS_PUBLIC').toLowerCase();
  const hook = env('BUILD_HOOK_URL');
  if (!['yes', 'preview'].includes(mode) || !/^https:\/\/api\.netlify\.com\/build_hooks\//.test(hook)) {
    console.log('rebuild skipped: MLS_PUBLIC or BUILD_HOOK_URL not set');
    return new Response('skipped');
  }
  const r = await fetch(`${hook}?trigger_title=${encodeURIComponent('MLS listings refresh (6 AM, 11 AM, 4 PM, 9 PM)')}`, { method: 'POST' });
  console.log(`rebuild requested: ${r.status}`);
  return new Response(`requested ${r.status}`);
};

export const config = { schedule: '0 * * * *' };
