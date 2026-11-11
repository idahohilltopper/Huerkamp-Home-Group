// Turns a website form submission into a Follow Up Boss event.
// Used by netlify/functions/lead.mjs; kept separate so it can be tested without sending anything.

import team from '../data/team.json' with { type: 'json' };
import sites from '../data/agent-sites.json' with { type: 'json' };
import { CONSENT_VERSION, consentText } from './consent.mjs';

// The lead source Follow Up Boss (and Lead Claimer) shows for this site. huerkamphomegroup.com is a separate site with
// its own leads, so this site uses its own name (changed 2026-11-07; earlier leads from this site said
// huerkamphomegroup.com and are told apart by the "Website" tag, see PAST_SOURCES).
export const SOURCE = 'huerkamphomes.com';
export const PAST_SOURCES = ['huerkamphomegroup.com'];

// Agents who can be assigned leads from their agent site (licensed agents only, matched by page slug).
export const AGENTS = Object.fromEntries(team.members.filter((m) => /realtor|broker/i.test(m.title ?? ''))
  .map((m) => [m.profileUrl.split('/').pop(), { name: m.name, fubName: sites.agents[m.profileUrl.split('/').pop()]?.fubName ?? m.name }]));

// One entry per form (the form's data-lead attribute). `type` is the Follow Up Boss event type;
// `tags` are added to the person. Seller forms carry "Seller lead" so Fello can pick them up.
export const FORMS = {
  'home-value':        { type: 'Seller Inquiry',  label: 'Home value request',     tags: ['Seller lead', 'Home valuation'] },
  'cash-offer':        { type: 'Seller Inquiry',  label: 'Cash offer request',     tags: ['Seller lead', 'Cash offer'] },
  'expired':           { type: 'Seller Inquiry',  label: 'Expired listing second look', tags: ['Seller lead', 'Expired listing'] },
  'contact':           { type: 'General Inquiry', label: 'Contact form',           tags: [] },
  'home':              { type: 'General Inquiry', label: 'Home page form',         tags: [] },
  'community-alert':   { type: 'Property Search', label: 'New-listing alert',      tags: ['Buyer lead', 'Listing alert'] },
  'community-contact': { type: 'General Inquiry', label: 'Community page form',    tags: [] },
  'lake-homes':        { type: 'General Inquiry', label: 'Lake homes form',        tags: ['Lake homes'] },
  'new-construction':  { type: 'Property Search', label: 'New construction development form', tags: ['Buyer lead', 'New construction'] },
  // Brainerd lakes (and other lakes up north): monthly lake report sign-ups and questions. The lake name is added as a
  // tag from the form's "lake" field.
  'lake-report':       { type: 'General Inquiry', label: 'Monthly lake report sign-up', tags: ['Lake homes', 'Lake report', 'Cabin / lake owner'] },
  'north-lake':        { type: 'General Inquiry', label: 'Up-north lake home question', tags: ['Lake homes', 'Up north'] },
  'investing':         { type: 'General Inquiry', label: 'Investment form',        tags: ['Investor'] },
  'ramsey':            { type: 'General Inquiry', label: 'Ramsey ELP form',        tags: ['Ramsey ELP'] },
  'lender':            { type: 'General Inquiry', label: 'Lender request (Ken Rife)', tags: ['Buyer lead', 'Lender referral'] },
  'agent':             { type: 'General Inquiry', label: 'Agent page form',        tags: ['Agent page'] },
  'guide':             { type: 'General Inquiry', label: 'Area guide form',       tags: ['Area guide'] },
  'downsizing':        { type: 'Seller Inquiry',  label: 'Downsizing plan request', tags: ['Downsizing', 'Seller lead'] },
  'fsbo':              { type: 'Seller Inquiry',  label: 'FSBO second opinion',    tags: ['FSBO', 'Seller lead'] },
  'foreclosure':       { type: 'Seller Inquiry',  label: 'Short sale / foreclosure help', tags: ['Pre-foreclosure', 'Seller lead'] },
  'foreclosure-buyer': { type: 'General Inquiry', label: 'Foreclosure buyer form', tags: ['Buyer lead', 'Foreclosure buyer'] },
  'commute':           { type: 'Property Search', label: 'Commute page form',     tags: ['Buyer lead', 'Commute search'] },
  'compare':           { type: 'General Inquiry', label: 'Comparison page form',  tags: ['Comparing places'] },
  'listing':           { type: 'Property Inquiry', label: 'Listing page form',    tags: ['Buyer lead', 'Listing inquiry'] },
  'showing':           { type: 'Property Inquiry', label: 'Showing request',       tags: ['Buyer lead', 'Showing request'] },
  'favorite':          { type: 'Saved Property',   label: 'Hot buyer: saved a home (heart)', tags: ['Buyer lead', 'Saved home', 'Hot buyer', 'Hot: saved a home'] },
  // Hot-buyer signals from known visitors (src/scripts/hot.ts). `hot`: sent by email address only, so they never change
  // the person's name, phone, tags about consent or assigned agent in Follow Up Boss; no copy to the team inbox.
  'hot-return':        { type: 'Visited Website',  label: 'Hot buyer: back on the website after a week or more away', tags: ['Hot buyer', 'Hot: came back'], hot: true },
  'hot-repeat':        { type: 'Viewed Property',  label: 'Hot buyer: viewed the same home on 3 different days', tags: ['Hot buyer', 'Hot: repeat views'], hot: true },
  // Everyday browsing by known visitors (src/scripts/hot.ts), like Ylopo's activity feed: each home viewed (once per home
  // per day) and each search run on the map search (once per search per day), so the agent sees what the person is
  // looking at on their Follow Up Boss timeline. Same email-only rules as the hot signals; no tags beyond "Website".
  'activity-view':     { type: 'Viewed Property',  label: 'Viewed a home on the website', tags: [], hot: true },
  'activity-search':   { type: 'Property Search',  label: 'Searched for homes on the website', tags: [], hot: true },
  // Sharing a home (Share button, src/components/ShareHome.astro) is a buying signal, as in Ylopo: once per home per day.
  'hot-share':         { type: 'Viewed Property',  label: 'Hot buyer: shared a home', tags: ['Hot buyer', 'Hot: shared a home'], hot: true },
  'register':          { type: 'Registration',     label: 'Signed up to keep viewing homes', tags: ['Buyer lead', 'Website registration'] },
  'calc-seller':       { type: 'Seller Inquiry',  label: 'Net proceeds calculator', tags: ['Seller lead', 'Net proceeds calculator'] },
  'first-time-buyer':  { type: 'General Inquiry', label: 'First-time buyer guide form', tags: ['Buyer lead', 'First-time buyer'] },
  'seller-guide':      { type: 'Seller Inquiry',  label: 'Seller guide form',       tags: ['Seller lead', 'Seller guide'] },
  'buyer-guide':       { type: 'General Inquiry', label: 'Buyer guide form',        tags: ['Buyer lead', 'Buyer guide'] },
  'calc-buyer':        { type: 'General Inquiry', label: 'Affordability calculator', tags: ['Buyer lead', 'Affordability calculator'] },
  'calc-payoff':       { type: 'General Inquiry', label: 'Mortgage payoff calculator', tags: ['Homeowner', 'Mortgage payoff calculator'] },
  'calc-rentbuy':      { type: 'General Inquiry', label: 'Rent vs. buy calculator', tags: ['Buyer lead', 'Rent vs. buy calculator'] },
  'youtube':           { type: 'General Inquiry', label: 'YouTube viewer form',    tags: ['YouTube'], source: 'YouTube - Living in Minneapolis' },
  // Greater Minnesota towns outside the service area (/minnesota-homes-for-sale/<town>): referred to a local agent.
  'mn-referral':       { type: 'Property Search', label: 'Greater Minnesota: refer to a local agent', tags: ['Referral out', 'Greater Minnesota'] },
};

