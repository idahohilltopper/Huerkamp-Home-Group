// Turns a website form submission into a Follow Up Boss event.
// Used by netlify/functions/lead.mjs; kept separate so it can be tested without sending anything.

import team from '../data/team.json' with { type: 'json' };
import sites from '../data/agent-sites.json' with { type: 'json' };

export const SOURCE = 'huerkamphomegroup.com';

// Agents who can be assigned leads from their agent site (licensed agents only, matched by page slug).
export const AGENTS = Object.fromEntries(team.members.filter((m) => /realtor|broker/i.test(m.title ?? ''))
  .map((m) => [m.profileUrl.split('/').pop(), { name: m.name, fubName: sites.agents[m.profileUrl.split('/').pop()]?.fubName ?? m.name }]));

// One entry per form (the form's data-lead attribute). `type` is the Follow Up Boss event type;
// `tags` are added to the person. Seller forms carry "Seller lead" so Fello can pick them up.
export const FORMS = {
  'home-value':        { type: 'Seller Inquiry',  label: 'Home value request',     tags: ['Seller lead', 'Home valuation'] },
  'cash-offer':        { type: 'Seller Inquiry',  label: 'Cash offer request',     tags: ['Seller lead', 'Cash offer'] },
  'contact':           { type: 'General Inquiry', label: 'Contact form',           tags: [] },
  'home':              { type: 'General Inquiry', label: 'Home page form',         tags: [] },
  'community-alert':   { type: 'Property Search', label: 'New-listing alert',      tags: ['Buyer lead', 'Listing alert'] },
  'community-contact': { type: 'General Inquiry', label: 'Community page form',    tags: [] },
  'lake-homes':        { type: 'General Inquiry', label: 'Lake homes form',        tags: ['Lake homes'] },
  'investing':         { type: 'General Inquiry', label: 'Investment form',        tags: ['Investor'] },
  'ramsey':            { type: 'General Inquiry', label: 'Ramsey ELP form',        tags: ['Ramsey ELP'] },
  'lender':            { type: 'General Inquiry', label: 'Lender request (Ken Rife)', tags: ['Buyer lead', 'Lender referral'] },
  'agent':             { type: 'General Inquiry', label: 'Agent page form',        tags: ['Agent page'] },
  'guide':             { type: 'General Inquiry', label: 'Area guide form',       tags: ['Area guide'] },
  'compare':           { type: 'General Inquiry', label: 'Comparison page form',  tags: ['Comparing places'] },
  'listing':           { type: 'Property Inquiry', label: 'Listing page form',    tags: ['Buyer lead', 'Listing inquiry'] },
  'youtube':           { type: 'General Inquiry', label: 'YouTube viewer form',    tags: ['YouTube'], source: 'YouTube - Living in Minneapolis' },
};

// Field names → readable labels for the note on the lead. Contact details are sent separately.
const LABELS = {
  address: 'Property address', timeline: 'Selling timeline', topic: 'Topic', goal: 'Goal',
  notes: 'Notes', message: 'Message', lake: 'Lake', priceRange: 'Price range', maxPrice: 'Price range',
  community: 'Community', ramseyReferral: 'Referred by Ramsey', interest: 'Interested in', moveFrom: 'Moving from', agent: 'Wants to work with', listing: 'Listing', guide: 'Guide',
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
 * returns { event } | { error } | { spam: true }
 */
export function buildEvent(input) {
  const { form, fields = {}, page = '', title = '', hp = '', elapsed = 0 } = input ?? {};
  // Honeypot filled in, or submitted faster than a person could type: a bot.
  if (clean(hp) || Number(elapsed) < 2500) return { spam: true };

  const cfg = FORMS[form];
  if (!cfg) return { error: 'Unknown form' };

  const f = Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, clean(v, k === 'message' || k === 'notes' ? 4000 : 300)]));
  if (!f.firstName || !f.lastName) return { error: 'Name is required' };
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
  // Text-message consent is opt-in only (unchecked box on every form).
  if (f.smsConsent === 'yes') tags.add('SMS consent');
  if (f.lake) tags.add(f.lake);
  // Test submissions are labeled so the team can find and delete them.
  if (/^test\b/i.test(f.firstName) || /@example\.(com|org)$/i.test(f.email)) tags.add('TEST – website');

  const details = Object.entries(f)
    .filter(([k, v]) => v && !CONTACT.has(k) && LABELS[k])
    .map(([k, v]) => `${LABELS[k]}: ${v}`)
    .concat(f.smsConsent === 'yes' ? ['Agreed to receive text messages (website checkbox)'] : [])
    .concat(agentSite ? [`Came through ${agentSite.name}'s agent site: assigned to ${agentSite.fubName}, team lead`] : []);
  const pageUrl = page ? `https://www.huerkamphomegroup.com${clean(page, 300)}` : undefined;
  const message = [`${cfg.label}${title ? ` on "${clean(title, 200)}"` : ''}`, ...details].join('\n');

  const event = {
    source: cfg.source ?? SOURCE,
    system: 'HuerkampHomeGroupWebsite',
    type,
    message,
    description: cfg.label,
    ...(pageUrl && { pageUrl, pageTitle: clean(title, 200) }),
    person: {
      firstName: f.firstName,
      lastName: f.lastName,
      emails: [{ value: f.email }],
      ...(f.phone && { phones: [{ value: f.phone }] }),
      tags: [...tags],
      ...(agentSite && { assignedTo: agentSite.fubName }),
    },
    ...(property(f, pageUrl) && { property: property(f, pageUrl) }),
  };
  return { event };
}
