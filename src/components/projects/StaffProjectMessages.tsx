'use client';

import { AlertCircle, LoaderCircle, MessageSquareText, RefreshCw, Send } from 'lucide-react';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Button, Card } from '@/components/ui';

type ProjectMessage = {
  id: string;
  senderType: 'staff' | 'client';
  senderName: string;
  message: string;
  createdAt: string;
  isCurrentUser: boolean;
};

type MessagesResponse = {
  messages?: ProjectMessage[];
  error?: string;
};

function formatMessageDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default function StaffProjectMessages({ projectId }: { projectId: string }) {
  const [messages, setMessages] = useState<ProjectMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/messages`, {
        credentials: 'include',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });
      const data = (await response.json()) as MessagesResponse;
      if (!response.ok) throw new Error(data.error || 'Unable to retrieve project messages.');
      setMessages(data.messages ?? []);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to retrieve project messages.');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = draft.trim();
    if (!message || isSending) return;

    try {
      setIsSending(true);
      setError(null);
      const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/messages`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });
      const data = (await response.json()) as MessagesResponse;
      if (!response.ok) throw new Error(data.error || 'Unable to send the message.');
      setDraft('');
      setMessages(data.messages ?? []);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to send the message.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card variant="bordered" padding="lg">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <MessageSquareText className="mt-1 h-5 w-5 text-brand-green" />
          <div>
            <h2 className="text-xl font-semibold text-foreground">Project Messages</h2>
            <p className="mt-1 text-sm text-muted-foreground">Communicate directly with the client about this project.</p>
          </div>
        </div>
        <Button type="button" variant="secondary" onClick={() => void loadMessages()} disabled={isLoading || isSending}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div role="alert" className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="mt-6">
        {isLoading ? (
          <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-gray-200">
            <LoaderCircle className="h-7 w-7 animate-spin text-brand-green" />
            <p className="mt-3 text-sm text-muted-foreground">Loading project messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 px-6 text-center">
            <MessageSquareText className="h-8 w-8 text-gray-400" />
            <h3 className="mt-4 font-semibold text-foreground">No messages yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">Send the first project message to the client.</p>
          </div>
        ) : (
          <div className="max-h-[420px] space-y-4 overflow-y-auto pr-2">
            {messages.map((message) => (
              <article key={message.id} className={`rounded-xl border p-4 ${message.isCurrentUser ? 'ml-auto border-brand-green/30 bg-brand-green/5' : 'mr-auto border-gray-200 bg-white'}`}>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{message.senderName}</p>
                    <p className="text-xs capitalize text-muted-foreground">{message.senderType}</p>
                  </div>
                  <time dateTime={message.createdAt} className="text-xs text-muted-foreground">{formatMessageDate(message.createdAt)}</time>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground">{message.message}</p>
              </article>
            ))}
          </div>
        )}
      </div>

      <form className="mt-6" onSubmit={sendMessage}>
        <label htmlFor="staff-project-message" className="text-sm font-semibold text-foreground">New Message</label>
        <textarea
          id="staff-project-message"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Write a message to the client..."
          rows={4}
          maxLength={5000}
          disabled={isSending}
          className="mt-2 w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <div className="mt-3 flex justify-end">
          <Button type="submit" disabled={!draft.trim() || isSending}>
            {isSending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {isSending ? 'Sending...' : 'Send Message'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
