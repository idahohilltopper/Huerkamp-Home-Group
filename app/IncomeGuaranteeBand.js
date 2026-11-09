import Link from 'next/link';

const reqs = [
  ['20 · 4 · 3', 'weekly activity', 'Every week: 20 conversations, 4 appointments set, and 3 appointments met, tracked in our CRM, Follow Up Boss, in at least 48 of the 52 weeks.'],
  ['2 / 3', 'signed agreements per 3 weeks', 'Keep a pace of at least 2 signed agreements every 3 weeks, averaged over the year.'],
  ['48', 'weekly accountability meetings', 'Attend 48 weekly accountability meetings (WAM) a year.'],
  ['100', 'leads, maximum', 'Never more than 100 leads assigned to you in Follow Up Boss.'],
  ['46', 'in-person team meetings', 'Attend 46 team meetings a year, in person.'],
];

export default function IncomeGuaranteeBand({ compact = false }) {
  return (
    <section className="ig-band" id="income-guarantee">
      <div className="ig-inner">
        <p className="ig-eyebrow">Income guarantee*</p>
        <h2><span className="ig-amount">$100,000</span> guaranteed income*</h2>
        <p className="ig-lead">When you hold up your end. Meet all five requirements below and we stand behind your income.</p>
        <div className="ig-grid">
          {reqs.map(([n, label, d]) => (
            <div className="ig-card" key={label}>
              <strong>{n}</strong>
              <span className="ig-label">{label}</span>
              <p>{d}</p>
            </div>
          ))}
        </div>
        {!compact && <Link href="/income-guarantee" className="btn ig-btn">See exactly how the guarantee works</Link>}
        <p className="ig-fine">*The guarantee applies only to agents who meet all five requirements. If your income falls short, HHG pays the difference up to $100,000. <Link href="/terms#income-guarantee">Terms and conditions apply.</Link></p>
      </div>
    </section>
  );
}
