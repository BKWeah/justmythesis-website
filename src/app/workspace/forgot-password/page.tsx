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
              <KeyRound className="h-8 w-8 text-[#18452F]" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">Reset Operations Password</h1>
            <p className="mt-2 text-sm text-gray-600">Enter your staff email address to receive a secure recovery link.</p>
          </div>

          {message && (
            <div className="mt-6 flex gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <p>{message}</p>
            </div>
          )}

          {error && <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-800">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                disabled={isSubmitting}
                placeholder="you@justmythesis.org"
                className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-[#18452F] focus:ring-2 focus:ring-[#18452F]/20"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !email.trim()}
              className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-[#18452F] px-4 text-sm font-medium text-white hover:bg-[#2a5c45] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Sending recovery link...' : 'Send Recovery Link'}
            </button>
          </form>

          <Link href="/workspace/login" className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-[#18452F] hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Back to Operations Login
          </Link>
        </div>
      </main>
    </div>
  );
}
