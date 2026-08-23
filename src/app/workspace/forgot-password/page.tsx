'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, GraduationCap, KeyRound } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/workspace/reset-password`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
      if (resetError) throw resetError;
      setMessage('If this email belongs to an account, a password recovery link has been sent.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to send the recovery email.');
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
                <KeyRound className="h-7 w-7" />
              </div>
              <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-brand-green">Account Recovery</p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">Reset Operations Password</h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Enter your staff email address and we will send a secure recovery link.</p>
            </div>

            {message && (
              <div className="mt-6 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                <p>{message}</p>
              </div>
            )}

            {error && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-foreground">Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  disabled={isSubmitting}
                  placeholder="you@justmythesis.org"
                  className="h-11 w-full rounded-xl border border-[var(--border-default)] bg-white px-4 text-sm text-foreground outline-none transition placeholder:text-[var(--text-muted)] focus:border-brand-green focus:ring-2 focus:ring-brand-green/15 disabled:bg-[var(--surface-subtle)]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !email.trim()}
                className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-brand-green px-4 text-sm font-semibold text-white transition hover:bg-brand-green-light disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? 'Sending recovery link...' : 'Send Recovery Link'}
              </button>
            </form>

            <Link href="/workspace/login" className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-brand-green transition hover:text-brand-green-light">
              <ArrowLeft className="h-4 w-4" />
              Back to Operations Login
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
