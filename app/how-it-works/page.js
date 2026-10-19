import SiteHeader from '../SiteHeader';
import SiteFooter from '../SiteFooter';
import PageHero from '../PageHero';
import ApplySection from '../ApplySection';
import StepCards from '../StepCards';

export const metadata = { title: 'How It Works | Huerkamp Home Group', description: 'From hello to closing in five steps with Huerkamp Home Group.' };

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
