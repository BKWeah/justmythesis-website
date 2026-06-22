import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'JUSTmyTHESIS™ | Academic Research & Thesis Development Support',
  description: 'Academic research, thesis development support, formatting, dissertation support, and defense preparation for undergraduate, master\'s, and doctoral students.',
  keywords: [
    'thesis help',
    'dissertation support',
    'academic research',
    'thesis development',
    'research methodology',
    'literature review',
    'thesis defense',
    'undergraduate thesis',
    'master thesis',
    'doctoral dissertation'
  ],
  authors: [{ name: 'JUSTmyTHESIS™' }],
  openGraph: {
    title: 'JUSTmyTHESIS™ | Academic Research & Thesis Development Support',
    description: 'Professional academic research and thesis development support for undergraduate, master\'s, and doctoral students.',
    type: 'website',
    locale: 'en_US',
    siteName: 'JUSTmyTHESIS™',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JUSTmyTHESIS™ | Academic Research & Thesis Development Support',
    description: 'Professional academic research and thesis development support for students.',
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
        <link
          rel="icon"
          href="/images/logo/jmt-logo.png"
          type="image/png"
        />
      </head>
      <body className="font-sans antialiased bg-navy text-navy">
        {children}
      </body>
    </html>
  );
}
