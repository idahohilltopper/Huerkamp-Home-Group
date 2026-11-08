import SiteHeader from '../SiteHeader';
import SiteFooter from '../SiteFooter';
import PageHero from '../PageHero';
import JsonLd from '../JsonLd';
import { breadcrumbs, faqJsonLd } from '../seo';
import Quiz from './Quiz';

export const metadata = {
  title: 'Is Real Estate Right for You? Free Career Quiz',
  description: 'Take a free 2-minute quiz to see if a real estate career fits you, with next steps for Twin Cities agents. Your answers stay private until you choose to share.',
  alternates: { canonical: '/real-estate-career-quiz' },
};

const faqs = [
  ['How long does the career quiz take?', 'About two minutes. There are eight short questions.'],
  ['Is the quiz free?', 'Yes. It is free, and you do not need to give us your contact details to see your results.'],
  ['What happens to my answers?', 'Your answers stay on your device. Nothing is sent to us unless you choose to send your details at the end.'],
  ['Does the quiz predict how much I will earn?', 'No. It is a quick self-check to help you think about fit. It is not a job screening and it does not promise any result.'],
];

export default function CareerQuiz() {
  return (
    <>
      <JsonLd data={breadcrumbs([['Home', '/'], ['Real estate career quiz', '/real-estate-career-quiz']])} />
      <JsonLd data={faqJsonLd(faqs)} />
      <SiteHeader />
      <PageHero eyebrow="Free 2-minute quiz" title="Is a real estate career right for you?">
        Eight quick questions about your goals and how you like to work, with honest next steps for the Twin Cities. It is a self-check, not a screening.
      </PageHero>
      <section className="section narrow-quiz">
        <Quiz />
      </section>
      <section className="section alt">
        <h2>About the quiz</h2>
        <div className="faq">
          {faqs.map(([q, a]) => (<details key={q}><summary>{q}</summary><p>{a}</p></details>))}
        </div>
        <p className="sub">Prefer to read first? Start with how to <a href="/become-a-real-estate-agent-minnesota">become a real estate agent in Minnesota</a>, or see <a href="/real-estate-agent-jobs-twin-cities">agent jobs in the Twin Cities</a>.</p>
      </section>
      <SiteFooter />
    </>
  );
}
