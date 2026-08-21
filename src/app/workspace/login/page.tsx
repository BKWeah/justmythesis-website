'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, Database, GraduationCap, Lock } from 'lucide-react';

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
      .then((data) => {
        setIsConfigured(data.error !== 'Database not configured');
      })
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

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      router.push('/workspace/dashboard');
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF7F0]">
      <header className="p-6">
        <Link href="/" className="flex w-fit items-center gap-2">
          <GraduationCap className="h-8 w-8 text-[#18452F]" />
          <span className="text-xl font-semibold text-[#18452F]">
            JUST<span className="text-[#C79A2D]">my</span>THESIS
          </span>
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
            <div className="mb-8 text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#18452F]/10">
                <Lock className="h-8 w-8 text-[#18452F]" />
              </div>
              <h1 className="mb-2 text-2xl font-bold text-gray-900">Operations Login</h1>
              <p className="text-gray-600">Sign in to access the JUSTmyTHESIS workspace</p>
            </div>

            {isConfigured === false && (
              <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-100 p-4">
                <Database className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Database Not Configured</p>
                  <p className="mt-1 text-xs text-amber-700">The Supabase database is not properly configured. Please contact the administrator.</p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-300 bg-red-100 p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-800">Email Address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@justmythesis.org"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  disabled={isLoading || isConfigured === false}
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#18452F] focus:ring-2 focus:ring-[#18452F]/50 disabled:bg-gray-50"
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <label htmlFor="password" className="text-sm font-medium text-gray-800">Password</label>
                  <Link href="/workspace/forgot-password" className="text-sm font-medium text-[#18452F] hover:underline">Forgot password?</Link>
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  disabled={isLoading || isConfigured === false}
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#18452F] focus:ring-2 focus:ring-[#18452F]/50 disabled:bg-gray-50"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || isConfigured === false}
                className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-[#18452F] px-4 text-sm font-medium text-white hover:bg-[#2a5c45] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
              <div className="relative flex justify-center text-sm"><span className="bg-white px-2 text-gray-600">Operations Staff Only</span></div>
            </div>

            <p className="text-center text-sm text-gray-700">
              Need access? <a href="mailto:admin@justmythesis.org" className="font-medium text-[#18452F] hover:underline">Contact your administrator</a>
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-gray-700 transition-colors hover:text-[#18452F]">← Back to website</Link>
          </div>
        </div>
      </main>

      <footer className="p-6 text-center text-sm text-gray-600">© {new Date().getFullYear()} JUSTmyTHESIS™. All rights reserved.</footer>
    </div>
  );
}
