// /mls-status.json: what the MLS listing download did during the last build (counts, settings seen, errors).
// Never includes the API key. Used to diagnose missing homes-for-sale pages without opening Netlify's logs.
import { loadFeed } from '../lib/mls-feed.mjs';

export async function GET() {
  const feed: any = await loadFeed();
  const body = {
    builtAt: new Date().toISOString(),
    mode: feed.mode,
    listingsAt: feed.at,
    listings: feed.listings.length,
    sample: !!feed.fixture,
    ...(feed.status ?? {}),
  };
  return new Response(JSON.stringify(body, null, 2), { headers: { 'content-type': 'application/json' } });
}
