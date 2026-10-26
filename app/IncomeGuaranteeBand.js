import Link from 'next/link';

const reqs = [
  ['100', 'contacts every week', 'Minimum of 100 contacts a week, tracked in our CRM, Follow Up Boss.'],
  ['48', 'weekly accountability meetings', 'Attend 48 weekly accountability meetings (WAM) a year.'],
  ['100', 'leads, maximum', 'Never more than 100 leads assigned to you in Follow Up Boss.'],
  ['46', 'in-person team meetings', 'Attend 46 team meetings a year, in person.'],
];

export default function IncomeGuaranteeBand() {
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
        <p className="ig-fine">*The guarantee applies only to agents who meet all four requirements. <Link href="/terms#income-guarantee">Terms and conditions apply.</Link></p>
      </div>
    </section>
  );
}
