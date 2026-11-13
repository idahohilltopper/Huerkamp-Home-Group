// /feeds/team-listings.json: the team's own listings with their open house sign-in pages, and the agents who can host
// (name and website page slug), and the printable flyers. Read by Lead Tracker's Jlopo tab (Open house sign-in,
// Flyers) to make each agent's links. Public facts only (the same as the listing pages); kept out of Google by public/_headers.
import { openHouseListings } from '../../data/team-listings';
import { AGENTS } from '../../lib/lead.mjs';
import { communities } from '../../data/areas';
import { REGION, hasMarket } from '../../data/market';

export async function GET() {
  const homes = (await openHouseListings()).map((l) => ({
    mls: l.mls, street: l.street, city: l.city, zip: l.zip, price: l.price,
    photo: l.photos[0] ? `${l.photos[0]}?class=small` : null,
    page: `https://www.huerkamphomes.com/homes/${l.slug}`,
    signIn: `https://www.huerkamphomes.com/open-house/${l.mls}`,
    flyer: `https://www.huerkamphomes.com/flyers/listing/${l.mls}`,
  }));
  // Printable market updates (/flyers/market/<slug>): the whole region first, then every city with sales.
  const markets = [{ slug: REGION, name: 'Twin Cities region' }, ...communities.filter((c) => hasMarket(c.slug)).map((c) => ({ slug: c.slug, name: c.name }))]
    .map((m) => ({ ...m, flyer: `https://www.huerkamphomes.com/flyers/market/${m.slug}` }));
  const agents = Object.entries(AGENTS as Record<string, { name: string; fubName: string }>)
    .map(([slug, a]) => ({ slug, name: a.name, fubName: a.fubName }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return new Response(JSON.stringify({ at: new Date().toISOString(), homes, agents, markets }, null, 1), { headers: { 'content-type': 'application/json; charset=utf-8' } });
}
