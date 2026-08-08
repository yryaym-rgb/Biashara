import 'server-only';

import { createClient } from '@/lib/supabase/server';
import type { MineralId } from '@/lib/constants/minerals';
import type { MarketplaceListingRow } from '@/lib/marketplace/queries';

export interface SuggestionGroup {
  mineral: MineralId;
  listings: MarketplaceListingRow[];
}

/**
 * Ranks minerals by how often the user has traded them (orders + offers),
 * most frequent first. Ties preserve first-seen order.
 */
export function rankTradedMinerals(mineralOccurrences: MineralId[]): MineralId[] {
  const counts = new Map<MineralId, number>();
  const order: MineralId[] = [];

  for (const mineral of mineralOccurrences) {
    if (!counts.has(mineral)) {
      order.push(mineral);
    }
    counts.set(mineral, (counts.get(mineral) ?? 0) + 1);
  }

  return order.sort((a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0));
}

/**
 * Groups active listings by mineral for suggestion display.
 * Excludes the user's own listings. Limits results per mineral.
 */
export function buildSuggestionGroups(
  tradedMinerals: MineralId[],
  listings: MarketplaceListingRow[],
  userId: string,
  limitPerMineral = 3,
): SuggestionGroup[] {
  const ranked = rankTradedMinerals(tradedMinerals);
  const groups: SuggestionGroup[] = [];

  for (const mineral of ranked) {
    const matching = listings
      .filter((listing) => listing.mineral === mineral && listing.seller_id !== userId)
      .slice(0, limitPerMineral);

    if (matching.length > 0) {
      groups.push({ mineral, listings: matching });
    }
  }

  return groups;
}

export async function getTradedMineralsForUser(userId: string): Promise<MineralId[]> {
  const supabase = await createClient();

  const [buyerOrdersRes, sellerOrdersRes, offersRes] = await Promise.all([
    supabase
      .from('orders')
      .select('id, listing:listings(mineral)')
      .eq('buyer_id', userId),
    supabase
      .from('orders')
      .select('id, listing:listings(mineral)')
      .eq('seller_id', userId),
    supabase.from('offers').select('id, listing:listings(mineral)').eq('buyer_id', userId),
  ]);

  if (buyerOrdersRes.error) {
    throw new Error(buyerOrdersRes.error.message);
  }
  if (sellerOrdersRes.error) {
    throw new Error(sellerOrdersRes.error.message);
  }
  if (offersRes.error) {
    throw new Error(offersRes.error.message);
  }

  const minerals: MineralId[] = [];

  const pushMineral = (row: {
    listing: { mineral: string } | { mineral: string }[] | null;
  }) => {
    const listing = Array.isArray(row.listing) ? row.listing[0] : row.listing;
    if (listing?.mineral) {
      minerals.push(listing.mineral as MineralId);
    }
  };

  for (const row of buyerOrdersRes.data ?? []) {
    pushMineral(row);
  }
  for (const row of sellerOrdersRes.data ?? []) {
    pushMineral(row);
  }
  for (const row of offersRes.data ?? []) {
    pushMineral(row);
  }

  return minerals;
}

export async function getSuggestedListingsForUser(
  userId: string,
): Promise<SuggestionGroup[]> {
  const tradedMinerals = await getTradedMineralsForUser(userId);

  if (tradedMinerals.length === 0) {
    return [];
  }

  const uniqueMinerals = [...new Set(tradedMinerals)];
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('listings')
    .select(
      `
        *,
        seller:profiles!listings_seller_id_fkey(company_name, kyc_status, created_at),
        listing_photos(id, storage_path, sort_order)
      `,
    )
    .eq('status', 'active')
    .in('mineral', uniqueMinerals)
    .neq('seller_id', userId)
    .order('created_at', { ascending: false })
    .order('sort_order', { ascending: true, foreignTable: 'listing_photos' });

  if (error) {
    throw new Error(error.message);
  }

  return buildSuggestionGroups(
    tradedMinerals,
    (data ?? []) as MarketplaceListingRow[],
    userId,
  );
}
