import 'server-only';

import { createClient } from '@/lib/supabase/server';
import type { MineralId } from '@/lib/constants/minerals';

export interface TradingMixSegment {
  mineral: MineralId;
  count: number;
}

export function buildTradingMixSegments(
  orders: Array<{ mineral: string }>,
): TradingMixSegment[] {
  const counts = new Map<MineralId, number>();

  for (const order of orders) {
    const mineral = order.mineral as MineralId;
    counts.set(mineral, (counts.get(mineral) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([mineral, count]) => ({ mineral, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getTradingMixForUser(userId: string): Promise<TradingMixSegment[]> {
  const supabase = await createClient();

  const [buyerOrdersRes, sellerOrdersRes] = await Promise.all([
    supabase
      .from('orders')
      .select('id, listing:listings(mineral)')
      .eq('buyer_id', userId),
    supabase
      .from('orders')
      .select('id, listing:listings(mineral)')
      .eq('seller_id', userId),
  ]);

  if (buyerOrdersRes.error) {
    throw new Error(buyerOrdersRes.error.message);
  }
  if (sellerOrdersRes.error) {
    throw new Error(sellerOrdersRes.error.message);
  }

  const seen = new Set<string>();
  const minerals: Array<{ mineral: string }> = [];

  const pushOrder = (row: { id: string; listing: { mineral: string } | { mineral: string }[] | null }) => {
    if (seen.has(row.id)) {
      return;
    }
    seen.add(row.id);
    const listing = Array.isArray(row.listing) ? row.listing[0] : row.listing;
    if (listing?.mineral) {
      minerals.push({ mineral: listing.mineral });
    }
  };

  for (const row of buyerOrdersRes.data ?? []) {
    pushOrder(row);
  }
  for (const row of sellerOrdersRes.data ?? []) {
    pushOrder(row);
  }

  return buildTradingMixSegments(minerals);
}
