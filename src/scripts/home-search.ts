// Runtime for /home-search: reads the filters from the address, asks /api/search, draws the cards, the page buttons
// and (when "Map" is on) the map. The map library loads only when the map is first opened.
type Card = { slug: string; street: string; city: string; zip: string; price: number; beds: number | null; baths: number | null;
  sqft: number | null; type: string; newConstruction: 0 | 1; lakefront: 0 | 1; lotAcres: number | null; brokerage: string; photo: string | null };
type Answer = { ok: boolean; error?: string; total: number; page: number; pages: number; results: Card[]; pins: [number, number, number, string][] };

const KEYS = ['place', 'min', 'max', 'beds', 'baths', 'type', 'lakefront', 'new', 'acres', 'team', 'sort', 'bbox', 'page'];
const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const money = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;
const short = (n: number) => (n >= 1e6 ? `$${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, '')}M` : `$${Math.round(n / 1000)}K`);

export function initSearch(root: HTMLElement) {
  const form = document.querySelector<HTMLFormElement>('form[data-search]')!;
  const list = root.querySelector<HTMLUListElement>('[data-results]')!;
  const countEl = root.querySelector<HTMLElement>('[data-count]')!;
  const emptyEl = root.querySelector<HTMLElement>('[data-empty]')!;
  const errorEl = root.querySelector<HTMLElement>('[data-error]')!;
  const prev = root.querySelector<HTMLButtonElement>('[data-prev]')!;
  const next = root.querySelector<HTMLButtonElement>('[data-next]')!;
  const pageInfo = root.querySelector<HTMLElement>('[data-pageinfo]')!;
  const pagesNav = root.querySelector<HTMLElement>('[data-pages]')!;
  const main = root.querySelector<HTMLElement>('.hs-main')!;
  const mapBox = root.querySelector<HTMLElement>('[data-mapbox]')!;
  const areaBtn = root.querySelector<HTMLButtonElement>('[data-area]')!;
  const clearBtn = root.querySelector<HTMLButtonElement>('[data-clear-area]')!;
  const types: Record<string, string> = JSON.parse(root.dataset.types ?? '{}');
  const names: Record<string, string> = JSON.parse(root.dataset.names ?? '{}');
  const saved = document.querySelector<HTMLInputElement>('[data-saved-search]');
  const summaryEl = document.querySelector<HTMLElement>('[data-alert-summary]');
  let last: Answer | null = null;
  let map: any = null;
  let mapApi: typeof import('./search-map') | null = null;

  // ---- filters <-> address ----
  const params = () => {
    const p = new URLSearchParams();
    const fd = new FormData(form);
    for (const k of KEYS) { const v = String(fd.get(k) ?? '').trim(); if (v && !(k === 'sort' && v === 'new') && !(k === 'page' && v === '1')) p.set(k, v); }
    return p;
  };
  const fill = (p: URLSearchParams) => {
    for (const k of KEYS) {
      const el = form.elements.namedItem(k) as HTMLInputElement | HTMLSelectElement | null;
      if (!el) continue;
      const v = p.get(k) ?? (k === 'sort' ? 'new' : '');
      if (el instanceof HTMLInputElement && el.type === 'checkbox') el.checked = /^(1|true|yes|on)$/i.test(v);
      else if (el instanceof HTMLSelectElement) {
        // A place from a link that isn't in the list (a ZIP code, or several places): add it so it shows.
        if (v && ![...el.options].some((o) => o.value === v)) el.add(new Option(v.split(',').map(label).join(', '), v), 1);
        el.value = v;
      } else el.value = v;
    }
  };
  const label = (v: string) => names[v] ?? (v.startsWith('zip:') ? `ZIP ${v.slice(4)}` : v.replace(/^(hood|lake):.*\//, '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()));
  const describe = (p: URLSearchParams) => {
    const bits = [p.get('place') ? p.get('place')!.split(',').map(label).join(', ') : 'All communities'];
    if (p.get('min') || p.get('max')) bits.push(`${p.get('min') ? short(+p.get('min')!) : 'any'} to ${p.get('max') ? short(+p.get('max')!) : 'any'}`);
    if (p.get('beds')) bits.push(`${p.get('beds')}+ beds`);
    if (p.get('baths')) bits.push(`${p.get('baths')}+ baths`);
    if (p.get('type')) bits.push(p.get('type')!.split(',').map((t) => types[t] ?? t).join(', '));
    if (p.get('lakefront')) bits.push('lakefront');
    if (p.get('new')) bits.push('new construction');
    if (p.get('acres')) bits.push('1+ acre');
    if (p.get('team')) bits.push('our team’s listings');
    if (p.get('bbox')) bits.push('in the map area');
    return bits.join(' · ');
  };

  // ---- drawing ----
  const card = (l: Card) => {
    const specs = [l.beds && `${l.beds} bd`, l.baths && `${l.baths} ba`, l.sqft && `${l.sqft.toLocaleString('en-US')} sq ft`, l.type === 'land' && l.lotAcres && `${l.lotAcres} acres`].filter(Boolean).join(' · ');
    const flag = l.newConstruction ? 'New construction' : l.lakefront ? 'Lakefront' : '';
    const img = l.photo ? `<img src="${esc(l.photo)}?class=small" alt="${esc(`${l.street}, ${l.city}`)}" width="400" height="267" loading="lazy" decoding="async" />` : '<span class="lcard__nophoto">Photo coming soon</span>';
    return `<li class="lcard"><a href="/homes/${esc(l.slug)}"><span class="lcard__photo">${img}${flag ? `<span class="lcard__flag">${flag}</span>` : ''}</span>`
      + `<strong class="lcard__price">${money(l.price)}</strong>${specs ? `<span class="lcard__specs">${esc(specs)}</span>` : ''}`
      + `<span class="lcard__addr">${esc(l.street)}, ${esc(l.city)}, MN ${esc(l.zip)}</span><span class="lcard__type">${esc(types[l.type] ?? 'home')}</span>`
      + `<span class="lcard__broker">Listing courtesy of ${esc(l.brokerage || 'the listing brokerage')}</span></a></li>`;
  };
  const draw = (a: Answer) => {
    last = a;
    list.innerHTML = a.results.map(card).join('');
    countEl.textContent = `${a.total.toLocaleString('en-US')} ${a.total === 1 ? 'home' : 'homes'} for sale`;
    emptyEl.hidden = a.total > 0;
    errorEl.hidden = true;
    pagesNav.hidden = a.pages <= 1;
    pageInfo.textContent = `Page ${a.page} of ${a.pages}`;
    prev.disabled = a.page <= 1;
    next.disabled = a.page >= a.pages;
    if (map && mapApi) mapApi.setPins(map, a.pins, !params().get('bbox'));
  };

  // ---- asking the server ----
  let seq = 0;
  const run = async (push = true) => {
    const p = params();
    const qs = p.toString();
    if (push) history.replaceState(null, '', `${location.pathname}${qs ? `?${qs}` : ''}${location.hash}`);
    const keep = new URLSearchParams(p); keep.delete('page');
    if (saved) saved.value = `${location.origin}${location.pathname}${keep.size ? `?${keep}` : ''}`;
    if (summaryEl) summaryEl.textContent = `Your search: ${describe(p)}`;
    clearBtn.hidden = !p.get('bbox');
    const mine = ++seq;
    list.classList.add('is-loading');
    try {
      const r = await fetch(`/api/search?${qs}`);
      const a = (await r.json()) as Answer;
      if (mine !== seq) return;
      if (!a.ok) throw new Error(a.error);
      draw(a);
    } catch {
      if (mine !== seq) return;
      errorEl.hidden = false; emptyEl.hidden = true; pagesNav.hidden = true; list.innerHTML = '';
    } finally {
      if (mine === seq) list.classList.remove('is-loading');
    }
  };
  const setPage = (n: number) => { (form.elements.namedItem('page') as HTMLInputElement).value = n > 1 ? String(n) : ''; };

  form.addEventListener('change', () => { setPage(1); run(); });
  form.addEventListener('submit', (e) => { e.preventDefault(); setPage(1); run(); });
  prev.addEventListener('click', () => { setPage((last?.page ?? 1) - 1); run(); root.scrollIntoView({ behavior: 'smooth' }); });
  next.addEventListener('click', () => { setPage((last?.page ?? 1) + 1); run(); root.scrollIntoView({ behavior: 'smooth' }); });

  // ---- map ----
  const views = root.querySelectorAll<HTMLButtonElement>('[data-view]');
  const showMap = async (on: boolean) => {
    views.forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.view === 'map') === on)));
    main.classList.toggle('is-map', on);
    mapBox.hidden = !on;
    const u = new URL(location.href);
    if (on) u.searchParams.set('view', 'map'); else u.searchParams.delete('view');
    history.replaceState(null, '', u);
    if (!on) { areaBtn.hidden = true; return; }
    if (!map) {
      mapApi = await import('./search-map');
      map = await mapApi.createMap(root.querySelector<HTMLElement>('[data-map]')!, root.dataset.mapStyle!, () => { areaBtn.hidden = false; });
      if (last) mapApi.setPins(map, last.pins, !params().get('bbox'));
      else await run(false);
    } else map.resize();
  };
  views.forEach((b) => b.addEventListener('click', () => showMap(b.dataset.view === 'map')));
  areaBtn.addEventListener('click', () => {
    if (!map || !mapApi) return;
    (form.elements.namedItem('bbox') as HTMLInputElement).value = mapApi.boxOf(map);
    areaBtn.hidden = true; setPage(1); run();
  });
  clearBtn.addEventListener('click', () => { (form.elements.namedItem('bbox') as HTMLInputElement).value = ''; setPage(1); run(); });

  // ---- start: the first page of newest homes is already in the HTML; ask the server only if the address has filters ----
  const start = new URLSearchParams(location.search);
  fill(start);
  const filtered = KEYS.some((k) => start.get(k));
  if (filtered) run(false);
  else {
    if (saved) saved.value = `${location.origin}${location.pathname}`;
    fetch('/api/search').then((r) => r.json()).then((a: Answer) => { if (a.ok && seq === 0) draw(a); }).catch(() => {});
  }
  if (start.get('view') === 'map') showMap(true);
}
