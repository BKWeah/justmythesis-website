'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Ensure background color is always visible - use solid color
  const bgStyle = { backgroundColor: '#FAF7F0' };

  return (
    <div style={bgStyle} className="min-h-screen flex flex-col">
      {/* DEBUG HEADING - REMOVE AFTER TESTING */}
      <div style={{ backgroundColor: '#EF4444', color: 'white', padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
        JUSTmyTHESIS Operations Login
      </div>

      {/* Header */}
      <header className="p-6">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <GraduationCap className="h-8 w-8 text-[#18452F]" />
          <span className="font-semibold text-[#18452F] text-xl">
            JUST<span className="text-[#C79A2D]">my</span>THESIS
          </span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Login Card - white background with dark text */}
          <div style={{ backgroundColor: '#FFFFFF' }} className="rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#18452F]/10 mb-4">
                <Lock className="h-8 w-8 text-[#18452F]" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Operations Login
              </h1>
              <p className="text-gray-600">
                Sign in to access the JUSTmyTHESIS workspace
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Login Form */}
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
                  placeholder="you@justmythesis.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#18452F]/50 focus:border-[#18452F]"
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
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#18452F]/50 focus:border-[#18452F]"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 font-medium rounded-xl h-10 px-4 text-sm w-full bg-[#18452F] text-white hover:bg-[#2a5c45] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-600">
                  Operations Staff Only
                </span>
              </div>
            </div>

            {/* Help Text */}
            <p className="text-center text-sm text-gray-700">
              Need access?{' '}
              <a
                href="mailto:admin@justmythesis.org"
                className="text-[#18452F] hover:underline font-medium"
              >
                Contact your administrator
              </a>
            </p>
          </div>

          {/* Back to Website */}
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

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-gray-600">
        © {new Date().getFullYear()} JUSTmyTHESIS™. All rights reserved.
      </footer>
    </div>
  );
}