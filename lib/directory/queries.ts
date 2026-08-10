import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';
import type { MineralId } from '@/lib/constants/minerals';
import {
  DIRECTORY_PAGE_SIZE,
  DIRECTORY_PUBLIC_PROFILE_COLUMNS,
  DIRECTORY_PUBLIC_ROLES,
  type DirectoryPublicProfile,
} from '@/lib/directory/constants';
import {
  collectDistinctMinerals,
  isDirectoryEligibleProfile,
  pickPrimaryProvince,
} from '@/lib/directory/filters';
import type { DirectorySearchParams } from '@/lib/directory/params';
import { getTrustScoreForUserWithAdmin } from '@/lib/directory/trust-score';
import type { TrustScoreResult } from '@/lib/platform/trust-score';
import type { MarketplaceListingRow } from '@/lib/marketplace/queries';
import { isSellerRole } from '@/lib/rbac';

export interface DirectoryEntry {
  profile: DirectoryPublicProfile;
  province: string | null;
  minerals: MineralId[];
  trustScore: TrustScoreResult;
  completedOrderCount: number;
}

export interface DirectoryListResult {
  entries: DirectoryEntry[];
  total: number;
  page: number;
  pageSize: number;
}

export interface DirectoryProfileDetail {
  profile: DirectoryPublicProfile;
  province: string | null;
  minerals: MineralId[];
  trustScore: TrustScoreResult;
  completedOrderCount: number;
  activeListings: MarketplaceListingRow[];
  contactContext: DirectoryContactContext | null;
}

export type DirectoryContactContext =
  | { type: 'listing'; listingId: string }
  | { type: 'rfp'; rfpId: string };

async function getUserIdsForMineral(mineral: MineralId): Promise<Set<string>> {
  const admin = createAdminClient();
  const userIds = new Set<string>();

  const [listingsRes, rfpsRes, ordersRes] = await Promise.all([
    admin.from('listings').select('seller_id').eq('mineral', mineral),
    admin.from('rfps').select('buyer_id').eq('mineral', mineral),
    admin
      .from('orders')
      .select('buyer_id, seller_id, listing:listings(mineral)')
      .eq('status', 'delivered'),
  ]);

  if (listingsRes.error) {
    throw new Error(listingsRes.error.message);
  }
  if (rfpsRes.error) {
    throw new Error(rfpsRes.error.message);
  }
  if (ordersRes.error) {
    throw new Error(ordersRes.error.message);
  }

  for (const listing of listingsRes.data ?? []) {
    userIds.add(listing.seller_id);
  }

  for (const rfp of rfpsRes.data ?? []) {
    userIds.add(rfp.buyer_id);
  }

  for (const order of ordersRes.data ?? []) {
    const listing = Array.isArray(order.listing) ? order.listing[0] : order.listing;
    if (listing?.mineral !== mineral) {
      continue;
    }
    userIds.add(order.buyer_id);
    userIds.add(order.seller_id);
  }

  return userIds;
}

