import ApplyForm from './ApplyForm';

const badges = ['100% free to apply', 'Reply within 1 business day', 'Confidential conversation'];

const matchCards = [
  { who: 'You', tag: 'Ambitious agent', rows: [['Looking for', 'Leads · Training · Culture'], ['Goal', 'Close more deals'], ['Style', 'Collaborative']] },
  { who: 'Huerkamp Home Group', tag: 'Keller Williams team', rows: [['Founded', '2002'], ['Team', '~30 agents'], ['Volume', '~500 homes / year']] },
];

const perks = [
  ['Warm leads, every week', 'Company-generated leads routed to agents who show up and follow up.'],
  ['Training that sticks', 'Scripts, role-play, and a structured first 90 days. You are never guessing.'],
  ['Real mentorship', 'Work alongside experienced agents on listings, offers, and negotiations.'],
  ['Tech & marketing built in', 'CRM, listing marketing, social content, and transaction support.'],
  ['Culture that wins together', 'Collaborative, not cutthroat. We celebrate every closing.'],
  ['Room to grow', 'Clear paths from new agent to top producer to team leader.'],
];

const steps = [
  ['Tell us what you want', 'Pick what matters most: leads, training, culture, split.'],
  ['Get matched', 'We review your goals and tell you honestly if HHG is the right fit.'],
  ['Meet the team', 'Coffee, a team meeting, or a day shadowing. See how we really work.'],
  ['Onboard & train', 'Get your CRM, scripts, and mentor lined up.'],
  ['Start closing', 'Work leads, build your pipeline, and grow with the group.'],
];

const free = ['Free to apply', 'Confidential conversation', 'Honest look at how we work', 'Shadow the team before you decide', 'Mentor assigned from day one', 'Lead flow, CRM and marketing tools'];

const faqs = [
  ['Do I need to be licensed?', 'No. We talk with licensed agents, agents in the licensing process, and people curious about the career.'],
  ['Is it really free to apply?', 'Yes. Applying and talking with us costs nothing and carries no obligation.'],
  ['Where is HHG located?', 'We are a Keller Williams Preferred Realty team based in Burnsville, MN.'],
  ['How fast will I hear back?', 'Within one business day.'],
];

export default function Home() {
  return (
    <>
      <header className="nav">
        <img src="/hhg-logo.png" alt="Huerkamp Home Group" className="logo-img" />
        <nav>
          <a href="#why">Why HHG</a>
          <a href="#how">How it works</a>
          <a href="#faq">FAQ</a>
          <a href="#apply" className="btn small">Join</a>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Now recruiting agents</p>
          <h1>Get matched with <em>a team</em> that helps you close more deals.</h1>
          <p className="sub">Tell us what you want in a team: leads, training, culture, support. We&apos;ll show you how Huerkamp Home Group delivers it.</p>
          <div className="cta-row">
            <a href="#apply" className="btn">See my match</a>
            <a href="#how" className="btn ghost">How it works</a>
          </div>
          <ul className="badges">{badges.map((b) => <li key={b}>✓ {b}</li>)}</ul>
        </div>
        <div className="hero-cards" aria-hidden="true">
          {matchCards.map((c, i) => (
            <div className={'pcard' + (i ? ' b' : '')} key={c.who}>
              <div className="pcard-h"><strong>{c.who}</strong><span>{c.tag}</span></div>
              {c.rows.map(([k, v]) => <p key={k}><span>{k}</span>{v}</p>)}
            </div>
          ))}
          <div className="match">Great match</div>
        </div>
      </section>

      <div className="strip">Keller Williams Preferred Realty · Burnsville, MN · Serving the Twin Cities since 2002</div>

      <section className="section" id="why">
        <p className="eyebrow dark">Why HHG</p>
        <h2>Everything you need to build a business</h2>
        <p className="sub">No searching. No cold calls. Just a team built to help you win.</p>
        <div className="grid">
          {perks.map(([t, d]) => (
            <div className="card" key={t}><h3>{t}</h3><p>{d}</p></div>
          ))}
        </div>
      </section>

      <section className="section alt" id="how">
        <p className="eyebrow dark">How it works</p>
        <h2>From hello to closing in five steps</h2>
        <ol className="steps">
          {steps.map(([t, d], i) => (
            <li key={t}><span>{i + 1}</span><h3>{t}</h3><p>{d}</p></li>
          ))}
        </ol>
      </section>

      <section className="section split">
        <div>
          <p className="eyebrow dark">For agents</p>
          <h2>Free for agents. Always.</h2>
          <p className="sub left">Joining the conversation costs nothing. Here&apos;s what you get from day one.</p>
          <a href="#apply" className="btn">Get started, it&apos;s free</a>
        </div>
        <ul className="checks">{free.map((f) => <li key={f}>{f}</li>)}</ul>
      </section>

      <section className="section alt" id="faq">
        <h2>Questions, answered</h2>
        <div className="faq">
          {faqs.map(([q, a]) => (
            <details key={q}><summary>{q}</summary><p>{a}</p></details>
          ))}
        </div>
      </section>

      <section className="final" id="apply">
        <h2>Ready for new opportunities?</h2>
        <p className="sub">Tell us what you&apos;re looking for. We&apos;ll take it from there.</p>
        <div className="formwrap"><ApplyForm /></div>
      </section>

      <footer className="footer">
        <img src="/hhg-logo.png" alt="" className="logo-img foot" />
        <p>Huerkamp Home Group · Keller Williams Preferred Realty · 14300 Nicollet Ct, Burnsville, MN 55306</p>
        <p>© {new Date().getFullYear()} Huerkamp Home Group. All rights reserved. Equal Housing Opportunity.</p>
      </footer>
    </>
  );
}
