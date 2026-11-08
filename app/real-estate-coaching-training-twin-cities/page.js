import SiteHeader from '../SiteHeader';
import SiteFooter from '../SiteFooter';
import PageHero from '../PageHero';
import ApplySection from '../ApplySection';
import JsonLd from '../JsonLd';
import { breadcrumbs, faqJsonLd } from '../seo';

export const metadata = {
  title: 'Real Estate Coaching in the Twin Cities',
  description: 'See what real estate coaching and training looks like at Huerkamp Home Group: weekly coaching 46 weeks a year, accountability meetings, and proven systems.',
  alternates: { canonical: '/real-estate-coaching-training-twin-cities' },
};

const good = [
  'Coaching that happens every week, not once a quarter',
  'Coaches who are active in the business, not just teachers',
  'A weekly plan and a scoreboard, so progress is measured',
  'Scripts and systems you can use the day you start',
  'Accountability from people who check in on your numbers',
  'A path from your first deal to a bigger business',
];
const offer = [
  ['Weekly coaching, 46 weeks a year', 'Coaching built into the team, led by national coach Jeff Glover and team coaches Olivia Manson and Jason Huerkamp.'],
  ['Group coaching with Jeff Glover*', 'Jeff Glover personally leads group coaching, and he does it for only 10 people in the United States.'],
  ['A weekly accountability meeting', 'Every week the team holds WAM, a practice from the book The 12 Week Year. You review last week against your plan and commit to the week ahead.'],
  ['Systems, scripts, and support', 'Organized processes, scripts, and team members who handle the 80% that does not make you money, so you can focus on the 20% that does.'],
  ['Tracked in Follow Up Boss', 'Your activity lives in our CRM, so coaching is based on your real numbers, not guesses.'],
];
const faqs = [
  ['Do I need experience to get coaching?', 'No. We talk with licensed agents, agents in the licensing process, and people curious about the career.'],
  ['How often is coaching?', 'Weekly coaching is built into the team, 46 weeks a year.'],
  ['What is WAM?', 'WAM is our weekly accountability meeting, a core practice from the book The 12 Week Year. You review last week against your plan, commit to specific actions for the week ahead, and keep each other accountable.'],
];

export default function CoachingTraining() {
  return (
    <>
      <JsonLd data={breadcrumbs([['Home', '/'], ['Real estate coaching and training in the Twin Cities', '/real-estate-coaching-training-twin-cities']])} />
      <JsonLd data={faqJsonLd(faqs)} />
      <SiteHeader />
      <PageHero eyebrow="Coaching and training" title="Real estate coaching and training in the Twin Cities">
        What a real estate agent training program should include, and what you get at Huerkamp Home Group, a Keller Williams Preferred Realty team in Burnsville.
      </PageHero>

      <section className="section">
        <p className="eyebrow dark">What to look for</p>
        <h2>What makes real estate coaching actually work</h2>
        <p className="sub">Many programs sound great and fade after a month. The ones that work tend to share these traits.</p>
        <div className="grid two">
          <div className="card"><h3>A good training program has</h3><ul className="plain">{good.map((x) => <li key={x}>{x}</li>)}</ul></div>
          <div className="card"><h3>Ask any team</h3><ul className="plain">
            <li>How often is coaching, and who leads it?</li>
            <li>What does the weekly plan look like?</li>
            <li>How is my progress measured?</li>
            <li>Do I get scripts and systems on day one?</li>
            <li>Can I talk to agents who use the coaching now?</li>
          </ul></div>
        </div>
      </section>

      <section className="section alt">
        <p className="eyebrow dark">What we offer</p>
        <h2>Coaching at Huerkamp Home Group</h2>
        <div className="grid">
          {offer.map(([t, d]) => (<div className="card" key={t}><h3>{t}</h3><p>{d}</p></div>))}
        </div>
        <p className="fine-print">*Terms and conditions apply. <a href="/terms">Read the terms.</a> Coaching is valued at $1,000 a month and is included with the team. <a href="/value">See the full value.</a></p>
      </section>

      <section className="section">
        <h2>New to real estate?</h2>
        <p className="sub">Start with our guide to <a href="/become-a-real-estate-agent-minnesota">becoming a real estate agent in Minnesota</a>, then <a href="/join-a-real-estate-team-twin-cities">see how to choose a team</a>.</p>
        <div className="faq">
          {faqs.map(([q, a]) => (<details key={q}><summary>{q}</summary><p>{a}</p></details>))}
        </div>
      </section>

      <ApplySection />
      <SiteFooter />
    </>
  );
}
