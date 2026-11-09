// Branded Repliers email templates: checks the three alert emails (designed by hand, Nov 4-5, 2026: NorthstarMLS
// Rule 12.3(f) means no beds/baths/sqft or neighbourhood on other brokerages' homes, and a "Listing courtesy of" line
// waiting for Repliers' brokerage tag), makes previews of them, and restyles Repliers' two message emails in our
// colors and logo.
// Repliers sends these emails; we send them the HTML and they switch our account to it (help.repliers.com:
// "Setting Up Integrated Email Messaging With Repliers", "Email Template Syntax Guide").
//   email-templates/<name>.html          what goes to Repliers support
//   email-templates/preview/<name>.html  the same email filled with made-up sample homes, to look at
// Rules: every Repliers tag in their default template (email-templates/repliers-defaults/) must still be there, except
// the few listed in DROPPED; the script stops if one is missing. Usage: node scripts/email-templates/build.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const SITE = 'https://www.huerkamphomes.com';
const B = { name: 'Huerkamp Home Group', brokerage: 'Keller Williams Preferred Realty', phone: '(612) 502-7653', tel: '+16125027653',
  red: '#d40000', night: '#1f1b1c', sand: '#f2ebe3', line: '#e6ded3', text: '#1f1b1c', soft: '#6b6461',
  logo: `${SITE}/brand/hhg-logo-reverse.png`, br: `${SITE}/mls/br-logo.jpg` };
const MLS = {
  disclaimer: `${B.brokerage} is not a Multiple Listing Service (MLS), nor does it offer MLS access. This email is a service of ${B.brokerage}, a broker Participant of the Regional Multiple Listing Service of Minnesota, Inc. Information Deemed Reliable But Not Guaranteed.`,
  source: `The data relating to real estate in this email comes in part from the Broker Reciprocity℠ Program of the Regional Multiple Listing Service of Minnesota, Inc. Listings held by brokerage firms other than ${B.brokerage} are marked with the Broker Reciprocity℠ logo, and detailed information about them, including the name of the listing broker, is on each home's page. Some homes may have sold or may no longer be available.`,
};
const FONT = "Helvetica, Arial, sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";

// The two message emails keep Repliers' layout (their logic for threads, pictures and searches is intricate) with our
// colors and logo swapped in.
const restyle = (html) => html
  .replace(/background: linear-gradient\(to right, #3123ae 0%, #c46cd6 100%\);/g, `background: ${B.night}; border-bottom: 4px solid ${B.red};`)
  .replace(/#3b28b1/gi, B.red).replace(/#3123ae/gi, B.red).replace(/#c46cd6/gi, B.red).replace(/#f7f7fc/gi, B.sand)
  .replace('<div align="center" style="height: 50px; margin: auto;">', `<div align="left" style="padding: 18px 28px; margin: auto;"><a href="${SITE}/"><img src="${B.logo}" alt="${B.name}" width="150" style="display:block; width:150px; height:auto; border:0;"></a>`)
  .replace(/font-family: sans-serif;/g, `font-family: ${FONT};`);

// Tags Repliers' defaults use that ours leave out on purpose.
const tags = (s) => new Set([...s.matchAll(/\{\{\{?\s*[^}]+?\s*\}?\}\}/g)].map((m) => m[0].replace(/\s+/g, '')));

// A small renderer for the previews: {{var}}, {{{var}}}, {{if x}}…{{else}}…{{end}}, {{each list}}…{{end}}, #count, >, ==.
function render(tpl, data) {
  const tokens = tpl.split(/(\{\{\{?[^}]+\}?\}\})/);
  let i = 0;
  const get = (path, ctx) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), ctx);
  const value = (expr, ctx) => {
    expr = expr.trim();
    const m = expr.match(/^#(\S+)\s*(>|==)\s*(\d+)$/);
    if (m) { const n = (get(m[1], ctx) ?? []).length; return m[2] === '>' ? n > +m[3] : n === +m[3]; }
    if (expr.startsWith('!')) return !value(expr.slice(1), ctx);
    const v = get(expr, ctx);
    return Array.isArray(v) ? v.length > 0 : !!v;
  };
  const walk = (ctx, stop) => {
    let out = '';
    while (i < tokens.length) {
      const t = tokens[i++];
      const m = t.match(/^\{\{\{?\s*(.*?)\s*\}?\}\}$/);
      if (!m) { out += t; continue; }
      const body = m[1];
      if (stop.includes(body.split(' ')[0])) { i--; return out; }
      if (body.startsWith('if ')) {
        const yes = walk(ctx, ['else', 'end']);
        let no = '';
        if (tokens[i]?.match(/\{\{\s*else\s*\}\}/)) { i++; no = walk(ctx, ['end']); }
        i++; // {{end}}
        out += value(body.slice(3), ctx) ? yes : no;
      } else if (body.startsWith('each ')) {
        const start = i; const list = get(body.slice(5).trim(), ctx) ?? [];
        let html = '';
        for (const item of list.length ? list : [null]) { i = start; const part = walk({ ...ctx, loop_var: item }, ['end']); if (item) html += part; }
        if (!list.length) { i = start; walk(ctx, ['end']); }
        i++;
        out += html;
      } else {
        const v = get(body, ctx);
        out += v == null ? '' : String(v);
      }
    }
    return out;
  };
  return walk(data, []);
}

