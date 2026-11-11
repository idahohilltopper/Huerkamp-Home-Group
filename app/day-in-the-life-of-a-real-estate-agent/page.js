import SiteHeader from '../SiteHeader';
import SiteFooter from '../SiteFooter';
import PageHero from '../PageHero';
import ApplySection from '../ApplySection';
import JsonLd from '../JsonLd';
import { breadcrumbs, faqJsonLd } from '../seo';

export const metadata = {
  title: 'Day in the Life of a Real Estate Agent',
  description: 'What a real estate agent actually does all day: prospecting, appointments, showings, follow-up and paperwork, and how a team changes the day.',
  alternates: { canonical: '/day-in-the-life-of-a-real-estate-agent' },
};

const day = [
  ['Start with the plan', 'Check the day against your weekly plan. Look at new leads and follow-ups due in the CRM, and decide which conversations come first.'],
  ['Prospecting block', 'The core of the job. Calls, texts and emails to leads, past clients and your network, aimed at live conversations with people who may buy or sell.'],
  ['Appointments', 'Buyer consultations, listing appointments and showings. These are where trust is built and where agreements get signed.'],
  ['Follow-up and offers', 'Answer questions, send listings, prepare offers and keep deals under contract moving toward closing.'],
  ['Log it and plan tomorrow', 'Record the day\'s conversations, appointments and agreements in the CRM, then set up tomorrow. If it is not recorded, you cannot coach it.'],
];
const week = [
  ['Prospecting every day', 'Real estate rewards steady daily outreach more than occasional big pushes.'],
  ['A weekly accountability meeting', 'At our team it is WAM, a practice from The 12 Week Year: review last week, commit to the next.'],
  ['Weekly coaching', 'Coaching built into the team, 46 weeks a year.'],
  ['Team meetings in person', 'Time with the team to learn, share what is working and stay connected.'],
];
const honest = [
  'Clients choose the time, so evenings and weekends are common',
  'A deal can take weeks or months to close, and pay arrives at closing',
  'Not every conversation or appointment leads to a deal',
  'You run your own business, so the discipline has to come from you',
];
const faqs = [
  ['What does a real estate agent do all day?', 'Most of the day goes to finding and talking with people who may buy or sell, meeting clients, showing homes, following up and keeping deals on track. Paperwork and logging activity fill the gaps.'],
  ['Is real estate a 9 to 5 job?', 'No. You set much of your schedule, but clients decide when they can meet, so evenings and weekends are common.'],
  ['How many hours do agents work?', 'It varies a lot. Agents who do well tend to put in consistent daily effort, especially prospecting, rather than a fixed number of hours.'],
  ['How does a team change the day?', 'A team can supply leads, take on parts of the work, and give you coaching and accountability. At Huerkamp Home Group, a Client Care Manager and a showing partner take some of the workload so you can spend more time with clients.'],
  ['Is this a promise of what my days will look like?', 'No. This is a sample of how the work is usually organized. Your days will vary with your clients, your market and your plan.'],
];

export default function DayInTheLife() {
  return (
    <>
      <JsonLd data={breadcrumbs([['Home', '/'], ['Day in the life of a real estate agent', '/day-in-the-life-of-a-real-estate-agent']])} />
      <JsonLd data={faqJsonLd(faqs)} />
      <SiteHeader />
      <PageHero eyebrow="Real estate career" title="A day in the life of a real estate agent">
        What agents actually do between waking up and logging off, and how a team can change the day.
      </PageHero>

      <section className="section">
        <p className="eyebrow dark">A sample day</p>
        <h2>The shape of a working day</h2>
        <p className="sub">Every day is different, but most days follow this pattern. It is a sample of how the work is organized, not a fixed schedule.</p>
        <div className="grid">
          {day.map(([t, d], i) => (<div className="card" key={t}><h3>{i + 1}. {t}</h3><p>{d}</p></div>))}
        </div>
      </section>

      <section className="section alt">
        <p className="eyebrow dark">The weekly rhythm</p>
        <h2>What a good week includes</h2>
        <div className="grid">
          {week.map(([t, d]) => (<div className="card" key={t}><h3>{t}</h3><p>{d}</p></div>))}
        </div>
        <p className="sub">At Huerkamp Home Group, our weekly standards for agents in the income guarantee* program come to roughly four conversations a day: 20 conversations, 4 appointments set and 3 appointments met each week, tracked in Follow Up Boss. <a href="/income-guarantee">See the full requirements</a>.</p>
        <p className="fine-print">*Terms and conditions apply. <a href="/terms">Read the terms.</a></p>
      </section>

      <section className="section">
        <p className="eyebrow dark">The honest part</p>
        <h2>What makes some days hard</h2>
        <div className="card" style={{ textAlign: 'left', maxWidth: 720, margin: '1rem auto' }}><ul className="plain">{honest.map((x) => <li key={x}>{x}</li>)}</ul></div>
        <p className="sub">Wondering if it suits you? Take the <a href="/real-estate-career-quiz">free career quiz</a>, read <a href="/is-real-estate-a-good-career">is real estate a good career?</a>, or see <a href="/how-do-real-estate-agents-get-paid">how agents get paid</a>.</p>
      </section>

      <section className="section alt">
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
