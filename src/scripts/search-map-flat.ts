// The backup /home-search map for browsers without WebGL (3D graphics turned off, or an old graphics driver), where the
// main MapLibre map (src/scripts/search-map.ts) can't run: Leaflet with OpenStreetMap's standard map images, drawn with
// plain 2D canvas. Same functions and the same home pop-up card (src/scripts/map-card.ts), so home-search.ts can use
// either. Only a few visitors need it, which keeps us inside OpenStreetMap's tile usage policy (with its attribution).
import L from 'leaflet';
import leafletCss from 'leaflet/dist/leaflet.css?url';
import type { Pin } from './home-search';
import { pinCard } from './map-card';

const RED = '#d40000';
const PLACE_BLUE = '#2f6fd6';
const TWIN_CITIES: L.LatLngBoundsExpression = [[44.55, -93.9], [45.3, -92.75]];

const css = () => new Promise((resolve) => {
  if (document.querySelector('link[data-leaflet]')) return resolve(null);
  const link = Object.assign(document.createElement('link'), { rel: 'stylesheet', href: leafletCss });
  link.dataset.leaflet = '';
  link.onload = link.onerror = resolve;
  document.head.append(link);
});

type FlatMap = L.Map & { __pins?: L.LayerGroup; __bySlug?: Map<string, L.CircleMarker>; __place?: L.GeoJSON; __home?: L.Marker | null; __hot?: L.CircleMarker | null; resize?: () => void };

export async function createMap(el: HTMLElement, _style: string, brThumb: string, onMoved: () => void, start?: number[] | null) {
  await css();
  el.innerHTML = '';
  const map = L.map(el, { preferCanvas: true, scrollWheelZoom: false, zoomSnap: 0.5 }) as FlatMap;
  // Scroll-wheel zoom only after a click on the map, so scrolling the page doesn't zoom it (like the main map's gestures).
  map.on('click', () => map.scrollWheelZoom.enable());
  map.on('mouseout', () => map.scrollWheelZoom.disable());
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
  if (start?.length === 4 && start.every(Number.isFinite)) map.fitBounds([[start[1], start[0]], [start[3], start[2]]]);
  else map.fitBounds(TWIN_CITIES, { padding: [30, 30] });
  map.__pins = L.layerGroup().addTo(map);
  map.__bySlug = new Map();
  map.__home = null;
  map.__hot = null;
  map.resize = () => map.invalidateSize();
  (map as any).__brThumb = brThumb;
  // Only when the person moves the map (not when it moves itself to fit the results).
  let moving = false;
  map.on('movestart', () => { moving = !(map as any).__auto; });
  map.on('moveend', () => { if (moving) onMoved(); moving = false; (map as any).__auto = false; });
  return map;
}

/** Outline the searched place(s); an empty list clears it. */
export function setPlace(map: FlatMap, features: unknown[]) {
  map.__place?.remove();
  map.__place = features.length
    ? L.geoJSON({ type: 'FeatureCollection', features } as any, { style: { color: PLACE_BLUE, weight: 2.5, fillColor: PLACE_BLUE, fillOpacity: 0.06 }, interactive: false }).addTo(map)
    : undefined;
}

/** Show these homes; zoom to them unless the search is already limited to the map area. */
export function setPins(map: FlatMap, pins: Pin[], fit = true) {
  map.__pins!.clearLayers();
  map.__bySlug!.clear();
  const brThumb = (map as any).__brThumb as string;
  for (const [lat, lng, price, slug, photo, addr, brokerage, own, sold] of pins) {
    const m = L.circleMarker([lat, lng], { radius: 6, color: '#fff', weight: 1.5, fillColor: RED, fillOpacity: 1 });
    m.bindTooltip(tag(price), { direction: 'top', offset: [0, -6], className: 'hs-flat-tip' });
    m.bindPopup(() => pinCard({ price, slug, photo: photo ?? '', addr, brokerage, own, sold: sold ?? '' }, brThumb), { maxWidth: 260, minWidth: 240, className: 'hs-flat-pop', closeButton: false });
    m.addTo(map.__pins!);
    map.__bySlug!.set(slug, m);
  }
  if (fit && pins.length) {
    (map as any).__auto = true;
    map.fitBounds(L.latLngBounds(pins.map((p) => [p[0], p[1]] as [number, number])), { padding: [40, 40], maxZoom: 14, animate: false });
  }
}

const tag = (n: number) => (n <= 1 ? 'Auction' : n >= 1e6 ? `$${(n / 1e6).toFixed(n >= 1e7 ? 0 : 2).replace(/\.?0+$/, '')}M` : `$${Math.round(n / 1000)}K`);

/** Light up one home's marker (by its page slug), or none. */
export function highlight(map: FlatMap, slug: string) {
  map.__hot?.setStyle({ radius: 6, fillColor: RED, weight: 1.5 } as any);
  map.__hot = slug ? map.__bySlug!.get(slug) ?? null : null;
  map.__hot?.setStyle({ radius: 11, fillColor: '#151213', weight: 2.5 } as any).bringToFront();
}

/** Mark the visitor's own address ("Your home") with a bubble offering its estimate; null removes it. */
export function showHome(map: FlatMap, home: { lat: number; lng: number; street: string } | null, box?: number[], estimateHref?: string) {
  map.__home?.remove();
  map.__home = null;
  if (!home) return;
  const icon = L.divIcon({ className: 'hs-homepin', iconSize: [40, 40],
    html: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 3 2.5 11h2.8v9h5.2v-5.5h3v5.5h5.2v-9h2.8z" fill="currentColor"/></svg>' });
  const pop = document.createElement('div');
  pop.className = 'hs-homepop';
  const t = document.createElement('strong');
  t.textContent = home.street;
  pop.append(t);
  if (estimateHref) pop.append(Object.assign(document.createElement('a'), { href: estimateHref, target: '_top', textContent: 'What’s my home worth? →' }));
  map.__home = L.marker([home.lat, home.lng], { icon, title: `Your home: ${home.street}` }).bindPopup(pop, { className: 'hs-flat-pop' }).addTo(map);
  if (box?.length === 4) { (map as any).__auto = true; map.fitBounds([[box[1], box[0]], [box[3], box[2]]]); }
  if (estimateHref) map.__home.openPopup();
}

/** Move the map to an area (west, south, east, north). */
export function fitBox(map: FlatMap, b: number[]) { (map as any).__auto = true; map.fitBounds([[b[1], b[0]], [b[3], b[2]]]); }

/** The visible map area as "west,south,east,north". */
export const boxOf = (map: FlatMap) => { const b = map.getBounds(); return [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()].map((n) => n.toFixed(4)).join(','); };
