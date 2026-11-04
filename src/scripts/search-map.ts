// The /home-search map (MapLibre). One marker per home (up to 500, NorthstarMLS Rule 11.8): red dots when zoomed
// out, red price tags ("$425K") when zoomed in, as on the big portals. Clicking one shows the price and a link to the
// home's page; pointing at a card in the list lights up its marker.
import * as maplibregl from 'maplibre-gl';
import type { Pin } from './home-search';
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

export async function createMap(el: HTMLElement, style: string, brThumb: string, onMoved: () => void) {
  await css();
  const map = new maplibregl.Map({ container: el, style, bounds: TWIN_CITIES, fitBoundsOptions: { padding: 30 }, cooperativeGestures: true, attributionControl: { compact: true } });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
  await new Promise((ok) => map.on('load', ok));
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
  map.addLayer({ id: 'homes-hot', type: 'circle', source: 'homes', filter: ['==', ['get', 'slug'], ''], paint: {
    'circle-radius': 11, 'circle-color': '#151213', 'circle-stroke-color': '#fff', 'circle-stroke-width': 2.5 } });
  // Pointing at a dot shows its price in a small red tag, as the portals do (zoomed in, the tags are always shown).
  const hoverTag = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 10, className: 'hs-hover' });
  map.on('mousemove', 'homes', (e: any) => {
    const f = e.features?.[0];
    if (!f) return;
    hoverTag.setLngLat(f.geometry.coordinates).setText(f.properties.label).addTo(map);
  });
  map.on('mouseleave', 'homes', () => hoverTag.remove());
  map.on('click', () => hoverTag.remove());
  for (const layer of ['homes', 'homes-tags']) {
    map.on('mouseenter', layer, () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', layer, () => { map.getCanvas().style.cursor = ''; });
    map.on('click', layer, (e: any) => {
      const f = e.features?.[0];
      if (!f) return;
      const p = f.properties;
      // NorthstarMLS Rule 12.3(f): like a listing card, the pop-up shows the photo, price, address and listing
      // brokerage, with the Broker Reciprocity thumbnail logo on other brokerages' listings.
      const a = document.createElement(p.sold ? 'div' : 'a');
      a.className = 'hs-pop-card';
      if (!p.sold) (a as HTMLAnchorElement).href = `/homes/${encodeURIComponent(p.slug)}`;
      const ph = document.createElement('span');
      ph.className = 'hs-pop-card__photo';
      if (p.photo) {
        const img = Object.assign(document.createElement('img'), { src: `${p.photo}?class=small`, alt: p.addr, width: 240, height: 160, decoding: 'async' });
        img.onerror = () => { ph.textContent = 'Photo coming soon'; };
        ph.append(img);
      } else ph.textContent = 'Photo coming soon';
      const price = document.createElement('strong');
      price.textContent = p.price > 1 ? `$${Number(p.price).toLocaleString('en-US')}` : 'Auction';
      const addr = document.createElement('span');
      addr.textContent = p.addr;
      const when = document.createElement('span');
      if (p.sold) when.textContent = `Sold ${new Date(`${p.sold}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      const by = document.createElement('small');
      if (!p.own && brThumb) by.append(Object.assign(document.createElement('img'), { src: brThumb, alt: 'Broker Reciprocity listing', height: 14 }));
      by.append(`Listing courtesy of ${p.brokerage || 'the listing brokerage'}`);
      a.append(ph, price, ...(p.sold ? [when] : []), addr, by);
      new maplibregl.Popup({ offset: 12, closeButton: false, maxWidth: '260px', className: 'hs-popup' }).setLngLat(f.geometry.coordinates).setDOMContent(a).addTo(map);
    });
  }
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

/** The visible map area as "west,south,east,north". */
export const boxOf = (map: any) => { const b = map.getBounds(); return [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()].map((n: number) => n.toFixed(4)).join(','); };
