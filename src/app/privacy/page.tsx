import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

const sections = [
  ['1. Information We Collect', <><p>We may collect the following types of information:</p><ul className="list-disc space-y-2 pl-6"><li><strong>Contact Information:</strong> Name, email address, phone number, and WhatsApp number when you reach out to us for services.</li><li><strong>Project Information:</strong> Academic documents, research materials, and project details you voluntarily share during consultations.</li><li><strong>Usage Data:</strong> Information about how you interact with our website, including pages visited and time spent.</li></ul></>],
  ['2. How We Use Your Information', <><p>We use collected information to:</p><ul className="list-disc space-y-2 pl-6"><li>Provide academic support and consultation services</li><li>Communicate with you about your project</li><li>Process service requests and deliver packages</li><li>Improve our website and services</li><li>Respond to inquiries and support requests</li></ul></>],
  ['3. Confidentiality', <><p><strong>Your privacy is paramount.</strong> All project information, documents, and communications are treated with strict confidentiality. We do not:</p><ul className="list-disc space-y-2 pl-6"><li>Share client information with third parties</li><li>Disclose project details to anyone outside our team</li><li>Use client documents for any purpose other than providing requested services</li></ul></>],
  ['4. Data Protection', <><p>We implement appropriate security measures to protect your personal information and project documents. Your data is:</p><ul className="list-disc space-y-2 pl-6"><li>Stored securely and accessible only to authorized team members</li><li>Not shared with any third parties</li><li>Handled in accordance with professional confidentiality standards</li></ul></>],
  ['5. Cookies and Tracking', <p>Our website may use cookies and similar tracking technologies to enhance your browsing experience. You can control cookie preferences through your browser settings.</p>],
  ['6. Third-Party Services', <p>We may use third-party services for communication, such as WhatsApp, and website analytics. These services have their own privacy policies governing their use of your information.</p>],
  ['7. Your Rights', <><p>You have the right to:</p><ul className="list-disc space-y-2 pl-6"><li>Request access to your personal information</li><li>Request correction of inaccurate information</li><li>Request deletion of your information</li><li>Opt out of communications at any time</li></ul></>],
  ['8. Contact Us', <p>If you have any questions about this Privacy Policy, contact us at <a href="mailto:team@justmythesis.org" className="font-semibold text-brand-green hover:underline">team@justmythesis.org</a> or Phone/WhatsApp: +231776732989.</p>],
  ['9. Changes to This Policy', <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date.</p>],
] as const;

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[var(--surface-page)]">
      <header className="sticky top-0 z-40 border-b border-[var(--border-subtle)] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 font-semibold text-brand-green">
            <img src="/images/logo/justmythesis-logo.png" alt="JUSTmyTHESIS™" className="h-10 w-auto" />
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-green hover:underline">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to Home
          </Link>
        </div>
      </header>

      <section className="border-b border-[var(--border-subtle)] bg-white">
        <div className="mx-auto max-w-4xl px-5 py-12 sm:px-6 md:py-16">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="eyebrow-label">Legal</p>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Privacy Policy</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--text-secondary)]">How JUSTmyTHESIS™ collects, uses, protects, and manages information shared through our services.</p>
          <p className="mt-5 text-sm text-[var(--text-muted)]">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-5 py-10 sm:px-6 md:py-14">
        <div className="space-y-5">
          {sections.map(([title, content]) => (
            <section key={title} className="rounded-2xl border border-[var(--border-subtle)] bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{title}</h2>
              <div className="mt-4 space-y-4 text-base leading-7 text-[var(--text-secondary)]">{content}</div>
            </section>
          ))}
        </div>
      </div>

      <footer className="border-t border-[var(--border-subtle)] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-6 text-sm text-[var(--text-muted)] sm:px-6 md:flex-row lg:px-8">
          <p>© {new Date().getFullYear()} JUSTmyTHESIS™. All rights reserved.</p>
          <div className="flex gap-6"><Link href="/terms" className="hover:text-brand-green">Terms of Service</Link><Link href="/privacy" className="font-semibold text-brand-green">Privacy Policy</Link></div>
        </div>
      </footer>
    </main>
  );
}
