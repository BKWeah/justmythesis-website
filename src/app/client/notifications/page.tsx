'use client';

import {
  AlertCircle,
  ArrowLeft,
  Bell,
  Check,
  CheckCheck,
  LoaderCircle,
  RefreshCw,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { Button, Card } from '@/components/ui';
import { cn } from '@/lib/utils/cn';

type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

interface ClientNotification {
  id: string;
  projectId: string | null;
  title: string;
  message: string;
  notificationType: string;
  priority: NotificationPriority;
  actionUrl: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

interface NotificationsResponse {
  success: boolean;
  unreadCount: number;
  notifications: ClientNotification[];
}

interface ApiErrorResponse { error?: string }

function formatNotificationDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(date);
}

function getPriorityClasses(priority: NotificationPriority): string {
  switch (priority) {
    case 'urgent': return 'border-red-200 bg-red-50 text-red-700';
    case 'high': return 'border-amber-200 bg-amber-50 text-amber-700';
    case 'low': return 'border-slate-200 bg-slate-50 text-slate-600';
    default: return 'border-blue-200 bg-blue-50 text-blue-700';
  }
}

function formatPriority(priority: NotificationPriority): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

export default function ClientNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<ClientNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/client/notifications', {
        method: 'GET', credentials: 'include', cache: 'no-store', headers: { Accept: 'application/json' },
      });
      const data = (await response.json()) as NotificationsResponse | ApiErrorResponse;
      if (response.status === 401) {
        router.replace('/client/login');
        return;
      }
      if (!response.ok) {
        throw new Error('error' in data && data.error ? data.error : 'Unable to retrieve notifications.');
      }
      const notificationData = data as NotificationsResponse;
      setNotifications(notificationData.notifications ?? []);
      setUnreadCount(notificationData.unreadCount ?? 0);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to retrieve notifications.');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => { void fetchNotifications(); }, [fetchNotifications]);

  const markNotificationRead = async (notificationId: string): Promise<boolean> => {
    try {
      setUpdatingId(notificationId);
      setError(null);
      const response = await fetch('/api/client/notifications', {
        method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_read', notificationId }),
      });
      const data = (await response.json()) as { success: boolean } | ApiErrorResponse;
      if (response.status === 401) {
        router.replace('/client/login');
        return false;
      }
      if (!response.ok) {
        throw new Error('error' in data && data.error ? data.error : 'Unable to update the notification.');
      }
      setNotifications((current) => current.map((item) => item.id === notificationId
        ? { ...item, isRead: true, readAt: new Date().toISOString() }
        : item));
      setUnreadCount((count) => Math.max(count - 1, 0));
      return true;
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to update the notification.');
      return false;
    } finally {
      setUpdatingId(null);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      setIsMarkingAll(true);
      setError(null);
      const response = await fetch('/api/client/notifications', {
        method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_all_read' }),
      });
      const data = (await response.json()) as { success: boolean } | ApiErrorResponse;
      if (response.status === 401) {
        router.replace('/client/login');
        return;
      }
      if (!response.ok) {
        throw new Error('error' in data && data.error ? data.error : 'Unable to mark notifications as read.');
      }
      const readAt = new Date().toISOString();
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true, readAt: item.readAt ?? readAt })));
      setUnreadCount(0);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to mark notifications as read.');
    } finally {
      setIsMarkingAll(false);
    }
  };

  const openNotification = async (notification: ClientNotification) => {
    if (!notification.isRead) {
      const wasUpdated = await markNotificationRead(notification.id);
      if (!wasUpdated) return;
    }
    if (notification.actionUrl) router.push(notification.actionUrl);
  };

  return (
    <main className="min-h-screen bg-[var(--surface-page)]">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => router.push('/client/dashboard')}
              className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-green transition hover:text-brand-green-light"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Scholar Haven
            </button>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-green">Scholar Haven</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-primary)]">Notifications</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
              Important updates about your projects, payments, messages and released deliverables.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="secondary" onClick={() => void fetchNotifications()} disabled={isLoading}>
              <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} aria-hidden="true" />
              Refresh
            </Button>
            {unreadCount > 0 && (
              <Button type="button" onClick={() => void markAllNotificationsRead()} disabled={isMarkingAll}>
                {isMarkingAll ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <CheckCheck className="h-4 w-4" aria-hidden="true" />}
                Mark All Read
              </Button>
            )}
          </div>
        </div>

        <section className="overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-[var(--border-subtle)] bg-[var(--surface-subtle)]/70 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-green/10 text-brand-green">
                <Bell className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Your Updates</h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  {unreadCount === 0 ? 'You are all caught up.' : `${unreadCount} unread ${unreadCount === 1 ? 'notification' : 'notifications'}.`}
                </p>
              </div>
            </div>
            <span className="inline-flex w-fit items-center rounded-full border border-brand-green/15 bg-white px-3 py-1.5 text-xs font-semibold text-brand-green">
              {notifications.length} total
            </span>
          </div>

          <div className="p-5 sm:p-6">
            {error && (
              <div role="alert" className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                <div><p className="font-semibold">Notification request failed</p><p className="mt-1 text-sm">{error}</p></div>
              </div>
            )}

            {isLoading && (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl bg-[var(--surface-subtle)] text-center">
                <LoaderCircle className="h-8 w-8 animate-spin text-brand-green" aria-hidden="true" />
                <p className="mt-4 text-sm font-semibold text-[var(--text-primary)]">Loading notifications</p>
              </div>
            )}

            {!isLoading && !error && notifications.length === 0 && (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-default)] bg-[var(--surface-subtle)] px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white">
                  <Bell className="h-7 w-7 text-[var(--text-muted)]" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-[var(--text-primary)]">No notifications yet</h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-[var(--text-secondary)]">
                  Important project, payment and deliverable updates will appear here.
                </p>
              </div>
            )}

            {!isLoading && notifications.length > 0 && (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <article
                    key={notification.id}
                    className={cn(
                      'rounded-2xl border p-5 transition',
                      notification.isRead
                        ? 'border-[var(--border-subtle)] bg-white'
                        : 'border-brand-green/20 bg-brand-green/[0.035] shadow-sm'
                    )}
                  >
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 gap-4">
                        <div className={cn(
                          'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl',
                          notification.isRead ? 'bg-[var(--surface-subtle)] text-[var(--text-muted)]' : 'bg-brand-green text-white'
                        )}>
                          {notification.isRead ? <Check className="h-5 w-5" aria-hidden="true" /> : <Bell className="h-5 w-5" aria-hidden="true" />}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-[var(--text-primary)]">{notification.title}</h3>
                            {!notification.isRead && (
                              <span className="rounded-full bg-brand-green px-2.5 py-1 text-xs font-semibold text-white">New</span>
                            )}
                            <span className={cn('rounded-full border px-2.5 py-1 text-xs font-semibold', getPriorityClasses(notification.priority))}>
                              {formatPriority(notification.priority)}
                            </span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{notification.message}</p>
                          <p className="mt-3 text-xs text-[var(--text-muted)]">{formatNotificationDate(notification.createdAt)}</p>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        {!notification.isRead && (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => void markNotificationRead(notification.id)}
                            disabled={updatingId === notification.id}
                          >
                            {updatingId === notification.id ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Check className="h-4 w-4" aria-hidden="true" />}
                            Mark Read
                          </Button>
                        )}
                        {notification.actionUrl && (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => void openNotification(notification)}
                            disabled={updatingId === notification.id}
                          >
                            View Update
                          </Button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