async function getMineralsForUsers(userIds: string[]): Promise<Map<string, MineralId[]>> {
  const result = new Map<string, MineralId[]>();
  if (userIds.length === 0) {
    return result;
  }

  const admin = createAdminClient();

  const [listingsRes, rfpsRes, buyerOrdersRes, sellerOrdersRes] = await Promise.all([
    admin.from('listings').select('seller_id, mineral').in('seller_id', userIds),
    admin.from('rfps').select('buyer_id, mineral').in('buyer_id', userIds),
    admin
      .from('orders')
      .select('buyer_id, listing:listings(mineral)')
      .in('buyer_id', userIds),
    admin
      .from('orders')
      .select('seller_id, listing:listings(mineral)')
      .in('seller_id', userIds),
  ]);

  if (listingsRes.error) {
    throw new Error(listingsRes.error.message);
  }
  if (rfpsRes.error) {
    throw new Error(rfpsRes.error.message);
  }
  if (buyerOrdersRes.error) {
    throw new Error(buyerOrdersRes.error.message);
  }
  if (sellerOrdersRes.error) {
    throw new Error(sellerOrdersRes.error.message);
  }

  const mineralsByUser = new Map<string, MineralId[]>();

  function appendMineral(userId: string, mineral: MineralId | null | undefined) {
    if (!mineral) {
      return;
    }
    const existing = mineralsByUser.get(userId) ?? [];
    existing.push(mineral);
    mineralsByUser.set(userId, existing);
  }

  for (const listing of listingsRes.data ?? []) {
    appendMineral(listing.seller_id, listing.mineral as MineralId);
  }

  for (const rfp of rfpsRes.data ?? []) {
    appendMineral(rfp.buyer_id, rfp.mineral as MineralId);
  }

  for (const order of buyerOrdersRes.data ?? []) {
    const listing = Array.isArray(order.listing) ? order.listing[0] : order.listing;
    appendMineral(order.buyer_id, listing?.mineral as MineralId | undefined);
  }

  for (const order of sellerOrdersRes.data ?? []) {
    const listing = Array.isArray(order.listing) ? order.listing[0] : order.listing;
    appendMineral(order.seller_id, listing?.mineral as MineralId | undefined);
  }

  for (const userId of userIds) {
    result.set(userId, collectDistinctMinerals(mineralsByUser.get(userId) ?? []));
  }

  return result;
}

async function getProvincesForUsers(userIds: string[]): Promise<Map<string, string | null>> {
  const result = new Map<string, string | null>();
  if (userIds.length === 0) {
    return result;
  }

  const admin = createAdminClient();

  const [listingsRes, sitesRes] = await Promise.all([
    admin.from('listings').select('seller_id, origin_province').in('seller_id', userIds),
    admin.from('cooperative_sites').select('cooperative_id, province').in('cooperative_id', userIds),
  ]);

  if (listingsRes.error) {
    throw new Error(listingsRes.error.message);
  }
  if (sitesRes.error) {
    throw new Error(sitesRes.error.message);
  }

  const provincesByUser = new Map<string, string[]>();

  function appendProvince(userId: string, province: string | null | undefined) {
    if (!province) {
      return;
    }
    const existing = provincesByUser.get(userId) ?? [];
    existing.push(province);
    provincesByUser.set(userId, existing);
  }

  for (const listing of listingsRes.data ?? []) {
    appendProvince(listing.seller_id, listing.origin_province);
  }

  for (const site of sitesRes.data ?? []) {
    appendProvince(site.cooperative_id, site.province);
  }

  for (const userId of userIds) {
    result.set(userId, pickPrimaryProvince(provincesByUser.get(userId) ?? []));
  }

  return result;
}

async function getCompletedOrderCounts(userIds: string[]): Promise<Map<string, number>> {
  const result = new Map<string, number>();
  if (userIds.length === 0) {
    return result;
  }

  const admin = createAdminClient();

  const [buyerRes, sellerRes] = await Promise.all([
    admin.from('orders').select('buyer_id').eq('status', 'delivered').in('buyer_id', userIds),
    admin.from('orders').select('seller_id').eq('status', 'delivered').in('seller_id', userIds),
  ]);

  if (buyerRes.error) {
    throw new Error(buyerRes.error.message);
  }
  if (sellerRes.error) {
    throw new Error(sellerRes.error.message);
  }

  for (const userId of userIds) {
    result.set(userId, 0);
  }

  for (const row of buyerRes.data ?? []) {
    result.set(row.buyer_id, (result.get(row.buyer_id) ?? 0) + 1);
  }

  for (const row of sellerRes.data ?? []) {
    result.set(row.seller_id, (result.get(row.seller_id) ?? 0) + 1);
  }

  return result;
}

