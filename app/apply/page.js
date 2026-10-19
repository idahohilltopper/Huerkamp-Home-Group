import SiteHeader from '../SiteHeader';
import SiteFooter from '../SiteFooter';
import PageHero from '../PageHero';
import ApplySection from '../ApplySection';

export const metadata = { title: 'Join the Team | Huerkamp Home Group', description: 'Apply to join Huerkamp Home Group. Free, confidential, no obligation.' };

export default function Apply() {
  return (
    <>
      <SiteHeader />
      <PageHero eyebrow="Join the team" title="Tell us what you're looking for">
        Free to apply, confidential, and no obligation. We reply within one business day.
      </PageHero>
      <ApplySection />
      <SiteFooter />
    </>
  );
}
