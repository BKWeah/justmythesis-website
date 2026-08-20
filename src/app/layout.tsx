import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://justmythesis-website.vercel.app'),
  title: 'JUSTmyTHESIS™ | Academic Research & Thesis Support',
  description: 'Professional academic research and thesis support for undergraduate, master\'s, dissertation, and thesis projects. Proposal development, formatting, compliance review, thesis rescue, defense preparation, and research training.',
  keywords: [
    'research support',
    'thesis support',
    'thesis development',
    'dissertation support',
    'proposal development',
    'research coaching',
    'thesis writing training',
    'academic research',
    'thesis formatting',
    'APA formatting',
    'research methodology',
    'undergraduate thesis',
    "master's thesis",
    'dissertation assistance'
  ],
  authors: [{ name: 'JUSTmyTHESIS™' }],
  alternates: {
    canonical: 'https://justmythesis-website.vercel.app',
  },
  openGraph: {
    title: 'JUSTmyTHESIS™ | Academic Research & Thesis Support',
    description: 'Professional academic research and thesis support for undergraduate, master\'s, and dissertation projects.',
    url: 'https://justmythesis-website.vercel.app',
    siteName: 'JUSTmyTHESIS™',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/images/justmythesis-logo-transparent.png',
        width: 400,
        height: 120,
        alt: 'JUSTmyTHESIS™ Logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'JUSTmyTHESIS™ | Academic Research & Thesis Support',
    description: 'Professional academic research and thesis support for undergraduate, master\'s, and dissertation projects.',
    images: ['/images/justmythesis-logo-transparent.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
        <link rel="icon" href="/favicon.ico" sizes="32x32" type="image/x-icon" />
        <link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png" />
        <link rel="icon" href="/favicon-16x16.png" sizes="16x16" type="image/png" />
        <link rel="apple-touch-icon" href="/images/justmythesis-logo-transparent.png" />
      </head>
      <body className="font-sans antialiased bg-white text-dark">
        {children}
      </body>
    </html>
  );
}
