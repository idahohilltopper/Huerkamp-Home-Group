// Tests for the county records lookup on /home-estimate (src/lib/public-record.mjs, netlify/functions/public-record.mjs).
// Run: npm test   (no network: the Census geocoder and Repliers are replaced by made-up answers)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normStreet, normUnit, splitUnit, sales, pickParcel, publicView } from '../src/lib/public-record.mjs';
import handler from '../netlify/functions/public-record.mjs';

test('normStreet: county style, units dropped', () => {
  assert.equal(normStreet('14300 Nicollet Court'), '14300 NICOLLET CT');
  assert.equal(normStreet('13000 Nicollet Avenue South, Burnsville, MN'), '13000 NICOLLET AVE S');
  assert.equal(normStreet('1500 Main St #204'), '1500 MAIN ST');
  assert.equal(normStreet('1500 Main Street Unit 204'), '1500 MAIN ST');
  assert.equal(normStreet('100 County Road 42 West'), '100 COUNTY RD 42 W');
  assert.equal(normStreet(null), '');
});

test('normUnit and splitUnit: the unit a visitor types', () => {
  assert.equal(normUnit('#0204'), '204');
  assert.equal(normUnit('3b'), '3B');
  assert.equal(normUnit('0'), '0');
  assert.equal(normUnit(undefined), '');
  assert.deepEqual(splitUnit('1500 Main St #204, Burnsville'), { street: '1500 Main St, Burnsville', unit: '204' });
  assert.deepEqual(splitUnit('1500 Main St Unit 0204'), { street: '1500 Main St', unit: '204' });
  assert.deepEqual(splitUnit('1500 Main St Apt. 3B'), { street: '1500 Main St', unit: '3B' });
  assert.deepEqual(splitUnit('14300 Nicollet Ct'), { street: '14300 Nicollet Ct', unit: '' });
  assert.deepEqual(splitUnit(''), { street: '', unit: '' });
});

test('sales: last and prior sale, prices only', () => {
  const pr = { purchasePrice: '$335,000', purchaseSaleDate: '20120924', pastPriceSale: '210000', priorSalesDate: '20040115', ownerName: 'SMITH JOHN' };
  assert.deepEqual(sales(pr), { last: { price: 335000, date: '2012-09-24' }, prior: { price: 210000, date: '2004-01-15' } });
  // Falls back to the transfer fields when the purchase fields are blank.
  assert.deepEqual(sales({ salePriceLastTransfer: '400000', transferSaleDate: '20210601' }).last, { price: 400000, date: '2021-06-01' });
  // $1 deeds, bad dates and a "prior" sale that isn't older are ignored.
  assert.equal(sales({ purchasePrice: '1', purchaseSaleDate: '20120924' }).last, null);
  assert.equal(sales({ purchasePrice: '300000', purchaseSaleDate: '2012-09-24' }).last, null);
  assert.equal(sales({ purchasePrice: '300000', purchaseSaleDate: '20120924', pastPriceSale: '250000', priorSalesDate: '20150101' }).prior, null);
  assert.deepEqual(sales(), { last: null, prior: null });
});

const parcel = (streetAddress, extra = {}) => ({ address: { streetAddress, ...extra.address }, publicRecord: extra.publicRecord ?? {} });

test('pickParcel: house, exact street match only', () => {
  const a = parcel('14300 NICOLLET CT'), b = parcel('14302 NICOLLET CT');
  assert.equal(pickParcel([a, b], '14300 Nicollet Court'), a);
  assert.equal(pickParcel([a, b], '14304 Nicollet Court'), null);
  assert.equal(pickParcel([a], 'Nicollet Court'), null); // no house number
  assert.equal(pickParcel(null, '14300 Nicollet Court'), null);
});

test('pickParcel: condos and townhomes pick the unit', () => {
  const u1 = parcel('1500 MAIN ST UNIT 101'), u2 = parcel('1500 MAIN ST UNIT 204'), u3 = parcel('1500 MAIN ST', { address: { unitNumber: '0305' } });
  assert.equal(pickParcel([u1, u2, u3], '1500 Main St', '204'), u2);
  assert.equal(pickParcel([u1, u2, u3], '1500 Main St', '305'), u3); // from the unitNumber field
  assert.equal(pickParcel([u1, u2, u3], '1500 Main St', '999'), null); // unit not on file
  assert.equal(pickParcel([u1, u2, u3], '1500 Main St'), null); // no unit typed: can't tell them apart
  assert.equal(pickParcel([u1], '1500 Main St', '204'), null); // the only record is a different unit
  // A building filed as one parcel with no units still matches, unit or not.
  const whole = parcel('1500 MAIN ST');
  assert.equal(pickParcel([whole], '1500 Main St', '204'), whole);
  assert.equal(pickParcel([whole, parcel('1500 MAIN ST')], '1500 Main St', '204'), null);
});

