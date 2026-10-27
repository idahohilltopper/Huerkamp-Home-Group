// Commute pages: "Living in Lakeville and commuting to downtown Minneapolis".
//   /commute                         the destinations
//   /commute/<destination>           every community by drive time, with home prices
//   /commute/<destination>/<city>    one community: the drive, how it ranks, and shorter drives at a similar price
// Drive times are light-traffic estimates from each city's Census center point (OSRM on OpenStreetMap data,
// src/data/community-details.json); prices are the Minneapolis Area REALTORS® 12-month medians.
import details from './community-details.json';
import { communities, milesBetween, type Community } from './areas';
import { marketFor } from './market';

export interface Dest { key: string; slug: string; name: string; short: string; center: number[] }
export const DESTS: Dest[] = [
  { key: 'downtownMinneapolis', slug: 'downtown-minneapolis', name: 'Downtown Minneapolis', short: 'downtown Minneapolis', center: [-93.2718, 44.9765] },
  { key: 'downtownSaintPaul', slug: 'downtown-saint-paul', name: 'Downtown Saint Paul', short: 'downtown Saint Paul', center: [-93.0998, 44.9445] },
  { key: 'mspAirport', slug: 'msp-airport', name: 'MSP Airport', short: 'MSP Airport', center: [-93.2052, 44.882] },
  { key: 'universityOfMinnesota', slug: 'university-of-minnesota', name: 'University of Minnesota', short: 'the University of Minnesota', center: [-93.2354, 44.9764] },
];
/** Shown as a fact on each page but without pages of its own. */
export const EXTRA = [{ key: 'mallOfAmerica', name: 'Mall of America' }];
/** Search engines see a commute page only within this drive; beyond it few people commute daily. */
export const INDEX_MINUTES = 50;
export const MIN_SALES = 30;

const D = (details as any).communities as Record<string, any>;
export const minutes = (c: Community, key: string): number | null => D[c.slug]?.driveMinutes?.[key] ?? null;
export const placed = communities.filter((c) => D[c.slug]?.driveMinutes);
export const median = (c: Community) => marketFor(c.slug)?.medianPrice?.r12[1] ?? null;
export const sales = (c: Community) => marketFor(c.slug)?.closedSales?.r12[1] ?? 0;
export const dom = (c: Community) => marketFor(c.slug)?.daysOnMarket?.r12[1] ?? null;
export const meanCommute = (c: Community): number | null => D[c.slug]?.acs?.meanCommuteMinutes ?? null;
export const miles = (c: Community, d: Dest) => milesBetween(c.center, d.center);

export const commuteHref = (d: Dest, c?: Community) => `/commute/${d.slug}${c ? `/${c.slug}` : ''}`;
/** Every community with a drive time to d, shortest first. */
export const byDrive = (d: Dest) => placed.filter((c) => minutes(c, d.key) != null).sort((a, b) => minutes(a, d.key)! - minutes(b, d.key)! || a.name.localeCompare(b.name));
export const BANDS: [number, number, string][] = [[0, 14, 'Under 15 minutes'], [15, 24, '15 to 24 minutes'], [25, 34, '25 to 34 minutes'], [35, 44, '35 to 44 minutes'], [45, 59, '45 to 59 minutes'], [60, 999, 'An hour or more']];
