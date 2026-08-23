import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, GraduationCap } from 'lucide-react';

import { Button } from '@/components/ui';
import { RequestSupportForm } from '@/components/request-support';

export const metadata: Metadata = {
  title: 'Request Support',
  description:
    'Submit a support request for thesis development, proposal writing, or academic research assistance.',
};

export default function RequestSupportPage() {
  return (
    <div className="min-h-screen bg-[var(--surface-page)]">
      <header className="border-b border-[var(--border-subtle)] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green text-white shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight text-brand-green">
                JUST<span className="text-gold">my</span>THESIS
              </p>
              <p className="text-xs text-[var(--text-muted)]">Academic Support</p>
            </div>
          </Link>

          <Link href="/">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="py-8 sm:py-10">
        <RequestSupportForm />
      </main>

      <footer className="mt-10 border-t border-[var(--border-subtle)] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-6 text-sm text-[var(--text-muted)] sm:px-6 md:flex-row lg:px-8">
          <p>© {new Date().getFullYear()} JUSTmyTHESIS™. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="transition-colors hover:text-brand-green">Terms</Link>
            <Link href="/privacy" className="transition-colors hover:text-brand-green">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