test('publicView: never passes owner names or tax data on', () => {
  const v = publicView({ publicRecord: { purchasePrice: '335000', purchaseSaleDate: '20120924', ownerName: 'SMITH JOHN', taxId: '02-123', legalDescription: 'LOT 1' } });
  assert.deepEqual(v, { ok: true, last: { price: 335000, date: '2012-09-24' }, prior: null, source: 'Public Record Data' });
  assert.deepEqual(publicView({ publicRecord: {} }), { ok: false, error: 'no-sale' });
  assert.deepEqual(publicView(undefined), { ok: false, error: 'no-sale' });
});

// The Netlify function, with the Census geocoder and Repliers replaced by made-up answers.
const census = (street) => async (url) => {
  census.last = new URL(url).searchParams.get('address');
  return { ok: true, json: async () => ({ result: { addressMatches: street ? [{ matchedAddress: `${street}, BURNSVILLE, MN, 55337`, coordinates: { x: -93.28, y: 44.77 }, addressComponents: { state: 'MN', city: 'BURNSVILLE', zip: '55337' } }] : [] } }) };
};
const repliers = (locations) => async (_key, path, params) => { repliers.last = { path, params }; return { data: { locations } }; };
const ask = (qs, deps, init) => handler(new Request(`http://localhost/api/public-record?${qs}`, init), {}, deps).then(async (r) => ({ status: r.status, body: await r.json(), cache: r.headers.get('cache-control') }));

test('GET /api/public-record: a house', async () => {
  process.env.REPLIERS_API_KEY = 'test-key';
  const home = parcel('13000 NICOLLET AVE', { publicRecord: { purchasePrice: '335000', purchaseSaleDate: '20120924', ownerName: 'SMITH JOHN' } });
  const r = await ask('address=13000+Nicollet+Ave&zip=55337', { fetcher: census('13000 NICOLLET AVE'), call: repliers([home, parcel('13002 NICOLLET AVE')]) });
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, { ok: true, last: { price: 335000, date: '2012-09-24' }, prior: null, source: 'Public Record Data' });
  assert.match(r.cache, /max-age=86400/);
  assert.equal(repliers.last.path, '/locations');
  assert.equal(repliers.last.params.source, 'PublicRecord');
  assert.doesNotMatch(JSON.stringify(r.body), /SMITH/);
});

test('GET /api/public-record: a condo unit, with the unit kept away from the Census lookup', async () => {
  process.env.REPLIERS_API_KEY = 'test-key';
  const sold = (p, d) => ({ publicRecord: { purchasePrice: p, purchaseSaleDate: d } });
  const units = [parcel('1500 MAIN ST UNIT 101', sold('180000', '20190301')), parcel('1500 MAIN ST UNIT 204', sold('215000', '20210815'))];
  const r = await ask('address=1500+Main+St+%23204&zip=55337', { fetcher: census('1500 MAIN ST'), call: repliers(units) });
  assert.equal(census.last, '1500 Main St 55337');
  assert.deepEqual(r.body.last, { price: 215000, date: '2021-08-15' });
  const none = await ask('address=1500+Main+St&zip=55337', { fetcher: census('1500 MAIN ST'), call: repliers(units) });
  assert.deepEqual(none.body, { ok: false, error: 'not-found' });
});

test('GET /api/public-record: errors stay quiet', async () => {
  process.env.REPLIERS_API_KEY = 'test-key';
  const deps = { fetcher: census('13000 NICOLLET AVE'), call: repliers([]) };
  assert.equal((await ask('address=Burnsville', deps)).status, 400);
  assert.deepEqual((await ask('address=13000+Nicollet+Ave', { ...deps, fetcher: census(null) })).body, { ok: false, error: 'not-found' });
  const down = await ask('address=13000+Nicollet+Ave', { ...deps, call: async () => ({ status: 500 }) });
  assert.deepEqual([down.status, down.body], [502, { ok: false, error: 'lookup-failed' }]);
  assert.equal((await ask('address=13000+Nicollet+Ave', deps, { headers: { origin: 'https://evil.example' } })).status, 403);
  assert.equal((await ask('address=13000+Nicollet+Ave', deps, { method: 'POST' })).status, 405);
  delete process.env.REPLIERS_API_KEY;
  assert.equal((await ask('address=13000+Nicollet+Ave', deps)).status, 503);
});
