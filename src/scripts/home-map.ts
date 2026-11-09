// The small map on a listing page: the home's pin on a street map, loaded only when it scrolls near the screen.
import * as maplibregl from 'maplibre-gl';
import mapCssUrl from 'maplibre-gl/dist/maplibre-gl.css?url';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
maplibregl.setWorkerUrl(workerUrl);

export async function initHomeMap(el: HTMLElement) {
  await new Promise((resolve) => {
    const link = Object.assign(document.createElement('link'), { rel: 'stylesheet', href: mapCssUrl });
    link.onload = link.onerror = resolve;
    document.head.append(link);
  });
  const at: [number, number] = [Number(el.dataset.lng), Number(el.dataset.lat)];
  const map = new maplibregl.Map({ container: el, style: el.dataset.style!, center: at, zoom: 14, cooperativeGestures: true, attributionControl: { compact: true } });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
  const pin = document.createElement('div');
  pin.className = 'home-pin';
  pin.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="#fff" d="M12 4 3 11h2.5v8h5v-5h3v5h5v-8H21z"/></svg>';
  new maplibregl.Marker({ element: pin, anchor: 'bottom' }).setLngLat(at).addTo(map);
  el.dataset.ready = '1';
}
