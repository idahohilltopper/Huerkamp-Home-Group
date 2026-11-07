import './globals.css';
import { Poppins } from 'next/font/google';
import JsonLd from './JsonLd';
import { orgJsonLd } from './seo';

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '600', '700', '800'], display: 'swap', variable: '--font-poppins' });

export const metadata = {
  metadataBase: new URL('https://joinhhg.com'),
  openGraph: {
    title: 'Join a Real Estate Team in the Twin Cities | Huerkamp Home Group',
    description: 'The #1 Keller Williams team in the North Central region. $190M in volume and 520 units a year. Join the Huerkamp Home Group team in the Twin Cities.',
    url: 'https://joinhhg.com',
    siteName: 'Huerkamp Home Group',
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'The Huerkamp Home Group team' }],
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
  title: {
    default: 'Join a Real Estate Team in the Twin Cities | Huerkamp Home Group',
    template: '%s | Huerkamp Home Group',
  },
  description:
    'Join Huerkamp Home Group, the #1 Keller Williams team in the North Central region. Leads, weekly coaching, and a $150,000 income guarantee for Twin Cities agents.',
  alternates: { canonical: './' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body>
        <JsonLd data={orgJsonLd} />
        {children}
      </body>
    </html>
  );
}
