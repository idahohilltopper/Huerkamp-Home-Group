// /homes/photos/<MLS #>.json: the first 12 photos of a home for sale, for the photo arrows on the search map's card
// (src/scripts/map-card.ts). Static files written by the build, so the map never calls a server function for them.
import type { APIRoute } from 'astro';
import { listingsData } from '../../../data/listings';

export async function getStaticPaths() {
  const data = await listingsData;
  if (data.mode === 'off') return [];
  return data.listings.filter((l) => l.photos.length > 1).map((l) => ({ params: { mls: l.mls }, props: { photos: l.photos.slice(0, 12) } }));
}

export const GET: APIRoute = ({ props }) => new Response(JSON.stringify(props.photos), { headers: { 'content-type': 'application/json' } });
