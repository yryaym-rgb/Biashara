import 'server-only';

import { createClient } from '@/lib/supabase/server';
import {
  buildWeeklyCumulativeSnapshots,
  buildWeeklyStatusSnapshots,
  computeSnapshotTrendPercent,
  hasSparklineData,
  type WeeklySnapshotPoint,
} from '@/lib/admin/dashboard-kpis.logic';

export type AdminDashboardKpiKey =
  | 'users'
  | 'activeListings'
  | 'pendingKyc'
  | 'purchaseRequests';

export interface AdminDashboardKpiMetric {
  key: AdminDashboardKpiKey;
  value: number;
  trendPercent: number | null;
  sparkline: WeeklySnapshotPoint[];
  hasSparkline: boolean;
}

export interface AdminDashboardKpiBundle {
  metrics: AdminDashboardKpiMetric[];
}

function buildMetric(
  key: AdminDashboardKpiKey,
  value: number,
  sparkline: WeeklySnapshotPoint[],
): AdminDashboardKpiMetric {
  return {
    key,
    value,
    trendPercent: computeSnapshotTrendPercent(sparkline),
    sparkline,
    hasSparkline: hasSparklineData(sparkline),
  };
}

export async function getAdminDashboardKpiMetrics(): Promise<AdminDashboardKpiBundle> {
  const supabase = await createClient();

  const [profilesRes, listingsRes, kycDocumentsRes, rfpsRes] = await Promise.all([
    supabase.from('profiles').select('created_at'),
    supabase.from('listings').select('created_at, updated_at, status'),
    supabase.from('kyc_documents').select('created_at, updated_at, status'),
    supabase.from('rfps').select('created_at, updated_at, status'),
  ]);

  if (profilesRes.error) {
    throw new Error(profilesRes.error.message);
  }
  if (listingsRes.error) {
    throw new Error(listingsRes.error.message);
  }
  if (kycDocumentsRes.error) {
    throw new Error(kycDocumentsRes.error.message);
  }
  if (rfpsRes.error) {
    throw new Error(rfpsRes.error.message);
  }

  const profiles = profilesRes.data ?? [];
  const listings = listingsRes.data ?? [];
  const kycDocuments = kycDocumentsRes.data ?? [];
  const rfps = rfpsRes.data ?? [];

  const userSparkline = buildWeeklyCumulativeSnapshots(profiles);
  const activeListingSparkline = buildWeeklyStatusSnapshots(listings, 'active');
  const pendingKycSparkline = buildWeeklyStatusSnapshots(kycDocuments, 'pending');
  const purchaseRequestSparkline = buildWeeklyStatusSnapshots(rfps, 'open');

  const metrics: AdminDashboardKpiMetric[] = [
    buildMetric('users', profiles.length, userSparkline),
    buildMetric(
      'activeListings',
      listings.filter((row) => row.status === 'active').length,
      activeListingSparkline,
    ),
    buildMetric(
      'pendingKyc',
      kycDocuments.filter((row) => row.status === 'pending').length,
      pendingKycSparkline,
    ),
    buildMetric(
      'purchaseRequests',
      rfps.filter((row) => row.status === 'open').length,
      purchaseRequestSparkline,
    ),
  ];

  return { metrics };
}
