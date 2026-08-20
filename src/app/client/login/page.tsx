'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  Database,
  GraduationCap,
  Lock,
} from 'lucide-react';

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
      .catch(() => {
        setIsConfigured(true);
      });
  }, []);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/client/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed.');
      }

      router.push('/client/dashboard');
      router.refresh();
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : 'An unexpected error occurred.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: '#FAF7F0' }}
    >
      <header className="p-6">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <GraduationCap className="h-8 w-8 text-[#18452F]" />

          <span className="font-semibold text-[#18452F] text-xl">
            JUST<span className="text-[#C79A2D]">my</span>THESIS
          </span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div
            className="rounded-2xl shadow-xl border border-gray-200 p-8"
            style={{ backgroundColor: '#FFFFFF' }}
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#18452F]/10 mb-4">
                <Lock className="h-8 w-8 text-[#18452F]" />
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Client Portal Login
              </h1>

              <p className="text-gray-600">
                Sign in to access your project, payments, and deliverables
              </p>
            </div>

            {isConfigured === false && (
              <div className="mb-6 p-4 bg-amber-100 border border-amber-300 rounded-lg flex items-start gap-3">
                <Database className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />

                <div>
                  <p className="text-sm font-medium text-amber-800">
                    Database Not Configured
                  </p>

                  <p className="text-xs text-amber-700 mt-1">
                    The database is not properly configured. Please contact
                    JUSTmyTHESIS support.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />

                <p className="text-sm font-medium text-red-800">
                  {error}
                </p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="w-full">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-800 mb-1.5"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  disabled={isLoading || isConfigured === false}
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#18452F]/50 focus:border-[#18452F] disabled:opacity-60"
                />
              </div>

              <div className="w-full">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-800 mb-1.5"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  disabled={isLoading || isConfigured === false}
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#18452F]/50 focus:border-[#18452F] disabled:opacity-60"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || isConfigured === false}
                className="inline-flex items-center justify-center gap-2 font-medium rounded-xl h-10 px-4 text-sm w-full bg-[#18452F] text-white hover:bg-[#2a5c45] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>

              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-600">
                  Registered Clients Only
                </span>
              </div>
            </div>

            <p className="text-center text-sm text-gray-700">
              Need help accessing your account?{' '}
              <a
                href="mailto:support@justmythesis.org"
                className="text-[#18452F] hover:underline font-medium"
              >
                Contact support
              </a>
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-gray-700 hover:text-[#18452F] transition-colors"
            >
              ← Back to website
            </Link>
          </div>
        </div>
      </main>

      <footer className="p-6 text-center text-sm text-gray-600">
        © {new Date().getFullYear()} JUSTmyTHESIS™. All rights reserved.
      </footer>
    </div>
  );
}