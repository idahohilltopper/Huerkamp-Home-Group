import SiteHeader from '../SiteHeader';
import SiteFooter from '../SiteFooter';
import PageHero from '../PageHero';
import ApplySection from '../ApplySection';
import JsonLd from '../JsonLd';
import { breadcrumbs, faqJsonLd } from '../seo';

export const metadata = {
  title: 'Is Real Estate a Good Career?',
  description: 'An honest look at whether real estate is a good career: the upsides, the hard parts, who tends to succeed, and how a team changes the picture in the Twin Cities.',
  alternates: { canonical: '/is-real-estate-a-good-career' },
};

const pros = [
  ['Income tied to effort', 'You are paid on results, so the work you put in can show up in your income. There is no cap set by a salary band.'],
  ['Flexibility', 'You often set your own schedule, though clients decide when showings and closings happen.'],
  ['Helping people', 'Buying or selling a home is a big moment. Good agents guide people through it.'],
  ['A business you build', 'Referrals and repeat clients can compound over the years.'],
];
const cons = [
  ['Income can be uneven', 'Agents are usually paid at closing, which can be months after the work starts. Plan for a runway.'],
  ['You are in business for yourself', 'Most agents are independent contractors who cover their own costs, taxes and benefits.'],
  ['You have to find clients', 'Leads do not appear on their own. Daily outreach is part of the job.'],
  ['Evenings and weekends', 'Clients are busiest when they are not at work.'],
];
const fit = [
  'You are comfortable talking to people every day, including strangers',
  'You can work without someone telling you what to do each morning',
  'You have a financial runway for the first several months',
  'You will follow a system and track your numbers',
  'You like the idea of being held accountable',
];
const faqs = [
  ['Is real estate a good career for beginners?', 'It can be, if you have a runway, a plan for finding clients, and training. Joining a team with leads and coaching removes some of the hardest parts of starting alone.'],
  ['How long does it take to start earning?', 'It varies a lot. Agents are generally paid at closing, and a deal can take weeks or months from first contact, so plan your finances for a slow start. We do not promise any particular result.'],
  ['Do I need a degree?', 'Not in Minnesota. You need to be 18 or older, complete the required pre-licensing education, and pass the state exam. See our licensing guide.'],
  ['Is a team better than going solo?', 'Teams can offer leads, training and support, in exchange for a share of commission. It depends on what you need most. See how to choose a team.'],
];

export default function GoodCareer() {
  return (
    <>
      <JsonLd data={breadcrumbs([['Home', '/'], ['Is real estate a good career?', '/is-real-estate-a-good-career']])} />
      <JsonLd data={faqJsonLd(faqs)} />
      <SiteHeader />
      <PageHero eyebrow="Real estate career" title="Is real estate a good career?">
        An honest answer from a Twin Cities team that recruits agents: the upsides, the hard parts, and who tends to do well.
      </PageHero>

      <section className="section">
        <p className="eyebrow dark">The upside</p>
        <h2>What makes it attractive</h2>
        <div className="grid">
          {pros.map(([t, d]) => (<div className="card" key={t}><h3>{t}</h3><p>{d}</p></div>))}
        </div>
      </section>

      <section className="section alt">
        <p className="eyebrow dark">The hard parts</p>
        <h2>What people underestimate</h2>
        <div className="grid">
          {cons.map(([t, d]) => (<div className="card" key={t}><h3>{t}</h3><p>{d}</p></div>))}
        </div>
      </section>

      <section className="section">
        <p className="eyebrow dark">Is it for you?</p>
        <h2>Signs it may be a good fit</h2>
        <div className="card" style={{ textAlign: 'left', maxWidth: 720, margin: '1rem auto' }}><ul className="plain">{fit.map((x) => <li key={x}>{x}</li>)}</ul></div>
        <p className="sub">Not sure? Take the <a href="/real-estate-career-quiz">free 2-minute career quiz</a>. If you are ready to start, read how to <a href="/become-a-real-estate-agent-minnesota">get your Minnesota license</a>.</p>
      </section>

      <section className="section alt">
        <h2>How a team changes the picture</h2>
        <p className="sub">The hardest parts of starting out are finding clients and knowing what to do each day. A team can help with both: leads, weekly coaching and accountability. Read <a href="/join-a-real-estate-team-twin-cities">how to choose a team</a> or see <a href="/real-estate-coaching-training-twin-cities">our coaching</a>.</p>
        <div className="faq">
          {faqs.map(([q, a]) => (<details key={q}><summary>{q}</summary><p>{a}</p></details>))}
        </div>
      </section>

      <ApplySection />
      <SiteFooter />
    </>
  );
}
