// Walkability by community and Minneapolis/Saint Paul neighborhood (src/data/walkability.json, built by
// scripts/build-walkability.mjs from the same places as the listing pages' "What's nearby"). Places only.
import walk from './walkability.json';

export type Walk = { score: number; label: string; points: number; sqMi: number; walk: { grocery: number; park: number; transit: number }; inside: Record<string, number> };
export const walkData = walk as unknown as { built: string; places: { places: string; transit: string }; communities: Record<string, Walk>; hoods: Record<string, Walk> };

export const walkFor = (kind: 'community' | 'hood', slug: string): Walk | undefined => (kind === 'community' ? walkData.communities : walkData.hoods)[slug];

/** Rank among peers: all communities, or the neighborhoods of the same city. */
export function walkRank(kind: 'community' | 'hood', slug: string) {
  const w = walkFor(kind, slug);
  const peers = kind === 'community' ? Object.values(walkData.communities) : Object.entries(walkData.hoods).filter(([k]) => k.split('/')[0] === slug.split('/')[0]).map(([, v]) => v);
  return w ? { rank: peers.filter((x) => x.score > w.score).length + 1, of: peers.length } : null;
}

export const walkSentence = (name: string, w: Walk, kind: 'community' | 'hood') =>
  `${name} scores ${w.score} out of 100 for everyday walkability (${w.label.toLowerCase()}), averaged every quarter mile across the ${kind === 'community' ? 'city' : 'neighborhood'}: ${w.walk.grocery}% of ${name} is within about a 15-minute walk of a grocery store, ${w.walk.park}% of a park and ${w.walk.transit}% of a bus or train stop.`;
