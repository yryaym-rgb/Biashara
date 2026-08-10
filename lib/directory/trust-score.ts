import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';
import {
  accountAgeDays,
  computeTrustScore,
  isKycApprovedForTrust,
  type TrustScoreResult,
} from '@/lib/platform/trust-score';
import type { Database } from '@/types/database.types';

type KycStatus = Database['public']['Enums']['kyc_status'];

/** Service-role trust score lookup for public directory pages (bypasses order RLS). */
export async function getTrustScoreForUserWithAdmin(
  userId: string,
  kycStatus: KycStatus,
  createdAt: string,
): Promise<TrustScoreResult> {
  const admin = createAdminClient();

  const [completedRes, disputedRes] = await Promise.all([
    admin
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .eq('status', 'delivered'),
    admin
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .eq('status', 'disputed'),
  ]);

  if (completedRes.error) {
    throw new Error(completedRes.error.message);
  }
  if (disputedRes.error) {
    throw new Error(disputedRes.error.message);
  }

  return computeTrustScore({
    kycApproved: isKycApprovedForTrust(kycStatus),
    completedOrderCount: completedRes.count ?? 0,
    disputedOrderCount: disputedRes.count ?? 0,
    accountAgeDays: accountAgeDays(createdAt),
  });
}
