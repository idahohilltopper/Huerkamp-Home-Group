import Link from 'next/link';

const reqs = [
  ['100', 'contacts a week', 'Reach 100 contacts a week, tracked in our CRM, Follow Up Boss, in at least 48 of the 52 weeks.'],
  ['48', 'weekly accountability meetings', 'Attend 48 weekly accountability meetings (WAM) a year.'],
  ['100', 'leads, maximum', 'Never more than 100 leads assigned to you in Follow Up Boss.'],
  ['46', 'in-person team meetings', 'Attend 46 team meetings a year, in person.'],
];

export default function IncomeGuaranteeBand({ compact = false }) {
  return (
    <section className="ig-band" id="income-guarantee">
      <div className="ig-inner">
        <p className="ig-eyebrow">Income guarantee*</p>
        <h2><span className="ig-amount">$150,000</span> guaranteed income*</h2>
        <p className="ig-lead">When you hold up your end. Meet all four requirements below and we stand behind your income.</p>
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
        <p className="ig-fine">*The guarantee applies only to agents who meet all four requirements. If your income falls short, HHG pays the difference up to $150,000. <Link href="/terms#income-guarantee">Terms and conditions apply.</Link></p>
      </div>
    </section>
  );
}
