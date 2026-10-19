export default function SiteFooter() {
  return (
    <footer className="footer">
      <img src="/hhg-logo.png" alt="" className="logo-img foot" />
      <p>Huerkamp Home Group · Keller Williams Preferred Realty · 14300 Nicollet Ct, Burnsville, MN 55306</p>
      <p><a href="https://www.youtube.com/@LivingInMinneapolis" target="_blank" rel="noopener noreferrer">YouTube: Living in Minneapolis ↗</a></p>
      <p>© {new Date().getFullYear()} Huerkamp Home Group. All rights reserved. Equal Housing Opportunity.</p>
    </footer>
  );
}
