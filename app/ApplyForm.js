'use client';

import { useState } from 'react';

const LOOKING = ['Warm leads', 'Hands-on training', 'Mentorship', 'Better split', 'Team culture', 'Tech & marketing', 'Room to grow', 'Transaction support'];
const initial = { name: '', email: '', phone: '', licensed: '', experience: '', message: '', website: '' };

export default function ApplyForm() {
  const [form, setForm] = useState(initial);
  const [looking, setLooking] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const toggle = (t) => setLooking(looking.includes(t) ? looking.filter((x) => x !== t) : [...looking, t]);

  async function onSubmit(e) {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, looking }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      setStatus('done');
      setForm(initial);
      setLooking([]);
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }

  if (status === 'done') {
    return (
      <div className="thanks">
        <h3>You&apos;re in. We&apos;ll be in touch.</h3>
        <p>A member of the HHG recruiting team will reach out within one business day.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="form">
      <fieldset className="chips">
        <legend>What are you looking for in a team?</legend>
        {LOOKING.map((t) => (
          <button type="button" key={t} className={looking.includes(t) ? 'chip on' : 'chip'}
            aria-pressed={looking.includes(t)} onClick={() => toggle(t)}>{t}</button>
        ))}
      </fieldset>
      <label>Full name
        <input required value={form.name} onChange={set('name')} autoComplete="name" />
      </label>
      <div className="row">
        <label>Email
          <input required type="email" value={form.email} onChange={set('email')} autoComplete="email" />
        </label>
        <label>Phone
          <input required type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" />
        </label>
      </div>
      <div className="row">
        <label>Are you licensed?
          <select required value={form.licensed} onChange={set('licensed')}>
            <option value="">Select…</option>
            <option>Yes, active license</option>
            <option>In progress</option>
            <option>Not yet, but interested</option>
          </select>
        </label>
        <label>Years in real estate
          <select value={form.experience} onChange={set('experience')}>
            <option value="">Select…</option>
            <option>New to real estate</option>
            <option>1–3 years</option>
            <option>4–10 years</option>
            <option>10+ years</option>
          </select>
        </label>
      </div>
      <label>Anything else we should know?
        <textarea rows={3} value={form.message} onChange={set('message')} />
      </label>
      <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true"
        value={form.website} onChange={set('website')} />
      {status === 'error' && <p className="err">{error}</p>}
      <button type="submit" className="btn" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'See my match'}
      </button>
      <p className="fine">Free to apply. No obligation. We never share your info.</p>
    </form>
  );
}
