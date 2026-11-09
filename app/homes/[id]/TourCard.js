'use client';
import { useState, useMemo } from 'react';

const TIMES = ['9:00 am', '10:00 am', '11:00 am', '12:00 pm', '1:00 pm', '2:00 pm', '3:00 pm', '4:00 pm', '5:00 pm'];

export default function TourCard({ address, compact }) {
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i + 1); return d; }), []);
  const [day, setDay] = useState(0);
  const [time, setTime] = useState(TIMES[3]);
  const [open, setOpen] = useState(!compact);
  const [done, setDone] = useState(false);
  if (done) return <div className="lst-tour"><h3>Tour request ready</h3><p>Demo mode: nothing was sent. Once the lead form is connected to Follow Up Boss, this will notify an HHG agent.</p></div>;
  return (
    <form className="lst-tour" onSubmit={(e) => { e.preventDefault(); setDone(true); }}>
      <h3>Tour this home</h3>
      <p className="fine">{address}</p>
      {!open ? <button type="button" className="btn" onClick={() => setOpen(true)}>Request a tour</button> : (
        <>
          <div className="lst-days" role="radiogroup" aria-label="Tour date">
            {days.slice(0, 4).map((d, i) => (
              <button type="button" key={i} role="radio" aria-checked={day === i} className={day === i ? 'on' : ''} onClick={() => setDay(i)}>
                <b>{d.toLocaleDateString('en-US', { weekday: 'short' })}</b><span>{d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </button>
            ))}
          </div>
          <label>Time<select value={time} onChange={(e) => setTime(e.target.value)}>{TIMES.map((t) => <option key={t}>{t}</option>)}</select></label>
          <label>Name<input required autoComplete="name" /></label>
          <label>Phone<input required type="tel" autoComplete="tel" /></label>
          <label>Email<input required type="email" autoComplete="email" /></label>
          <button type="submit" className="btn">Request a tour</button>
          <p className="fine">Free, no obligation. An HHG agent will confirm your time.</p>
        </>
      )}
    </form>
  );
}
