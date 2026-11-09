'use client';

import { useState } from 'react';
import Link from 'next/link';

const LICENSED = ['Yes, active license', 'In progress', 'Not yet, but interested'];
const EXPERIENCE = ['New to real estate', '1–3 years', '4–10 years', '10+ years'];
const WANTS = ['Warm leads', 'Hands-on training', 'Mentorship', 'Better split', 'Team culture', 'Tech & marketing', 'Room to grow', 'Transaction support'];

// Scored questions: each option is worth 1 to 4 points.
const scored = [
  {
    id: 'outreach',
    q: 'How do you feel about starting conversations with new people every day?',
    options: [['I would rather avoid it', 1], ['I can do it, but it takes effort', 2], ['I am comfortable with it', 3], ['I enjoy it', 4]],
  },
  {
    id: 'selfstart',
    q: 'When nobody is telling you what to do, you usually…',
    options: [['Struggle to get going', 1], ['Get going with some outside structure', 2], ['Make a plan and mostly follow it', 3], ['Set goals and hit them without being asked', 4]],
  },
  {
    id: 'runway',
    q: 'How many months could you comfortably cover your expenses while you build a pipeline?',
    options: [['Less than 1 month', 1], ['1–3 months', 2], ['4–6 months', 3], ['7 months or more', 4]],
  },
  {
    id: 'coaching',
    q: 'Would you show up every week for coaching and an accountability meeting?',
    options: [['I would rather work on my own', 1], ['I am not sure', 2], ['Probably yes', 3], ['Definitely, I want that', 4]],
  },
];

const steps = [
  { id: 'licensed', type: 'single', q: 'Where are you in the process?', options: LICENSED.map((x) => [x, 0]) },
  { id: 'experience', type: 'single', q: 'How long have you been in real estate?', options: EXPERIENCE.map((x) => [x, 0]) },
  { id: 'time', type: 'single', q: 'How much time could you give real estate?', options: [['Full-time', 0], ['Part-time for now', 0], ['Part-time, building toward full-time', 0]] },
  { id: 'wants', type: 'multi', q: 'What matters most to you in a team? Pick any that apply.', options: WANTS },
  ...scored.map((s) => ({ ...s, type: 'single' })),
];

function tierFor(score) {
  if (score >= 13) return { key: 'strong', title: 'Strong fit', text: 'Your answers point to someone who would do well on a high-energy, high-accountability team. The next step is a conversation, so you can see how it works in real life.' };
  if (score >= 9) return { key: 'promising', title: 'Promising', text: 'You have a lot of what it takes. A few things are worth lining up first, like your financial runway or your comfort with daily outreach, and the right team can help with both.' };
  return { key: 'explore', title: 'Worth exploring first', text: 'Real estate asks a lot, especially at the start. There is no rush. Learn how the career works, and come back when the timing feels right.' };
}

