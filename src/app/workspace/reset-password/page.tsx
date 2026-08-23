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
    <div className="flex min-h-screen flex-col bg-[var(--surface-page)]">
      <header className="border-b border-[var(--border-subtle)] bg-white/95 px-5 py-4 backdrop-blur sm:px-6 lg:px-8">
        <Link href="/" className="flex w-fit items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green text-white shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight text-brand-green">
              JUST<span className="text-gold">my</span>THESIS
            </p>
            <p className="text-xs text-[var(--text-muted)]">Operations Workspace</p>
          </div>
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="rounded-[var(--radius-2xl)] border border-[var(--border-subtle)] bg-white p-6 shadow-lg sm:p-8">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-green/10 text-brand-green">
                <LockKeyhole className="h-7 w-7" />
              </div>
              <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-brand-green">Secure Password Update</p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">Create New Password</h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Set a new password for your JUSTmyTHESIS Operations account.</p>
            </div>

            {success ? (
              <div className="mt-6">
                <div className="flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                  <p>Your password has been updated successfully.</p>
                </div>
                <Link href="/workspace/login" className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-brand-green px-4 text-sm font-semibold text-white transition hover:bg-brand-green-light">
                  Return to Operations Login
                </Link>
              </div>
            ) : (
              <>
                {error && (
                  <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                  <div>
                    <label htmlFor="password" className="mb-2 block text-sm font-semibold text-foreground">New Password</label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      minLength={8}
                      required
                      disabled={!isReady || isSubmitting}
                      placeholder="At least 8 characters"
                      className="h-11 w-full rounded-xl border border-[var(--border-default)] bg-white px-4 text-sm text-foreground outline-none transition placeholder:text-[var(--text-muted)] focus:border-brand-green focus:ring-2 focus:ring-brand-green/15 disabled:bg-[var(--surface-subtle)]"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirm-password" className="mb-2 block text-sm font-semibold text-foreground">Confirm New Password</label>
                    <input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      minLength={8}
                      required
                      disabled={!isReady || isSubmitting}
                      placeholder="Re-enter your new password"
                      className="h-11 w-full rounded-xl border border-[var(--border-default)] bg-white px-4 text-sm text-foreground outline-none transition placeholder:text-[var(--text-muted)] focus:border-brand-green focus:ring-2 focus:ring-brand-green/15 disabled:bg-[var(--surface-subtle)]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!isReady || isSubmitting || !password || !confirmPassword}
                    className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-brand-green px-4 text-sm font-semibold text-white transition hover:bg-brand-green-light disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? 'Updating password...' : 'Update Password'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
