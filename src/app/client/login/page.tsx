'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, Database, GraduationCap, Lock, ShieldCheck } from 'lucide-react';
import { Button, Card, Input } from '@/components/ui';

export default function ClientLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/auth/session')
      .then((response) => response.json())
      .then((data) => {
        if (data.error === 'Database not configured') {
          setIsConfigured(false);
          return;
        }
        setIsConfigured(true);
      })
      .catch(() => setIsConfigured(true));
  }, []);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/client/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed.');
      router.push('/client/dashboard');
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--surface-page)]">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-5">
          <Link href="/" className="flex items-center gap-3 rounded-xl focus-visible:outline-none">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green text-white shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight text-brand-green">
                JUST<span className="text-gold">my</span>THESIS
              </p>
              <p className="text-xs text-[var(--text-muted)]">Scholar Haven</p>
            </div>
          </Link>

          <Link href="/" className="text-sm font-semibold text-brand-green transition hover:text-brand-green-light">
            Back to website
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-green/15 bg-brand-green/5 px-3 py-1.5 text-sm font-semibold text-brand-green">
              <ShieldCheck className="h-4 w-4" />
              Secure client workspace
            </div>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-[var(--text-primary)] sm:text-5xl">
              Sign in to your Scholar Haven.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-[var(--text-secondary)] sm:text-lg">
              Access your academic projects, messages, updates and released deliverables from one private workspace.
            </p>
          </div>

          <Card variant="bordered" padding="lg" className="w-full max-w-lg justify-self-end border-[var(--border-subtle)] bg-white shadow-sm">
            <div className="mb-7 flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-green/10">
                <Lock className="h-5 w-5 text-brand-green" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">Client sign in</h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">Use the credentials provided for your Scholar Haven account.</p>
              </div>
            </div>

            {isConfigured === false && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
                <Database className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-semibold">Database not configured</p>
                  <p className="mt-1 text-sm">Please contact JUSTmyTHESIS support.</p>
                </div>
              </div>
            )}

            {error && (
              <div role="alert" className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <Input
                label="Email address"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                disabled={isLoading || isConfigured === false}
              />
              <Input
                label="Password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                disabled={isLoading || isConfigured === false}
              />
              <Button type="submit" className="w-full" size="lg" disabled={isLoading || isConfigured === false}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 border-t border-[var(--border-subtle)] pt-5 text-center">
              <p className="text-sm text-[var(--text-secondary)]">
                Need help accessing your account?{' '}
                <a href="mailto:support@justmythesis.org" className="font-semibold text-brand-green hover:underline">
                  Contact support
                </a>
              </p>
            </div>
          </Card>
        </section>

        <footer className="border-t border-[var(--border-subtle)] pt-5 text-center text-sm text-[var(--text-muted)]">
          © {new Date().getFullYear()} JUSTmyTHESIS™. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
