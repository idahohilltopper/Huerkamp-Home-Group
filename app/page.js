import ApplyForm from './ApplyForm';

const perks = [
  ['Warm leads, every week', 'Company-generated leads routed to agents who show up and follow up.'],
  ['Real training', 'Scripts, role-play, and a structured first 90 days so you are never guessing.'],
  ['Mentorship', 'Work alongside experienced agents on listings, offers, and negotiations.'],
  ['Tech & marketing', 'CRM, listing marketing, social content, and transaction coordination included.'],
  ['Team culture', 'Collaborative, not cutthroat. We win together and celebrate it.'],
  ['Room to grow', 'Clear paths to top producer, team lead, and beyond.'],
];

const steps = [
  ['Apply', 'Tell us a little about yourself below.'],
  ['Chat', 'A relaxed conversation about your goals and our team.'],
  ['Shadow', 'Meet the team and see how a week at HHG really works.'],
  ['Launch', 'Onboard, train, and start working leads.'],
];

export default function Home() {
  return (
    <>
      <header className="nav">
        <span className="logo">Huerkamp Home Group</span>
        <a href="#apply" className="btn small">Apply</a>
      </header>

      <section className="hero">
        <p className="eyebrow">Now recruiting agents</p>
        <h1>Build a real estate career with people who invest in you.</h1>
        <p className="sub">
          Huerkamp Home Group pairs ambitious agents with leads, training, and a team that
          wants you to win.
        </p>
        <a href="#apply" className="btn">Join the team</a>
      </section>

      <section className="section">
        <h2>Why agents choose HHG</h2>
        <div className="grid">
          {perks.map(([t, d]) => (
            <div className="card" key={t}><h3>{t}</h3><p>{d}</p></div>
          ))}
        </div>
      </section>

      <section className="section alt">
        <h2>How it works</h2>
        <ol className="steps">
          {steps.map(([t, d], i) => (
            <li key={t}><span>{i + 1}</span><h3>{t}</h3><p>{d}</p></li>
          ))}
        </ol>
      </section>

      <section className="section narrow" id="apply">
        <h2>Let&apos;s talk</h2>
        <p className="sub">No pressure, just a conversation about where you want your career to go.</p>
        <ApplyForm />
      </section>

      <footer className="footer">© {new Date().getFullYear()} Huerkamp Home Group. All rights reserved.</footer>
    </>
  );
}
