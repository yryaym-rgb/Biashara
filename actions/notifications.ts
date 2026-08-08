'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth/session';
import { requireAuth } from '@/lib/rbac';

export async function markNotificationRead(notificationId: string) {
  const profile = requireAuth(await getProfile());
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('user_id', profile.id)
    .is('read_at', null)
    .select('id')
    .maybeSingle();

  if (error) {
    return { error: error.message };
  }

  if (!data) {
    return { error: 'notFound' };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function markAllNotificationsRead() {
  const profile = requireAuth(await getProfile());
  const supabase = await createClient();

  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', profile.id)
    .is('read_at', null);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}
