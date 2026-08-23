import Link from 'next/link';
import { ArrowLeft, FileCheck2 } from 'lucide-react';

const sections = [
  ['1. Acceptance of Terms', <p key="terms-acceptance">By accessing and using the JUSTmyTHESIS™ website and services, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use this service.</p>],
  [
    '2. Nature of Services',
    <div key="terms-nature-of-services">
      <p>JUSTmyTHESIS™ provides academic support services including proposal development, thesis development, formatting, and research coaching. Our services are designed to support and guide students through their academic research and writing process.</p>
      <p><strong>Important:</strong> JUSTmyTHESIS™ does not fabricate, create, or generate research data, survey responses, interview results, citations, references, or any academic data on behalf of clients.</p>
    </div>,
  ],
  [
    '3. Client Responsibilities',
    <div key="terms-client-responsibilities">
      <p>Clients remain responsible for:</p>
      <ul className="list-disc space-y-2 pl-6">
        <li>Conducting their own surveys and interviews</li>
        <li>Data collection activities</li>
        <li>Research activities</li>
        <li>Academic approvals and compliance</li>
        <li>Thesis defense preparation and attendance</li>
        <li>Final submission activities</li>
      </ul>
    </div>,
  ],
  ['4. Confidentiality', <p key="terms-confidentiality">JUSTmyTHESIS™ handles all client projects with strict confidentiality. Client information, project details, and submitted documents are kept private and are not shared with third parties.</p>],
  ['5. Intellectual Property', <p key="terms-intellectual-property">The structure, formatting guidance, and support methodologies provided by JUSTmyTHESIS™ are for the client&apos;s use in developing their own academic work. Final academic work produced using our services remains the intellectual property of the client.</p>],
  ['6. Service Fees', <p key="terms-service-fees">Service fees are structured based on the scope and complexity of support required. Specific pricing is provided during the package recommendation phase. Reasonable payment arrangements may be discussed where necessary.</p>],
  ['7. Limitation of Liability', <p key="terms-liability">JUSTmyTHESIS™ provides guidance and support services. We are not responsible for academic outcomes, supervisor decisions, or institutional requirements beyond our direct service deliverables.</p>],
  ['8. Contact', <p key="terms-contact">For questions regarding these terms, contact us at <a href="mailto:team@justmythesis.org" className="font-semibold text-brand-green hover:underline">team@justmythesis.org</a> or Phone/WhatsApp: +231776732989.</p>],
] as const;

export default function TermsPage() {
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
            <FileCheck2 className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="eyebrow-label">Legal</p>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Terms of Service</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--text-secondary)]">The terms governing access to and use of JUSTmyTHESIS™ academic support services.</p>
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
          <div className="flex gap-6"><Link href="/terms" className="font-semibold text-brand-green">Terms of Service</Link><Link href="/privacy" className="hover:text-brand-green">Privacy Policy</Link></div>
        </div>
      </footer>
    </main>
  );
}
