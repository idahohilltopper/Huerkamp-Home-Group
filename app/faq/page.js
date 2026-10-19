import SiteHeader from '../SiteHeader';
import SiteFooter from '../SiteFooter';
import PageHero from '../PageHero';
import ApplySection from '../ApplySection';

export const metadata = { title: 'FAQ | Huerkamp Home Group', description: 'Answers to common questions about joining Huerkamp Home Group.' };

const faqs = [
  ['Do I need to be licensed?', 'No. We talk with licensed agents, agents in the licensing process, and people curious about the career.'],
  ['Is it really free to apply?', 'Yes. Applying and talking with us costs nothing and carries no obligation.'],
  ['What does #1 in the North Central region mean?', 'We are the #1 team in the Keller Williams North Central region, a wide region that includes Wyoming, Montana, North Dakota, South Dakota, Minnesota, and Wisconsin.'],
  ['What is Agent+?', 'Agent+ is a dual licensing program from Mutual of Omaha Mortgage. Agents can earn half a point (50 basis points) of the loan amount on loans up to $800,000, up to $4,000 per file, on top of their real estate commission, and take part in a matching 401(k). Participation requires mortgage licensing and is subject to program terms. See the Agent+ page for details.'],
  ['Where is HHG located?', 'We are a Keller Williams Preferred Realty team based in Burnsville, MN.'],
  ['Is there an agent recruiting bonus?', 'Yes. We pay a $5,000 bonus if you close two team leads in your first 120 days. It applies to people you bring onto the team, and it also applies to you when you join the team yourself.'],
  ['How fast will I hear back?', 'Within one business day.'],
];

export default function FAQ() {
  return (
    <>
      <SiteHeader />
      <PageHero eyebrow="FAQ" title="Questions, answered" />
      <section className="section">
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
