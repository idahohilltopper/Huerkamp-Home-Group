import './globals.css';

export const metadata = {
  title: 'Join Huerkamp Home Group | Real Estate Careers',
  description:
    'Build your real estate career with Huerkamp Home Group. Leads, training, mentorship, and a team that wins together.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
