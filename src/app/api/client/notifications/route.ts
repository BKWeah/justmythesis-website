import { NextRequest, NextResponse } from 'next/server';

import {
  getClientNotifications,
  markAllClientNotificationsRead,
  markClientNotificationRead,
} from '@/lib/services/client-notifications';

export const dynamic = 'force-dynamic';

function getErrorStatus(message: string): number {
  if (
    message === 'Unauthorized.' ||
    message === 'Client profile not found.'
  ) {
    return 401;
  }

  if (message === 'Notification not found.') {
    return 404;
  }

  return 500;
}

export async function GET(request: NextRequest) {
  try {
    const notifications =
      await getClientNotifications(request);

    const unreadCount = notifications.filter(
      (notification) => !notification.isRead
    ).length;

    return NextResponse.json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to retrieve notifications.';

    return NextResponse.json(
      { error: message },
      { status: getErrorStatus(message) }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body?.action;

    if (action === 'mark_all_read') {
      await markAllClientNotificationsRead(request);

      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read.',
      });
    }

    if (action === 'mark_read') {
      const notificationId = body?.notificationId;

      if (
        typeof notificationId !== 'string' ||
        !notificationId.trim()
      ) {
        return NextResponse.json(
          { error: 'Notification ID is required.' },
          { status: 400 }
        );
      }

      const notification =
        await markClientNotificationRead(
          request,
          notificationId.trim()
        );

      return NextResponse.json({
        success: true,
        notification,
      });
    }

    return NextResponse.json(
      { error: 'Invalid notification action.' },
      { status: 400 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to update notification.';

    return NextResponse.json(
      { error: message },
      { status: getErrorStatus(message) }
    );
  }
}