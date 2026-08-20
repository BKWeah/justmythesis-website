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
import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import { Card } from '@/components/ui';
import { cn } from '@/lib/utils/cn';

type NotificationPriority =
  | 'low'
  | 'normal'
  | 'high'
  | 'urgent';

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

interface ApiErrorResponse {
  error?: string;
}

function formatNotificationDate(value: string): string {
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

function getPriorityClasses(
  priority: NotificationPriority
): string {
  switch (priority) {
    case 'urgent':
      return 'bg-red-50 text-red-700';
    case 'high':
      return 'bg-amber-50 text-amber-700';
    case 'low':
      return 'bg-slate-100 text-slate-600';
    default:
      return 'bg-blue-50 text-blue-700';
  }
}

function formatPriority(
  priority: NotificationPriority
): string {
  return (
    priority.charAt(0).toUpperCase() +
    priority.slice(1)
  );
}

export default function ClientNotificationsPage() {
  const router = useRouter();

  const [notifications, setNotifications] = useState<
    ClientNotification[]
  >([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [updatingId, setUpdatingId] = useState<
    string | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        '/api/client/notifications',
        {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
          headers: {
            Accept: 'application/json',
          },
        }
      );

      const data = (await response.json()) as
        | NotificationsResponse
        | ApiErrorResponse;

      if (response.status === 401) {
        router.replace('/client/login');
        return;
      }

      if (!response.ok) {
        throw new Error(
          'error' in data && data.error
            ? data.error
            : 'Unable to retrieve notifications.'
        );
      }

      const notificationData =
        data as NotificationsResponse;

      setNotifications(
        notificationData.notifications ?? []
      );
      setUnreadCount(
        notificationData.unreadCount ?? 0
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to retrieve notifications.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  const markNotificationRead = async (
    notificationId: string
  ): Promise<boolean> => {
    try {
      setUpdatingId(notificationId);
      setError(null);

      const response = await fetch(
        '/api/client/notifications',
        {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'mark_read',
            notificationId,
          }),
        }
      );

      const data = (await response.json()) as
        | { success: boolean }
        | ApiErrorResponse;

      if (response.status === 401) {
        router.replace('/client/login');
        return false;
      }

      if (!response.ok) {
        throw new Error(
          'error' in data && data.error
            ? data.error
            : 'Unable to update the notification.'
        );
      }

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                isRead: true,
                readAt: new Date().toISOString(),
              }
            : notification
        )
      );

      setUnreadCount((currentCount) =>
        Math.max(currentCount - 1, 0)
      );

      return true;
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to update the notification.'
      );

      return false;
    } finally {
      setUpdatingId(null);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      setIsMarkingAll(true);
      setError(null);

      const response = await fetch(
        '/api/client/notifications',
        {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'mark_all_read',
          }),
        }
      );

      const data = (await response.json()) as
        | { success: boolean }
        | ApiErrorResponse;

      if (response.status === 401) {
        router.replace('/client/login');
        return;
      }

      if (!response.ok) {
        throw new Error(
          'error' in data && data.error
            ? data.error
            : 'Unable to mark notifications as read.'
        );
      }

      const readAt = new Date().toISOString();

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) => ({
          ...notification,
          isRead: true,
          readAt: notification.readAt ?? readAt,
        }))
      );

      setUnreadCount(0);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to mark notifications as read.'
      );
    } finally {
      setIsMarkingAll(false);
    }
  };

  const openNotification = async (
    notification: ClientNotification
  ) => {
    if (!notification.isRead) {
      const wasUpdated = await markNotificationRead(
        notification.id
      );

      if (!wasUpdated) {
        return;
      }
    }

    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl space-y-6 px-6 py-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() =>
                router.push('/client/dashboard')
              }
              className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-green hover:underline"
            >
              <ArrowLeft
                className="h-4 w-4"
                aria-hidden="true"
              />
              Back to Scholar Haven
            </button>

            <h1 className="text-3xl font-bold text-foreground">
              Notifications
            </h1>

            <p className="mt-2 text-muted-foreground">
              View important updates about your projects,
              payments, and deliverables.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void fetchNotifications()}
              disabled={isLoading}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border-2 border-brand-green px-5 py-2.5 font-semibold text-brand-green transition hover:bg-brand-green/5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={cn(
                  'h-4 w-4',
                  isLoading && 'animate-spin'
                )}
                aria-hidden="true"
              />
              Refresh
            </button>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() =>
                  void markAllNotificationsRead()
                }
                disabled={isMarkingAll}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-green px-5 py-2.5 font-semibold text-white transition hover:bg-brand-green/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isMarkingAll ? (
                  <LoaderCircle
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <CheckCheck
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                )}
                Mark All Read
              </button>
            )}
          </div>
        </div>

        <Card
          variant="bordered"
          padding="lg"
          className="bg-white"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Your Updates
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {unreadCount === 0
                  ? 'You have no unread notifications.'
                  : `${unreadCount} unread ${
                      unreadCount === 1
                        ? 'notification'
                        : 'notifications'
                    }.`}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
              <Bell
                className="h-6 w-6"
                aria-hidden="true"
              />
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
            >
              <AlertCircle
                className="mt-0.5 h-5 w-5 shrink-0"
                aria-hidden="true"
              />

              <div>
                <p className="font-semibold">
                  Notification request failed
                </p>
                <p className="mt-1 text-sm">{error}</p>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex min-h-64 flex-col items-center justify-center text-center">
              <LoaderCircle
                className="h-8 w-8 animate-spin text-brand-green"
                aria-hidden="true"
              />
              <p className="mt-4 font-semibold text-foreground">
                Loading notifications
              </p>
            </div>
          )}

          {!isLoading &&
            !error &&
            notifications.length === 0 && (
              <div className="mt-6 flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                  <Bell
                    className="h-7 w-7 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>

                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  No notifications yet
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  Important project, payment, and deliverable
                  updates will appear here.
                </p>
              </div>
            )}

          {!isLoading &&
            notifications.length > 0 && (
              <div className="mt-6 space-y-4">
                {notifications.map((notification) => (
                  <article
                    key={notification.id}
                    className={cn(
                      'rounded-xl border p-5 transition',
                      notification.isRead
                        ? 'border-border bg-white'
                        : 'border-brand-green/30 bg-brand-green/5'
                    )}
                  >
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex gap-4">
                        <div
                          className={cn(
                            'flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
                            notification.isRead
                              ? 'bg-muted text-muted-foreground'
                              : 'bg-brand-green text-white'
                          )}
                        >
                          {notification.isRead ? (
                            <Check
                              className="h-5 w-5"
                              aria-hidden="true"
                            />
                          ) : (
                            <Bell
                              className="h-5 w-5"
                              aria-hidden="true"
                            />
                          )}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-foreground">
                              {notification.title}
                            </h3>

                            {!notification.isRead && (
                              <span className="rounded-full bg-brand-green px-2.5 py-1 text-xs font-semibold text-white">
                                New
                              </span>
                            )}

                            <span
                              className={cn(
                                'rounded-full px-2.5 py-1 text-xs font-semibold',
                                getPriorityClasses(
                                  notification.priority
                                )
                              )}
                            >
                              {formatPriority(
                                notification.priority
                              )}
                            </span>
                          </div>

                          <p className="mt-2 leading-6 text-muted-foreground">
                            {notification.message}
                          </p>

                          <p className="mt-3 text-xs text-muted-foreground">
                            {formatNotificationDate(
                              notification.createdAt
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-3">
                        {!notification.isRead && (
                          <button
                            type="button"
                            onClick={() =>
                              void markNotificationRead(
                                notification.id
                              )
                            }
                            disabled={
                              updatingId === notification.id
                            }
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border-2 border-brand-green px-4 py-2 text-sm font-semibold text-brand-green transition hover:bg-brand-green/5 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {updatingId ===
                            notification.id ? (
                              <LoaderCircle
                                className="h-4 w-4 animate-spin"
                                aria-hidden="true"
                              />
                            ) : (
                              <Check
                                className="h-4 w-4"
                                aria-hidden="true"
                              />
                            )}
                            Mark Read
                          </button>
                        )}

                        {notification.actionUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              void openNotification(
                                notification
                              )
                            }
                            disabled={
                              updatingId === notification.id
                            }
                            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-brand-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-green/90 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            View Update
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
        </Card>
      </div>
    </main>
  );
}