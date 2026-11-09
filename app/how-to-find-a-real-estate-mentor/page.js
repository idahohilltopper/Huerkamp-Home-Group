import SiteHeader from '../SiteHeader';
import SiteFooter from '../SiteFooter';
import PageHero from '../PageHero';
import ApplySection from '../ApplySection';
import JsonLd from '../JsonLd';
import { breadcrumbs, faqJsonLd } from '../seo';

export const metadata = {
  title: 'How to Find a Real Estate Mentor',
  description: 'How to find a real estate mentor as a new agent: what a good mentor does, where to look, what to ask, and how a team with coaching can fill the gap.',
  alternates: { canonical: '/how-to-find-a-real-estate-mentor' },
};

const does = [
  ['Shows you the work', 'A good mentor lets you see real conversations, showings and negotiations, not just theory.'],
  ['Gives honest feedback', 'They tell you what you did well and what to fix, even when it is uncomfortable.'],
  ['Keeps you accountable', 'They ask about your numbers and your plan, and notice when you slip.'],
  ['Makes introductions', 'They connect you with lenders, inspectors, title and other agents.'],
];
const where = [
  ['Your brokerage or team', 'The easiest place to start. Ask who is active, willing to teach, and has time.'],
  ['Local real estate groups', 'REALTOR association events, local meetups and training classes put you in the room with experienced agents.'],
  ['Past clients and your network', 'People who know agents they trust can make introductions.'],
  ['Paid coaching', 'A coach is a structured, paid version of mentoring. Look for one who is active in the business.'],
];
const ask = [
  'How many deals did you close in the last 12 months?',
  'How much time can you give me each week?',
  'Can I shadow you on showings, listing appointments and negotiations?',
  'What would you expect from me in return?',
  'Is the mentoring free, paid or tied to a split?',
];
const faqs = [
  ['Do new real estate agents need a mentor?', 'You do not need one to get licensed, but most new agents do better with someone experienced to learn from. Many struggle because they have no one to ask.'],
  ['What is the difference between a mentor and a coach?', 'A mentor usually shares experience informally, often for free. A coach gives you a structured plan, regular sessions and accountability, usually for a fee. On a team, coaching can be built in.'],
  ['How do I ask an agent to be my mentor?', 'Be specific and respect their time. Ask for one hour a month to start, show up prepared, and offer something useful in return, such as help with open houses.'],
  ['Does Huerkamp Home Group offer mentoring?', 'We offer weekly coaching 46 weeks a year, a weekly accountability meeting, and group coaching with a national coach. See the coaching page for details.'],
];

export default function Mentor() {
  return (
    <>
      <JsonLd data={breadcrumbs([['Home', '/'], ['How to find a real estate mentor', '/how-to-find-a-real-estate-mentor']])} />
      <JsonLd data={faqJsonLd(faqs)} />
      <SiteHeader />
      <PageHero eyebrow="New agent guide" title="How to find a real estate mentor">
        What a good mentor does, where to find one, what to ask, and how a team can give you mentoring from day one.
      </PageHero>

      <section className="section">
        <p className="eyebrow dark">What to expect</p>
        <h2>What a good mentor does</h2>
        <div className="grid">
          {does.map(([t, d]) => (<div className="card" key={t}><h3>{t}</h3><p>{d}</p></div>))}
        </div>
      </section>

      <section className="section alt">
        <p className="eyebrow dark">Where to look</p>
        <h2>Four places to find one</h2>
        <div className="grid">
          {where.map(([t, d]) => (<div className="card" key={t}><h3>{t}</h3><p>{d}</p></div>))}
        </div>
      </section>

      <section className="section">
        <p className="eyebrow dark">Before you commit</p>
        <h2>Questions to ask a possible mentor</h2>
        <div className="card" style={{ textAlign: 'left', maxWidth: 720, margin: '1rem auto' }}><ul className="plain">{ask.map((x) => <li key={x}>{x}</li>)}</ul></div>
        <p className="sub">A mentor should be an active agent with recent results. Someone who has not closed a deal in years may not know today&apos;s market.</p>
      </section>

      <section className="section alt">
        <h2>Or join a team that builds it in</h2>
        <p className="sub">Finding a mentor on your own takes time, and a busy agent may not have any. A team with coaching built in solves that. Our team coaches are Olivia Manson and Jason Huerkamp, with national coach Jeff Glover. Read about our <a href="/real-estate-coaching-training-twin-cities">weekly coaching</a>, <a href="/join-a-real-estate-team-twin-cities">how to choose a team</a>, or take the <a href="/real-estate-career-quiz">free career quiz</a>.</p>
        <div className="faq">
          {faqs.map(([q, a]) => (<details key={q}><summary>{q}</summary><p>{a}</p></details>))}
        </div>
      </section>

      <ApplySection />
      <SiteFooter />
    </>
  );
}
