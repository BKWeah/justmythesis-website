import { Metadata } from 'next';
import { GraduationCap } from 'lucide-react';
import { RequestSupportForm } from '@/components/request-support';

export const metadata: Metadata = {
  title: 'Request Support',
  description:
    'Submit a support request for thesis development, proposal writing, or academic research assistance. Get expert guidance for your academic project.',
};

export default function RequestSupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-brand-green" />
              <span className="font-semibold text-brand-green text-xl">
                JUST<span className="text-gold">my</span>THESIS
              </span>
            </a>
            <a
              href="/"
              className="text-sm font-medium text-gray-600 hover:text-brand-green transition-colors"
            >
              Back to Home
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Request Support
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tell us about your thesis or research project. We will review your
              request and provide a personalized assessment and service
              recommendation within 24-48 hours.
            </p>
          </div>

          {/* Form */}
          <RequestSupportForm />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <p>
              &copy; {new Date().getFullYear()} JUSTmyTHESIS™. All rights
              reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="/terms" className="hover:text-brand-green">
                Terms of Service
              </a>
              <a href="/privacy" className="hover:text-brand-green">
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}