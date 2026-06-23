import Link from 'next/link';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gold/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy to-navy-light flex items-center justify-center shadow-md">
                <span className="text-gold font-bold text-sm tracking-wide">JMT</span>
              </div>
              <div>
                <h1 className="text-navy font-bold text-lg leading-tight">JUSTmyTHESIS™</h1>
                <p className="text-navy/50 text-xs hidden sm:block">Academic Research Support</p>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-navy mb-8">Terms of Service</h1>
        
        <div className="prose prose-lg max-w-none text-navy/80 space-y-6">
          <p className="text-sm text-navy/50">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          
          <h2 className="text-2xl font-bold text-navy mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using the JUSTmyTHESIS™ website and services, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use this service.
          </p>
          
          <h2 className="text-2xl font-bold text-navy mt-8 mb-4">2. Nature of Services</h2>
          <p>
            JUSTmyTHESIS™ provides academic support services including proposal development, thesis development, formatting, and research coaching. Our services are designed to support and guide students through their academic research and writing process.
          </p>
          <p>
            <strong>Important:</strong> JUSTmyTHESIS™ does not fabricate, create, or generate research data, survey responses, interview results, citations, references, or any academic data on behalf of clients.
          </p>
          
          <h2 className="text-2xl font-bold text-navy mt-8 mb-4">3. Client Responsibilities</h2>
          <p>Clients remain responsible for:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Conducting their own surveys and interviews</li>
            <li>Data collection activities</li>
            <li>Research activities</li>
            <li>Academic approvals and compliance</li>
            <li>Thesis defense preparation and attendance</li>
            <li>Final submission activities</li>
          </ul>
          
          <h2 className="text-2xl font-bold text-navy mt-8 mb-4">4. Confidentiality</h2>
          <p>
            JUSTmyTHESIS™ handles all client projects with strict confidentiality. Client information, project details, and submitted documents are kept private and are not shared with third parties.
          </p>
          
          <h2 className="text-2xl font-bold text-navy mt-8 mb-4">5. Intellectual Property</h2>
          <p>
            The structure, formatting guidance, and support methodologies provided by JUSTmyTHESIS™ are for the client's use in developing their own academic work. Final academic work produced using our services remains the intellectual property of the client.
          </p>
          
          <h2 className="text-2xl font-bold text-navy mt-8 mb-4">6. Service Fees</h2>
          <p>
            Service fees are structured based on the scope and complexity of support required. Specific pricing is provided during the package recommendation phase. Reasonable payment arrangements may be discussed where necessary.
          </p>
          
          <h2 className="text-2xl font-bold text-navy mt-8 mb-4">7. Limitation of Liability</h2>
          <p>
            JUSTmyTHESIS™ provides guidance and support services. We are not responsible for academic outcomes, supervisor decisions, or institutional requirements beyond our direct service deliverables.
          </p>
          
          <h2 className="text-2xl font-bold text-navy mt-8 mb-4">8. Contact</h2>
          <p>
            For questions regarding these terms, please contact us at:<br />
            Email: <a href="mailto:team@justmythesis.org" className="text-gold hover:text-gold-dark">team@justmythesis.org</a><br />
            Phone/WhatsApp: +231776732989
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link href="/" className="inline-flex items-center gap-2 text-gold hover:text-gold-dark transition-colors font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-navy text-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-white/60">
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <span className="hidden sm:block text-gold">•</span>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          </div>
          <div className="mt-4 text-center text-white/40 text-sm">
            © {new Date().getFullYear()} JUSTmyTHESIS™. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
