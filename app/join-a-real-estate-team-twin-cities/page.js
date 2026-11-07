import SiteHeader from '../SiteHeader';
import SiteFooter from '../SiteFooter';
import PageHero from '../PageHero';
import ApplySection from '../ApplySection';
import JsonLd from '../JsonLd';
import { breadcrumbs, faqJsonLd, CITIES } from '../seo';

export const metadata = {
  title: 'Join a Twin Cities Real Estate Team',
  description: 'Thinking of joining a real estate team in Minneapolis, St. Paul, or the south metro? Compare team vs. solo, and see what Huerkamp Home Group offers agents.',
  alternates: { canonical: '/join-a-real-estate-team-twin-cities' },
};

const why = [
  'A steady source of leads you did not have to buy yourself',
  'Training, coaching, and mentors who have done it',
  'Systems, scripts, and tech that are already built',
  'Support staff for transactions, marketing, and client care',
  'Accountability that keeps you producing',
  'Shared costs and a ready-made brand',
];
const weigh = [
  'How the commission split compares to the support you get',
  'How leads are assigned, and who owns them if you leave',
  'The activity and meeting expectations, and whether they fit your life',
  'The culture, and whether you would enjoy working there every day',
  'The terms for leaving, so there are no surprises',
];
const questions = [
  'Where do the leads come from, and who pays for them?',
  'How are leads assigned, and what follow-up is expected?',
  'What is the commission split, and what fees come out of each deal?',
  'What coaching and training do I get, and how often?',
  'Who helps with transactions, showings, and client care?',
  'Which CRM and tools do I get, and what do they cost me?',
  'What activity and meeting expectations come with the team?',
  'What can a new agent realistically expect in the first year?',
  'What happens to my leads and clients if I leave?',
  'Can I talk with agents who are on the team right now?',
];
const answers = [
  ['Leads', 'We are the #1 purchaser of realtor.com leads in the Twin Cities and a Zillow Preferred team.', '/why-hhg'],
  ['Coaching', 'Coaching 46 weeks a year, with national coach Jeff Glover and team coaches Olivia Manson and Jason Huerkamp.', '/value'],
  ['Support', 'A Client Care Manager and a showing partner who gives you time back with buyers.', '/why-hhg'],
  ['Accountability', 'A weekly accountability meeting from The 12 Week Year, so your plan turns into action.', '/how-it-works'],
  ['Income*', 'A $150,000 income guarantee for full-time agents who meet the requirements.', '/income-guarantee'],
  ['Extra earnings*', 'Agent+ with Mutual of Omaha Mortgage and a matching 401(k) for licensed loan officers.', '/agent-plus'],
];
const faqs = [
  ['Do I need to be licensed to join a real estate team?', 'No. We talk with licensed agents, agents in the licensing process, and people curious about the career.'],
  ['Where is Huerkamp Home Group located?', 'We are a Keller Williams Preferred Realty team based in Burnsville, MN, at 14300 Nicollet Ct, serving the Twin Cities.'],
  ['Is it free to apply?', 'Yes. Applying and talking with us costs nothing and carries no obligation.'],
];

export default function JoinATeam() {
  return (
    <>
      <JsonLd data={breadcrumbs([['Home', '/'], ['Join a real estate team in the Twin Cities', '/join-a-real-estate-team-twin-cities']])} />
      <JsonLd data={faqJsonLd(faqs)} />
      <SiteHeader />
      <PageHero eyebrow="Twin Cities agents" title="Join a real estate team in the Twin Cities">
        What to look for, what to ask, and how Huerkamp Home Group, a Keller Williams Preferred Realty team in Burnsville, answers.
      </PageHero>

      <section className="section">
        <p className="eyebrow dark">Team or solo?</p>
        <h2>An honest look at joining a team</h2>
        <div className="grid two">
          <div className="card"><h3>Why agents join a team</h3><ul className="plain">{why.map((x) => <li key={x}>{x}</li>)}</ul></div>
          <div className="card"><h3>What to weigh before you join</h3><ul className="plain">{weigh.map((x) => <li key={x}>{x}</li>)}</ul></div>
        </div>
      </section>

      <section className="section alt">
        <p className="eyebrow dark">Before you decide</p>
        <h2>Ten questions to ask any team</h2>
        <p className="sub">Use these with every team you talk to, including ours.</p>
        <ol className="qlist">{questions.map((q) => <li key={q}>{q}</li>)}</ol>
      </section>

      <section className="section">
        <p className="eyebrow dark">Our answers</p>
        <h2>How Huerkamp Home Group answers</h2>
        <div className="grid">
          {answers.map(([t, d, href]) => (
            <a className="card tile" key={t} href={href}><h3>{t}</h3><p>{d}</p><span className="more">Learn more →</span></a>
          ))}
        </div>
        <p className="fine-print">*Terms and conditions apply. <a href="/terms">Read the terms.</a></p>
      </section>

      <section className="section alt">
        <p className="eyebrow dark">Where we work</p>
        <h2>A Twin Cities team, based in Burnsville</h2>
        <p className="sub">Our market includes {CITIES.join(', ')}, and the rest of the Twin Cities.</p>
        <p className="sub">New to real estate? Start with our guide to <a href="/become-a-real-estate-agent-minnesota">becoming a real estate agent in Minnesota</a>.</p>
      </section>

      <section className="section">
        <h2>Common questions</h2>
        <div className="faq">
          {faqs.map(([q, a]) => (
            <details key={q}><summary>{q}</summary><p>{a}</p></details>
          ))}
        </div>
      </section>

      <ApplySection />
      <SiteFooter />
    </>
  );
}
