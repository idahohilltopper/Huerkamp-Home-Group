import SiteHeader from '../SiteHeader';
import SiteFooter from '../SiteFooter';
import PageHero from '../PageHero';
import ApplySection from '../ApplySection';

export const metadata = { title: 'Your Value | Huerkamp Home Group', description: 'What the Huerkamp Home Group team value proposition means for you.' };

const valueRows = [
  ['Reduced company split', 9750, 1],
  ['Weekly coaching from former MAPS coaches', 1000, 12],
  ['Marketing assistance', 250, 12],
  ['Client Care Manager', 3000, 12],
  ['DocuSign', 20, 12],
  ['Commissions Inc website', 2000, 12],
  ['Open house signs', 30, 15],
  ['Business cards', 100, 1],
  ['Copy machine, toner, paper', 100, 12],
  ['Care for business while on vacation', 2500, 1],
  ['Buyer and seller leads', 5000, 12],
  ['Office space / rent', 250, 12],
  ['Quarterly client events', 2500, 4],
];
const money = (n) => '$' + n.toLocaleString('en-US');
const valueTotal = valueRows.reduce((t, [, v, f]) => t + v * f, 0);

export default function Value() {
  return (
    <>
      <SiteHeader />
      <PageHero eyebrow="Team value proposition" title="What does this mean for you?">
        Everything the team provides, and what it would cost you to try to recreate it on your own.
      </PageHero>
      <section className="section" id="value">
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
      <ApplySection />
      <SiteFooter />
    </>
  );
}
