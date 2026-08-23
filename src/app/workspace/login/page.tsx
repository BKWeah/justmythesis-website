'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, Database, GraduationCap, Lock } from 'lucide-react';

import { Button, Input } from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/auth/session')
      .then((response) => response.json())
      .then((data) => setIsConfigured(data.error !== 'Database not configured'))
      .catch(() => setIsConfigured(true));
  }, []);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');
      router.push('/workspace/dashboard');
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--surface-page)]">
      <header className="px-5 py-5 sm:px-6 lg:px-8">
        <Link href="/" className="flex w-fit items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green text-white shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight text-brand-green">JUST<span className="text-gold">my</span>THESIS</p>
            <p className="text-xs text-[var(--text-muted)]">Operations Workspace</p>
          </div>
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-8 sm:px-6">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-white p-6 shadow-sm sm:p-8">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-green/10 ring-1 ring-brand-green/10">
                <Lock className="h-7 w-7 text-brand-green" />
              </div>
              <h1 className="mt-5 text-2xl font-semibold tracking-tight text-[var(--text-primary)]">Operations Login</h1>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">Sign in to access the JUSTmyTHESIS workspace.</p>
            </div>

            {isConfigured === false && (
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
                <Database className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">Database Not Configured</p>
                  <p className="mt-1 text-xs leading-5">The database is not properly configured. Please contact the administrator.</p>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700" role="alert">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="mt-6 space-y-5">
              <Input
                label="Email Address"
                type="email"
                autoComplete="email"
                placeholder="you@justmythesis.org"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                disabled={isLoading || isConfigured === false}
              />

              <div>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <label htmlFor="password" className="text-sm font-medium text-[var(--text-primary)]">Password</label>
                  <Link href="/workspace/forgot-password" className="text-sm font-medium text-brand-green hover:underline">Forgot password?</Link>
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  disabled={isLoading || isConfigured === false}
                  className="flex min-h-11 w-full rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-white px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-brand-green focus:ring-2 focus:ring-brand-green/15 disabled:cursor-not-allowed disabled:bg-[var(--surface-subtle)]"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || isConfigured === false}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border-subtle)]" /></div>
              <div className="relative flex justify-center text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]"><span className="bg-white px-3">Operations Staff Only</span></div>
            </div>

            <p className="text-center text-sm text-[var(--text-secondary)]">
              Need access? <a href="mailto:admin@justmythesis.org" className="font-medium text-brand-green hover:underline">Contact your administrator</a>
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-[var(--text-secondary)] transition-colors hover:text-brand-green">← Back to website</Link>
          </div>
        </div>
      </main>

      <footer className="px-6 py-5 text-center text-sm text-[var(--text-muted)]">© {new Date().getFullYear()} JUSTmyTHESIS™. All rights reserved.</footer>
    </div>
  );
}
