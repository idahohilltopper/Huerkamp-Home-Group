import SiteHeader from '../SiteHeader';
import SiteFooter from '../SiteFooter';
import { LISTINGS, money } from './data';

export const metadata = { title: 'Homes for sale', robots: { index: false, follow: false }, alternates: { canonical: '/homes' } };

export default function Homes() {
  return (
    <>
      <SiteHeader />
      <div className="lst-sample">Sample listings for design review. Not real homes.</div>
      <div className="lst-wrap">
        <h1 className="lst-h1">Homes for sale</h1>
        <div className="lst-cards">
          {LISTINGS.map((l) => (
            <a key={l.id} className="lst-card" href={`/homes/${l.id}`}>
              <div className="ph">Sample photo<span className="lst-chip">{l.tag}</span></div>
              <p className="p">{money(l.price)}</p>
              <p>{l.beds} bd | {l.baths} ba | {l.sqft.toLocaleString()} sqft · {l.type}</p>
              <p className="a">{l.address}, {l.city}, {l.state} {l.zip}</p>
              <p className="s">{l.source}</p>
            </a>
          ))}
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