// Field names → readable labels for the note on the lead. Contact details are sent separately.
const LABELS = {
  address: 'Property address', zip: 'ZIP code', condition: 'Condition', homeType: 'Kind of home', beds: 'Bedrooms', baths: 'Bathrooms', sqft: 'Finished sq ft', timeline: 'Selling timeline', topic: 'Topic', goal: 'Goal',
  notes: 'Notes', message: 'Message', lake: 'Lake', priceRange: 'Price range', maxPrice: 'Price range',
  community: 'Community', ramseyReferral: 'Referred by Ramsey', interest: 'Interested in', moveFrom: 'Moving from', agent: 'Wants to work with', listing: 'Listing', guide: 'Guide', nextHome: 'Next home', helping: 'Asking for', calc: 'Calculator results', situation: 'Situation', savedSearch: 'Saved search', awayDays: 'Days since last visit', search: 'Search', searchUrl: 'Search link', shareMethod: 'Shared by', viewDays: 'Different days viewed this home', showingDay: 'Preferred day', showingTime: 'Preferred time', tourType: 'Tour type', saleDate: 'Sheriff’s sale or deadline',
};
const CONTACT = new Set(['firstName', 'lastName', 'email', 'phone']);

const clean = (v, max = 2000) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

// The home a listing-page lead asked about (Follow Up Boss shows it on the lead), or a seller's address.
const n = (v) => { const x = Number(String(v ?? '').replace(/[^0-9.]/g, '')); return Number.isFinite(x) && x > 0 ? x : undefined; };
function property(f, url) {
  if (f.propStreet) {
    return Object.fromEntries(Object.entries({
      street: f.propStreet, city: f.propCity, state: 'MN', code: f.propZip, mlsNumber: f.propMls,
      price: n(f.propPrice), bedrooms: n(f.propBeds), bathrooms: n(f.propBaths), area: n(f.propSqft),
      url,
    }).filter(([, v]) => v !== undefined && v !== ''));
  }
  return f.address ? { street: f.address } : null;
}

/**
 * input: { form, fields: {...}, page, title, hp, elapsed }
 * meta (from the server, not the browser): { at, ip, userAgent }
 * returns { event, consent } | { error } | { spam: true }; consent is the record to keep when the box was checked.
 */
