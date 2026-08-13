import 'server-only';

import { createClient } from '@/lib/supabase/server';
import {
  computeKycFunnelCounts,
  countNeedsReviewUsers,
  type KycFunnelCounts,
  type OldestPendingKycRow,
} from '@/lib/admin/dashboard-kyc-intelligence.logic';

export type { KycFunnelCounts, OldestPendingKycRow } from '@/lib/admin/dashboard-kyc-intelligence.logic';

export interface AdminKycIntelligence {
  funnel: KycFunnelCounts;
  oldestPending: OldestPendingKycRow[];
}

const OLDEST_PENDING_LIMIT = 5;

export async function getAdminKycIntelligence(): Promise<AdminKycIntelligence> {
  const supabase = await createClient();

  const [pendingCountRes, approvedCountRes, rejectedCountRes, pendingUsersRes, rejectedUsersRes, oldestRes] =
    await Promise.all([
      supabase
        .from('kyc_documents')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),
      supabase
        .from('kyc_documents')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'approved'),
      supabase
        .from('kyc_documents')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'rejected'),
      supabase.from('kyc_documents').select('user_id').eq('status', 'pending'),
      supabase.from('kyc_documents').select('user_id').eq('status', 'rejected'),
      supabase
        .from('kyc_documents')
        .select(
          `
            id,
            user_id,
            created_at,
            applicant:profiles!kyc_documents_user_id_fkey(company_name)
          `,
        )
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(OLDEST_PENDING_LIMIT),
    ]);

  const errors = [
    pendingCountRes.error,
    approvedCountRes.error,
    rejectedCountRes.error,
    pendingUsersRes.error,
    rejectedUsersRes.error,
    oldestRes.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    throw new Error(errors[0]!.message);
  }

  const pendingUserIds = (pendingUsersRes.data ?? []).map((row) => row.user_id);
  const rejectedUserIds = (rejectedUsersRes.data ?? []).map((row) => row.user_id);
  const needsReview = countNeedsReviewUsers(pendingUserIds, rejectedUserIds);

  const funnel = computeKycFunnelCounts({
    pending: pendingCountRes.count ?? 0,
    approved: approvedCountRes.count ?? 0,
    rejected: rejectedCountRes.count ?? 0,
    needsReview,
  });

  const oldestPending: OldestPendingKycRow[] = (oldestRes.data ?? []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    companyName: (row.applicant as { company_name: string | null } | null)?.company_name ?? null,
    submittedAt: row.created_at,
  }));

  return { funnel, oldestPending };
}