// Made-up sample homes for the previews only (never sent): photos are the site's own share image.
const SAMPLE = (sold) => ({
  agentAvatar: `${SITE}/brand/hhg-mark.png`, fromName: 'Jason Huerkamp', datetime: 'Nov 9, 2026 7:05 AM', to: { firstname: ' Sam' },
  search: 'Lakeville, MN · 3+ beds · $400K–$600K', search_url: '#', adjust_search_url: '#', unsubscribe_url: '#', settings_url: '#', editSearch: true,
  business_name: B.name, business_address: '14300 Nicollet Ct, Ste 208, Burnsville, MN 55306', logo: '', showPoweredBy: false,
  listings: [
    { price: '549,900', address: '123 Sample Lane, Lakeville, MN 55044', neighbourhood: 'Lakeville', mlsnumber: '0000001', bedrooms: 4, bathrooms: 3, sqft: '2,850', image: `${SITE}/brand/og-default.jpg`, url: '#' },
    { price: '475,000', address: '456 Example Court, Lakeville, MN 55044', neighbourhood: 'Lakeville', mlsnumber: '0000002', bedrooms: 3, bathrooms: 2, sqft: '2,120', image: `${SITE}/brand/og-default.jpg`, url: '#' },
  ].map((l) => (sold ? { ...l, price: undefined } : l)),
});

mkdirSync('email-templates/preview', { recursive: true });
const report = [];
for (const name of ['new-listing-alert', 'price-change-alert', 'sold-listing-alert']) {
  const html = readFileSync(`email-templates/${name}.html`, 'utf8');
  const def = readFileSync(`email-templates/repliers-defaults/${name}.html`, 'utf8');
  // Left out on purpose (Rule 12.3(f)): beds, baths, square feet and neighbourhood on listing summaries.
  // Written in directly instead: our logo, team name and office address (the address is required in every email).
  const rule = new Set(['{{loop_var.bedrooms}}', '{{loop_var.bathrooms}}', '{{loop_var.sqft}}', '{{loop_var.neighbourhood}}', '{{iflogo}}', '{{{logo}}}', '{{business_name}}', '{{business_address}}']);
  const missing = [...tags(def)].filter((t) => !tags(html).has(t) && !rule.has(t));
  if (missing.length) throw new Error(`${name}: Repliers tags missing: ${missing.join(' ')}`);
  writeFileSync(`email-templates/preview/${name}.html`, render(html, SAMPLE(name.startsWith('sold'))));
  report.push(`${name}: Repliers tags kept (beds/baths/sqft/neighbourhood left out for Rule 12.3(f))`);
}
for (const name of ['message-from-agent-to-client', 'message-from-client-to-agent']) {
  const def = readFileSync(`email-templates/repliers-defaults/${name}.html`, 'utf8');
  const html = restyle(def);
  const missing = [...tags(def)].filter((t) => !tags(html).has(t));
  if (missing.length) throw new Error(`${name}: Repliers tags missing: ${missing.join(' ')}`);
  writeFileSync(`email-templates/${name}.html`, html);
  report.push(`${name}: colors and logo swapped, all ${tags(def).size} Repliers tags kept`);
}
console.log(report.join('\n'));
