import SiteHeader from '../SiteHeader';
import SiteFooter from '../SiteFooter';
import PageHero from '../PageHero';
import ApplySection from '../ApplySection';
import IncomeGuaranteeBand from '../IncomeGuaranteeBand';

export const metadata = {
  title: '$100,000 Income Guarantee for Agents',
  description: 'How the Huerkamp Home Group $100,000 income guarantee works: the five requirements, how activity is tracked in Follow Up Boss, and how the payout is figured.',
  alternates: { canonical: '/income-guarantee' },
};

export default function IncomeGuarantee() {
  return (
    <>
      <SiteHeader />
      <PageHero eyebrow="Income guarantee" title="The $100,000 income guarantee">
        Income insurance for agents who do the work. Here is exactly how it works, so you know what to expect before you join.
      </PageHero>
      <IncomeGuaranteeBand compact />
      <article className="section prose">
        <h2>1. What it is</h2>
        <p>The guarantee is built for full-time agents at Huerkamp Home Group who commit to our system and show up week after week. If you meet every requirement for a full 12 months and your commission income comes in under $100,000, HHG pays you the difference.</p>
        <p>It is not a handout. It is a safety net for people who do the work.</p>

        <h2>2. How the payout works</h2>
        <ul>
          <li>Your 12-month period starts on the date you sign the program acknowledgment, and you can sign only during your first year on the team.</li>
          <li>At the end of your 12-month period, we review your records to confirm you met every requirement.</li>
          <li>We total your commission income for the period. That means your own share of each commission after the team split, on transactions that closed.</li>
          <li>If you met every requirement and your total is below $100,000, HHG pays you the difference between your total and $100,000, as a lump sum or in another way we agree on in writing.</li>
          <li>If your total is $100,000 or more, nothing is owed. You simply earned it.</li>
          <li>If you did not meet every requirement, no payout is due under the program.</li>
        </ul>
        <p><strong>Example:</strong> if you meet every requirement and your own commission income for the 12 months is $72,000, HHG pays you $28,000, which brings you to $100,000.</p>

        <p><strong>Production benchmark:</strong> based on an average agent commission of about $5,000 per closed transaction, $100,000 of agent income is about 20 closed units in 12 months. The weekly standards below are designed to reasonably lead to that level of production. The benchmark is not a requirement and is not a promise of results, and the payout is figured only as described above.</p>

        <h2>3. The five requirements</h2>
        <p>You must meet all five. They are tracked in Follow Up Boss, except for meeting attendance, which HHG records.</p>
        <ul>
          <li><strong>Weekly activity.</strong> Every week you have at least 20 conversations, set at least 4 appointments, and meet at least 3 appointments, logged in Follow Up Boss, in at least 48 of the 52 weeks of your 12-month period. A conversation is live, two-way contact with a potential buyer, seller, or referral partner about real estate. An appointment set is an agreed date and time with a qualified prospect to meet virtually or in person about a real estate need. An appointment met is one where the client actually shows and the meeting happens.</li>
          <li><strong>A signed agreement pace.</strong> You keep a pace of at least 2 signed agreements every 3 weeks, averaged over the year. We check this monthly on a rolling basis.</li>
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
          <li>You can join the program only during your first year on the team.</li>
          <li><strong>&ldquo;Full-time&rdquo;</strong> means real estate is your primary occupation and your main source of working income, you do not hold other full-time employment, and you are available to meet the weekly activity standards and attend the required meetings.</li>
          <li><strong>&ldquo;Good standing&rdquo;</strong> means you hold an active real estate license with no suspension or disciplinary action that restricts it, you follow team policies, brokerage rules, and applicable ethical and legal standards, you are not under a written warning or corrective plan for a policy violation, and you are current on any fees or amounts owed to the team or brokerage.</li>
          <li>Referral-only or sphere-only agents, part-time agents, limited-duty agents, and agents whose role is mainly inside sales or admin and support are not eligible unless we agree otherwise in writing. Unless we agree in writing, only producing field agents are eligible.</li>
        </ul>

        <h2>5. Follow Up Boss is the scoreboard</h2>
        <p>You log your conversations, appointments set and met, signed agreements, properties under contract, and closed units and commission in Follow Up Boss. Your activity is measured there. If it is not logged there, it does not count toward the program. That also means we can coach it, you can improve it, and it is part of the record we review at the end of your 12 months. You are responsible for logging your own activity accurately and on time.</p>

        <h2>6. When the guarantee does not apply</h2>
        <p>No payout is made if:</p>
        <ul>
          <li>you leave the team before your 12 months are complete;</li>
          <li>you are terminated for cause or for violating team or brokerage policy;</li>
          <li>you do not log your activity consistently in Follow Up Boss;</li>
          <li>you miss the weekly activity standards (20 conversations, 4 appointments set, and 3 met) in more than 4 weeks during the 12 months;</li>
          <li>you fall short of any of the five requirements; or</li>
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
