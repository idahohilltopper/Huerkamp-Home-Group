// The /home-search map (MapLibre), loaded only when someone opens the map. One dot per home (up to 2,000);
// clicking a dot shows the price and a link to the home's page.
import * as maplibregl from 'maplibre-gl';
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

export async function createMap(el: HTMLElement, style: string, onMoved: () => void) {
  await css();
  const map = new maplibregl.Map({ container: el, style, bounds: TWIN_CITIES, fitBoundsOptions: { padding: 30 }, cooperativeGestures: true, attributionControl: { compact: true } });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
  await new Promise((ok) => map.on('load', ok));
  map.addSource('homes', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
  map.addLayer({ id: 'homes', type: 'circle', source: 'homes', paint: {
    'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, 3.5, 13, 7], 'circle-color': RED,
    'circle-stroke-color': '#fff', 'circle-stroke-width': 1.5 } });
  map.on('mouseenter', 'homes', () => { map.getCanvas().style.cursor = 'pointer'; });
  map.on('mouseleave', 'homes', () => { map.getCanvas().style.cursor = ''; });
  map.on('click', 'homes', (e: any) => {
    const f = e.features?.[0];
    if (!f) return;
    const p = f.properties;
    const a = document.createElement('a');
    a.href = `/homes/${encodeURIComponent(p.slug)}`;
    a.textContent = `$${Number(p.price).toLocaleString('en-US')} · see this home`;
    const box = document.createElement('div'); box.className = 'hs-pop'; box.append(a);
    new maplibregl.Popup({ offset: 8 }).setLngLat(f.geometry.coordinates).setDOMContent(box).addTo(map);
  });
  // "Search this map area" appears after the person moves the map (not after the map moves itself).
  map.on('moveend', (e: any) => { if (e.originalEvent) onMoved(); });
  return map;
}

/** Show these homes; zoom to them unless the search is already limited to the map area. */
export function setPins(map: any, pins: [number, number, number, string][], fit = true) {
  const features = pins.map(([lat, lng, price, slug]) => ({ type: 'Feature', geometry: { type: 'Point', coordinates: [lng, lat] }, properties: { price, slug } }));
  (map.getSource('homes') as any)?.setData({ type: 'FeatureCollection', features });
  if (fit && features.length) {
    const b = new maplibregl.LngLatBounds();
    features.forEach((f) => b.extend(f.geometry.coordinates as [number, number]));
    map.fitBounds(b, { padding: 40, maxZoom: 14, duration: 0 });
  }
}

/** The visible map area as "west,south,east,north". */
export const boxOf = (map: any) => { const b = map.getBounds(); return [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()].map((n: number) => n.toFixed(4)).join(','); };
