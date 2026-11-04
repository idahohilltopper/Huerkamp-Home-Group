// Outlines of every community and Minneapolis/Saint Paul neighborhood, keyed by the home search's place codes
// ("burnsville", "hood:minneapolis/uptown"). The search map draws the chosen place's outline, as the portals do.
// Loaded only when someone searches a place (src/scripts/home-search.ts).
import { readFileSync } from 'node:fs';

const read = (f: string) => JSON.parse(readFileSync(`src/data/geo/${f}`, 'utf8')).features as { geometry: unknown; properties: { slug: string } }[];

export function GET() {
  const features = [
    ...read('communities.geojson').map((f) => ({ type: 'Feature', geometry: f.geometry, properties: { key: f.properties.slug } })),
    ...read('neighborhoods.geojson').map((f) => ({ type: 'Feature', geometry: f.geometry, properties: { key: `hood:${f.properties.slug}` } })),
  ];
  return new Response(JSON.stringify({ type: 'FeatureCollection', features }), { headers: { 'content-type': 'application/json' } });
}
