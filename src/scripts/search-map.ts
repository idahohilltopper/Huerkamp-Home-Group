// The /home-search map (MapLibre). One marker per home (up to 500, NorthstarMLS Rule 11.8): red dots when zoomed
// out, red price tags ("$425K") when zoomed in, as on the big portals. Clicking one shows the price and a link to the
// home's page; pointing at a card in the list lights up its marker.
import * as maplibregl from 'maplibre-gl';
import type { Pin } from './home-search';
import { pinCard, canHover } from './map-card';
import mapCssUrl from 'maplibre-gl/dist/maplibre-gl.css?url';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
maplibregl.setWorkerUrl(workerUrl);

const RED = '#d40000';
const TWIN_CITIES: [[number, number], [number, number]] = [[-93.9, 44.55], [-92.75, 45.3]];

const css = () => new Promise((resolve) => {
  if (document.querySelector('link[data-maplibre]')) return resolve(null);
  const link = Object.assign(document.createElement('link'), { rel: 'stylesheet', href: mapCssUrl });
  link.dataset.maplibre = '';
  link.onload = link.onerror = resolve;
  document.head.append(link);
});

const PLACE_BLUE = '#2f6fd6';

/** `start` (west,south,east,north): open on that area, e.g. the search's map area ("Use my current location"). */
export async function createMap(el: HTMLElement, style: string, brThumb: string, onMoved: () => void, start?: number[] | null) {
  // No WebGL (turned off, or the graphics driver gave up): fail now with a reason, not a blank gray box.
  const probe = document.createElement('canvas');
  if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) throw new Error('map: this browser has WebGL (3D graphics) turned off');
  await css();
  const bounds: [[number, number], [number, number]] = start?.length === 4 && start.every(Number.isFinite) ? [[start[0], start[1]], [start[2], start[3]]] : TWIN_CITIES;
  const map = new maplibregl.Map({ container: el, style, bounds, fitBoundsOptions: { padding: start ? 0 : 30 }, cooperativeGestures: true, attributionControl: { compact: true } });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
  // The base map (style and tiles) must load within 20 seconds; otherwise say so instead of waiting forever.
  await new Promise<void>((ok, fail) => {
    const t = setTimeout(() => fail(new Error('map: the base map did not load within 20 seconds')), 20000);
    map.on('load', () => { clearTimeout(t); ok(); });
    // A style that won't load, or the map's helper file (web worker) missing, e.g. a page from before a deploy.
    map.on('error', (e: any) => { if (!map.loaded() && /style|worker/i.test(String(e?.error?.message ?? ''))) { clearTimeout(t); fail(new Error(`map: ${e.error.message}`)); } });
  });
  // The searched place's outline (a town or neighborhood), under the dots: a light wash and a blue line, like the portals.
  map.addSource('place', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
  map.addLayer({ id: 'place-fill', type: 'fill', source: 'place', paint: { 'fill-color': PLACE_BLUE, 'fill-opacity': 0.06 } });
  map.addLayer({ id: 'place-line', type: 'line', source: 'place', paint: { 'line-color': PLACE_BLUE, 'line-width': ['interpolate', ['linear'], ['zoom'], 8, 1.5, 13, 3], 'line-opacity': 0.9 } });
  map.addSource('homes', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
  // A rounded red tag that stretches to fit the price text.
  const c = Object.assign(document.createElement('canvas'), { width: 40, height: 28 });
  const g = c.getContext('2d')!;
  g.fillStyle = RED; g.strokeStyle = '#fff'; g.lineWidth = 2;
  g.beginPath(); g.roundRect(1, 1, 38, 26, 8); g.fill(); g.stroke();
  map.addImage('tag', { width: 40, height: 28, data: new Uint8Array(g.getImageData(0, 0, 40, 28).data.buffer) },
    { stretchX: [[10, 30]], stretchY: [[10, 18]], content: [7, 4, 33, 24], pixelRatio: 1 } as any);
  map.addLayer({ id: 'homes', type: 'circle', source: 'homes', maxzoom: 12, paint: {
    'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, 4, 12, 6.5], 'circle-color': RED,
    'circle-stroke-color': '#fff', 'circle-stroke-width': 1.5 } });
  map.addLayer({ id: 'homes-tags', type: 'symbol', source: 'homes', minzoom: 12, layout: {
    'text-field': ['get', 'label'], 'text-font': ['Noto Sans Bold'], 'text-size': 12.5, 'icon-image': 'tag', 'icon-text-fit': 'both',
    'icon-allow-overlap': true, 'text-allow-overlap': true, 'symbol-sort-key': ['get', 'price'] },
    paint: { 'text-color': '#fff' } });
  // The home under the mouse, drawn again 50% bigger on top (dot or price tag).
  const none = ['==', ['get', 'slug'], ''];
  map.addLayer({ id: 'homes-hover', type: 'circle', source: 'homes', maxzoom: 12, filter: none, paint: {
    'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, 6, 12, 9.75], 'circle-color': RED,
    'circle-stroke-color': '#fff', 'circle-stroke-width': 2 } });
  map.addLayer({ id: 'homes-tags-hover', type: 'symbol', source: 'homes', minzoom: 12, filter: none, layout: {
    'text-field': ['get', 'label'], 'text-font': ['Noto Sans Bold'], 'text-size': 18.75, 'icon-image': 'tag', 'icon-text-fit': 'both',
    'icon-text-fit-padding': [2, 4, 2, 4], 'icon-allow-overlap': true, 'text-allow-overlap': true },
    paint: { 'text-color': '#fff' } });
  map.addLayer({ id: 'homes-hot', type: 'circle', source: 'homes', filter: ['==', ['get', 'slug'], ''], paint: {
    'circle-radius': 11, 'circle-color': '#151213', 'circle-stroke-color': '#fff', 'circle-stroke-width': 2.5 } });
  // Pointing at a dot or a price tag makes it 50% bigger (no preview: the photo card opens on click; Jason, Nov 9, 2026).
  let hovered = '';
  if (canHover()) for (const layer of ['homes', 'homes-tags']) {
    map.on('mousemove', layer, (e: any) => {
      const f = e.features?.[0];
      if (!f || f.properties.slug === hovered) return;
      hovered = f.properties.slug;
      for (const l of ['homes-hover', 'homes-tags-hover']) map.setFilter(l, ['==', ['get', 'slug'], hovered]);
    });
    map.on('mouseleave', layer, () => { hovered = ''; unhover(); });
  }
  const unhover = () => { for (const l of ['homes-hover', 'homes-tags-hover']) map.setFilter(l, none); };
  for (const layer of ['homes', 'homes-tags']) {
    map.on('mouseenter', layer, () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', layer, () => { map.getCanvas().style.cursor = ''; });
    map.on('click', layer, (e: any) => {
      const f = e.features?.[0];
      if (!f) return;
      const p = f.properties;
      // NorthstarMLS Rule 12.3(f): like a listing card, the pop-up shows the photo, price, address and listing
      // brokerage, with the Broker Reciprocity thumbnail logo on other brokerages' listings.
      const box = pinCard(p, brThumb);
      new maplibregl.Popup({ offset: 12, closeButton: false, maxWidth: '260px', className: 'hs-popup' }).setLngLat(f.geometry.coordinates).setDOMContent(box).addTo(map);
    });
  }
  (window as any).__hsMap = { kind: 'main', map };
  // Only when the person moves the map (not when it moves itself to fit the results).
  map.on('moveend', (e: any) => { if (e.originalEvent) onMoved(); });
  return map;
}

/** Outline the searched place(s); an empty list clears it. */
export function setPlace(map: any, features: unknown[]) {
  (map.getSource('place') as any)?.setData({ type: 'FeatureCollection', features });
}

/** Show these homes; zoom to them unless the search is already limited to the map area. */
export function setPins(map: any, pins: Pin[], fit = true) {
  const features = pins.map(([lat, lng, price, slug, photo, addr, brokerage, own, sold]) => ({ type: 'Feature', geometry: { type: 'Point', coordinates: [lng, lat] },
    properties: { price, slug, label: tag(price), photo: photo ?? '', addr, brokerage, own, sold: sold ?? '' } }));
  (map.getSource('homes') as any)?.setData({ type: 'FeatureCollection', features });
  if (fit && features.length) {
    const b = new maplibregl.LngLatBounds();
    features.forEach((f) => b.extend(f.geometry.coordinates as [number, number]));
    map.fitBounds(b, { padding: 40, maxZoom: 14, duration: 0 });
  }
}

const tag = (n: number) => (n <= 1 ? 'Auction' : n >= 1e6 ? `$${(n / 1e6).toFixed(n >= 1e7 ? 0 : 2).replace(/\.?0+$/, '')}M` : `$${Math.round(n / 1000)}K`);

/** Light up one home's marker (by its page slug), or none. */
export function highlight(map: any, slug: string) {
  if (map.getLayer('homes-hot')) map.setFilter('homes-hot', ['==', ['get', 'slug'], slug]);
}

/** Mark the visitor's own address ("Your home") with a bubble offering its estimate, and move the map around it; null removes it. */
export function showHome(map: any, home: { lat: number; lng: number; street: string } | null, box?: number[], estimateHref?: string) {
  map.__home?.getPopup()?.remove();
  map.__home?.remove();
  map.__home = null;
  if (!home) return;
  const el = document.createElement('div');
  el.className = 'hs-homepin';
  el.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 3 2.5 11h2.8v9h5.2v-5.5h3v5.5h5.2v-9h2.8z" fill="currentColor"/></svg>';
  el.setAttribute('aria-label', `Your home: ${home.street}`);
  const box2 = document.createElement('div');
  box2.className = 'hs-homepop';
  const t = document.createElement('strong');
  t.textContent = home.street;
  box2.append(t);
  if (estimateHref) {
    const a = Object.assign(document.createElement('a'), { href: estimateHref, target: '_top', textContent: 'What’s my home worth? →' });
    box2.append(a);
  }
  const pop = new maplibregl.Popup({ offset: 22, closeButton: true, className: 'hs-popup', maxWidth: '240px' }).setDOMContent(box2);
  map.__home = new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat([home.lng, home.lat]).setPopup(pop).addTo(map);
  if (box?.length === 4) map.fitBounds([[box[0], box[1]], [box[2], box[3]]], { padding: 0, duration: 600 });
  if (estimateHref) map.__home.togglePopup();
}

/** Move the map to an area (west, south, east, north). */
export function fitBox(map: any, b: number[]) { map.fitBounds([[b[0], b[1]], [b[2], b[3]]], { padding: 0, duration: 800 }); }

/** The visible map area as "west,south,east,north". */
/** A point on the map's screen area (pixels from its top left) as [lng, lat]: the "Draw boundary" pencil. */
export const toLngLat = (map: any, x: number, y: number): [number, number] => { const p = map.unproject([x, y]); return [p.lng, p.lat]; };
export const boxOf = (map: any) => { const b = map.getBounds(); return [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()].map((n: number) => n.toFixed(4)).join(','); };
