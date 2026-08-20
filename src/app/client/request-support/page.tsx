import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, GraduationCap } from 'lucide-react';

import { Button } from '@/components/ui';
import { RequestSupportForm } from '@/components/request-support';

export const metadata: Metadata = {
  title: 'Client Request Support',
  description:
    'Submit a new academic service request from your Scholar Haven.',
};

export default function ClientRequestSupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-brand-green" />

            <span className="text-xl font-semibold text-brand-green">
              JUST<span className="text-gold">my</span>THESIS
            </span>
          </div>

          <Link href="/client/dashboard">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Back to Scholar Haven
            </Button>
          </Link>
        </div>
      </header>

      <main className="py-10">
        <RequestSupportForm />
      </main>

      <footer className="mt-12 border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 text-sm text-gray-500 md:flex-row">
          <p>
            © {new Date().getFullYear()} JUSTmyTHESIS™. All rights reserved.
          </p>

          <div className="flex gap-6">
            <Link
              href="/terms"
              className="transition-colors hover:text-brand-green"
            >
              Terms
            </Link>

            <Link
              href="/privacy"
              className="transition-colors hover:text-brand-green"
            >
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}