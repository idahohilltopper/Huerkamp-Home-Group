// /feeds/team-listings.json: the team's own listings with their open house sign-in pages, and the agents who can host
// (name and website page slug). Read by Lead Tracker's Jlopo tab (Open house sign-in) to make each agent's tablet link
// and QR code. Public facts only (the same as the listing pages); kept out of Google by public/_headers.
import { openHouseListings } from '../../data/team-listings';
import { AGENTS } from '../../lib/lead.mjs';

export async function GET() {
  const homes = (await openHouseListings()).map((l) => ({
    mls: l.mls, street: l.street, city: l.city, zip: l.zip, price: l.price,
    photo: l.photos[0] ? `${l.photos[0]}?class=small` : null,
    page: `https://www.huerkamphomes.com/homes/${l.slug}`,
    signIn: `https://www.huerkamphomes.com/open-house/${l.mls}`,
  }));
  const agents = Object.entries(AGENTS as Record<string, { name: string; fubName: string }>)
    .map(([slug, a]) => ({ slug, name: a.name, fubName: a.fubName }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return new Response(JSON.stringify({ at: new Date().toISOString(), homes, agents }, null, 1), { headers: { 'content-type': 'application/json; charset=utf-8' } });
}
