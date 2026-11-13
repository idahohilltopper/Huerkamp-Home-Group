// The team's OWN listings: Keller Williams Preferred Realty, listed by a team member or under the team's name (the MLS
// files most team listings as "The Huerkamp Home Group"). The same test as the map search's "our team's listings".
// Used where only our own listings may appear: the Meta catalog feed (advertising another brokerage's listing needs
// NorthstarMLS's written OK) and the open house sign-in pages.
import { listingsData, type Listing } from './listings';
import team from './team.json';
import { TEAM_AGENT_NAME } from './own-listings';

const NAMES = new Set([...team.members.map((m) => m.name), TEAM_AGENT_NAME].map((n) => n.toLowerCase().trim()));
export const isTeamListing = (l: { brokerage: string; agent: string }) =>
  /keller williams preferred/i.test(l.brokerage ?? '') && NAMES.has(String(l.agent ?? '').toLowerCase().trim());

/** Team listings with a price, an address and photos (none while the MLS feed is off or in preview). */
export async function teamListings(): Promise<Listing[]> {
  const data = await listingsData;
  if (data.mode === 'off' || data.preview) return [];
  return data.listings.filter((l) => isTeamListing(l) && l.price > 1000 && !l.addressHidden && l.photos.length);
}

/** Team listings that get an open house sign-in page: also while the feed is in preview, and with or without photos. */
export async function openHouseListings(): Promise<Listing[]> {
  const data = await listingsData;
  if (data.mode === 'off') return [];
  return data.listings.filter((l) => isTeamListing(l) && !l.addressHidden);
}
