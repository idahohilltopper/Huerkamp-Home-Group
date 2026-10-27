import SiteHeader from '../SiteHeader';
import SiteFooter from '../SiteFooter';
import PageHero from '../PageHero';
import ApplySection from '../ApplySection';
import IncomeGuaranteeBand from '../IncomeGuaranteeBand';

export const metadata = {
  title: '$150,000 Income Guarantee | Huerkamp Home Group',
  description: 'How the Huerkamp Home Group $150,000 income guarantee works: the requirements, how it is tracked in Follow Up Boss, and how the payout is calculated.',
};

export default function IncomeGuarantee() {
  return (
    <>
      <SiteHeader />
      <PageHero eyebrow="Income guarantee" title="The $150,000 income guarantee">
        Income insurance for agents who do the work. Here is exactly how it works, so you know what to expect before you join.
      </PageHero>
      <IncomeGuaranteeBand compact />
      <article className="section prose">
        <h2>1. What it is</h2>
        <p>The guarantee is built for full-time agents at Huerkamp Home Group who commit to our system and show up every week. If you meet every requirement for a full 12 months and your commission income comes in under $150,000, HHG pays you the difference.</p>
        <p>It is not a handout. It is a safety net for people who do the work.</p>

        <h2>2. How the payout works</h2>
        <ul>
          <li>At the end of your 12-month period, we review your records to confirm you met every requirement.</li>
          <li>We total your commission income for the period. That means your own share of each commission after the team split, on transactions that closed.</li>
          <li>If you met every requirement and your total is below $150,000, HHG pays you the difference between your total and $150,000, as a lump sum or in another way we agree on in writing.</li>
          <li>If your total is $150,000 or more, nothing is owed. You simply earned it.</li>
          <li>If you did not meet every requirement, no payout is due under the program.</li>
        </ul>
        <p><strong>Example:</strong> if you meet every requirement and your own commission income for the 12 months is $112,000, HHG pays you $38,000, which brings you to $150,000.</p>

        <h2>3. The four requirements</h2>
        <p>You must meet all four. They are tracked in Follow Up Boss, except for meeting attendance, which HHG records.</p>
        <ul>
          <li><strong>100 contacts every week.</strong> A minimum of 100 contacts a week, logged in Follow Up Boss.</li>
          <li><strong>48 weekly accountability meetings a year.</strong> You attend 48 of our weekly accountability meetings (WAM) over the 12 months.</li>
          <li><strong>No more than 100 leads.</strong> You never have more than 100 leads assigned to you in Follow Up Boss at one time.</li>
          <li><strong>46 team meetings a year, in person.</strong> You attend 46 team meetings over the 12 months, in person.</li>
        </ul>

        <h2>4. Who is eligible</h2>
        <ul>
          <li>You are a full-time agent, and real estate is your primary occupation.</li>
          <li>You are licensed with HHG through Keller Williams Preferred Realty, and you stay in good standing for the full 12 months.</li>
          <li>You follow team policies, brokerage rules, and all applicable legal and ethical standards.</li>
          <li>You sign the program acknowledgment in writing. The guarantee applies only to agents who have signed.</li>
          <li>Referral-only agents, part-time agents, and agents whose role is mainly inside sales or admin and support are not eligible unless we agree otherwise in writing.</li>
        </ul>

        <h2>5. Follow Up Boss is the scoreboard</h2>
        <p>Your activity is measured in Follow Up Boss. If it is not logged there, it does not count toward the program. That also means we can coach it, you can improve it, and it is part of the record we review at the end of your 12 months. You are responsible for logging your own activity accurately and on time.</p>

        <h2>6. When the guarantee does not apply</h2>
        <p>No payout is made if:</p>
        <ul>
          <li>you leave the team before your 12 months are complete;</li>
          <li>you are terminated for cause or for violating team or brokerage policy;</li>
          <li>you do not log your activity consistently in Follow Up Boss;</li>
          <li>you fall short of any of the four requirements; or</li>
          <li>you take part in conduct that harms the team&rsquo;s reputation, operations, or clients.</li>
        </ul>

        <h2>7. Changes to the program</h2>
        <p>HHG may change the standards or structure of the program, or end it for future periods. Any change applies going forward and will be given to you in writing. The program does not guarantee employment or independent contractor status for any length of time, and it is subject to brokerage policies and to state and local real estate laws and regulations.</p>

        <h2>8. Questions</h2>
        <p>Want to talk it through? Use the <a href="/apply">Join</a> form and a member of our recruiting team will walk you through it. The full list of our offer terms is on the <a href="/terms">terms and conditions</a> page.</p>
      </article>
      <ApplySection />
      <SiteFooter />
    </>
  );
}
