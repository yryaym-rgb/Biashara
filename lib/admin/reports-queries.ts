import 'server-only';

import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database.types';
import {
  aggregateDisputeRateByPeriod,
  aggregateMineralDistribution,
  aggregateStatusFunnel,
  aggregateUserGrowth,
  aggregateVolumeByPeriod,
  type DisputeRatePoint,
  type FunnelSegment,
  type MineralSegment,
  type UserGrowthPoint,
  type VolumeGranularity,
  type VolumePoint,
} from '@/lib/admin/reports.logic';

type KycStatus = Database['public']['Enums']['kyc_status'];
type ListingStatus = Database['public']['Enums']['listing_status'];

const DAILY_WINDOW_DAYS = 90;
const WEEKLY_WINDOW_WEEKS = 12;

const KYC_FUNNEL_STATUSES: KycStatus[] = ['none', 'pending', 'approved', 'rejected'];
const LISTING_FUNNEL_STATUSES: ListingStatus[] = [
  'draft',
  'pending_review',
  'active',
  'rejected',
  'sold',
  'paused',
];

function windowCutoff(granularity: VolumeGranularity): string {
  const cutoff = new Date();
  if (granularity === 'daily') {
    cutoff.setUTCDate(cutoff.getUTCDate() - DAILY_WINDOW_DAYS);
  } else {
    cutoff.setUTCDate(cutoff.getUTCDate() - WEEKLY_WINDOW_WEEKS * 7);
  }
  return cutoff.toISOString();
}

export async function getPlatformTransactionVolume(
  granularity: VolumeGranularity,
): Promise<VolumePoint[]> {
  const supabase = await createClient();
  const cutoff = windowCutoff(granularity);

  const { data, error } = await supabase
    .from('orders')
    .select('created_at, price_amount, quantity')
    .gte('created_at', cutoff)
    .not('status', 'eq', 'cancelled')
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return aggregateVolumeByPeriod(data ?? [], granularity);
}

export async function getPlatformMineralDistribution(): Promise<MineralSegment[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('orders')
    .select('listing:listings(mineral)')
    .not('status', 'eq', 'cancelled');

  if (error) {
    throw new Error(error.message);
  }

  const normalized = (data ?? []).map((row) => {
    const listing = Array.isArray(row.listing) ? row.listing[0] : row.listing;
    return { listing: listing as { mineral: string } | null };
  });

  return aggregateMineralDistribution(normalized);
}

export async function getPlatformUserGrowth(
  granularity: VolumeGranularity,
): Promise<UserGrowthPoint[]> {
  const supabase = await createClient();
  const cutoff = windowCutoff(granularity);

  const { data, error } = await supabase
    .from('profiles')
    .select('created_at')
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const allProfiles = data ?? [];
  const inWindow = allProfiles.filter((p) => p.created_at >= cutoff);

  return aggregateUserGrowth(inWindow, granularity);
}

export async function getPlatformKycFunnel(): Promise<FunnelSegment[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.from('profiles').select('kyc_status');

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []).map((p) => ({ status: p.kyc_status }));
  return aggregateStatusFunnel(rows, KYC_FUNNEL_STATUSES);
}

export async function getPlatformListingFunnel(): Promise<FunnelSegment[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.from('listings').select('status');

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []).map((l) => ({ status: l.status }));
  return aggregateStatusFunnel(rows, LISTING_FUNNEL_STATUSES);
}

export async function getPlatformDisputeRateTrend(
  granularity: VolumeGranularity,
): Promise<DisputeRatePoint[]> {
  const supabase = await createClient();
  const cutoff = windowCutoff(granularity);

  const { data, error } = await supabase
    .from('orders')
    .select('created_at, status')
    .gte('created_at', cutoff)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return aggregateDisputeRateByPeriod(data ?? [], granularity);
}

export interface PlatformReportSummary {
  totalUsers: number;
  totalListings: number;
  totalOrders: number;
  totalVolume: number;
  disputeRate: number;
  kycFunnel: FunnelSegment[];
  listingFunnel: FunnelSegment[];
  mineralDistribution: MineralSegment[];
}

export async function getPlatformReportSummary(): Promise<PlatformReportSummary> {
  const supabase = await createClient();

  const [usersRes, listingsRes, ordersRes, kycFunnel, listingFunnel, mineralDistribution] =
    await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('listings').select('id', { count: 'exact', head: true }),
      supabase
        .from('orders')
        .select('price_amount, quantity, status')
        .not('status', 'eq', 'cancelled'),
      getPlatformKycFunnel(),
      getPlatformListingFunnel(),
      getPlatformMineralDistribution(),
    ]);

  if (usersRes.error) {
    throw new Error(usersRes.error.message);
  }
  if (listingsRes.error) {
    throw new Error(listingsRes.error.message);
  }
  if (ordersRes.error) {
    throw new Error(ordersRes.error.message);
  }

  const orders = ordersRes.data ?? [];
  const totalVolume = orders.reduce(
    (sum, o) => sum + Number(o.price_amount) * Number(o.quantity),
    0,
  );
  const disputed = orders.filter((o) => o.status === 'disputed').length;
  const disputeRate = orders.length > 0 ? disputed / orders.length : 0;

  return {
    totalUsers: usersRes.count ?? 0,
    totalListings: listingsRes.count ?? 0,
    totalOrders: orders.length,
    totalVolume,
    disputeRate,
    kycFunnel,
    listingFunnel,
    mineralDistribution,
  };
}
