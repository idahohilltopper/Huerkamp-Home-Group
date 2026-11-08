// Runtime for /home-search (Zillow-style: filter pills on top, map left, list right). Reads the filters from the address,
// asks /api/search, draws the cards, the page buttons and the map. On a computer the map loads at once; on a phone
// only when the Map button is pressed. With "Search as I move the map" on, moving the map searches that area.
// "Sold" switches the page to recently sold homes (/api/sold, NorthstarMLS sold content; src/lib/sold.mjs).
import { soldCardHtml, soldOn, soldHeaders, signInNote, type Sold } from './sold-card';
import { formatOpenHouse } from '../lib/open-house.mjs';
type Card = { mls: string; slug: string; street: string; city: string; zip: string; price: number; beds: number | null; baths: number | null;
  sqft: number | null; type: string | null; newConstruction: 0 | 1; lakefront: 0 | 1; lotAcres: number | null; brokerage: string; photo: string | null;
  ownBrokerage: 0 | 1; addressHidden: 0 | 1; openHouse?: { date: string; start: string; end: string | null } | null; cut?: number };
type Answer = { ok: boolean; error?: string; total: number; page: number; pages: number; results: (Card | Sold)[]; pins: Pin[]; unsupported?: boolean; months?: number; signInFor?: number };
/** lat, lng, price, page slug (MLS number for a sold home), photo, address, brokerage, own brokerage, sold date (sold only). */
export type Pin = [number, number, number, string, string | null, string, string, 0 | 1, string?];

