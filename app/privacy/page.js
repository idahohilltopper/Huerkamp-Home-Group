import SiteHeader from '../SiteHeader';
import SiteFooter from '../SiteFooter';
import PageHero from '../PageHero';

export const metadata = {
  title: 'Privacy Policy',
  description: 'How Huerkamp Home Group collects, uses and shares information on joinhhg.com, including the application form, the career quiz and analytics.',
  alternates: { canonical: '/privacy' },
};

export default function Privacy() {
  return (
    <>
      <SiteHeader />
      <PageHero eyebrow="Privacy" title="Privacy policy">
        What we collect on joinhhg.com, why we collect it, and the choices you have.
      </PageHero>
      <article className="section prose">
        <p className="updated">Last updated November 24, 2026</p>

        <h2>1. Who we are</h2>
        <p>This site, joinhhg.com, is operated by Huerkamp Home Group, a team of Keller Williams Preferred Realty (&ldquo;HHG,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;), 14300 Nicollet Ct, Suite 208, Burnsville, MN. The site is for real estate agents and people considering a real estate career. It is not for buying or selling a home.</p>

        <h2>2. What we collect</h2>
        <ul>
          <li><strong>What you send us.</strong> If you complete the application form, or send your career quiz results, we receive the information you enter: your name, email address and phone number, and the answers you choose, such as your license status, experience, what you are looking for in a team, and any message. For quiz results we also receive your score and the answers behind it.</li>
          <li><strong>Quiz answers you do not send.</strong> If you take the career quiz and do not send your results, your answers stay in your browser and are not sent to us.</li>
          <li><strong>Usage information.</strong> Our analytics tool collects information about how the site is used, such as the pages you view, how you arrived, your approximate location, and your device and browser type. Analytics events from the quiz and forms record that an action happened, not the details you typed.</li>
          <li><strong>Technical logs.</strong> Our hosting provider and security systems process technical data such as your IP address and request details so the site works and stays secure. We use IP addresses to limit abuse of our forms.</li>
        </ul>

        <h2>3. How we use it</h2>
        <ul>
          <li>To respond to your inquiry and contact you at the phone number or email address you gave us about joining the team.</li>
          <li>To understand how the site performs and to improve it.</li>
          <li>To keep the site and our forms secure, and to prevent spam and abuse.</li>
          <li>To meet legal obligations.</li>
        </ul>

        <h2>4. Who we share it with</h2>
        <ul>
          <li><strong>Our customer relationship system.</strong> Information you submit is sent to Follow Up Boss, the system we use to manage recruiting inquiries and follow up.</li>
          <li><strong>Google Analytics.</strong> We use Google Analytics 4 to measure site usage. Google may set cookies or similar technologies and process usage data under its own privacy policy.</li>
          <li><strong>Our hosting provider.</strong> The site is hosted by Vercel.</li>
          <li><strong>Video.</strong> Some pages embed a video from Vimeo. Loading the video may share information such as your IP address with Vimeo, which handles it under its own privacy policy.</li>
          <li><strong>Legal and safety.</strong> We may disclose information when the law requires it, or to protect our rights, our visitors or the public.</li>
        </ul>
        <p>We do not sell the personal information you give us, and we do not use it for targeted advertising.</p>

        <h2>5. Cookies and analytics</h2>
        <p>Google Analytics uses cookies and similar technologies to tell visitors apart and measure activity on the site. You can block or delete cookies in your browser settings, and Google offers a browser add-on to opt out of Google Analytics. Blocking cookies will not stop you from using the site or the application form.</p>

        <h2>6. How long we keep it</h2>
        <p>We keep recruiting inquiries for as long as we need them to follow up and manage our recruiting records, and then delete them or keep them as the law requires. Analytics data is kept according to the retention settings in our analytics account.</p>

        <h2>7. Your choices</h2>
        <p>You can ask us to tell you what personal information we hold about you, to correct it, or to delete it, and you can ask us to stop contacting you. To make a request, use the <a href="/apply">Join</a> form and say that your message is a privacy request, and a member of our team will respond. We may need to confirm your identity first. Depending on where you live, you may have additional rights under state law.</p>

        <h2>8. Security</h2>
        <p>We use reasonable measures to protect information, including encrypted connections and limits on how forms can be used. No website or system is completely secure, so we cannot guarantee absolute security.</p>

        <h2>9. Children</h2>
        <p>This site is for adults. You must be at least 18 to become a licensed real estate agent in Minnesota, and we do not knowingly collect information from anyone under 18.</p>

        <h2>10. Links to other sites</h2>
        <p>This site links to third-party sites, such as YouTube and Vimeo. We are not responsible for their privacy practices.</p>

        <h2>11. Changes to this policy</h2>
        <p>We may update this policy. When we do, we will change the date at the top of this page.</p>

        <h2>12. Contact</h2>
        <p>Questions about this policy? Use the <a href="/apply">Join</a> form on this site. See also our <a href="/terms">terms and conditions</a>.</p>
      </article>
      <SiteFooter />
    </>
  );
}
