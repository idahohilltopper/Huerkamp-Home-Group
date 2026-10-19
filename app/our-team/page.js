import SiteHeader from '../SiteHeader';
import SiteFooter from '../SiteFooter';
import PageHero from '../PageHero';
import ApplySection from '../ApplySection';
import Stats from '../Stats';
import YouTubeBanner from '../YouTubeBanner';

export const metadata = { title: 'Our Team | Huerkamp Home Group', description: 'Meet the Huerkamp Home Group team: how we work, give back, and have fun together.' };

export default function OurTeam() {
  return (
    <>
      <SiteHeader />
      <PageHero eyebrow="Our team" title="People who want you to win">
        We plan together, train together, give back together, and enjoy it, as the #1 Keller Williams team in the North Central region, closing $190 million in volume and 520 units a year.
      </PageHero>
      <Stats />
      <YouTubeBanner />
      <section className="section split team" id="team">
        <img src="/team-photo.jpg" alt="The Huerkamp Home Group team at our annual planning retreat" className="team-img" />
        <div>
          <p className="eyebrow dark">Meet the team</p>
          <h2>People who want you to win</h2>
          <p className="sub left">We plan together, train together, and celebrate together. This is our crew at our annual planning retreat, where we map out the year ahead as one team.</p>
          <a href="/apply" className="btn">Come meet us</a>
        </div>
      </section>

      <section className="section split rev" id="community">
        <div>
          <p className="eyebrow dark">Community</p>
          <h2>We give back together</h2>
          <p className="sub left">Every year the team rolls up its sleeves for Keller Williams Red Day, a day of service for neighbors in our community. Work hard, make a difference, and have fun doing it.</p>
        </div>
        <img src="/red-day.jpg" alt="HHG team members in red shirts volunteering on Keller Williams Red Day" className="team-img wide" />
      </section>

      <section className="section" id="life">
        <p className="eyebrow dark">Life at HHG</p>
        <h2>Work hard. Have fun.</h2>
        <p className="sub">The best teams enjoy each other. From retreats to fair days to nights out, this is what being part of HHG looks like.</p>
        <div className="gallery">
          {[
            ['/life-lake.jpg', 'Team getaway at the lake'],
            ['/life-fair.jpg', 'Cookie run at the State Fair'],
            ['/life-night.jpg', 'Team night out'],
          ].map(([src, cap]) => (
            <figure key={src}><img src={src} alt={cap} loading="lazy" /><figcaption>{cap}</figcaption></figure>
          ))}
        </div>
      </section>
      <ApplySection />
      <SiteFooter />
    </>
  );
}