export function buildEvent(input, meta = {}) {
  const { form, fields = {}, page = '', title = '', hp = '', elapsed = 0 } = input ?? {};
  // Honeypot filled in, or submitted faster than a person could type: a bot.
  if (clean(hp) || Number(elapsed) < 2500) return { spam: true };
  // Spam content: a link in a name, link markup anywhere, or a message stuffed with links. Real people don't.
  const LINK = /(https?:\/\/|www\.|\.(ru|cn|xyz|top|click|link)\b)/i;
  if (['firstName', 'lastName'].some((k) => LINK.test(String(fields[k] ?? '')))) return { spam: true };
  const all = Object.values(fields).map((v) => String(v ?? '')).join(' ');
  if (/<a\s+href|\[url=|\[link=/i.test(all)) return { spam: true };
  if ((all.match(/https?:\/\//gi) ?? []).length >= 3) return { spam: true };

  const cfg = FORMS[form];
  if (!cfg) return { error: 'Unknown form' };

  const f = Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, clean(v, k === 'message' || k === 'notes' || k === 'calc' ? 4000 : k === 'savedSearch' ? 1000 : 300)]));
  // Hot-buyer signals: matched to the existing person by email alone.
  if (cfg.hot) { delete f.firstName; delete f.lastName; delete f.phone; delete f.smsConsent; delete f.agentSlug; delete f.agent; delete f.community; }
  if (!cfg.hot && (!f.firstName || !f.lastName)) return { error: 'Name is required' };
  if (!isEmail(f.email)) return { error: 'A valid email is required' };

  // A goal or topic that mentions selling turns any form into a seller inquiry.
  const intent = `${f.goal ?? ''} ${f.topic ?? ''} ${f.interest ?? ''}`.toLowerCase();
  const sells = /sell/.test(intent);
  const buys = /buy/.test(intent);
  const type = cfg.type === 'General Inquiry' && sells ? 'Seller Inquiry' : cfg.type;

  const tags = new Set(['Website', ...cfg.tags]);
  if (sells) tags.add('Seller lead');
  if (buys) tags.add('Buyer lead');
  if (f.community) tags.add(f.community);
  if (f.agent) tags.add(`Asked for ${clean(f.agent, 60)}`);
  // From an agent's site (or a visitor who came through it): assign to that agent, credit the team.
  const agentSite = AGENTS[String(f.agentSlug ?? '').toLowerCase()];
  if (agentSite) { tags.add('Team lead'); tags.add(`Agent site: ${agentSite.name}`); }
  // Call/text consent is opt-in only (unchecked box on every form) and counts only with a phone number.
  // Follow Up Boss and Ylopo automations must only call or text people tagged "Call/text consent".
  const consented = f.smsConsent === 'yes' && (f.phone ?? '').replace(/\D/g, '').length >= 10;
  if (consented) { tags.add('Call/text consent'); tags.add('SMS consent'); }
  else if (f.phone) tags.add('No call/text consent');
  if (f.lake) tags.add(f.lake);
  // Test submissions are labeled so the team can find and delete them.
  if (/^test\b/i.test(f.firstName ?? '') || /@example\.(com|org)$/i.test(f.email)) tags.add('TEST – website');

  const at = meta.at ?? new Date().toISOString();
  const details = Object.entries(f)
    .filter(([k, v]) => v && !CONTACT.has(k) && LABELS[k])
    .map(([k, v]) => `${LABELS[k]}: ${v}`)
    .concat(consented ? [`Call/text consent: checked the box on ${at} for ${f.phone} (wording version ${CONSENT_VERSION}${meta.ip ? `, IP ${meta.ip}` : ''}): "${consentText()}"`] : [])
    .concat(!consented && f.phone ? ['No call/text consent: did not check the box. Personal replies only; no automated calls or texts.'] : [])
    .concat(agentSite ? [`Came through ${agentSite.name}'s agent site: assigned to ${agentSite.fubName}, team lead`] : []);
  const pageUrl = page ? `https://www.huerkamphomes.com${clean(page, 300)}` : undefined;
  const message = [`${cfg.label}${title ? ` on "${clean(title, 200)}"` : ''}`, ...details].join('\n');

  const event = {
    source: cfg.source ?? SOURCE,
    system: 'HuerkampHomeGroupWebsite',
    type,
    message,
    description: cfg.label,
    ...(pageUrl && { pageUrl, pageTitle: clean(title, 200) }),
    person: {
      ...(!cfg.hot && { firstName: f.firstName, lastName: f.lastName }),
      emails: [{ value: f.email }],
      ...(f.phone && { phones: [{ value: f.phone }] }),
      tags: [...tags],
      ...(agentSite && { assignedTo: agentSite.fubName }),
    },
    ...(property(f, pageUrl) && { property: property(f, pageUrl) }),
  };
  const consent = consented ? {
    at, version: CONSENT_VERSION, text: consentText(), phone: f.phone, email: f.email, name: `${f.firstName} ${f.lastName}`,
    form, page: pageUrl ?? null, ip: meta.ip ?? null, userAgent: clean(meta.userAgent, 300) || null,
  } : null;
  return { event, consent };
}
