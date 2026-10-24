// MapLibre map runtime for AreaMap.astro. Loaded only when a map scrolls near the screen,
// so pages don't download the ~1 MB map library up front.
import * as maplibregl from 'maplibre-gl';
// The map's stylesheet is added only when a map loads, so it never slows down the first paint.
import mapCssUrl from 'maplibre-gl/dist/maplibre-gl.css?url';
// MapLibre 6 runs its tile processing in a separate worker file; bundle it and point MapLibre at it.
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
maplibregl.setWorkerUrl(workerUrl);

const GOLD = '#d40000'; // Ferrari red
const INK = '#1b1819';

function bounds(features: any[]) {
  const b = new maplibregl.LngLatBounds();
  const walk = (c: any) => (typeof c[0] === 'number' ? b.extend(c as [number, number]) : c.forEach(walk));
  features.forEach((f) => walk(f.geometry.coordinates));
  return b;
}

let cssReady: Promise<unknown> | undefined;
function loadCss() {
  cssReady ??= new Promise((resolve) => {
    const link = Object.assign(document.createElement('link'), { rel: 'stylesheet', href: mapCssUrl });
    link.onload = link.onerror = resolve;
    document.head.append(link);
  });
  return cssReady;
}

export async function initMap(el: HTMLElement) {
  await loadCss();
  const data = el.dataset.geojson ? JSON.parse(el.dataset.geojson) : await (await fetch(el.dataset.src!)).json();
  const info = JSON.parse(el.dataset.info!);
  const mode = el.dataset.mode;
  const focus = el.dataset.focus;
  const root = el.parentElement!;
  const nameEl = root.querySelector<HTMLElement>('[data-name]')!;
  const detailEl = root.querySelector<HTMLElement>('[data-detail]')!;
  const hintEl = root.querySelector<HTMLElement>('[data-hint]')!;
  // Attach display info to each outline so the map can show it on hover.
  data.features.forEach((f: any, i: number) => {
    f.id = i;
    Object.assign(f.properties, info[f.properties.slug], { isFocus: f.properties.slug === focus });
  });

  const focusFeatures = data.features.filter((f: any) => f.properties.isFocus);
  const map = new maplibregl.Map({
    container: el,
    style: el.dataset.style!,
    bounds: bounds(focusFeatures.length ? focusFeatures : data.features),
    fitBoundsOptions: { padding: 40 },
    cooperativeGestures: true,
    attributionControl: { compact: true },
  });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

  const show = (p: any) => {
    hintEl.hidden = !!p;
    nameEl.textContent = p ? p.name : '';
    detailEl.textContent = p ? p.detail : '';
  };
  if (focusFeatures.length) show(focusFeatures[0].properties);

  map.on('load', () => {
    map.addSource('areas', { type: 'geojson', data });
    map.addLayer({
      id: 'areas-fill', type: 'fill', source: 'areas',
      paint: {
        'fill-color': GOLD,
        'fill-opacity': ['case',
          ['boolean', ['feature-state', 'hover'], false], 0.5,
          ['get', 'isFocus'], 0.4,
          mode === 'focus' ? 0.08 : 0.22],
      },
    });
    map.addLayer({
      id: 'areas-line', type: 'line', source: 'areas',
      paint: {
        'line-color': ['case', ['get', 'isFocus'], INK, GOLD],
        'line-width': ['case', ['get', 'isFocus'], 2.5, ['boolean', ['feature-state', 'hover'], false], 2, 1],
      },
    });

    let hovered: number | null = null;
    map.on('mousemove', 'areas-fill', (e) => {
      const f = e.features?.[0];
      if (!f) return;
      if (hovered !== null) map.setFeatureState({ source: 'areas', id: hovered }, { hover: false });
      hovered = f.id as number;
      map.setFeatureState({ source: 'areas', id: hovered }, { hover: true });
      map.getCanvas().style.cursor = 'pointer';
      show(f.properties);
    });
    map.on('mouseleave', 'areas-fill', () => {
      if (hovered !== null) map.setFeatureState({ source: 'areas', id: hovered }, { hover: false });
      hovered = null;
      map.getCanvas().style.cursor = '';
      show(focusFeatures[0]?.properties ?? null);
    });
    map.on('click', 'areas-fill', (e) => {
      const href = e.features?.[0]?.properties?.href;
      if (href) window.location.href = href;
    });
  });
}
