import SiteHeader from '../SiteHeader';
import SiteFooter from '../SiteFooter';
import PageHero from '../PageHero';
import ApplySection from '../ApplySection';
import JsonLd from '../JsonLd';
import { SITE, CITIES, breadcrumbs } from '../seo';

export const metadata = {
  title: 'Real Estate Agent Jobs, Twin Cities',
  description: 'Now hiring real estate agents in Minneapolis and St. Paul. Huerkamp Home Group offers leads, coaching, and an income guarantee. Licensed or getting licensed.',
  alternates: { canonical: '/real-estate-agent-jobs-twin-cities' },
};

const jobPosting = {
  '@context': 'https://schema.org',
  '@type': 'JobPosting',
  title: 'Real Estate Agent (Licensed or Getting Licensed)',
  description:
    '<p>Huerkamp Home Group, a Keller Williams Preferred Realty team in Burnsville, MN, is looking for real estate agents across the Twin Cities. We talk with licensed agents, agents in the licensing process, and people curious about the career.</p>' +
    '<p>What you get: team-provided leads, weekly coaching 46 weeks a year, a Client Care Manager, a showing partner, weekly accountability meetings, and a $150,000 income guarantee for full-time agents who meet the requirements (terms and conditions apply).</p>' +
    '<p>Apply for free at ' + SITE + '/apply. It is confidential and there is no obligation.</p>',
  datePosted: '2026-11-08',
  industry: 'Real Estate',
  occupationalCategory: '41-9022.00',
  directApply: true,
  identifier: { '@type': 'PropertyValue', name: 'Huerkamp Home Group', value: 'HHG-AGENT' },
  hiringOrganization: { '@type': 'Organization', name: 'Huerkamp Home Group', sameAs: SITE, logo: SITE + '/hhg-logo.png' },
  jobLocation: {
    '@type': 'Place',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '14300 Nicollet Ct, Suite 208',
      addressLocality: 'Burnsville',
      addressRegion: 'MN',
      postalCode: '55306',
      addressCountry: 'US',
    },
  },
};

const get = [
  ['Leads', 'Team-provided buyer and seller leads, so you spend your time working them, not buying them.'],
  ['Coaching', 'Weekly coaching 46 weeks a year, plus a weekly accountability meeting.'],
  ['Support', 'A Client Care Manager and a showing partner who gives you time back with buyers.'],
  ['Income*', 'A $150,000 income guarantee for full-time agents who meet the requirements.'],
  ['Extra earnings*', 'Agent+ with Mutual of Omaha Mortgage and a matching 401(k) for licensed loan officers.'],
  ['A $5,000 bonus*', 'The agent recruiting bonus applies to you if you join, and to anyone you bring on.'],
];
const who = [
  'Licensed Minnesota real estate agents ready for a better team',
  'Agents who are in the licensing process',
  'People curious about a real estate career, with or without experience',
];

export default function AgentJobs() {
  return (
    <>
      <JsonLd data={jobPosting} />
      <JsonLd data={breadcrumbs([['Home', '/'], ['Real estate agent jobs in the Twin Cities', '/real-estate-agent-jobs-twin-cities']])} />
      <SiteHeader />
      <PageHero eyebrow="Now hiring" title="Real estate agent jobs in the Twin Cities">
        Huerkamp Home Group, a Keller Williams Preferred Realty team in Burnsville, is bringing on agents across Minneapolis, St. Paul, and the south metro.
      </PageHero>

      <section className="section">
        <p className="eyebrow dark">Who we are looking for</p>
        <h2>Licensed or getting licensed, we want to talk</h2>
        <ul className="plain narrow-list">{who.map((x) => <li key={x}>{x}</li>)}</ul>
      </section>

      <section className="section alt">
        <p className="eyebrow dark">What you get</p>
        <h2>Everything you need to build a business</h2>
        <div className="grid">
          {get.map(([t, d]) => (<div className="card" key={t}><h3>{t}</h3><p>{d}</p></div>))}
        </div>
        <p className="fine-print">*Terms and conditions apply. <a href="/terms">Read the terms.</a></p>
      </section>

      <section className="section">
        <p className="eyebrow dark">Where you will work</p>
        <h2>Based in Burnsville, serving the Twin Cities</h2>
        <p className="sub">Our market includes {CITIES.join(', ')}, and the rest of the Twin Cities.</p>
        <p className="sub">Not sure it is for you? Take the free <a href="/real-estate-career-quiz">career quiz</a>. Not licensed yet? Read how to <a href="/become-a-real-estate-agent-minnesota">become a real estate agent in Minnesota</a>. Comparing teams? See <a href="/join-a-real-estate-team-twin-cities">how to join a real estate team</a> and our <a href="/real-estate-coaching-training-twin-cities">coaching and training</a>.</p>
      </section>

      <ApplySection />
      <SiteFooter />
    </>
  );
}
