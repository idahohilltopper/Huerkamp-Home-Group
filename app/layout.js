import './globals.css';

export const metadata = {
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
