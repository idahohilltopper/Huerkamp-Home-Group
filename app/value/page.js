import SiteHeader from '../SiteHeader';
import SiteFooter from '../SiteFooter';
import PageHero from '../PageHero';
import ApplySection from '../ApplySection';

export const metadata = { title: 'Your Value | Huerkamp Home Group', description: 'What the Huerkamp Home Group team value proposition means for you.' };

const valueRows = [
  ['Reduced company split', 9750, 1],
  ['Weekly coaching', 1000, 12],
  ['Marketing assistance', 250, 12],
  ['Client Care Manager', 3000, 12],
  ['DocuSign', 20, 12],
  ['CINC (Commissions Inc) website', 100, 12],
  ['Fello targeting lists and ads', 3000, 1],
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

const coaches = [
  ['Jeff Glover', 'National coach', 'Jeff Glover is a national real estate coach and the founder of Glover U. He coaches the team every week and also leads his own group coaching.', 'https://www.gloveru.com/meet-jeff'],
  ['Olivia Manson', 'Coach', 'Weekly coaching to keep you on track.'],
  ['Jason Huerkamp', 'Coach and co-founder', 'Weekly coaching from the team\u2019s co-founder.'],
];

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
      <section className="section coaching">
        <p className="eyebrow dark">Weekly coaching</p>
        <h2>Coaching every week, from people who&apos;ve done it</h2>
        <p className="sub">Weekly coaching is built into the team, with a national coach and two team coaches.</p>
        <div className="coaches">
          {coaches.map(([name, role, blurb, link]) => (
            <div className="card coach" key={name}>
              <h3>{name}</h3>
              <p className="role">{role}</p>
              <p>{blurb}</p>
              {link && <a href={link} target="_blank" rel="noopener noreferrer" className="coach-link">Meet {name.split(' ')[0]} ↗</a>}
            </div>
          ))}
        </div>
        <div className="group-coach">
          <div>
            <p className="eyebrow dark">Group coaching</p>
            <h3>Group coaching with Jeff Glover himself</h3>
            <p>Jeff Glover personally leads group coaching, and he does it for only 10 people in the United States. Learn more about his coaching platform, Glover U.</p>
          </div>
          <a href="https://www.gloveru.com" target="_blank" rel="noopener noreferrer" className="btn">Visit Glover U ↗</a>
        </div>
        <div className="wam">
          <h3>Plus a weekly accountability meeting</h3>
          <p>Every week the team also holds WAM, our weekly accountability meeting, a core practice from the book <em>The 12 Week Year</em>. You review last week against your plan, commit to the specific actions for the week ahead, and keep each other accountable. Coaching shows you what to do. WAM makes sure it gets done.</p>
        </div>
        <p className="fine-print">Coaching is valued at $1,000 a month ($12,000 a year) and is included with the team.</p>
      </section>

      <ApplySection />
      <SiteFooter />
    </>
  );
}
