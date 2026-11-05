// Street-address suggestions while typing (/api/address-suggest, Google Places). Used by the home page search box
// (src/components/HeroSearch.astro) and the home value form on the home page (attachAddressList below).
export type Suggestion = { text: string; main: string; secondary: string };

/** A house number, a space and at least 2 letters: worth asking for suggestions. */
export const looksLikeAddress = (t: string) => /^\d{1,6}[a-z]?\s+\S/i.test(t.trim()) && /[a-z].*[a-z]/i.test(t.replace(/^\s*\d+\s*/, ''));

/** Suggestions for typed text: waits for a pause in typing, drops answers to older text, remembers answers. */
export function makeSuggester(wait = 250) {
  const memo = new Map<string, Suggestion[]>();
  const session = (globalThis.crypto?.randomUUID?.() ?? String(Math.random()).slice(2)).replace(/[^a-zA-Z0-9-]/g, '');
  let timer: ReturnType<typeof setTimeout> | undefined;
  let ctl: AbortController | null = null;
  return (text: string): Promise<Suggestion[] | null> => new Promise((resolve) => {
    clearTimeout(timer);
    ctl?.abort();
    const q = text.replace(/\s+/g, ' ').trim();
    if (!looksLikeAddress(q)) return resolve([]);
    const key = q.toLowerCase();
    if (memo.has(key)) return resolve(memo.get(key)!);
    timer = setTimeout(async () => {
      ctl = new AbortController();
      try {
        const r = await fetch(`/api/address-suggest?${new URLSearchParams({ q, s: session })}`, { signal: ctl.signal });
        const a = await r.json();
        const list: Suggestion[] = Array.isArray(a?.suggestions) ? a.suggestions : [];
        memo.set(key, list);
        resolve(list);
      } catch { resolve(null); } // superseded by newer typing, or offline
    }, wait);
  });
}

/** A suggestion list under an address input; `onPick` gets the chosen suggestion. Keyboard: arrows, Enter, Escape. */
export function attachAddressList(input: HTMLInputElement, onPick: (s: Suggestion) => void) {
  const suggest = makeSuggester();
  const list = document.createElement('ul');
  const id = `${input.id || 'addr'}-list`;
  list.id = id;
  list.className = 'addr-list';
  list.setAttribute('role', 'listbox');
  list.setAttribute('aria-label', 'Matching addresses');
  list.hidden = true;
  input.insertAdjacentElement('afterend', list);
  input.parentElement!.style.position ||= 'relative';
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-controls', id);
  input.setAttribute('aria-expanded', 'false');
  input.autocomplete = 'off';
  let items: Suggestion[] = [];
  let active = -1;
  const show = (on: boolean) => { list.hidden = !on; input.setAttribute('aria-expanded', String(on)); };
  const setActive = (i: number) => {
    active = i;
    [...list.children].forEach((li, j) => li.setAttribute('aria-selected', String(j === i)));
    if (i >= 0) input.setAttribute('aria-activedescendant', `${id}-${i}`); else input.removeAttribute('aria-activedescendant');
  };
  const pick = (i: number) => { const s = items[i]; if (!s) return; show(false); onPick(s); };
  const render = () => {
    list.replaceChildren(...items.map((s, i) => {
      const li = document.createElement('li');
      li.id = `${id}-${i}`;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', 'false');
      const b = document.createElement('strong'); b.textContent = s.main;
      const sm = document.createElement('span'); sm.textContent = s.secondary;
      li.append(b, ' ', sm);
      return li;
    }));
    setActive(-1);
    show(items.length > 0);
  };
  input.addEventListener('input', async () => {
    const text = input.value;
    const got = await suggest(text);
    if (got === null || input.value !== text) return;
    items = got;
    render();
  });
  list.addEventListener('mousedown', (e) => e.preventDefault());
  list.addEventListener('click', (e) => { const li = (e.target as Element).closest('li'); if (li) pick([...list.children].indexOf(li)); });
  input.addEventListener('keydown', (e) => {
    if (list.hidden) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((active + 1) % items.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((active - 1 + items.length) % items.length); }
    else if (e.key === 'Escape') show(false);
    else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); pick(active); }
  });
  input.addEventListener('blur', () => setTimeout(() => show(false), 150));
}
