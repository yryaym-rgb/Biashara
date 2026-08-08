import 'server-only';

import { createClient } from '@/lib/supabase/server';
import {
  buildAdminAlerts,
  isHighDisputeRateUser,
  isOlderThanHours,
  PENDING_KYC_AGE_HOURS,
  PENDING_LISTING_AGE_HOURS,
  type AdminAlertItem,
} from '@/lib/admin/alerts.logic';
import {
  adminKycReviewPath,
  adminListingsModerationPath,
  adminUsersPath,
} from '@/lib/admin/path';

export type { AdminAlertItem, AdminAlertType } from '@/lib/admin/alerts.logic';
export {
  buildAdminAlerts,
  DISPUTE_RATE_THRESHOLD,
  isHighDisputeRateUser,
  MIN_ORDERS_FOR_DISPUTE_RATE,
  PENDING_KYC_AGE_HOURS,
  PENDING_LISTING_AGE_HOURS,
} from '@/lib/admin/alerts.logic';

export async function getAdminAlerts(): Promise<AdminAlertItem[]> {
  const supabase = await createClient();

  const [listingsRes, kycRes, disputesRes, profilesRes] = await Promise.all([
    supabase
      .from('listings')
      .select('id, title, created_at')
      .eq('status', 'pending_review')
      .order('created_at', { ascending: true }),
    supabase
      .from('kyc_documents')
      .select(
        `
          id,
          type,
          created_at,
          applicant:profiles!kyc_documents_user_id_fkey(company_name)
        `,
      )
      .eq('status', 'pending')
      .order('created_at', { ascending: true }),
    supabase
      .from('orders')
      .select(
        `
          id,
          created_at,
          listing:listings(title)
        `,
      )
      .eq('status', 'disputed')
      .order('created_at', { ascending: false }),
    supabase.from('profiles').select('id, company_name, created_at'),
  ]);

  const errors = [listingsRes.error, kycRes.error, disputesRes.error, profilesRes.error].filter(
    Boolean,
  );
  if (errors.length > 0) {
    throw new Error(errors[0]!.message);
  }

  const agingListings = (listingsRes.data ?? [])
    .filter((row) => isOlderThanHours(row.created_at, PENDING_LISTING_AGE_HOURS))
    .map((row) => ({
      id: row.id,
      title: row.title,
      createdAt: row.created_at,
    }));

  const agingKycDocs = (kycRes.data ?? [])
    .filter((row) => isOlderThanHours(row.created_at, PENDING_KYC_AGE_HOURS))
    .map((row) => {
      const applicant = Array.isArray(row.applicant) ? row.applicant[0] : row.applicant;
      return {
        id: row.id,
        companyName: applicant?.company_name?.trim() || row.id.slice(0, 8),
        type: row.type,
        createdAt: row.created_at,
      };
    });

  const unresolvedDisputes = (disputesRes.data ?? []).map((row) => {
    const listing = Array.isArray(row.listing) ? row.listing[0] : row.listing;
    return {
      id: row.id,
      listingTitle: listing?.title ?? row.id.slice(0, 8),
      createdAt: row.created_at,
    };
  });

  const profileIds = (profilesRes.data ?? []).map((p) => p.id);
  const highDisputeRateUsers: Array<{
    userId: string;
    companyName: string;
    disputeRate: number;
    createdAt: string;
  }> = [];

  if (profileIds.length > 0) {
    const { data: allOrders, error: ordersError } = await supabase
      .from('orders')
      .select('buyer_id, seller_id, status, created_at');

    if (ordersError) {
      throw new Error(ordersError.message);
    }

    const profileMap = new Map(
      (profilesRes.data ?? []).map((p) => [p.id, p.company_name?.trim() || p.id.slice(0, 8)]),
    );

    for (const userId of profileIds) {
      const userOrders = (allOrders ?? []).filter(
        (o) => o.buyer_id === userId || o.seller_id === userId,
      );
      const disputed = userOrders.filter((o) => o.status === 'disputed').length;
      const total = userOrders.length;

      if (isHighDisputeRateUser(disputed, total)) {
        const latestOrder = userOrders.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )[0];
        highDisputeRateUsers.push({
          userId,
          companyName: profileMap.get(userId) ?? userId.slice(0, 8),
          disputeRate: disputed / total,
          createdAt: latestOrder?.created_at ?? new Date().toISOString(),
        });
      }
    }
  }

  return buildAdminAlerts({
    agingListings,
    agingKycDocs,
    unresolvedDisputes,
    highDisputeRateUsers,
    listingModerationPath: (id) => adminListingsModerationPath(id),
    kycReviewPath: adminKycReviewPath(),
    orderPath: (id) => adminUsersPath(),
    userPath: (id) => adminUsersPath(id),
  });
}
