import SiteHeader from '../SiteHeader';
import SiteFooter from '../SiteFooter';
import PageHero from '../PageHero';
import ApplySection from '../ApplySection';
import JsonLd from '../JsonLd';
import { breadcrumbs, faqJsonLd } from '../seo';

export const metadata = {
  title: { absolute: 'Become a Real Estate Agent in Minnesota | HHG' },
  description: 'Step by step: the 90 hours of education, the exam, finding a broker, and the fees to get your Minnesota real estate license, plus how to start on a team.',
  alternates: { canonical: '/become-a-real-estate-agent-minnesota' },
};

const faqs = [
  ['How many hours of education do I need for a Minnesota real estate license?', 'You must complete three 30-hour courses, known as Course I, Course II, and Course III, for 90 hours in all. You need Course I before you can take the exam, and Courses II and III before you apply for your license.'],
  ['Who gives the Minnesota real estate exam?', 'PSI Services administers the salesperson exam. You must have completed at least Course I before you register.'],
  ['How long do I have to apply after I pass the exam?', 'You must apply for your license within one year of passing the exam. If you wait longer, you will have to take the exam again.'],
  ['Can I get licensed without a broker?', 'No. By law you cannot be licensed as a real estate salesperson in Minnesota without first being associated with an actively licensed real estate broker. The broker submits your application for you.'],
  ['Can I work with two brokers at once?', 'No. A Minnesota salesperson may not be licensed to act on behalf of more than one broker during the same period of time.'],
  ['How old do I have to be?', 'You must be at least 18 years old.'],
];

export default function BecomeAnAgent() {
  return (
    <>
      <JsonLd data={breadcrumbs([['Home', '/'], ['How to become a real estate agent in Minnesota', '/become-a-real-estate-agent-minnesota']])} />
      <JsonLd data={faqJsonLd(faqs)} />
      <SiteHeader />
      <PageHero eyebrow="Get licensed" title="How to become a real estate agent in Minnesota">
        A plain-English guide to getting your Minnesota real estate salesperson license, from a Twin Cities team that helps new agents get started.
      </PageHero>
      <article className="section prose">
        <p className="updated">Last reviewed November 2026. Requirements and fees can change, and the Minnesota Department of Commerce is the final authority.</p>

        <h2>The short version</h2>
        <p>To become a licensed real estate salesperson in Minnesota, you need to:</p>
        <ul>
          <li>be at least 18 years old;</li>
          <li>complete three 30-hour pre-license courses (90 hours in total);</li>
          <li>pass the salesperson exam;</li>
          <li>become associated with a licensed real estate broker, who submits your application; and</li>
          <li>receive notice that the Commerce Department has approved your application.</li>
        </ul>

        <h2>Step 1: Complete your pre-license education</h2>
        <p>Minnesota requires three courses before you can be licensed: Course I, Course II, and Course III. Each one is 30 hours of instruction.</p>
        <ul>
          <li>Finish <strong>Course I</strong> before you take the exam.</li>
          <li>Finish <strong>Courses II and III</strong> before you apply for your license.</li>
          <li>Before you pay for any course, confirm that the school is active and in good standing with the Commerce Department and that the course is approved for pre-license credit.</li>
        </ul>

        <h2>Step 2: Pass the salesperson exam</h2>
        <p>PSI Services gives the exam. You can schedule it at <a href="https://test-takers.psiexams.com/mnre" target="_blank" rel="noopener noreferrer">test-takers.psiexams.com/mnre</a> or by calling PSI at (866) 395-1006. You must have completed at least Course I to register.</p>
        <p>Keep the clock in mind: you must apply for your license within one year of passing, or you will need to pass the exam again.</p>

        <h2>Step 3: Choose a sponsoring broker</h2>
        <p>This step surprises many new agents. By law, you cannot be licensed as a salesperson until you are associated with an actively licensed broker, and you can only be associated with one broker at a time. You do not submit the application yourself: your broker does. Once the Commerce Department approves it, your broker can print your license and let you know you are licensed.</p>
        <p>Because your broker decides so much about your first years, this is the choice that matters most. Look for training, mentorship, a steady source of leads, and a culture that fits you. If you are weighing a team inside a brokerage, our guide on how to <a href="/join-a-real-estate-team-twin-cities">join a real estate team in the Twin Cities</a> lists the questions to ask.</p>

        <h2>Step 4: Your application and background questions</h2>
        <p>The license application asks about criminal history. If something on your background needs explaining, the Commerce Department requires official documents showing what happened and how it was resolved. Read the details in the Commerce Department&rsquo;s licensing guide before you apply so nothing delays you.</p>

        <h2>What does it cost?</h2>
        <p>According to the Commerce Department&rsquo;s licensing guide, the initial salesperson license fee is $100 plus the current technology surcharge, which includes $30 for the real estate education, research and recovery fund. The renewal fee is $60 plus the surcharge, which includes $20 for that fund. Course tuition and the exam fee are set by the school and by PSI, so compare them before you buy. Please confirm current amounts with the Commerce Department.</p>

        <h2>After you are licensed</h2>
        <p>To stay licensed in good standing, you must stay associated with a licensed broker, complete your continuing education by the deadlines, and follow the laws that govern licensees. Continuing education is due before June 30 each year, with a special rule for your first June 30.</p>

        <h2>Starting on a team</h2>
        <p>Most new agents succeed faster with leads, coaching, and people to learn from than they do going it alone. Huerkamp Home Group is a team within Keller Williams Preferred Realty in Burnsville. We talk with licensed agents, agents in the licensing process, and people who are just curious about the career, and it is free and confidential. <a href="/why-hhg">See what the team provides</a> or <a href="/apply">tell us where you are in the process</a>.</p>

        <h2>Frequently asked questions</h2>
        <div className="faq">
          {faqs.map(([q, a]) => (
            <details key={q}><summary>{q}</summary><p>{a}</p></details>
          ))}
        </div>

        <h2>Official sources</h2>
        <ul>
          <li><a href="https://mn.gov/commerce-stat/pdfs/re-license-guide.pdf" target="_blank" rel="noopener noreferrer">Minnesota Department of Commerce Guide to Real Estate Licensing (PDF)</a></li>
          <li><a href="https://test-takers.psiexams.com/mnre" target="_blank" rel="noopener noreferrer">PSI Services: Minnesota real estate exam registration</a></li>
        </ul>
      </article>
      <ApplySection />
      <SiteFooter />
    </>
  );
}
