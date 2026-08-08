import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth/session';
import type { Database } from '@/types/database.types';
import {
  MARKETPLACE_PAGE_SIZE,
  type MarketplaceSearchParams,
} from '@/lib/marketplace/params';

type MineralType = Database['public']['Enums']['mineral_type'];

export type ListingSellerProfile = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'company_name' | 'kyc_status' | 'created_at'
>;

export type ListingPhotoRow = Pick<
  Database['public']['Tables']['listing_photos']['Row'],
  'id' | 'storage_path' | 'sort_order'
>;

export type MarketplaceListingRow = Database['public']['Tables']['listings']['Row'] & {
  seller: ListingSellerProfile | null;
  listing_photos: ListingPhotoRow[];
  lot_traceability: Pick<
    Database['public']['Tables']['lot_traceability']['Row'],
    'id' | 'lot_code'
  > | null;
};

export interface MarketplaceListingsResult {
  listings: MarketplaceListingRow[];
  total: number;
  page: number;
  pageSize: number;
}

type LotTraceabilitySummary = Pick<
  Database['public']['Tables']['lot_traceability']['Row'],
  'id' | 'lot_code'
>;

function normalizeLotTraceability(
  value: LotTraceabilitySummary | LotTraceabilitySummary[] | null | undefined,
): LotTraceabilitySummary | null {
  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

function normalizeMarketplaceListing(
  listing: MarketplaceListingRow & {
    lot_traceability?: LotTraceabilitySummary | LotTraceabilitySummary[] | null;
  },
): MarketplaceListingRow {
  const { lot_traceability, ...rest } = listing;
  return {
    ...rest,
    lot_traceability: normalizeLotTraceability(lot_traceability),
  };
}

export async function getActiveListings(
  params: MarketplaceSearchParams,
): Promise<MarketplaceListingsResult> {
  const supabase = await createClient();
  const page = params.page;
  const from = (page - 1) * MARKETPLACE_PAGE_SIZE;
  const to = from + MARKETPLACE_PAGE_SIZE - 1;

  let query = supabase
    .from('listings')
    .select(
      `
        *,
        seller:profiles!listings_seller_id_fkey(company_name, kyc_status, created_at),
        listing_photos(id, storage_path, sort_order),
        lot_traceability(id, lot_code)
      `,
      { count: 'exact' },
    )
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .order('sort_order', { ascending: true, foreignTable: 'listing_photos' });

  if (params.mineral) {
    query = query.eq('mineral', params.mineral as MineralType);
  }

  if (params.province) {
    query = query.eq('origin_province', params.province);
  }

  if (params.minPrice !== undefined) {
    query = query.gte('price_amount', params.minPrice);
  }

  if (params.maxPrice !== undefined) {
    query = query.lte('price_amount', params.maxPrice);
  }

  if (params.q?.trim()) {
    const term = params.q.trim();
    query = query.or(`title.ilike.%${term}%,mineral.ilike.%${term}%`);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return {
    listings: (data ?? []).map((listing) =>
      normalizeMarketplaceListing(listing as MarketplaceListingRow & {
        lot_traceability?: LotTraceabilitySummary | LotTraceabilitySummary[] | null;
      }),
    ),
    total: count ?? 0,
    page,
    pageSize: MARKETPLACE_PAGE_SIZE,
  };
}

/** Active listing counts keyed by origin_province — real Supabase query results only. */
export async function getActiveListingCountsByProvince(): Promise<Record<string, number>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('listings')
    .select('origin_province')
    .eq('status', 'active');

  if (error) {
    throw new Error(error.message);
  }

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const province = row.origin_province;
    counts[province] = (counts[province] ?? 0) + 1;
  }

  return counts;
}

export async function getListingById(listingId: string): Promise<MarketplaceListingRow | null> {
  const supabase = await createClient();
  const profile = await getProfile();

  const { data, error } = await supabase
    .from('listings')
    .select(
      `
        *,
        seller:profiles!listings_seller_id_fkey(company_name, kyc_status, created_at),
        listing_photos(id, storage_path, sort_order),
        lot_traceability(id, lot_code)
      `,
    )
    .eq('id', listingId)
    .order('sort_order', { ascending: true, foreignTable: 'listing_photos' })
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const listing = normalizeMarketplaceListing(
    data as MarketplaceListingRow & {
      lot_traceability?: LotTraceabilitySummary | LotTraceabilitySummary[] | null;
    },
  );
  const isOwner = profile?.id === listing.seller_id;
  const isAdmin = profile?.role === 'admin';

  if (listing.status !== 'active' && !isOwner && !isAdmin) {
    if (listing.status === 'sold' && profile) {
      const { count, error: orderError } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('listing_id', listingId)
        .or(`buyer_id.eq.${profile.id},seller_id.eq.${profile.id}`);

      if (orderError) {
        throw new Error(orderError.message);
      }

      if ((count ?? 0) > 0) {
        return listing;
      }
    }

    return null;
  }

  return listing;
}
