import Link from 'next/link';
import TopPerks from './TopPerks';

const links = [
  ['/why-hhg', 'Why HHG'],
  ['/our-team', 'Our team'],
  ['/value', 'Your value'],
  ['/agent-plus', 'Agent+'],
  ['/how-it-works', 'How it works'],
  ['/faq', 'FAQ'],
];

export default function SiteHeader() {
  return (
    <>
    <header className="nav">
      <Link href="/"><img src="/hhg-logo.png" alt="Huerkamp Home Group" className="logo-img" /></Link>
      <nav>
        {links.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
        <Link href="/apply" className="btn small">Join</Link>
      </nav>
    </header>
    <TopPerks />
    </>
  );
}
