import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';
import type { Database } from '@/types/database.types';
import type { NotificationPayload } from '@/lib/notifications/types';

type NotificationType = Database['public']['Enums']['notification_type'];

/**
 * Insert an in-app notification for a user.
 * Server-side only — uses service role (same trust model as other admin writes).
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  payload: NotificationPayload,
): Promise<{ id: string } | { error: string }> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      payload: payload as Database['public']['Tables']['notifications']['Insert']['payload'],
    })
    .select('id')
    .single();

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[notifications:create]', type, userId, error.message);
    }
    return { error: error.message };
  }

  return { id: data.id };
}
