// Runtime for /home-search (Zillow-style: filter pills on top, map left, list right). Reads the filters from the address,
// asks /api/search, draws the cards, the page buttons and the map. On a computer the map loads at once; on a phone
// only when the Map button is pressed. With "Search as I move the map" on, moving the map searches that area.
type Card = { mls: string; slug: string; street: string; city: string; zip: string; price: number; beds: number | null; baths: number | null;
  sqft: number | null; type: string | null; newConstruction: 0 | 1; lakefront: 0 | 1; lotAcres: number | null; brokerage: string; photo: string | null;
  ownBrokerage: 0 | 1; addressHidden: 0 | 1 };
type Answer = { ok: boolean; error?: string; total: number; page: number; pages: number; results: Card[]; pins: Pin[] };
export type Pin = [number, number, number, string, string | null, string, string, 0 | 1];

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
  const mapBox = root.querySelector<HTMLElement>('[data-mapbox]')!;
  const mapCount = root.querySelector<HTMLElement>('[data-mapcount]')!;
  const follow = root.querySelector<HTMLInputElement>('[data-follow]')!;
  const clearBtn = root.querySelector<HTMLButtonElement>('[data-clear-area]')!;
  const toggle = root.querySelector<HTMLButtonElement>('[data-toggle]')!;
  const where = form.querySelector<HTMLInputElement>('[data-where]')!;
  const sortEl = document.querySelector<HTMLSelectElement>('#hs-sort')!;
  const pills = [...form.querySelectorAll<HTMLDetailsElement>('[data-pill]')];
  const phone = window.matchMedia('(max-width: 900px)');
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
    const place = p.get('place') ?? '';
    where.value = place ? place.split(',').map(label).join(', ') : '';
    pillLabels();
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
  // Same rules as src/components/ListingCard.astro (NorthstarMLS Rule 12.3(d)-(f)): the API already leaves out the
  // details of other brokerages' listings; their cards carry the Broker Reciprocity thumbnail logo.
  const thumb = root.dataset.brThumb;
  const card = (l: Card) => {
    const specs = [l.beds && `${l.beds} bd`, l.baths && `${l.baths} ba`, l.sqft && `${l.sqft.toLocaleString('en-US')} sq ft`, l.type === 'land' && l.lotAcres && `${l.lotAcres} acres`].filter(Boolean).join(' · ');
    const flag = l.newConstruction ? 'New construction' : l.lakefront ? 'Lakefront' : '';
    const addr = l.addressHidden ? `${l.city}, MN ${l.zip}` : `${l.street}, ${l.city}, MN ${l.zip}`;
    const img = l.photo ? `<img src="${esc(l.photo)}?class=small" alt="${esc(addr)}" width="400" height="267" loading="lazy" decoding="async" />` : '<span class="lcard__nophoto">Photo coming soon</span>';
    const icon = !l.ownBrokerage && thumb ? `<img src="${esc(thumb)}" alt="Broker Reciprocity listing" width="35" height="35" />` : '';
    return `<li class="lcard"><a href="/homes/${esc(l.slug)}"><span class="lcard__photo">${img}${flag ? `<span class="lcard__flag">${flag}</span>` : ''}</span>`
      + `<strong class="lcard__price">${l.price > 1 ? money(l.price) : 'Auction'}</strong>${specs ? `<span class="lcard__specs">${esc(specs)}</span>` : ''}`
      + `<span class="lcard__addr">${esc(addr)}</span>${l.type ? `<span class="lcard__type">${esc(types[l.type] ?? 'home')}</span>` : ''}`
      + `<span class="lcard__mls">MLS #${esc(l.mls)}</span><span class="lcard__broker">${icon}Listing courtesy of ${esc(l.brokerage || 'the listing brokerage')}</span></a></li>`;
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
    mapCount.hidden = !a.total;
    mapCount.textContent = a.pins.length < a.total ? `${a.pins.length.toLocaleString('en-US')} of ${a.total.toLocaleString('en-US')} homes on the map` : `${a.total.toLocaleString('en-US')} ${a.total === 1 ? 'home' : 'homes'}`;
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
      const r = await fetch(`/api/search?${qs}`, { headers: { 'x-idx-eula': 'agreed' } });
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

  // ---- filter pills: one open at a time; each shows what's chosen ----
  const val = (k: string) => String(new FormData(form).get(k) ?? '');
  function pillLabels() {
    const sets: Record<string, string> = {
      price: val('min') || val('max') ? `${val('min') ? short(+val('min')) : 'Any'} – ${val('max') ? short(+val('max')) : 'Any'}` : '',
      rooms: [val('beds') && `${val('beds')}+ bd`, val('baths') && `${val('baths')}+ ba`].filter(Boolean).join(', '),
      type: val('type') ? val('type').split(',').map((t) => (types[t] ?? t).replace(/^./, (c) => c.toUpperCase())).join(', ') : '',
      more: (() => { const n = ['lakefront', 'new', 'acres', 'team'].filter((k) => val(k)).length; return n ? `More (${n})` : ''; })(),
    };
    for (const d of pills) {
      const s = d.querySelector<HTMLElement>('summary')!;
      const v = sets[d.dataset.pill!];
      s.textContent = v || s.dataset.pillLabel!;
      d.classList.toggle('is-set', !!v);
    }
  }
  pills.forEach((d) => d.addEventListener('toggle', () => { if (d.open) pills.forEach((o) => { if (o !== d) o.open = false; }); }));
  document.addEventListener('click', (e) => { if (!(e.target as Element).closest('[data-pill]')) pills.forEach((d) => { d.open = false; }); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') pills.forEach((d) => { d.open = false; }); });

  // ---- the search box: a place from the list, a ZIP code, or empty for everywhere ----
  const placeOf = (text: string) => {
    const t = text.trim().toLowerCase();
    if (!t) return '';
    if (/^\d{5}$/.test(t)) return `zip:${t}`;
    const entries = Object.entries(names);
    const hit = entries.find(([, l]) => l.toLowerCase() === t) ?? entries.find(([, l]) => l.toLowerCase().startsWith(t)) ?? entries.find(([, l]) => l.toLowerCase().includes(t));
    return hit ? hit[0] : null;
  };
  const setPlace = () => {
    const v = placeOf(where.value);
    if (v === null) { where.setCustomValidity('Pick a city, neighborhood or lake from the list, or a 5-digit ZIP code.'); where.reportValidity(); return false; }
    where.setCustomValidity('');
    (form.elements.namedItem('place') as HTMLInputElement).value = v;
    (form.elements.namedItem('bbox') as HTMLInputElement).value = '';
    where.value = v ? label(v) : '';
    return true;
  };
  where.addEventListener('input', () => where.setCustomValidity(''));

  const changed = () => { setPage(1); pillLabels(); run(); };
  form.addEventListener('change', (e) => { if (e.target === where) { if (setPlace()) changed(); return; } changed(); });
  sortEl.addEventListener('change', changed);
  form.addEventListener('submit', (e) => { e.preventDefault(); if (setPlace()) changed(); });
  const top = () => root.querySelector('.hs-panel')!.scrollIntoView({ behavior: 'smooth' });
  prev.addEventListener('click', () => { setPage((last?.page ?? 1) - 1); run(); top(); });
  next.addEventListener('click', () => { setPage((last?.page ?? 1) + 1); run(); top(); });

  // ---- map ----
  const openMap = async () => {
    if (map) { map.resize(); return; }
    mapApi = await import('./search-map');
    map = await mapApi.createMap(root.querySelector<HTMLElement>('[data-map]')!, root.dataset.mapStyle!, root.dataset.brThumb ?? '', () => {
      // The person moved the map: search that area if "Search as I move the map" is on.
      if (!follow.checked || !map || !mapApi) return;
      (form.elements.namedItem('bbox') as HTMLInputElement).value = mapApi.boxOf(map);
      setPage(1); run();
    });
    if (last) mapApi.setPins(map, last.pins, !params().get('bbox'));
    else await run(false);
  };
  const showMap = (on: boolean) => {
    root.classList.toggle('is-map', on);
    toggle.textContent = on ? 'List' : 'Map';
    toggle.setAttribute('aria-pressed', String(on));
    const u = new URL(location.href);
    if (on) u.searchParams.set('view', 'map'); else u.searchParams.delete('view');
    history.replaceState(null, '', u);
    if (on || !phone.matches) openMap();
  };
  toggle.addEventListener('click', () => showMap(!root.classList.contains('is-map')));
  phone.addEventListener('change', () => { if (!phone.matches) openMap(); });
  clearBtn.addEventListener('click', () => { (form.elements.namedItem('bbox') as HTMLInputElement).value = ''; setPage(1); run(); });

  // Pointing at a card lights up its home on the map.
  list.addEventListener('mouseover', (e) => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="/homes/"]');
    if (map && mapApi) mapApi.highlight(map, a ? decodeURIComponent(a.getAttribute('href')!.slice(7)) : '');
  });
  list.addEventListener('mouseleave', () => { if (map && mapApi) mapApi.highlight(map, ''); });

  // ---- start: the first page of newest homes is already in the HTML; ask the server only if the address has filters.
  // Nothing is asked until the visitor has agreed to the license agreement this visit (src/layouts/Base.astro). ----
  const start = new URLSearchParams(location.search);
  fill(start);
  const begin = () => {
    const filtered = KEYS.some((k) => start.get(k));
    if (filtered) run(false);
    else {
      if (saved) saved.value = `${location.origin}${location.pathname}`;
      fetch('/api/search', { headers: { 'x-idx-eula': 'agreed' } }).then((r) => r.json()).then((a: Answer) => { if (a.ok && seq === 0) draw(a); }).catch(() => {});
    }
    showMap(start.get('view') === 'map' && phone.matches);
  };
  if (document.documentElement.classList.contains('idx-ok')) begin();
  else window.addEventListener('idx-agreed', begin, { once: true });
}
