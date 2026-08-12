import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { DIRECTORY_PUBLIC_ROLES } from '@/lib/directory/constants';
import type { MineralId } from '@/lib/constants/minerals';

export interface LandingPlatformStats {
  verifiedUsers: number;
  activeListings: number;
  provincesRepresented: number;
  mineralsTraded: number;
}

async function getVerifiedUsersCount(): Promise<number> {
  const admin = createAdminClient();
  const { count, error } = await admin
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('kyc_status', 'approved')
    .neq('role', 'admin')
    .in('role', [...DIRECTORY_PUBLIC_ROLES]);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

async function getActiveListingAggregates(): Promise<{
  activeListings: number;
  provincesRepresented: number;
  mineralsTraded: number;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('listings')
    .select('origin_province, mineral')
    .eq('status', 'active');

  if (error) {
    throw new Error(error.message);
  }

  const provinces = new Set<string>();
  const minerals = new Set<MineralId>();

  for (const row of data ?? []) {
    provinces.add(row.origin_province);
    minerals.add(row.mineral as MineralId);
  }

  return {
    activeListings: data?.length ?? 0,
    provincesRepresented: provinces.size,
    mineralsTraded: minerals.size,
  };
}

/** Aggregate platform counts for the landing page — real Supabase data only. */
export async function getLandingPlatformStats(): Promise<LandingPlatformStats> {
  const [verifiedUsers, listingAggregates] = await Promise.all([
    getVerifiedUsersCount(),
    getActiveListingAggregates(),
  ]);

  return {
    verifiedUsers,
    ...listingAggregates,
  };
}
