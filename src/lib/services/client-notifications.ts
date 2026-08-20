import { NextRequest } from 'next/server';

import { getAuthenticatedClient } from '@/lib/services/client-auth';

export type ClientNotificationPriority =
  | 'low'
  | 'normal'
  | 'high'
  | 'urgent';

export interface ClientNotification {
  id: string;
  projectId: string | null;
  title: string;
  message: string;
  notificationType: string;
  priority: ClientNotificationPriority;
  actionUrl: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

interface NotificationRecord {
  id: string;
  project_id: string | null;
  title: string;
  message: string;
  notification_type: string;
  priority: ClientNotificationPriority;
  action_url: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

function mapClientNotification(
  notification: NotificationRecord
): ClientNotification {
  return {
    id: notification.id,
    projectId: notification.project_id,
    title: notification.title,
    message: notification.message,
    notificationType: notification.notification_type,
    priority: notification.priority,
    actionUrl: notification.action_url,
    isRead: notification.is_read,
    readAt: notification.read_at,
    createdAt: notification.created_at,
  };
}

export async function getClientNotifications(
  request: NextRequest
): Promise<ClientNotification[]> {
  const { admin, client } =
    await getAuthenticatedClient(request);

  const { data, error } = await admin
    .from('notifications')
    .select(
      `
        id,
        project_id,
        title,
        message,
        notification_type,
        priority,
        action_url,
        is_read,
        read_at,
        created_at
      `
    )
    .eq('client_id', client.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as NotificationRecord[]).map(
    mapClientNotification
  );
}

export async function markClientNotificationRead(
  request: NextRequest,
  notificationId: string
): Promise<ClientNotification> {
  const { admin, client } =
    await getAuthenticatedClient(request);

  const readAt = new Date().toISOString();

  const { data, error } = await admin
    .from('notifications')
    .update({
      is_read: true,
      read_at: readAt,
    })
    .eq('id', notificationId)
    .eq('client_id', client.id)
    .select(
      `
        id,
        project_id,
        title,
        message,
        notification_type,
        priority,
        action_url,
        is_read,
        read_at,
        created_at
      `
    )
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Notification not found.');
  }

  return mapClientNotification(
    data as NotificationRecord
  );
}

export async function markAllClientNotificationsRead(
  request: NextRequest
): Promise<void> {
  const { admin, client } =
    await getAuthenticatedClient(request);

  const { error } = await admin
    .from('notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('client_id', client.id)
    .eq('is_read', false);

  if (error) {
    throw new Error(error.message);
  }
}