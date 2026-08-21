'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, GraduationCap, LockKeyhole } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const prepareSession = async () => {
      try {
        const supabase = createClient();
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
          window.history.replaceState({}, document.title, '/workspace/reset-password');
        }

        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!data.session) {
          throw new Error('This recovery link is invalid or has expired. Request a new password recovery email.');
        }

        setIsReady(true);
      } catch (sessionError) {
        setError(sessionError instanceof Error ? sessionError.message : 'Unable to verify the recovery link.');
      }
    };

    void prepareSession();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setSuccess(true);
      setPassword('');
      setConfirmPassword('');
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update the password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0]">
      <header className="p-6">
        <Link href="/" className="flex w-fit items-center gap-2">
          <GraduationCap className="h-8 w-8 text-[#18452F]" />
          <span className="text-xl font-semibold text-[#18452F]">JUST<span className="text-[#C79A2D]">my</span>THESIS</span>
        </Link>
      </header>

      <main className="flex min-h-[calc(100vh-96px)] items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#18452F]/10">
              <LockKeyhole className="h-8 w-8 text-[#18452F]" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">Create New Password</h1>
            <p className="mt-2 text-sm text-gray-600">Set a new password for your JUSTmyTHESIS Operations account.</p>
          </div>

          {success ? (
            <div className="mt-6">
              <div className="flex gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <p>Your password has been updated successfully.</p>
              </div>
              <Link href="/workspace/login" className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-xl bg-[#18452F] px-4 text-sm font-medium text-white hover:bg-[#2a5c45]">
                Return to Operations Login
              </Link>
            </div>
          ) : (
            <>
              {error && <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div>
                  <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-800">New Password</label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    minLength={8}
                    required
                    disabled={!isReady || isSubmitting}
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-[#18452F] focus:ring-2 focus:ring-[#18452F]/20 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-gray-800">Confirm New Password</label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    minLength={8}
                    required
                    disabled={!isReady || isSubmitting}
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-[#18452F] focus:ring-2 focus:ring-[#18452F]/20 disabled:bg-gray-50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!isReady || isSubmitting || !password || !confirmPassword}
                  className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-[#18452F] px-4 text-sm font-medium text-white hover:bg-[#2a5c45] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating password...' : 'Update Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
