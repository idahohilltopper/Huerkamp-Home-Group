import SiteHeader from '../SiteHeader';
import SiteFooter from '../SiteFooter';
import PageHero from '../PageHero';
import ApplySection from '../ApplySection';
import JsonLd from '../JsonLd';
import { breadcrumbs, faqJsonLd } from '../seo';

export const metadata = {
  title: 'Part-Time Real Estate Agent Guide',
  description: 'Can you be a part-time real estate agent in Minnesota? What works, what is hard, and how to build toward full-time with the right support.',
  alternates: { canonical: '/part-time-real-estate-agent' },
};

const works = [
  'Keep your current income while you earn your license and start',
  'Set aside fixed daily blocks for outreach, even if short',
  'Be honest with clients about when you are available',
  'Use a team or systems so follow-up does not slip',
];
const hard = [
  'Leads need fast replies, and a day job can get in the way',
  'Clients want showings on evenings and weekends, which is when you may be busiest elsewhere',
  'Part-time effort can mean slow progress and a weaker reputation',
  'Brokerages and teams may have minimums or expectations',
];
const faqs = [
  ['Can I be a real estate agent part-time in Minnesota?', 'Yes. The license does not require full-time work. Whether it works for you depends on how much time you can give to responding to clients quickly.'],
  ['How many hours a week do I need?', 'There is no fixed number. Agents who do well tend to make steady daily contact with people, so consistency matters more than total hours.'],
  ['Can I join your team part-time?', 'We are built for full-time agents, and some of our programs, such as the income guarantee*, require full-time work. If you are building toward full-time, talk to us about whether the timing fits.'],
  ['What should I do first?', 'Get licensed, build a plan for the first 90 days, and decide how long you can run both jobs.'],
];

export default function PartTime() {
  return (
    <>
      <JsonLd data={breadcrumbs([['Home', '/'], ['Part-time real estate agent', '/part-time-real-estate-agent']])} />
      <JsonLd data={faqJsonLd(faqs)} />
      <SiteHeader />
      <PageHero eyebrow="Starting out" title="Can you be a part-time real estate agent?">
        Yes, but it is harder than it looks. Here is what works, what gets in the way, and how to build toward full-time.
      </PageHero>

      <section className="section">
        <div className="grid two">
          <div className="card"><h3>What helps part-time agents</h3><ul className="plain">{works.map((x) => <li key={x}>{x}</li>)}</ul></div>
          <div className="card"><h3>What makes it hard</h3><ul className="plain">{hard.map((x) => <li key={x}>{x}</li>)}</ul></div>
        </div>
        <p className="sub">Not sure how much time you have? The <a href="/real-estate-career-quiz">free career quiz</a> asks about your schedule and runway. To get started, read <a href="/become-a-real-estate-agent-minnesota">how to become a real estate agent in Minnesota</a>.</p>
      </section>

      <section className="section alt">
        <h2>Our honest take</h2>
        <p className="sub">Our team is built for agents who commit to this full time, with daily outreach, weekly coaching and accountability. If you are still working another job, we can talk about a plan to get you there. <a href="/income-guarantee">See the income guarantee*</a> and its requirements.</p>
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
