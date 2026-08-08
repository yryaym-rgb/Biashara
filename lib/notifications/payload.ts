import type { NotificationPayload } from '@/lib/notifications/types';

export function parseNotificationPayload(payload: unknown): NotificationPayload {
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    return payload as NotificationPayload;
  }
  return {} as NotificationPayload;
}