export default function Quiz() {
  const [i, setI] = useState(0);
  const [a, setA] = useState({ wants: [] });
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', website: '' });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const step = steps[i];
  const answered = step && (step.type === 'multi' ? true : a[step.id] !== undefined);
  const score = scored.reduce((t, s) => t + (a[s.id]?.points || 0), 0);
  const tier = tierFor(score);

  const choose = (opt) => setA({ ...a, [step.id]: { label: opt[0], points: opt[1] } });
  const toggle = (w) => setA({ ...a, wants: a.wants.includes(w) ? a.wants.filter((x) => x !== w) : [...a.wants, w] });
  const next = () => (i === steps.length - 1 ? setDone(true) : setI(i + 1));
  const restart = () => { setI(0); setA({ wants: [] }); setDone(false); setStatus('idle'); setError(''); };

  const notLicensed = a.licensed?.label !== 'Yes, active license';
  const fullTime = a.time?.label === 'Full-time';

  async function send(e) {
    e.preventDefault();
    setStatus('sending'); setError('');
    const message = [
      `Career quiz result: ${tier.title} (${score}/16).`,
      `Time: ${a.time?.label}.`,
      `Outreach: ${a.outreach?.label}.`,
      `Self-starter: ${a.selfstart?.label}.`,
      `Runway: ${a.runway?.label}.`,
      `Coaching: ${a.coaching?.label}.`,
    ].join(' ');
    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, email: form.email, phone: form.phone, website: form.website,
          licensed: a.licensed?.label, experience: a.experience?.label, looking: a.wants, message,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      setStatus('done');
    } catch (err) { setError(err.message); setStatus('error'); }
  }

  if (!done) {
    return (
      <div className="quiz" role="group" aria-label="Career quiz">
        <div className="quiz-progress" aria-live="polite">
          <span>Question {i + 1} of {steps.length}</span>
          <div className="bar"><div style={{ width: `${((i + 1) / steps.length) * 100}%` }} /></div>
        </div>
        <fieldset key={step.id} className="quiz-q">
          <legend>{step.q}</legend>
          {step.type === 'multi' ? (
            <div className="chips">
              {step.options.map((w) => (
                <label key={w} className={'chip' + (a.wants.includes(w) ? ' on' : '')}>
                  <input type="checkbox" className="sr" checked={a.wants.includes(w)} onChange={() => toggle(w)} />{w}
                </label>
              ))}
            </div>
          ) : (
            <div className="opts">
              {step.options.map((o) => (
                <label key={o[0]} className={'opt' + (a[step.id]?.label === o[0] ? ' on' : '')}>
                  <input type="radio" className="sr" name={step.id} checked={a[step.id]?.label === o[0]} onChange={() => choose(o)} />{o[0]}
                </label>
              ))}
            </div>
          )}
        </fieldset>
        <div className="quiz-nav">
          <button type="button" className="btn ghost-dark" onClick={() => setI(i - 1)} disabled={i === 0}>Back</button>
          <button type="button" className="btn" onClick={next} disabled={!answered}>{i === steps.length - 1 ? 'See my results' : 'Next'}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz result" aria-live="polite">
      <p className="eyebrow dark">Your result</p>
      <h2>{tier.title}</h2>
      <p className="score">{score} out of 16</p>
      <p className="sub">{tier.text}</p>
      <h3>Your next steps</h3>
      <ul className="steps-list">
        {notLicensed && <li><Link href="/become-a-real-estate-agent-minnesota">Read how to get your Minnesota real estate license</Link> so you know exactly what is involved.</li>}
        {a.coaching?.points >= 3 && <li>See our <Link href="/real-estate-coaching-training-twin-cities">weekly coaching and accountability</Link>, which looks like what you told us you want.</li>}
        {(fullTime && a.runway?.points <= 2) && <li>Look at our <Link href="/income-guarantee">$100,000 income guarantee*</Link>. It is built for full-time agents who meet the requirements.</li>}
        <li>Compare teams with our <Link href="/join-a-real-estate-team-twin-cities">ten questions to ask any team</Link>.</li>
        <li>Or <Link href="/why-hhg">see everything the team provides</Link>.</li>
      </ul>
      <p className="fine-print">*Terms and conditions apply. <Link href="/terms">Read the terms.</Link></p>

      <div className="quiz-contact">
        <h3>Want to talk it through?</h3>
        <p>Your answers stay on your device until you send them. If you would like a confidential conversation with our recruiting team, send your details and we will reply within one business day.</p>
        {status === 'done' ? (
          <div className="thanks"><h3>Got it, thank you.</h3><p>A member of our recruiting team will reach out within one business day.</p></div>
        ) : (
          <form onSubmit={send} className="form">
            <label>Full name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" /></label>
            <div className="row">
              <label>Email<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" /></label>
              <label>Phone<input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} autoComplete="tel" /></label>
            </div>
            <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            {status === 'error' && <p className="err">{error}</p>}
            <button type="submit" className="btn" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Send my results to the team'}</button>
            <p className="fine">Free, confidential, no obligation.</p>
          </form>
        )}
      </div>
      <button type="button" className="btn ghost-dark" onClick={restart}>Retake the quiz</button>
    </div>
  );
}
