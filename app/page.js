import Link from 'next/link';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import ApplySection from './ApplySection';
import Stats from './Stats';
import YouTubeBanner from './YouTubeBanner';

const badges = ['#1 Keller Williams team in the North Central region', '#1 realtor.com lead purchaser in the Twin Cities', 'Zillow Preferred team', '100% free to apply', 'Reply within 1 business day', 'Confidential conversation'];

const matchCards = [
  { who: 'You', tag: 'Ambitious agent', rows: [['Looking for', 'Leads · Training · Culture'], ['Goal', 'Close more deals'], ['Style', 'Collaborative']] },
  { who: 'Huerkamp Home Group', tag: 'Keller Williams team', rows: [['Founded', '2002'], ['Volume', '$190M / year'], ['Units', '520 / year']] },
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

      <div className="strip">#1 Keller Williams team in the North Central region · Burnsville, MN · Serving the Twin Cities since 2002</div>

      <Stats />

      <YouTubeBanner />

      <section className="section proof">
        <p className="eyebrow dark">Productive. And fun.</p>
        <h2>We get things done, and we enjoy every minute</h2>
        <p className="sub">$190 million in volume and 520 units a year, with a team that plans together, works together, and celebrates together.</p>
        <div className="gallery">
          {[
            ['/team-photo.jpg', 'Our team at our annual planning retreat', 'tall'],
            ['/life-lake.jpg', 'Team getaway at the lake', ''],
            ['/life-night.jpg', 'Team night out', ''],
          ].map(([src, cap, cls]) => (
            <figure key={src} className={cls}><img src={src} alt={cap} loading="lazy" /><figcaption>{cap}</figcaption></figure>
          ))}
        </div>
        <Link href="/our-team" className="btn">See more of the team</Link>
      </section>

      <section className="section">
        <p className="eyebrow dark">Explore</p>
        <h2>Everything you need to build a business</h2>
        <p className="sub">A team built to help you win, with real systems behind it.</p>
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
