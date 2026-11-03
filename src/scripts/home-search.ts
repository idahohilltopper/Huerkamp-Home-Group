// Runtime for /home-search (Zillow-style: filter pills on top, map left, list right). Reads the filters from the address,
// asks /api/search, draws the cards, the page buttons and the map. On a computer the map loads at once; on a phone
// only when the Map button is pressed. With "Search as I move the map" on, moving the map searches that area.
// "Sold" switches the page to recently sold homes (/api/sold, NorthstarMLS sold content; src/lib/sold.mjs).
import { soldCardHtml, soldOn, type Sold } from './sold-card';
type Card = { mls: string; slug: string; street: string; city: string; zip: string; price: number; beds: number | null; baths: number | null;
  sqft: number | null; type: string | null; newConstruction: 0 | 1; lakefront: 0 | 1; lotAcres: number | null; brokerage: string; photo: string | null;
  ownBrokerage: 0 | 1; addressHidden: 0 | 1 };
type Answer = { ok: boolean; error?: string; total: number; page: number; pages: number; results: (Card | Sold)[]; pins: Pin[]; unsupported?: boolean; months?: number };
/** lat, lng, price, page slug (MLS number for a sold home), photo, address, brokerage, own brokerage, sold date (sold only). */
export type Pin = [number, number, number, string, string | null, string, string, 0 | 1, string?];

const KEYS = ['status', 'place', 'min', 'max', 'beds', 'baths', 'months', 'type', 'lakefront', 'new', 'acres', 'team', 'sort', 'bbox', 'page'];
// Filters the sold view can't use (the MLS sold data is searched by place, price, rooms, date and map area).
const SALE_ONLY = ['type', 'lakefront', 'new', 'acres', 'team', 'sort'];
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
  const modeBtns = [...form.querySelectorAll<HTMLButtonElement>('[data-mode]')];
  const isSold = () => String(new FormData(form).get('status') ?? '') === 'sold';
  const defaultMonths = Number(root.dataset.defaultMonths ?? 6);
  const months = () => Number(new FormData(form).get('months') || defaultMonths);
  const monthsText = (m: number) => (m < 12 ? `${m} months` : m === 12 ? 'year' : `${m / 12} years`);
  /** Show the filters that fit the view (for sale or sold). */
  const showMode = () => {
    const sold = isSold();
    modeBtns.forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.mode === 'sold') === sold)));
    document.querySelectorAll<HTMLElement>('[data-sold-only]').forEach((el) => { el.hidden = !sold; });
    document.querySelectorAll<HTMLElement>('[data-sale-only]').forEach((el) => { el.hidden = sold; });
    const h1 = root.querySelector<HTMLElement>('[data-h1]');
    if (h1) h1.textContent = sold ? 'Recently sold Twin Cities homes' : 'Twin Cities homes for sale';
  };

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
    const bits = [p.get('status') === 'sold' ? 'Sold homes:' : '', p.get('place') ? p.get('place')!.split(',').map(label).join(', ') : 'All communities'];
    if (p.get('min') || p.get('max')) bits.push(`${p.get('min') ? short(+p.get('min')!) : 'any'} to ${p.get('max') ? short(+p.get('max')!) : 'any'}`);
    if (p.get('beds')) bits.push(`${p.get('beds')}+ beds`);
    if (p.get('baths')) bits.push(`${p.get('baths')}+ baths`);
    if (p.get('type')) bits.push(p.get('type')!.split(',').map((t) => types[t] ?? t).join(', '));
    if (p.get('lakefront')) bits.push('lakefront');
    if (p.get('new')) bits.push('new construction');
    if (p.get('acres')) bits.push('1+ acre');
    if (p.get('team')) bits.push('our team’s listings');
    if (p.get('bbox')) bits.push('in the map area');
    return bits.filter(Boolean).join(' · ').replace(': · ', ': ');
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
    const sold = isSold();
    list.innerHTML = sold ? (a.results as Sold[]).map((l) => soldCardHtml(l, thumb)).join('') : (a.results as Card[]).map(card).join('');
    countEl.textContent = sold
      ? (a.unsupported ? 'Sold homes can be searched by city, ZIP code or map area' : `${a.total.toLocaleString('en-US')} ${a.total === 1 ? 'home' : 'homes'} sold in the last ${monthsText(a.months ?? months())}`)
      : `${a.total.toLocaleString('en-US')} ${a.total === 1 ? 'home' : 'homes'} for sale`;
    emptyEl.hidden = a.total > 0 || !!a.unsupported;
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
      // Sold homes come from the MLS when asked; the map's points only when the map is open (they cost extra calls).
      const url = isSold() ? `/api/sold?${qs}${map ? `${qs ? '&' : ''}pins=1` : ''}` : `/api/search?${qs}`;
      const r = await fetch(url, { headers: { 'x-idx-eula': 'agreed' } });
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
      months: isSold() ? `Sold in the last ${monthsText(months())}` : '',
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
  modeBtns.forEach((b) => b.addEventListener('click', () => {
    (form.elements.namedItem('status') as HTMLInputElement).value = b.dataset.mode ?? '';
    if (b.dataset.mode !== 'sold') (form.elements.namedItem('months') as HTMLSelectElement).value = '';
    if (b.dataset.mode === 'sold') for (const k of SALE_ONLY) { const el = form.elements.namedItem(k) as HTMLInputElement | null; if (el) { if (el.type === 'checkbox') el.checked = false; else el.value = k === 'sort' ? 'new' : ''; } }
    showMode(); changed();
  }));
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
    if (last && !isSold()) mapApi.setPins(map, last.pins, !params().get('bbox'));
    else await run(false); // sold answers carry map points only when the map is open
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
    const sold = (e.target as Element).closest<HTMLElement>('.lcard--sold')?.querySelector('.lcard__mls')?.textContent?.replace('MLS #', '');
    if (map && mapApi) mapApi.highlight(map, a ? decodeURIComponent(a.getAttribute('href')!.slice(7)) : sold ?? '');
  });
  list.addEventListener('mouseleave', () => { if (map && mapApi) mapApi.highlight(map, ''); });

  // ---- start: the first page of newest homes is already in the HTML; ask the server only if the address has filters.
  // Nothing is asked until the visitor has agreed to the license agreement this visit (src/layouts/Base.astro). ----
  const start = new URLSearchParams(location.search);
  fill(start);
  showMode();
  pillLabels();
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
