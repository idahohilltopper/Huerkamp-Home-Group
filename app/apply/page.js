import SiteHeader from '../SiteHeader';
import SiteFooter from '../SiteFooter';
import PageHero from '../PageHero';
import ApplySection from '../ApplySection';

export const metadata = {
  title: 'Apply to Join Our Real Estate Team',
  description: 'Apply to join Huerkamp Home Group in the Twin Cities. It is free, confidential, and there is no obligation. We reply within one business day.',
  alternates: { canonical: '/apply' },
};

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
