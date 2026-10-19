import SiteHeader from '../SiteHeader';
import SiteFooter from '../SiteFooter';
import PageHero from '../PageHero';
import ApplySection from '../ApplySection';
import PerkCards from '../PerkCards';

export const metadata = { title: 'Why HHG | Huerkamp Home Group', description: 'Everything you need to build a real estate business with Huerkamp Home Group.' };

const free = ['Free to apply', 'Confidential conversation', 'Honest look at how we work', 'Shadow the team before you decide', 'Weekly coaching from former MAPS coaches', 'A showing partner to give you time back with buyers', 'Leads, marketing and a Client Care Manager'];

export default function WhyHHG() {
  return (
    <>
      <SiteHeader />
      <PageHero eyebrow="Why HHG" title="Everything you need to build a business">
        No searching. No cold calls. Just a team built to help you win. Tap any benefit to see what it means for you.
      </PageHero>
      <section className="section">
        <PerkCards />
      </section>
      <section className="section split">
        <div>
          <p className="eyebrow dark">For agents</p>
          <h2>Free for agents. Always.</h2>
          <p className="sub left">Joining the conversation costs nothing. Here&apos;s what you get from day one.</p>
          <a href="/apply" className="btn">Get started, it&apos;s free</a>
        </div>
        <ul className="checks">{free.map((f) => <li key={f}>{f}</li>)}</ul>
      </section>
      <ApplySection />
      <SiteFooter />
    </>
  );
}