const KEYS = ['status', 'place', 'min', 'max', 'beds', 'baths', 'garage', 'months', 'type', 'lakefront', 'new', 'acres', 'team', 'open', 'sort', 'bbox', 'page'];
// Filters the sold view can't use (the MLS sold data is searched by place, price, rooms, date and map area).
const SALE_ONLY = ['type', 'garage', 'lakefront', 'new', 'acres', 'team', 'open', 'sort'];
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
  // The main map (MapLibre, needs WebGL) or, when the browser can't run it, the backup flat map (Leaflet); same functions.
  let mapApi: any = null;
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
    if (!h1) return;
    // Named after the searched place when there's just one ("Burnsville, MN homes for sale"), as the portals do.
    const pl = (params().get('place') ?? '').split(',').filter(Boolean);
    const one = pl.length === 1 ? pl[0] : '';
    const name = !one ? '' : one.startsWith('zip:') ? `ZIP ${one.slice(4)}` : one.startsWith('hood:') || one.startsWith('lake:') ? (names[one] ?? '') : names[one] ? `${names[one]}, MN` : '';
    const near = !name && nearHere && !!params().get('bbox');
    h1.textContent = name ? (sold ? `Recently sold homes in ${name}` : `${name} homes for sale`)
      : near ? (sold ? 'Recently sold homes near you' : 'Homes for sale near you')
      : sold ? 'Recently sold Twin Cities homes' : 'Twin Cities homes for sale';
    // One town or neighborhood searched: link to its community guide.
    const guide = root.querySelector<HTMLAnchorElement>('[data-guide]');
    if (guide) {
      const href = one && names[one] && !one.includes(':') ? `/communities/${one}` : one.startsWith('hood:') && names[one] ? `/communities/${one.slice(5)}` : '';
      guide.hidden = !href;
      if (href) { guide.href = href; guide.textContent = `${names[one]} community guide ›`; }
    }
  };

  // ---- filters <-> address ----
  let nearHere = false; // the map area came from "Use my current location" (heading: "Homes for sale near you")
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
    if (p.get('garage')) bits.push(`${p.get('garage')}+ garage stalls`);
    if (p.get('type')) bits.push(p.get('type')!.split(',').map((t) => types[t] ?? t).join(', '));
    if (p.get('lakefront')) bits.push('lakefront');
    if (p.get('new')) bits.push('new construction');
    if (p.get('acres')) bits.push('1+ acre');
    if (p.get('team')) bits.push('our team’s listings');
    if (p.get('open')) bits.push('open houses');
    if (p.get('bbox')) bits.push('in the map area');
    return bits.filter(Boolean).join(' · ').replace(': · ', ': ');
  };

  // ---- drawing ----
  // Same rules as src/components/ListingCard.astro (NorthstarMLS Rule 12.3(d)-(f)): the API already leaves out the
  // details of other brokerages' listings; their cards carry the Broker Reciprocity thumbnail logo.
  const thumb = root.dataset.brThumb;
  const card = (l: Card) => {
    const specs = [l.beds && `${l.beds} bd`, l.baths && `${l.baths} ba`, l.sqft && `${l.sqft.toLocaleString('en-US')} sq ft`, l.type === 'land' && l.lotAcres && `${l.lotAcres} acres`].filter(Boolean).join(' · ');
    // The API sends cut only for the team's own listings (src/lib/search-index.mjs, Rule 12.3(f)).
    const c = l.cut ?? 0;
    const cut = c >= 1000 ? `Price cut $${c >= 1e6 ? `${(c / 1e6).toFixed(1)}M` : `${Math.round(c / 1000)}K`}` : '';
    const flag = cut || (l.newConstruction ? 'New construction' : l.lakefront ? 'Lakefront' : '');
    const addr = l.addressHidden ? `${l.city}, MN ${l.zip}` : `${l.street}, ${l.city}, MN ${l.zip}`;
    const img = l.photo ? `<img src="${esc(l.photo)}?class=small" alt="${esc(addr)}" width="400" height="267" loading="lazy" decoding="async" />` : '<span class="lcard__nophoto">Photo coming soon</span>';
    const icon = !l.ownBrokerage && thumb ? `<img src="${esc(thumb)}" alt="Broker Reciprocity listing" height="18" />` : '';
    return `<li class="lcard"><a href="/homes/${esc(l.slug)}"><span class="lcard__photo">${img}${flag ? `<span class="lcard__flag${cut ? ' lcard__flag--cut' : ''}">${flag}</span>` : ''}${l.openHouse ? `<span class="lcard__open">Open ${esc(formatOpenHouse(l.openHouse))}</span>` : ''}</span>`
      + `<strong class="lcard__price">${l.price > 1 ? money(l.price) : 'Auction'}</strong>${specs ? `<span class="lcard__specs">${esc(specs)}</span>` : ''}`
      + `<span class="lcard__addr">${esc(addr)}</span>${l.type ? `<span class="lcard__type">${esc(types[l.type] ?? 'home')}</span>` : ''}`
      + `<span class="lcard__mls">MLS #${esc(l.mls)}</span><span class="lcard__broker">${icon}Listing courtesy of ${esc(l.brokerage || 'the listing brokerage')}</span></a>`
      + `<button type="button" class="fav" data-fav="${esc(l.mls)}" data-fav-name="${esc(addr)}" data-fav-street="${l.addressHidden ? '' : esc(l.street)}" data-fav-city="${esc(l.city)}" data-fav-zip="${esc(l.zip)}" data-fav-price="${esc(l.price)}" aria-pressed="false" aria-label="Save: ${esc(addr)}">♡</button></li>`;
  };
  const draw = (a: Answer) => {
    last = a;
    const sold = isSold();
    list.innerHTML = sold ? (a.results as Sold[]).map((l) => soldCardHtml(l, thumb)).join('') : (a.results as Card[]).map(card).join('');
    list.parentElement?.querySelectorAll(':scope > .sold-signin').forEach((n) => n.remove());
    if (sold && a.signInFor) list.insertAdjacentHTML('beforebegin', signInNote(a.signInFor));
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
    showPlace();
    showMode();
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
    // The alert form saves this search at Repliers too (src/layouts/Base.astro; homes for sale only).
    const alertForm = document.querySelector<HTMLFormElement>('form[data-lead="community-alert"]');
    if (alertForm) {
      const q = Object.fromEntries([...keep].filter(([k]) => !['sort', 'status', 'months'].includes(k)));
      if (isSold()) { delete alertForm.dataset.alertQuery; } else { alertForm.dataset.alertQuery = JSON.stringify(q); alertForm.dataset.alertName = describe(keep).slice(0, 50); }
    }
    clearBtn.hidden = !p.get('bbox');
    const mine = ++seq;
    list.classList.add('is-loading');
    try {
      // Sold homes come from the MLS when asked; the map's points only when the map is open (they cost extra calls).
      const url = isSold() ? `/api/sold?${qs}${map ? `${qs ? '&' : ''}pins=1` : ''}` : `/api/search?${qs}`;
      const r = await fetch(url, { headers: isSold() ? soldHeaders() : { 'x-idx-eula': 'agreed' } });
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
      garage: val('garage') ? `${val('garage')}+ garage` : '',
      months: isSold() ? `Sold in the last ${monthsText(months())}` : '',
      more: (() => { const n = ['lakefront', 'new', 'acres', 'team', 'open'].filter((k) => val(k)).length; return n ? `More (${n})` : ''; })(),
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
  // ---- a street address: the map moves there, marks it, and offers an instant estimate of what it's worth ----
  type Home = { lat: number; lng: number; street: string; city: string; zip: string; address: string };
  let home: Home | null = null;
  const homeCard = document.createElement('div');
  homeCard.className = 'hs-addr';
  homeCard.hidden = true;
  list.before(homeCard);
  const looksLikeAddress = (t: string) => /^\d{1,6}[a-z]?\s+\S/i.test(t.trim()) && !/^\d{5}$/.test(t.trim());
  // About a mile across, centered on the address.
  const boxAround = (lat: number, lng: number) => [lng - 0.017, lat - 0.012, lng + 0.017, lat + 0.012];
  const estimateHref = (h: Home) => `/home-estimate?${new URLSearchParams({ address: `${h.street}, ${h.city}`, zip: h.zip })}`;
  const showHomeCard = () => {
    homeCard.hidden = !home;
    if (!home) { homeCard.innerHTML = ''; return; }
    const est = estimateHref(home);
    homeCard.innerHTML = `<p class="hs-addr__where"><span aria-hidden="true">⌂</span> Homes near <strong>${esc(home.street)}</strong>, ${esc(home.city)}</p>`
      + '<p>Is this your home? See what it could sell for, based on recent sales near you.</p>'
      + `<a class="btn" href="${esc(est)}" target="_top">What’s my home worth?</a>`;
  };
  const clearHome = () => {
    if (!home) return;
    home = null;
    showHomeCard();
    if (map && mapApi) mapApi.showHome(map, null);
  };
  const findAddress = async (text: string) => {
    where.setCustomValidity('');
    const r = await fetch(`/api/geocode?q=${encodeURIComponent(text)}`).then((x) => x.json()).catch(() => null);
    if (!r?.ok) {
      where.setCustomValidity(r?.error === 'not-found' ? 'We couldn’t find that address. Try adding the city, like “123 Main St, Lakeville”.' : 'We couldn’t look up that address right now. Try a city or ZIP code.');
      where.reportValidity();
      return;
    }
    home = r as Home;
    const box = boxAround(home.lat, home.lng);
    (form.elements.namedItem('place') as HTMLInputElement).value = '';
    (form.elements.namedItem('bbox') as HTMLInputElement).value = box.map((n) => n.toFixed(4)).join(',');
    where.value = home.address;
    showHomeCard();
    changed();
    if (phone.matches) showMap(true);
    await openMap();
    if (map && mapApi) mapApi.showHome(map, home, box, estimateHref(home));
  };

  const setPlace = () => {
    if (looksLikeAddress(where.value)) {
      if (home && where.value === home.address) return false; // already showing it
      findAddress(where.value);
      return false;
    }
    clearHome();
    const v = placeOf(where.value);
    if (v === null) { where.setCustomValidity('Pick a city, neighborhood or lake from the list, or type a 5-digit ZIP code or a street address.'); where.reportValidity(); return false; }
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
  // One map only: a second call while the first is still loading waits for it instead of making another.
  let opening: Promise<void> | null = null;
  const openMap = () => (map ? (map.resize(), Promise.resolve()) : (opening ??= makeMap().catch(mapFailed)));
  // The map couldn't start: say so where the map would be, with a way to try again (the list keeps working).
  const mapFailed = (e: unknown) => {
    opening = null;
    const msg = e instanceof Error ? e.message : String(e);
    const w = window as any;
    if (/dynamically imported|Importing a module|preload|Failed to fetch/i.test(msg) && w.hhgReloadOnce?.(msg)) return;
    w.hhgReport?.('map', msg, '', 0);
    const box = root.querySelector<HTMLElement>('[data-map]')!;
    box.innerHTML = `<div class="hs-mapfail" role="alert"><p><strong>The map didn't load.</strong> The homes are all in the list${phone.matches ? ' (tap List)' : ' on the right'}.</p>`
      + `<p>This is usually a slow connection. Reloading the page normally fixes it.</p>`
      + `<button type="button" class="btn">Reload the page</button></div>`;
    box.querySelector('button')!.addEventListener('click', () => location.reload());
  };
  // WebGL check. When the browser refuses, it says why in a "webglcontextcreationerror" event (for example "GPU process
  // was unable to boot" or "Web page caused context loss and was blocked"); that reason goes in the error report.
  let glWhy = '';
  const hasWebGL = () => {
    try {
      const c = document.createElement('canvas');
      c.addEventListener('webglcontextcreationerror', (e: any) => { if (e.statusMessage) glWhy = e.statusMessage; }, false);
      return !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch (e) { glWhy = e instanceof Error ? e.message : String(e); return false; }
  };
  const makeMap = async () => {
    const el = root.querySelector<HTMLElement>('[data-map]')!;
    const args = [root.dataset.mapStyle!, root.dataset.brThumb ?? '', () => {
      // The person moved the map: search that area if "Search as I move the map" is on.
      if (!follow.checked || !map || !mapApi) return;
      (form.elements.namedItem('bbox') as HTMLInputElement).value = mapApi.boxOf(map);
      setPage(1); run();
    }, (params().get('bbox') ?? '').split(',').map(Number).filter((n, i, a) => a.length === 4)] as const;
    try {
      if (!hasWebGL()) throw new Error(`map: no WebGL, using the flat map (browser says: ${glWhy || 'no reason given'})`);
      mapApi = await import('./search-map');
      map = await mapApi.createMap(el, ...args);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (/dynamically imported|Importing a module|preload|Failed to fetch/i.test(msg)) throw e; // an old copy of the page: mapFailed reloads it
      // The main map can't run here (no WebGL, or its base map didn't load): the flat map has the same homes and pop-ups.
      (window as any).hhgReport?.('map-flat', msg, '', 0);
      map?.remove?.(); map = null;
      mapApi = await import('./search-map-flat');
      map = await mapApi.createMap(el, ...args);
    }
    showPlace();
    if (home) mapApi.showHome(map, home, undefined, estimateHref(home));
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

  // ---- the searched town or neighborhood is outlined on the map (outlines load the first time a place is searched) ----
  let outlines: Promise<{ features: { properties: { key: string } }[] }> | null = null;
  async function showPlace() {
    if (!map || !mapApi) return;
    const places = (params().get('place') ?? '').split(',').filter((p) => p && !p.startsWith('zip:') && !p.startsWith('lake:'));
    if (!places.length) return mapApi.setPlace(map, []);
    outlines ??= fetch('/geo/places.json').then((r) => r.json()).catch(() => ({ features: [] }));
    const all = await outlines;
    mapApi.setPlace(map, all.features.filter((f) => places.includes(f.properties.key)));
  }

  // ---- a home opens in a panel over the search, like the portals ("‹ Back to search" returns to the same spot) ----
  const panel = document.createElement('div');
  panel.className = 'hs-home';
  panel.hidden = true;
  // Top bar like the portals: back on the left, our logo in the middle, Save (the home's heart) and Share on the right.
  panel.innerHTML = '<div class="hs-home__bar"><button type="button" class="hs-home__back" data-back>‹ Back to search</button>'
    + '<a class="hs-home__logo" href="/" target="_top" aria-label="Huerkamp Home Group home page"><img src="/brand/hhg-logo.png" alt="" width="66" height="32" /></a>'
    + '<span class="hs-home__acts"><button type="button" class="hs-home__act" data-save aria-pressed="false"><span aria-hidden="true" data-save-icon>♡</span> <span data-save-text>Save</span></button>'
    + '<button type="button" class="hs-home__act" data-share><span aria-hidden="true">⤴</span> <span data-share-text>Share</span></button>'
    + '<a class="hs-home__act hs-home__full" data-full target="_top">Full page ↗</a></span></div><iframe class="hs-home__frame" title="Home details"></iframe>';
  document.body.append(panel);
  const frame = panel.querySelector('iframe')!;
  const searchUrl = () => `${location.pathname}${location.search}`;
  let back = '';
  const openHome = (href: string) => {
    back = searchUrl();
    frame.src = `${href}${href.includes('?') ? '&' : '?'}embed=1`;
    panel.querySelector<HTMLAnchorElement>('[data-full]')!.href = href;
    panel.hidden = false;
    document.documentElement.classList.add('hs-home-open');
    history.pushState({ hsHome: href }, '', href); // the address is the home's own page, so it can be shared or reloaded
  };
  const closeHome = (fromHistory = false) => {
    if (panel.hidden) return;
    panel.hidden = true;
    frame.src = 'about:blank';
    document.documentElement.classList.remove('hs-home-open');
    if (!fromHistory) history.back(); else if (back && location.pathname + location.search !== back) history.replaceState(null, '', back);
  };
  panel.querySelector('[data-back]')!.addEventListener('click', () => closeHome());
  // Save = the home page's own heart (src/scripts/favorites.ts runs in the frame and asks for a name the first time);
  // the bar's button mirrors whether it's saved.
  const heart = () => frame.contentDocument?.querySelector<HTMLElement>('.fav--big') ?? null;
  const saveBtn = panel.querySelector<HTMLButtonElement>('[data-save]')!;
  const showSaved = () => {
    const on = heart()?.getAttribute('aria-pressed') === 'true';
    saveBtn.setAttribute('aria-pressed', String(on));
    saveBtn.querySelector('[data-save-icon]')!.textContent = on ? '♥' : '♡';
    saveBtn.querySelector('[data-save-text]')!.textContent = on ? 'Saved' : 'Save';
  };
  let watch: MutationObserver | null = null;
  frame.addEventListener('load', () => {
    watch?.disconnect();
    const h = heart();
    saveBtn.hidden = !h;
    if (h) { showSaved(); watch = new MutationObserver(showSaved); watch.observe(h, { attributes: true, attributeFilter: ['aria-pressed'] }); }
  });
  saveBtn.addEventListener('click', () => heart()?.click());
  panel.querySelector('[data-share]')!.addEventListener('click', async () => {
    const url = location.href.replace(/[?&]embed=1\b/, '');
    const label = panel.querySelector<HTMLElement>('[data-share-text]')!;
    try {
      if (navigator.share) await navigator.share({ title: frame.contentDocument?.title ?? document.title, url });
      else { await navigator.clipboard.writeText(url); label.textContent = 'Link copied'; setTimeout(() => { label.textContent = 'Share'; }, 2000); }
    } catch { /* closed the share sheet */ }
  });
  addEventListener('popstate', () => closeHome(true));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) closeHome(); });
  document.addEventListener('click', (e) => {
    const me = e as MouseEvent;
    if (me.button !== 0 || me.metaKey || me.ctrlKey || me.shiftKey || me.altKey) return; // opening in a new tab: normal page
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="/homes/"]');
    if (!a || !(root.contains(a) || a.closest('.maplibregl-popup'))) return;
    e.preventDefault();
    openHome(a.getAttribute('href')!);
  });

  // ---- start: the first page of newest homes is already in the HTML; ask the server only if the address has filters.
  // Nothing is asked until the visitor has agreed to the license agreement this visit (src/layouts/Base.astro). ----
  const start = new URLSearchParams(location.search);
  fill(start);
  // Arrived from an alert email's "Adjust saved search" link (/search): a bar to save the changed filters back to the alert.
  const editId = start.get('edit');
  if (editId) {
    const bar = document.createElement('div');
    bar.className = 'hs-editbar';
    bar.innerHTML = '<p><strong>Editing your saved alert.</strong> Change the filters or move the map, then update it.</p><button type="button" class="btn">Update my alert</button><span role="status"></span>';
    root.querySelector('.hs-panel')?.prepend(bar);
    bar.querySelector('button')!.addEventListener('click', async () => {
      let t = ''; try { t = sessionStorage.getItem('hhg-alert-token') ?? ''; } catch { /* private window */ }
      const q = Object.fromEntries([...params()].filter(([k]) => !['sort', 'status', 'months', 'page'].includes(k)));
      const r = await fetch('/api/alerts/update', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token: t, searchId: editId, query: q }) }).catch(() => null);
      const a = r ? await r.json().catch(() => ({})) : {};
      bar.querySelector('[role=status]')!.textContent = a.ok ? 'Updated! New matches will come by email.' : a.error && !/mls-error|link-expired|not-found/.test(a.error) ? a.error : 'That didn’t work. Open the alert email again and use its link.';
    });
  }
  // "Use my current location" (?near=1 from the home page): the page and map are already loading; ask the browser where
  // the person is, then search the 3 miles around them. A note says what's happening, since the browser can take a few
  // seconds on a computer without GPS.
  const nearMe = () => {
    const u = new URL(location.href); u.searchParams.delete('near'); history.replaceState(null, '', u);
    const bar = document.createElement('div');
    bar.className = 'hs-editbar hs-near';
    bar.setAttribute('role', 'status');
    bar.innerHTML = '<p><span class="hs-near__dot" aria-hidden="true"></span> Finding homes near you…</p>';
    root.querySelector('.hs-panel')?.prepend(bar);
    const say = (t: string) => { bar.innerHTML = `<p>${t}</p>`; setTimeout(() => bar.remove(), 8000); };
    if (!('geolocation' in navigator)) return say('Your browser can’t share its location. Type a city or ZIP code in the search box instead.');
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      // More than about 60 miles from the Twin Cities: outside the areas we cover.
      if (Math.hypot((lat - 44.98) * 69, (lng + 93.27) * 69 * 0.71) > 75) return say('You look to be outside the areas we cover, so here are all Twin Cities homes for sale.');
      const d = 0.043; // about 3 miles each way (0.043 degrees of latitude; longitude scaled for Minnesota)
      const box = [lng - d * 1.4, lat - d, lng + d * 1.4, lat + d];
      (form.elements.namedItem('bbox') as HTMLInputElement).value = box.map((n) => n.toFixed(4)).join(',');
      setPage(1);
      bar.remove();
      nearHere = true;
      await run();
      showMode();
      await (opening ?? Promise.resolve());
      if (map && mapApi?.fitBox) mapApi.fitBox(map, box);
    }, () => say('We couldn’t get your location (it may be turned off for this site), so here are all Twin Cities homes. Type a city or ZIP code to narrow it down.'),
    { enableHighAccuracy: false, timeout: 15000, maximumAge: 1800000 });
  };
  showMode();
  pillLabels();
  const begin = () => {
    const filtered = KEYS.some((k) => start.get(k));
    if (filtered) run(false);
    else {
      if (saved) saved.value = `${location.origin}${location.pathname}`;
      const alertForm = document.querySelector<HTMLFormElement>('form[data-lead="community-alert"]');
      if (alertForm) { alertForm.dataset.alertQuery = '{}'; alertForm.dataset.alertName = 'Twin Cities homes'; }
      fetch('/api/search', { headers: { 'x-idx-eula': 'agreed' } }).then((r) => r.json()).then((a: Answer) => { if (a.ok && seq === 0) draw(a); }).catch(() => {});
    }
    showMap(start.get('view') === 'map' && phone.matches);
    if (start.get('near') === '1') nearMe();
    // Arrived with an address (the home page search box sends /home-search?addr=...): go straight to it.
    const addr = start.get('addr');
    if (addr && looksLikeAddress(addr)) { where.value = addr; findAddress(addr); }
  };
  if (document.documentElement.classList.contains('idx-ok')) begin();
  else window.addEventListener('idx-agreed', begin, { once: true });
}
