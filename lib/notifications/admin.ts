import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';
import { adminKycReviewPath, adminListingsModerationPath } from '@/lib/admin/path';
import { createNotification } from '@/lib/notifications/create';
import type { SystemNotificationPayload } from '@/lib/notifications/types';

export async function getAdminUserIds(): Promise<string[]> {
  const admin = createAdminClient();

  const { data, error } = await admin.from('profiles').select('id').eq('role', 'admin');

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[notifications:admin] getAdminUserIds', error.message);
    }
    return [];
  }

  return (data ?? []).map((row) => row.id);
}

export async function notifyAdmins(
  payload: SystemNotificationPayload,
): Promise<{ notified: number; errors: string[] }> {
  const adminIds = await getAdminUserIds();
  const errors: string[] = [];

  await Promise.all(
    adminIds.map(async (userId) => {
      const result = await createNotification(userId, 'system', payload);
      if ('error' in result) {
        errors.push(result.error);
      }
    }),
  );

  return { notified: adminIds.length, errors };
}

export async function notifyAdminsPendingKyc(input: {
  documentType: string;
  applicantName: string;
}): Promise<void> {
  await notifyAdmins({
    action: 'pending_kyc',
    href: adminKycReviewPath(),
    documentType: input.documentType,
    applicantName: input.applicantName,
  });
}

export async function notifyAdminsPendingListing(input: {
  listingId: string;
  listingTitle: string;
}): Promise<void> {
  await notifyAdmins({
    action: 'pending_listing',
    href: adminListingsModerationPath(),
    listingId: input.listingId,
    listingTitle: input.listingTitle,
  });
}