export async function getDirectoryEntries(
  params: DirectorySearchParams,
): Promise<DirectoryListResult> {
  const admin = createAdminClient();
  const page = params.page;
  const from = (page - 1) * DIRECTORY_PAGE_SIZE;
  const to = from + DIRECTORY_PAGE_SIZE - 1;

  let mineralUserIds: Set<string> | null = null;
  if (params.mineral) {
    mineralUserIds = await getUserIdsForMineral(params.mineral as MineralId);
    if (mineralUserIds.size === 0) {
      return { entries: [], total: 0, page, pageSize: DIRECTORY_PAGE_SIZE };
    }
  }

  let query = admin
    .from('profiles')
    .select(DIRECTORY_PUBLIC_PROFILE_COLUMNS, { count: 'exact' })
    .in('role', [...DIRECTORY_PUBLIC_ROLES])
    .eq('kyc_status', 'approved')
    .order('created_at', { ascending: false });

  if (params.role) {
    query = query.eq('role', params.role);
  }

  if (params.country) {
    query = query.eq('country', params.country);
  }

  if (params.q?.trim()) {
    query = query.ilike('company_name', `%${params.q.trim()}%`);
  }

  if (mineralUserIds) {
    query = query.in('id', [...mineralUserIds]);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const profiles = (data ?? []).filter(isDirectoryEligibleProfile);
  const userIds = profiles.map((profile) => profile.id);

  const [mineralsByUser, provincesByUser, completedCounts] = await Promise.all([
    getMineralsForUsers(userIds),
    getProvincesForUsers(userIds),
    getCompletedOrderCounts(userIds),
  ]);

  const trustScores = await Promise.all(
    profiles.map((profile) => getTrustScoreForUserWithAdmin(profile.id, profile.kyc_status, profile.created_at)),
  );

  const entries: DirectoryEntry[] = profiles.map((profile, index) => ({
    profile,
    province: provincesByUser.get(profile.id) ?? null,
    minerals: mineralsByUser.get(profile.id) ?? [],
    trustScore: trustScores[index]!,
    completedOrderCount: completedCounts.get(profile.id) ?? 0,
  }));

  return {
    entries,
    total: count ?? 0,
    page,
    pageSize: DIRECTORY_PAGE_SIZE,
  };
}

export async function getDirectoryProfileById(
  userId: string,
): Promise<DirectoryProfileDetail | null> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from('profiles')
    .select(DIRECTORY_PUBLIC_PROFILE_COLUMNS)
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data || !isDirectoryEligibleProfile(data)) {
    return null;
  }

  const profile = data;
  const [mineralsByUser, provincesByUser, completedCounts, trustScore, contactContext] =
    await Promise.all([
      getMineralsForUsers([profile.id]),
      getProvincesForUsers([profile.id]),
      getCompletedOrderCounts([profile.id]),
      getTrustScoreForUserWithAdmin(profile.id, profile.kyc_status, profile.created_at),
      findDirectoryContactContext(profile.id, profile.role),
    ]);

  let activeListings: MarketplaceListingRow[] = [];
  if (isSellerRole(profile.role)) {
    const { data: listings, error: listingsError } = await admin
      .from('listings')
      .select(
        `
          *,
          seller:profiles!listings_seller_id_fkey(company_name, kyc_status, created_at),
          listing_photos(id, storage_path, sort_order),
          lot_traceability(id, lot_code)
        `,
      )
      .eq('seller_id', profile.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .order('sort_order', { ascending: true, foreignTable: 'listing_photos' });

    if (listingsError) {
      throw new Error(listingsError.message);
    }

    activeListings = (listings ?? []).map((listing) => ({
      ...listing,
      lot_traceability: Array.isArray(listing.lot_traceability)
        ? listing.lot_traceability[0] ?? null
        : listing.lot_traceability,
    })) as MarketplaceListingRow[];
  }

  return {
    profile,
    province: provincesByUser.get(profile.id) ?? null,
    minerals: mineralsByUser.get(profile.id) ?? [],
    trustScore,
    completedOrderCount: completedCounts.get(profile.id) ?? 0,
    activeListings,
    contactContext,
  };
}

export async function findDirectoryContactContext(
  targetUserId: string,
  targetRole: DirectoryPublicProfile['role'],
): Promise<DirectoryContactContext | null> {
  const admin = createAdminClient();

  if (isSellerRole(targetRole)) {
    const { data, error } = await admin
      .from('listings')
      .select('id')
      .eq('seller_id', targetUserId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data ? { type: 'listing', listingId: data.id } : null;
  }

  const { data, error } = await admin
    .from('rfps')
    .select('id')
    .eq('buyer_id', targetUserId)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? { type: 'rfp', rfpId: data.id } : null;
}
