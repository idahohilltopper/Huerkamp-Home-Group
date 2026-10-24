// Turns a website form submission into a Follow Up Boss event.
// Used by netlify/functions/lead.mjs; kept separate so it can be tested without sending anything.

export const SOURCE = 'huerkamphomegroup.com';

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
};

// Field names → readable labels for the note on the lead. Contact details are sent separately.
const LABELS = {
  address: 'Property address', timeline: 'Selling timeline', topic: 'Topic', goal: 'Goal',
  notes: 'Notes', message: 'Message', lake: 'Lake', priceRange: 'Price range', maxPrice: 'Price range',
  community: 'Community', ramseyReferral: 'Referred by Ramsey',
};
const CONTACT = new Set(['firstName', 'lastName', 'email', 'phone']);

const clean = (v, max = 2000) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

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
  const intent = `${f.goal ?? ''} ${f.topic ?? ''}`.toLowerCase();
  const sells = /sell/.test(intent);
  const buys = /buy/.test(intent);
  const type = cfg.type === 'General Inquiry' && sells ? 'Seller Inquiry' : cfg.type;

  const tags = new Set(['Website', ...cfg.tags]);
  if (sells) tags.add('Seller lead');
  if (buys) tags.add('Buyer lead');
  if (f.community) tags.add(f.community);
  if (f.lake) tags.add(f.lake);
  // Test submissions are labeled so the team can find and delete them.
  if (/^test\b/i.test(f.firstName) || /@example\.(com|org)$/i.test(f.email)) tags.add('TEST – website');

  const details = Object.entries(f)
    .filter(([k, v]) => v && !CONTACT.has(k) && LABELS[k])
    .map(([k, v]) => `${LABELS[k]}: ${v}`);
  const pageUrl = page ? `https://www.huerkamphomegroup.com${clean(page, 300)}` : undefined;
  const message = [`${cfg.label}${title ? ` on "${clean(title, 200)}"` : ''}`, ...details].join('\n');

  const event = {
    source: SOURCE,
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
    },
    ...(f.address && { property: { street: f.address } }),
  };
  return { event };
}
