import Link from 'next/link';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import ApplySection from './ApplySection';

const badges = ['#1 realtor.com lead purchaser in the Twin Cities', 'Zillow Preferred team', '100% free to apply', 'Reply within 1 business day', 'Confidential conversation'];

const matchCards = [
  { who: 'You', tag: 'Ambitious agent', rows: [['Looking for', 'Leads · Training · Culture'], ['Goal', 'Close more deals'], ['Style', 'Collaborative']] },
  { who: 'Huerkamp Home Group', tag: 'Keller Williams team', rows: [['Founded', '2002'], ['Team', '~30 agents'], ['Volume', '~500 homes / year']] },
];

const explore = [
  ['/why-hhg', 'Why HHG', 'Leads, coaching, a Client Care Manager, a showing partner and more.'],
  ['/our-team', 'Our team', 'Meet the people, the community work, and life at HHG.'],
  ['/value', 'Your value', 'See what the team provides and what it is worth.'],
  ['/how-it-works', 'How it works', 'From hello to closing in five steps.'],
  ['/faq', 'FAQ', 'Licensing, cost, location, and how fast we reply.'],
];

export default function Home() {
  return (
    <>
      <SiteHeader />

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Now recruiting agents</p>
          <h1>Get matched with <em>a team</em> that helps you close more deals.</h1>
          <p className="sub">Tell us what you want in a team: leads, training, culture, support. We&apos;ll show you how Huerkamp Home Group delivers it.</p>
          <div className="cta-row">
            <a href="/apply" className="btn">See my match</a>
            <a href="/how-it-works" className="btn ghost">How it works</a>
          </div>
          <ul className="badges">{badges.map((b) => <li key={b}>✓ {b}</li>)}</ul>
        </div>
        <div className="hero-cards" aria-hidden="true">
          {matchCards.map((c, i) => (
            <div className={'pcard' + (i ? ' b' : '')} key={c.who}>
              <div className="pcard-h"><strong>{c.who}</strong><span>{c.tag}</span></div>
              {c.rows.map(([k, v]) => <p key={k}><span>{k}</span>{v}</p>)}
            </div>
          ))}
          <div className="match">Great match</div>
        </div>
      </section>

      <div className="strip">Keller Williams Preferred Realty · Burnsville, MN · Serving the Twin Cities since 2002</div>

      <section className="section">
        <p className="eyebrow dark">Explore</p>
        <h2>Everything you need to build a business</h2>
        <p className="sub">No searching. No cold calls. Just a team built to help you win.</p>
        <div className="grid">
          {explore.map(([href, t, d]) => (
            <Link className="card tile" key={href} href={href}><h3>{t}</h3><p>{d}</p><span className="more">Learn more →</span></Link>
          ))}
        </div>
      </section>

      <ApplySection />
      <SiteFooter />
    </>
  );
}
