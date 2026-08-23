'use client';

import {
  AlertCircle,
  LoaderCircle,
  MessageSquareText,
  RefreshCw,
  Send,
} from 'lucide-react';
import { FormEvent, useCallback, useEffect, useState } from 'react';

import { Button, Card } from '@/components/ui';

interface ProjectMessage {
  id: string;
  senderType: 'staff' | 'client';
  senderName: string;
  message: string;
  createdAt: string;
  isCurrentUser: boolean;
}

interface MessagesResponse {
  messages?: ProjectMessage[];
  error?: string;
}

interface ProjectMessagesProps {
  projectId: string;
}

function formatMessageDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable';
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function ProjectMessages({ projectId }: ProjectMessagesProps) {
  const [messages, setMessages] = useState<ProjectMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/client/projects/${encodeURIComponent(projectId)}/messages`,
        {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        },
      );

      const data = (await response.json()) as MessagesResponse;

      if (!response.ok) {
        throw new Error(data.error || 'Unable to retrieve project messages.');
      }

      setMessages(data.messages ?? []);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to retrieve project messages.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void fetchMessages();
  }, [fetchMessages]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = draft.trim();

    if (!message || isSending) return;

    try {
      setIsSending(true);
      setError(null);

      const response = await fetch(
        `/api/client/projects/${encodeURIComponent(projectId)}/messages`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message }),
        },
      );

      const data = (await response.json()) as MessagesResponse;

      if (!response.ok) {
        throw new Error(data.error || 'Unable to send the message.');
      }

      setDraft('');
      setMessages(data.messages ?? []);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to send the message.',
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card variant="bordered" padding="lg" className="overflow-hidden bg-white">
      <div className="flex flex-col gap-4 border-b border-[var(--border-subtle)] pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-green/10">
            <MessageSquareText className="h-5 w-5 text-brand-green" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Project Messages</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Communicate directly with the JUSTmyTHESIS team about this project.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={() => void fetchMessages()}
          disabled={isLoading || isSending}
        >
          <RefreshCw
            className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            aria-hidden="true"
          />
          Refresh
        </Button>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="mt-5 rounded-2xl bg-[var(--surface-subtle)] p-3 sm:p-4">
        {isLoading ? (
          <div className="flex min-h-52 flex-col items-center justify-center text-center">
            <LoaderCircle className="h-7 w-7 animate-spin text-brand-green" aria-hidden="true" />
            <p className="mt-3 text-sm text-[var(--text-secondary)]">Loading project messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-default)] bg-white px-6 text-center">
            <MessageSquareText className="h-8 w-8 text-[var(--text-muted)]" aria-hidden="true" />
            <h3 className="mt-4 font-semibold text-[var(--text-primary)]">No messages yet</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Start the conversation whenever you need clarification or an update.
            </p>
          </div>
        ) : (
          <div className="max-h-[440px] space-y-3 overflow-y-auto pr-1 sm:pr-2">
            {messages.map((message) => (
              <article
                key={message.id}
                className={`max-w-[92%] rounded-2xl border px-4 py-3 shadow-sm sm:max-w-[78%] ${
                  message.isCurrentUser
                    ? 'ml-auto border-brand-green/20 bg-brand-green text-white'
                    : 'mr-auto border-[var(--border-subtle)] bg-white text-[var(--text-primary)]'
                }`}
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold">{message.senderName}</p>
                    <p
                      className={`text-xs capitalize ${
                        message.isCurrentUser ? 'text-white/70' : 'text-[var(--text-muted)]'
                      }`}
                    >
                      {message.senderType}
                    </p>
                  </div>
                  <time
                    dateTime={message.createdAt}
                    className={`text-xs ${
                      message.isCurrentUser ? 'text-white/70' : 'text-[var(--text-muted)]'
                    }`}
                  >
                    {formatMessageDate(message.createdAt)}
                  </time>
                </div>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-6">{message.message}</p>
              </article>
            ))}
          </div>
        )}
      </div>

      <form className="mt-5" onSubmit={handleSubmit}>
        <label htmlFor="project-message" className="text-sm font-semibold text-[var(--text-primary)]">
          New Message
        </label>
        <textarea
          id="project-message"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Write a message to the JUSTmyTHESIS team..."
          rows={4}
          maxLength={5000}
          disabled={isSending}
          className="mt-2 w-full resize-y rounded-xl border border-[var(--border-default)] bg-white px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-brand-green focus:ring-2 focus:ring-brand-green/15 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[var(--text-muted)]">{draft.length.toLocaleString()} / 5,000 characters</p>
          <Button type="submit" disabled={!draft.trim() || isSending}>
            {isSending ? (
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="h-4 w-4" aria-hidden="true" />
            )}
            {isSending ? 'Sending...' : 'Send Message'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
