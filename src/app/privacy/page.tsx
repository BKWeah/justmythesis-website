import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gold/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-3">
              <img 
                src="/images/logo/justmythesis-logo.png" 
                alt="JUSTmyTHESIS™ Logo"
                className="h-10 md:h-12 w-auto"
              />
              <div className="hidden">
                <h1 className="text-brand-green font-bold text-lg leading-tight">JUSTmyTHESIS™</h1>
                <p className="text-dark/50 text-xs">Academic Research & Thesis Support</p>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-brand-green mb-8">Privacy Policy</h1>
        
        <div className="prose prose-lg max-w-none text-dark/80 space-y-6">
          <p className="text-sm text-dark/50">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          
          <h2 className="text-2xl font-bold text-brand-green mt-8 mb-4">1. Information We Collect</h2>
          <p>
            We may collect the following types of information:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Contact Information:</strong> Name, email address, phone number, and WhatsApp number when you reach out to us for services.</li>
            <li><strong>Project Information:</strong> Academic documents, research materials, and project details you voluntarily share during consultations.</li>
            <li><strong>Usage Data:</strong> Information about how you interact with our website, including pages visited and time spent.</li>
          </ul>
          
          <h2 className="text-2xl font-bold text-navy mt-8 mb-4">2. How We Use Your Information</h2>
          <p>We use collected information to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide academic support and consultation services</li>
            <li>Communicate with you about your project</li>
            <li>Process service requests and deliver packages</li>
            <li>Improve our website and services</li>
            <li>Respond to inquiries and support requests</li>
          </ul>
          
          <h2 className="text-2xl font-bold text-navy mt-8 mb-4">3. Confidentiality</h2>
          <p>
            <strong>Your privacy is paramount.</strong> All project information, documents, and communications are treated with strict confidentiality. We do not:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Share client information with third parties</li>
            <li>Disclose project details to anyone outside our team</li>
            <li>Use client documents for any purpose other than providing requested services</li>
          </ul>
          
          <h2 className="text-2xl font-bold text-navy mt-8 mb-4">4. Data Protection</h2>
          <p>
            We implement appropriate security measures to protect your personal information and project documents. Your data is:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Stored securely and accessible only to authorized team members</li>
            <li>Not shared with any third parties</li>
            <li>Handled in accordance with professional confidentiality standards</li>
          </ul>
          
          <h2 className="text-2xl font-bold text-navy mt-8 mb-4">5. Cookies and Tracking</h2>
          <p>
            Our website may use cookies and similar tracking technologies to enhance your browsing experience. You can control cookie preferences through your browser settings.
          </p>
          
          <h2 className="text-2xl font-bold text-navy mt-8 mb-4">6. Third-Party Services</h2>
          <p>
            We may use third-party services for communication (such as WhatsApp) and website analytics. These services have their own privacy policies governing their use of your information.
          </p>
          
          <h2 className="text-2xl font-bold text-navy mt-8 mb-4">7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Request access to your personal information</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Opt out of communications at any time</li>
          </ul>
          
          <h2 className="text-2xl font-bold text-navy mt-8 mb-4">8. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us:<br />
            Email: <a href="mailto:team@justmythesis.org" className="text-gold hover:text-gold-dark">team@justmythesis.org</a><br />
            Phone/WhatsApp: +231776732989
          </p>
          
          <h2 className="text-2xl font-bold text-navy mt-8 mb-4">9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date.
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
      <footer className="bg-cream text-dark py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-dark/60">
            <Link href="/terms" className="hover:text-gold transition-colors">Terms of Service</Link>
            <span className="hidden sm:block text-gold">•</span>
            <Link href="/privacy" className="hover:text-gold transition-colors">Privacy Policy</Link>
          </div>
          <div className="mt-4 text-center text-dark/40 text-sm">
            © {new Date().getFullYear()} JUSTmyTHESIS™. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
