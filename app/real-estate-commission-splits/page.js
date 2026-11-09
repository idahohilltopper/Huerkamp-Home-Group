import SiteHeader from '../SiteHeader';
import SiteFooter from '../SiteFooter';
import PageHero from '../PageHero';
import ApplySection from '../ApplySection';
import JsonLd from '../JsonLd';
import { breadcrumbs, faqJsonLd } from '../seo';

export const metadata = {
  title: 'Real Estate Commission Splits',
  description: 'How real estate commission splits work for agents, what caps and fees to ask about, and how to compare a brokerage or team on what you keep, not just the split.',
  alternates: { canonical: '/real-estate-commission-splits' },
};

const terms = [
  ['Split', 'The share of each commission you keep versus the brokerage or team. It might be shown as 70/30, meaning you keep 70%.'],
  ['Cap', 'Some brokerages stop taking their share after you pay a set amount in a year, so you keep more after that.'],
  ['Fees', 'Transaction, technology, E&O and franchise fees can reduce what you take home, so ask for all of them.'],
  ['Team split', 'On a team, the split often reflects leads, coaching and support the team provides. A lower split can still mean more income if it brings you clients.'],
];
const ask = [
  'What is the split, and does it change as I earn more?',
  'Is there a cap, and when does it reset?',
  'What fees come out of each transaction?',
  'What do I get for the split: leads, coaching, a transaction coordinator?',
  'Can I see the agreement in writing before I join?',
];
const faqs = [
  ['What is a commission split?', 'It is how a commission is divided between an agent and the brokerage or team. The agent keeps a percentage and the brokerage keeps the rest.'],
  ['Is a higher split always better?', 'No. A high split with no leads or training may earn less than a lower split with strong support. Compare what you would actually take home.'],
  ['What is the Keller Williams commission split?', 'Keller Williams market centers and teams set their own structures, so there is no single number. Ask any team or market center for its plan in writing.'],
  ['What is your split at Huerkamp Home Group?', 'We cover it in a conversation, because it depends on the program and your situation. Talk with us and we will walk through it.'],
];

export default function Splits() {
  return (
    <>
      <JsonLd data={breadcrumbs([['Home', '/'], ['Real estate commission splits', '/real-estate-commission-splits']])} />
      <JsonLd data={faqJsonLd(faqs)} />
      <SiteHeader />
      <PageHero eyebrow="Agent guide" title="Real estate commission splits, explained">
        How splits work, what caps and fees to ask about, and how to compare teams and brokerages on what you actually keep.
      </PageHero>

      <section className="section">
        <p className="eyebrow dark">The basics</p>
        <h2>Four terms to know</h2>
        <div className="grid">
          {terms.map(([t, d]) => (<div className="card" key={t}><h3>{t}</h3><p>{d}</p></div>))}
        </div>
      </section>

      <section className="section alt">
        <p className="eyebrow dark">Before you join</p>
        <h2>Questions to ask any brokerage or team</h2>
        <div className="card" style={{ textAlign: 'left', maxWidth: 720, margin: '1rem auto' }}><ul className="plain">{ask.map((x) => <li key={x}>{x}</li>)}</ul></div>
        <p className="sub">Compare on total value, not the split alone. See <a href="/value">what the team provides</a> and <a href="/join-a-real-estate-team-twin-cities">how to choose a team</a>.</p>
      </section>

      <section className="section">
        <h2>Common questions</h2>
        <div className="faq">
          {faqs.map(([q, a]) => (<details key={q}><summary>{q}</summary><p>{a}</p></details>))}
        </div>
      </section>

      <ApplySection />
      <SiteFooter />
    </>
  );
}
