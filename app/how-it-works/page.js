import SiteHeader from '../SiteHeader';
import SiteFooter from '../SiteFooter';
import PageHero from '../PageHero';
import ApplySection from '../ApplySection';
import StepCards from '../StepCards';

export const metadata = {
  title: 'How to Join Our Real Estate Team',
  description: 'From first conversation to closing, here are the five steps to join Huerkamp Home Group, a Keller Williams team serving the Twin Cities.',
  alternates: { canonical: '/how-it-works' },
};

export default function HowItWorks() {
  return (
    <>
      <SiteHeader />
      <PageHero eyebrow="How it works" title="From hello to closing in five steps">
        Tap any step to see exactly what to expect.
      </PageHero>
      <section className="section alt">
        <StepCards />
      </section>
      <ApplySection />
      <SiteFooter />
    </>
  );
}
