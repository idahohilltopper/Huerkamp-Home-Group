import ApplyForm from './ApplyForm';

const badges = ['100% free to apply', 'Reply within 1 business day', 'Confidential conversation'];

const matchCards = [
  { who: 'You', tag: 'Ambitious agent', rows: [['Looking for', 'Leads · Training · Culture'], ['Goal', 'Close more deals'], ['Style', 'Collaborative']] },
  { who: 'Huerkamp Home Group', tag: 'Keller Williams team', rows: [['Founded', '2002'], ['Team', '~30 agents'], ['Volume', '~500 homes / year']] },
];

const perks = [
  ['Focus on the 20% that pays', 'Organized processes, systems, scripts, and manpower so you spend your time on the activities that make money, not the 80% that doesn\u2019t.'],
  ['Weekly MAPS coaching', 'One-on-one coaching every week to keep you accountable and growing.'],
  ['Client Care Manager', 'A dedicated manager handles client care and keeps your deals moving.'],
  ['Buyer leads provided', 'Paid lead sources feed the team so you spend time working leads, not buying them.'],
  ['Marketing handled', 'Marketing assistance, signs, cards, and quarterly client events. No marketing expenses.'],
  ['Cover while you\u2019re away', 'We care for your business while you are on vacation.'],
];

const valueRows = [
  ['Reduced company split', 9750, 1],
  ['Weekly coaching by MAPS coach', 1000, 52],
  ['Marketing assistance', 250, 12],
  ['Client Care Manager', 3000, 12],
  ['DocuSign', 20, 12],
  ['Commissions Inc website', 2000, 12],
  ['Open house signs', 30, 15],
  ['Business cards', 100, 1],
  ['Copy machine, toner, paper', 100, 12],
  ['Care for business while on vacation', 2500, 1],
  ['Buyer leads', 1000, 12],
  ['Office space / rent', 250, 12],
  ['Quarterly client events', 2500, 4],
];
const money = (n) => '$' + n.toLocaleString('en-US');
const valueTotal = valueRows.reduce((t, [, v, f]) => t + v * f, 0);

const steps = [
  ['Tell us what you want', 'Pick what matters most: leads, training, culture, split.'],
  ['Get matched', 'We review your goals and tell you honestly if HHG is the right fit.'],
  ['Meet the team', 'Coffee, a team meeting, or a day shadowing. See how we really work.'],
  ['Onboard & train', 'Get your CRM, scripts, and mentor lined up.'],
  ['Start closing', 'Work leads, build your pipeline, and grow with the group.'],
];

const free = ['Free to apply', 'Confidential conversation', 'Honest look at how we work', 'Shadow the team before you decide', 'Weekly MAPS coaching', 'Buyer leads, marketing and a Client Care Manager'];

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
          <a href="#team">Our team</a>
          <a href="#value">Your value</a>
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

      <section className="section split team" id="team">
        <img src="/team-photo.jpg" alt="The Huerkamp Home Group team at our annual planning retreat" className="team-img" />
        <div>
          <p className="eyebrow dark">Meet the team</p>
          <h2>People who want you to win</h2>
          <p className="sub left">We plan together, train together, and celebrate together. This is our crew at our annual planning retreat, where we map out the year ahead as one team.</p>
          <a href="#apply" className="btn">Come meet us</a>
        </div>
      </section>

      <section className="section" id="value">
        <p className="eyebrow dark">Team value proposition</p>
        <h2>What does this mean for you?</h2>
        <p className="sub">We have the processes, systems, scripts, experience and manpower to let you focus on the 20% of activities that make you money, not the 80% that doesn&apos;t.</p>
        <div className="tablewrap">
          <table className="value">
            <thead><tr><th>Team benefit</th><th>Value</th><th>Frequency</th><th>Annual value</th></tr></thead>
            <tbody>
              {valueRows.map(([n, v, f]) => (
                <tr key={n}><td>{n}</td><td>{money(v)}</td><td>{f}</td><td>{money(v * f)}</td></tr>
              ))}
              {['No marketing expenses', 'Reputation of a demonstrably successful team', 'Time'].map((n) => (
                <tr key={n}><td>{n}</td><td></td><td></td><td className="pl">Priceless</td></tr>
              ))}
            </tbody>
            <tfoot><tr><td colSpan="3">To try to recreate what we provide you</td><td>{money(valueTotal)}</td></tr></tfoot>
          </table>
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
