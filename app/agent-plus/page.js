import SiteHeader from '../SiteHeader';
import SiteFooter from '../SiteFooter';
import PageHero from '../PageHero';
import ApplySection from '../ApplySection';
import AgentPlusBand from '../AgentPlusBand';

export const metadata = {
  title: 'Agent+ | Huerkamp Home Group',
  description: 'Earn up to $4,000 per file on top of your commission, plus a matching 401(k), through the Agent+ program with Mutual of Omaha Mortgage.',
};

const steps = [
  ['Dual licensing', 'Agent+ is a dual licensing opportunity from Mutual of Omaha Mortgage. You become a licensed loan officer and stay the agent in the transaction.'],
  ['Help your clients with their loan', 'Earn additional income by helping your clients through the mortgage process, including refinances. You can earn half a point (50 basis points, or 0.50%) of the loan amount on loans up to $800,000, which works out to as much as $4,000 on a single file.'],
  ['Monetize your database', 'Turn the relationships you have already built into additional income.'],
];

const support = [
  'A dedicated senior loan officer and support staff',
  'Same-day pre-approvals',
  'In-house underwriting, with a goal of 24-hour turnaround times',
  'A support team that handles documents, ordering services, and disclosures',
  'Competitive loan programs and pricing',
  'No need to coordinate with a third party for financing',
];

export default function AgentPlus() {
  return (
    <>
      <SiteHeader />
      <PageHero eyebrow="Agent+" title="Earn up to $4,000 more per file, plus a matching 401(k)">
        Agent+ with Mutual of Omaha Mortgage is a big part of what you get at HHG: more income on every file, and a way to build lasting wealth.
      </PageHero>
      <AgentPlusBand compact />
      <section className="section">
        <p className="eyebrow dark">How it works</p>
        <h2>More income from the deals you are already doing</h2>
        <div className="grid">
          {steps.map(([t, d], i) => (
            <div className="card" key={t}><h3>{i + 1}. {t}</h3><p>{d}</p></div>
          ))}
        </div>
      </section>
      <section className="section split">
        <div>
          <p className="eyebrow dark">Support behind you</p>
          <h2>You are not doing it alone</h2>
          <p className="sub left">The Agent+ program comes with a team that handles the mortgage details, so you can keep selling.</p>
          <a href="https://www.mutualmortgage.com/agent-plus/" target="_blank" rel="noopener noreferrer" className="btn">Learn more about Agent+ ↗</a>
        </div>
        <ul className="checks">{support.map((f) => <li key={f}>{f}</li>)}</ul>
      </section>
      <section className="section">
        <p className="fine-print">Agent+ is offered by Mutual of Omaha Mortgage, Inc. (NMLS ID 1025894). Participation requires mortgage loan originator licensing and is subject to program terms and eligibility. Loans are subject to credit approval. Earnings vary; &ldquo;up to $4,000 per file&rdquo; is the maximum, based on 0.50% of an $800,000 loan amount, and is not a guarantee or a typical result. For licensing information, visit <a href="https://www.nmlsconsumeraccess.org" target="_blank" rel="noopener noreferrer">nmlsconsumeraccess.org</a>.</p>
      </section>
      <ApplySection />
      <SiteFooter />
    </>
  );
}
