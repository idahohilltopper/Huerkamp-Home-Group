import { notFound } from 'next/navigation';
import SiteHeader from '../../SiteHeader';
import SiteFooter from '../../SiteFooter';
import Gallery from './Gallery';
import Calculator from './Calculator';
import TourCard from './TourCard';
import ShowMore from './ShowMore';
import { LISTINGS, money, payment } from '../data';

export const dynamicParams = false;
export function generateStaticParams() { return LISTINGS.map((l) => ({ id: l.id })); }

export async function generateMetadata({ params }) {
  const { id } = await params;
  const l = LISTINGS.find((x) => x.id === id);
  if (!l) return {};
  return {
    title: `${l.address}, ${l.city}, ${l.state} ${l.zip}`,
    description: `${l.beds} bed, ${l.baths} bath, ${l.sqft.toLocaleString()} sqft home for sale in ${l.city}, ${l.state}.`,
    robots: { index: !l.sample, follow: !l.sample },
    alternates: { canonical: `/homes/${l.id}` },
  };
}

export default async function Listing({ params }) {
  const { id } = await params;
  const l = LISTINGS.find((x) => x.id === id);
  if (!l) notFound();
  const est = payment({ price: l.price, taxAnnual: l.taxAnnual, insuranceAnnual: l.insuranceAnnual, hoa: l.hoa || 0 });
  const full = `${l.address}, ${l.city}, ${l.state} ${l.zip}`;
  const tiles = [['Type', l.type], ['Built', 'Built in ' + l.year], ['Lot', l.lot], ['Price per sqft', money(l.price / l.sqft)], ['HOA', l.hoa ? money(l.hoa) + '/mo' : 'No HOA listed'], ['Days on market', String(l.daysOn)]];
  return (
    <>
      <SiteHeader />
      {l.sample && <div className="lst-sample">Sample listing for design review. Not a real home and not for sale.</div>}
      <div className="lst-wrap">
        <a className="lst-back" href="/homes">‹ Back to search</a>
        <Gallery count={8} status={l.status} />
        <nav className="lst-tabs" aria-label="Listing sections">
          <a href="#overview">Overview</a><a href="#facts">Facts and features</a><a href="#value">Market value</a><a href="#payment">Payment calculator</a><a href="#neighborhood">Neighborhood</a>
        </nav>
        <div className="lst-grid">
          <main>
            <section id="overview" className="lst-sec">
              <div className="lst-head">
                <div><p className="lst-price">{money(l.price)}</p><p className="lst-addr">{full}</p></div>
                <dl className="lst-nums"><div><dt>beds</dt><dd>{l.beds}</dd></div><div><dt>baths</dt><dd>{l.baths}</dd></div><div><dt>sqft</dt><dd>{l.sqft.toLocaleString()}</dd></div></dl>
              </div>
              <p className="lst-est">Est. <b>{money(est.total)}/mo</b> <a href="#payment">Adjust payment</a> <a href="/apply" className="pq">Talk to a lender</a></p>
              <div className="lst-tiles">{tiles.map(([k, v]) => <div key={k}><small>{k}</small><b>{v}</b></div>)}</div>
              <h2>What&apos;s special</h2>
              <span className="lst-chip">{l.tag}</span>
              <ShowMore text={l.description} />
              <p className="lst-meta"><b>{l.daysOn} days</b> on market · <b>{l.views}</b> views · <b>{l.saves}</b> saves</p>
              <p className="lst-fine">Listing updated: {l.updated}<br />Listed by: {l.listedBy}<br />Source: {l.source}, MLS#: {l.mls}</p>
              <div className="lst-map" role="img" aria-label="Map placeholder"><span>Map placeholder: connect a map provider and real coordinates</span></div>
            </section>

            <section className="lst-callout">
              <div><h3>Curious what you can afford?</h3><p>Talk to one of our preferred lenders and get pre-approved, or estimate your budget with the payment calculator below.</p></div>
              <a className="btn" href="#payment">Calculate now</a>
            </section>

            <section className="lst-sec">
              <h2>Make a strong offer</h2>
              <p>Every home and every market is different. An HHG agent will pull recent nearby sales, explain the seller&apos;s likely position, and help you decide price, terms and timing before you write an offer.</p>
              <a className="btn" href="/apply">Talk offer strategy with an agent</a>
            </section>

            <section id="facts" className="lst-sec">
              <h2>Facts and features</h2>
              {Object.entries(l.facts).map(([group, blocks]) => (
                <details key={group} className="lst-fact" open={group === 'Interior'}>
                  <summary>{group}</summary>
                  <div className="lst-cols">
                    {blocks.map(([h, items]) => (<div key={h}><h4>{h}</h4><ul>{items.map((i) => <li key={i}>{i}</li>)}</ul></div>))}
                  </div>
                </details>
              ))}
            </section>

            <section id="value" className="lst-sec">
              <h2>Estimated market value</h2>
              <div className="lst-val">
                <div><small>Our value opinion</small><b>Free from an agent</b></div>
                <div><small>List price</small><b>{money(l.price)}</b></div>
                <div><small>Price per sqft</small><b>{money(l.price / l.sqft)}</b></div>
              </div>
              <p className="lst-fine">Automated estimates can miss condition and updates. For a real number, ask for a free comparative market analysis from an HHG agent.</p>

              <h2>Price history</h2>
              <div className="lst-tablewrap"><table className="lst-table"><thead><tr><th>Date</th><th>Event</th><th>Price</th></tr></thead><tbody>
                {l.priceHistory.map(([d, e, p]) => (<tr key={d + e}><td>{d}</td><td><b>{e}</b></td><td>{money(p)}<small>{money(p / l.sqft)}/sqft</small></td></tr>))}
              </tbody></table></div>
              <p className="lst-fine">Source: {l.source} #{l.mls}</p>

              <h2>Public tax history</h2>
              {l.taxHistory.length ? (
                <div className="lst-tablewrap"><table className="lst-table"><thead><tr><th>Year</th><th>Property taxes</th><th>Tax assessment</th></tr></thead><tbody>
                  {l.taxHistory.map(([y, t, a]) => (<tr key={y}><td>{y}</td><td>{money(t)}</td><td>{money(a)}</td></tr>))}
                </tbody></table></div>
              ) : <p>Tax history is unavailable.</p>}
            </section>

            <section id="payment" className="lst-sec">
              <h2>Payment calculator</h2>
              <Calculator price={l.price} taxAnnual={l.taxAnnual} insuranceAnnual={l.insuranceAnnual} hoa={l.hoa} />
            </section>

            <section id="neighborhood" className="lst-sec">
              <h2>Neighborhood</h2>
              <div className="lst-maptabs" aria-hidden="true"><span className="on">Lot lines</span><span>Road</span><span>Satellite</span></div>
              <div className="lst-map" role="img" aria-label="Neighborhood map placeholder"><span>Map placeholder: connect a map provider (lot lines, road and satellite views)</span></div>
              <h3>Getting around</h3>
              <p className="lst-fine">Walk, transit and bike scores appear here when a walkability data source is connected.</p>
              <h3>Nearby schools</h3>
              {l.schools.length ? (
                <div className="lst-schcards">{l.schools.map(([n, g, t]) => <div key={n}><b>{n}</b><small>Grades {g} · {t}</small><span className="rt">Rating<br />not connected</span></div>)}</div>
              ) : <p>School information will appear here when a data source is connected.</p>}
              <p className="lst-fine">Confirm school assignment with the district. Information is deemed reliable but not guaranteed.</p>
            </section>

            <section className="lst-sec">
              <h2>Nearby homes</h2>
              <div className="lst-cards">
                {LISTINGS.filter((x) => x.id !== l.id).map((x) => (
                  <a key={x.id} className="lst-card" href={`/homes/${x.id}`}>
                    <div className="ph">Sample photo</div>
                    <p className="p">{money(x.price)}</p>
                    <p>{x.beds} bd | {x.baths} ba | {x.sqft.toLocaleString()} sqft</p>
                    <p className="a">{x.address}, {x.city}, {x.state}</p>
                  </a>
                ))}
              </div>
            </section>
          </main>
          <aside className="lst-side"><TourCard address={full} /><a className="btn ghost-dark lst-contact" href="/apply">Contact an agent</a></aside>
        </div>
        <p className="lst-legal">Equal Housing Opportunity. Listing information is deemed reliable but not guaranteed. {l.sample ? 'Sample data for design review.' : ''}</p>
      </div>
      <SiteFooter />
    </>
  );
}
