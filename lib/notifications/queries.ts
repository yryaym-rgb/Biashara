import 'server-only';

import { createClient } from '@/lib/supabase/server';
import type { NotificationRow } from '@/lib/notifications/types';

export const NOTIFICATIONS_PER_PAGE = 20;
const RECENT_NOTIFICATIONS_LIMIT = 8;

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('read_at', null);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

export async function getRecentNotifications(userId: string): Promise<NotificationRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(RECENT_NOTIFICATIONS_LIMIT);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as NotificationRow[];
}

export interface PaginatedNotifications {
  notifications: NotificationRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getNotificationsPage(
  userId: string,
  page = 1,
): Promise<PaginatedNotifications> {
  const supabase = await createClient();
  const safePage = Math.max(1, page);
  const from = (safePage - 1) * NOTIFICATIONS_PER_PAGE;
  const to = from + NOTIFICATIONS_PER_PAGE - 1;

  const { data, error, count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const total = count ?? 0;

  return {
    notifications: (data ?? []) as NotificationRow[],
    total,
    page: safePage,
    pageSize: NOTIFICATIONS_PER_PAGE,
    totalPages: Math.max(1, Math.ceil(total / NOTIFICATIONS_PER_PAGE)),
  };
}