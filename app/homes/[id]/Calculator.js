'use client';
import { useState } from 'react';
import { payment, money } from '../data';

export default function Calculator({ price, taxAnnual, insuranceAnnual, hoa }) {
  const [p, setP] = useState(price);
  const [down, setDown] = useState(20);
  const [rate, setRate] = useState(6.75);
  const [years, setYears] = useState(30);
  const r = payment({ price: p, down: down / 100, rate, years, taxAnnual, insuranceAnnual, hoa: hoa || 0 });
  const num = (set) => (e) => set(Math.max(0, Number(e.target.value) || 0));
  return (
    <div className="lst-calc">
      <div className="lst-calc-in">
        <label>Home price<input type="number" inputMode="numeric" value={p} onChange={num(setP)} /></label>
        <label>Down payment (%)<input type="number" inputMode="decimal" value={down} min="0" max="100" onChange={num(setDown)} /></label>
        <label>Interest rate (%)<input type="number" inputMode="decimal" step="0.125" value={rate} onChange={num(setRate)} /></label>
        <label>Loan term<select value={years} onChange={(e) => setYears(Number(e.target.value))}><option value={30}>30 years</option><option value={20}>20 years</option><option value={15}>15 years</option></select></label>
      </div>
      <div className="lst-calc-out" aria-live="polite">
        <p className="big">{money(r.total)}<span>/mo</span></p>
        <div className="lst-bar" aria-hidden="true">
          <i style={{ width: (r.pi / r.total) * 100 + '%', background: '#0a0a0b' }} />
          <i style={{ width: (r.tax / r.total) * 100 + '%', background: '#d40000' }} />
          <i style={{ width: (r.ins / r.total) * 100 + '%', background: '#8a8c90' }} />
          <i style={{ width: ((r.hoa || 0) / r.total) * 100 + '%', background: '#d9dadd' }} />
        </div>
        <p className="fine">Loan amount {money(r.loan)}</p>
        <ul>
          <li><span>Principal and interest</span><b>{money(r.pi)}</b></li>
          <li><span>Property tax</span><b>{money(r.tax)}</b></li>
          <li><span>Home insurance</span><b>{money(r.ins)}</b></li>
          {hoa ? <li><span>HOA</span><b>{money(hoa)}</b></li> : null}
        </ul>
        <p className="fine">Estimate only. Rate, taxes and insurance are assumptions, not a quote or loan offer.</p>
      </div>
    </div>
  );
}
