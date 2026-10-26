import SiteHeader from '../SiteHeader';
import SiteFooter from '../SiteFooter';
import PageHero from '../PageHero';
import ApplySection from '../ApplySection';
import PerkCards from '../PerkCards';
import GrowthCards from '../GrowthCards';
import FlashList from '../FlashList';
import AgentPlusBand from '../AgentPlusBand';
import IncomeGuaranteeBand from '../IncomeGuaranteeBand';

export const metadata = { title: 'Why HHG | Huerkamp Home Group', description: 'Everything you need to build a real estate business with Huerkamp Home Group.' };

const free = ['Free to apply', 'Confidential conversation', 'Honest look at how we work', 'Shadow the team before you decide', 'Weekly coaching from a national coach and our team', 'A showing partner to give you time back with buyers', 'Leads, marketing and a Client Care Manager'];

export default function WhyHHG() {
  return (
    <>
      <SiteHeader />
      <PageHero eyebrow="Why HHG" title="Everything you need to build a business">
        A team built to help you win, with real systems behind it. Tap any benefit to see what it means for you.
      </PageHero>
      <IncomeGuaranteeBand />
      <AgentPlusBand />
      <section className="section">
        <PerkCards />
      </section>
      <section className="section alt">
        <p className="eyebrow dark">The engine behind the team</p>
        <h2>How we keep the pipeline full and the team growing</h2>
        <p className="sub">Everything we do every week so there is always momentum. Tap any one to see more.</p>
        <GrowthCards />
      </section>
      <section className="section split">
        <div>
          <p className="eyebrow dark">For agents</p>
          <h2>Free for agents. Always.</h2>
          <p className="sub left">Joining the conversation costs nothing. Here&apos;s what you get from day one.</p>
          <a href="/apply" className="btn">Get started, it&apos;s free</a>
        </div>
        <FlashList className="checks" items={free} />
      </section>
      <ApplySection />
      <SiteFooter />
    </>
  );
}
