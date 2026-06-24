import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'JUSTmyTHESIS™ | Academic Research & Thesis Support',
  description: 'Academic Research & Thesis Support for undergraduate and master\'s students, researchers, and professionals.',
  keywords: [
    'thesis help',
    'dissertation support',
    'academic research',
    'thesis development',
    'research methodology',
    'literature review',
    'thesis defense',
    'undergraduate thesis',
    'master thesis'
  ],
  authors: [{ name: 'JUSTmyTHESIS™' }],
  openGraph: {
    title: 'JUSTmyTHESIS™ | Academic Research & Thesis Support',
    description: 'Focus on Your Research. We\'ll Handle the Thesis.',
    type: 'website',
    locale: 'en_US',
    siteName: 'JUSTmyTHESIS™',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JUSTmyTHESIS™ | Academic Research & Thesis Support',
    description: 'Focus on Your Research. We\'ll Handle the Thesis.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/images/logo/justmythesis-favicon.svg" />
      </head>
      <body className="font-sans antialiased bg-white text-dark">
        {children}
      </body>
    </html>
  );
}
