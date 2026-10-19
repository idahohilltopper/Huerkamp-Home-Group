import SiteHeader from '../SiteHeader';
import SiteFooter from '../SiteFooter';
import PageHero from '../PageHero';

export const metadata = {
  title: 'Terms and Conditions | Huerkamp Home Group',
  description: 'Terms and conditions for the Huerkamp Home Group 401(k), agent recruiting bonus, and Agent+ buy-side bonus offers.',
};

export default function Terms() {
  return (
    <>
      <SiteHeader />
      <PageHero eyebrow="Terms and conditions" title="Terms for our offers">
        The details behind the 401(k), the recruiting bonus, and the Agent+ buy-side bonus.
      </PageHero>
      <article className="section prose">
        <p className="updated">Last updated October 19, 2026</p>

        <h2>1. About these terms</h2>
        <p>These terms apply to the offers advertised on joinhhg.com by Huerkamp Home Group of Keller Williams Preferred Realty (&ldquo;HHG,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;). They cover three offers: the 401(k), the agent recruiting bonus, and the Agent+ buy-side bonus. Where an asterisk (*) appears next to an offer on this site, these terms apply to it.</p>
        <p>Nothing on this site is an offer of employment, a contract, or a guarantee of income. Offers are described in general terms for informational purposes. If these terms conflict with a written agreement you sign with HHG, Keller Williams Preferred Realty, or Mutual of Omaha Mortgage, the written agreement controls.</p>

        <h2>2. General conditions for all offers</h2>
        <ul>
          <li>You must hold an active real estate license in good standing and be, or become, affiliated with HHG through Keller Williams Preferred Realty to be eligible.</li>
          <li>You must remain affiliated with HHG and in good standing when a bonus or benefit is earned and when it is paid.</li>
          <li>You are responsible for complying with all applicable laws, licensing rules, and brokerage policies.</li>
          <li>Amounts shown as &ldquo;up to&rdquo; are maximums. They are not guarantees, averages, or typical results. Your results will depend on your own efforts, market conditions, and other factors.</li>
          <li>Bonuses and benefits may be subject to applicable taxes and withholding. HHG does not provide tax or legal advice. Please consult your own advisers.</li>
          <li>We may change, suspend, or end any offer at any time. Changes do not affect a bonus you have already fully earned under the terms in effect when you earned it.</li>
        </ul>

        <h2 id="401k">3. 401(k)*</h2>
        <ul>
          <li>The 401(k) is a retirement plan with an employer match offered through the Agent+ program from Mutual of Omaha Mortgage, Inc.</li>
          <li>Eligibility, contribution limits, the matching formula, vesting, investment options, and all other plan terms are set by the official plan documents, not by this website. The plan documents control.</li>
          <li>Participation is subject to the plan&rsquo;s eligibility rules and to federal law governing retirement plans.</li>
          <li>Matching contributions, if any, are not guaranteed, and investments can lose value.</li>
        </ul>

        <h2 id="recruiting-bonus">4. Agent recruiting bonus*</h2>
        <ul>
          <li>The bonus is up to $5,000 per agent. It applies to new agents who join the team, including an agent who joins the team on their own behalf, and to agents who bring new agents onto the team.</li>
          <li>To earn the bonus, an agent must close two team leads within their first 120 days on the team. A &ldquo;team lead&rdquo; is a lead provided through the team&rsquo;s lead sources. A lead counts only once the related transaction has closed.</li>
          <li>The 120-day period begins on the date the agent joins the team. Transactions that close after the 120 days do not count toward the bonus.</li>
          <li>Only one bonus is paid per agent. Bonuses are not transferable.</li>
          <li>The agent must remain affiliated with the team and in good standing when the bonus is paid.</li>
          <li>HHG determines whether the requirements have been met, and its determination is final.</li>
          <li>The bonus may be changed or ended at any time, as described in Section 2.</li>
        </ul>

        <h2 id="agent-plus">5. Agent+ buy-side bonus*</h2>
        <ul>
          <li>Agent+ is a dual licensing program offered by Mutual of Omaha Mortgage, Inc. (NMLS ID 1025894), not by HHG. Participation is governed by that company&rsquo;s program terms, policies, and applicable law.</li>
          <li>To take part, you must be licensed as a mortgage loan originator as required by law, complete the program&rsquo;s onboarding and any required licensing steps, and be approved by Mutual of Omaha Mortgage. Licensing information is available at <a href="https://www.nmlsconsumeraccess.org" target="_blank" rel="noopener noreferrer">nmlsconsumeraccess.org</a>.</li>
          <li>The advertised bonus is up to half a point, 50 basis points (0.50%), of the loan amount on buy-side files, on loan amounts up to $800,000. The most that can be earned on a single file under this formula is $4,000 (0.50% of $800,000). On loan amounts above $800,000, the amount is capped as described in the program terms.</li>
          <li>Compensation is paid only on loans that actually close and fund, and only to the extent permitted by applicable law and by the program terms. The program terms control how and when compensation is calculated and paid.</li>
          <li>All loans are subject to credit approval and to the lender&rsquo;s underwriting guidelines. Not all applicants will qualify.</li>
          <li>The Agent+ buy-side bonus is separate from, and in addition to, any real estate commission you earn on the same transaction.</li>
          <li>HHG does not make loans, does not guarantee loan approval, and does not control the terms of the Agent+ program.</li>
        </ul>

        <h2>6. Earnings and results</h2>
        <p>Numbers on this site, including volume, units, ranking, and the values shown for team benefits, reflect HHG&rsquo;s own information at the time they were published and may change. They are not a promise of what any agent will earn or receive.</p>

        <h2>7. Third-party names and links</h2>
        <p>This site mentions and links to third-party companies and products. HHG is not responsible for their content or terms. All trademarks belong to their owners.</p>

        <h2>8. Questions</h2>
        <p>To ask about these terms or about joining the team, use the <a href="/apply">Join</a> form on this site and a member of our recruiting team will respond.</p>
      </article>
      <SiteFooter />
    </>
  );
}
