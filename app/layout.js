import './globals.css';

export const metadata = {
  metadataBase: new URL('https://joinhhg.com'),
  openGraph: {
    title: 'Join Huerkamp Home Group | Real Estate Careers',
    description: 'The #1 Keller Williams team in the North Central region. $190M in volume and 520 units a year. Join the Huerkamp Home Group team in the Twin Cities.',
    url: 'https://joinhhg.com',
    siteName: 'Huerkamp Home Group',
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'The Huerkamp Home Group team' }],
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
  title: 'Join Huerkamp Home Group | Real Estate Careers',
  description:
    'Build your real estate career with Huerkamp Home Group. Leads, training, mentorship, and a team that wins together.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
