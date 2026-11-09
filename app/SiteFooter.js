import Link from 'next/link';

const links = [
  ['/join-a-real-estate-team-twin-cities', 'Join a team in the Twin Cities'],
  ['/become-a-real-estate-agent-minnesota', 'Get licensed in Minnesota'],
  ['/real-estate-agent-jobs-twin-cities', 'Agent jobs in the Twin Cities'],
  ['/real-estate-coaching-training-twin-cities', 'Coaching and training'],
  ['/real-estate-career-quiz', 'Free career quiz'],
  ['/is-real-estate-a-good-career', 'Is real estate a good career?'],
  ['/real-estate-commission-splits', 'Commission splits explained'],
  ['/why-hhg', 'Why HHG'],
  ['/income-guarantee', 'Income guarantee'],
  ['/agent-plus', 'Agent+'],
  ['/value', 'Your value'],
  ['/how-it-works', 'How it works'],
  ['/our-team', 'Our team'],
  ['/faq', 'FAQ'],
  ['/apply', 'Apply'],
  ['/terms', 'Terms and conditions'],
];

export default function SiteFooter() {
  return (
    <footer className="footer">
      <img src="/hhg-logo.png" alt="Huerkamp Home Group" className="logo-img foot" />
      <nav aria-label="Footer" className="footnav">
        {links.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
      </nav>
      <p>Huerkamp Home Group · Keller Williams Preferred Realty · 14300 Nicollet Ct, Suite 208, Burnsville, MN 55306</p>
      <p><a href="https://www.youtube.com/@LivingInMinneapolis" target="_blank" rel="noopener noreferrer">YouTube: Living in Minneapolis ↗</a></p>
      <p>© {new Date().getFullYear()} Huerkamp Home Group. All rights reserved. Equal Housing Opportunity.</p>
    </footer>
  );
}
