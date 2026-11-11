import SiteHeader from '../SiteHeader';
import SiteFooter from '../SiteFooter';
import PageHero from '../PageHero';
import ApplySection from '../ApplySection';
import JsonLd from '../JsonLd';
import { breadcrumbs, faqJsonLd } from '../seo';

export const metadata = {
  title: 'How Real Estate Agents Get Paid',
  description: 'How do real estate agents get paid? Commission, closing day, splits, expenses and taxes explained, plus why most agents have no salary.',
  alternates: { canonical: '/how-do-real-estate-agents-get-paid' },
};

const steps = [
  ['A client signs an agreement', 'The agent works for a buyer or seller under a written agreement that explains how the agent will be paid.'],
  ['The home goes under contract', 'The agent guides the client through offers, inspections and negotiation. No commission is paid yet.'],
  ['The sale closes', 'Commission is generally paid at closing, out of the sale proceeds, to the brokerage.'],
  ['The brokerage splits it', 'The brokerage pays the agent their share under the agent\'s agreement. If the agent is on a team, the team may take a share too.'],
];
const costs = [
  'Licensing, exam and renewal fees',
  'Association and MLS dues',
  'Brokerage, transaction or technology fees',
  'Marketing, photos, signs and client gifts',
  'Mileage, phone and software',
  'Self-employment and income taxes',
];
const faqs = [
  ['How do real estate agents get paid?', 'Most agents are paid commission, a percentage of a home\'s sale price, when a sale closes. The commission goes to the brokerage, which pays the agent their share. If no sale closes, the agent is usually not paid for that work.'],
  ['Do real estate agents get a salary?', 'Usually not. Most agents are independent contractors paid by commission only, with no salary, hourly wage or base pay. That is how it works at Huerkamp Home Group too. Earnings vary, and we do not promise any level of income except under the written terms of a specific program.'],
  ['When do agents get paid?', 'Generally at closing. A deal can take weeks or months from first contact, so new agents should plan for a runway before their first paycheck.'],
  ['Who pays an agent\'s expenses?', 'Independent contractor agents usually pay their own business expenses and taxes. Ask any brokerage or team exactly what they cover.'],
  ['What is a commission split?', 'It is how the commission is divided between the agent and the brokerage or team. Read our guide to commission splits for what to ask.'],
];

export default function HowAgentsGetPaid() {
  return (
    <>
      <JsonLd data={breadcrumbs([['Home', '/'], ['How real estate agents get paid', '/how-do-real-estate-agents-get-paid']])} />
      <JsonLd data={faqJsonLd(faqs)} />
      <SiteHeader />
      <PageHero eyebrow="Agent guide" title="How do real estate agents get paid?">
        Commission, closing day, splits, expenses and taxes, explained plainly. Most agents have no salary, so it helps to know how the money actually works.
      </PageHero>

      <section className="section">
        <p className="eyebrow dark">The short answer</p>
        <h2>Agents are paid commission, at closing</h2>
        <p className="sub">An agent earns money when a sale closes. The commission usually goes to the brokerage first, and the brokerage pays the agent their share. There is typically no salary, so income can be uneven, especially at the start.</p>
        <div className="grid">
          {steps.map(([t, d], i) => (<div className="card" key={t}><h3>{i + 1}. {t}</h3><p>{d}</p></div>))}
        </div>
      </section>

      <section className="section alt">
        <p className="eyebrow dark">Before you count it as income</p>
        <h2>What comes out of the commission</h2>
        <p className="sub">Agents are usually independent contractors, which means they cover their own costs. Typical ones include:</p>
        <div className="card" style={{ textAlign: 'left', maxWidth: 720, margin: '1rem auto' }}><ul className="plain">{costs.map((x) => <li key={x}>{x}</li>)}</ul></div>
        <p className="fine-print">Taxes depend on your situation. Talk with a CPA about estimated taxes and deductions.</p>
      </section>

      <section className="section">
        <h2>Pay at Huerkamp Home Group</h2>
        <p className="sub">Agents join our team as independent contractors paid by commission only, with no salary or base pay. We add leads, weekly coaching and systems, and for agents who meet every requirement, an income guarantee*. <a href="/income-guarantee">See how it works</a>, learn about <a href="/real-estate-commission-splits">commission splits</a>, or take the <a href="/real-estate-career-quiz">free career quiz</a>.</p>
        <div className="faq">
          {faqs.map(([q, a]) => (<details key={q}><summary>{q}</summary><p>{a}</p></details>))}
        </div>
        <p className="fine-print">*Terms and conditions apply. <a href="/terms">Read the terms.</a></p>
      </section>

      <ApplySection />
      <SiteFooter />
    </>
  );
}
