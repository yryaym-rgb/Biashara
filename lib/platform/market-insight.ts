import 'server-only';

import { createClient } from '@/lib/supabase/server';
import type { MineralId } from '@/lib/constants/minerals';
import { getPriceHistoryForMineral } from '@/lib/prices/history';
import {
  computeWeeklyPercentChange,
  pickPrimaryMineral,
  type PriceSparklinePoint,
} from '@/lib/platform/market-insight.logic';

export type { PriceSparklinePoint } from '@/lib/platform/market-insight.logic';
export { computeWeeklyPercentChange, pickPrimaryMineral } from '@/lib/platform/market-insight.logic';

export interface MarketInsight {
  mineral: MineralId;
  percentChange: number;
  sparkline: PriceSparklinePoint[];
  currency: string;
}

const WEEKLY_WINDOW_DAYS = 7;

function weekCutoffDate(): string {
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - WEEKLY_WINDOW_DAYS);
  return cutoff.toISOString().slice(0, 10);
}

export async function getUserTradedMinerals(userId: string): Promise<{
  minerals: MineralId[];
  orderCounts: Map<MineralId, number>;
}> {
  const supabase = await createClient();

  const [listingsRes, buyerOffersRes, sellerOffersRes, buyerOrdersRes, sellerOrdersRes] =
    await Promise.all([
      supabase.from('listings').select('mineral').eq('seller_id', userId),
      supabase
        .from('offers')
        .select('listing:listings(mineral)')
        .eq('buyer_id', userId),
      supabase
        .from('offers')
        .select('listing:listings!inner(mineral, seller_id)')
        .eq('listing.seller_id', userId),
      supabase
        .from('orders')
        .select('listing:listings(mineral)')
        .eq('buyer_id', userId),
      supabase
        .from('orders')
        .select('listing:listings(mineral)')
        .eq('seller_id', userId),
    ]);

  const errors = [
    listingsRes.error,
    buyerOffersRes.error,
    sellerOffersRes.error,
    buyerOrdersRes.error,
    sellerOrdersRes.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    throw new Error(errors[0]!.message);
  }

  const mineralSet = new Set<MineralId>();
  const orderCounts = new Map<MineralId, number>();

  const addMineral = (mineral: string | undefined) => {
    if (mineral) {
      mineralSet.add(mineral as MineralId);
    }
  };

  for (const row of listingsRes.data ?? []) {
    addMineral(row.mineral);
  }

  for (const row of buyerOffersRes.data ?? []) {
    const listing = Array.isArray(row.listing) ? row.listing[0] : row.listing;
    addMineral(listing?.mineral);
  }

  for (const row of sellerOffersRes.data ?? []) {
    const listing = Array.isArray(row.listing) ? row.listing[0] : row.listing;
    addMineral(listing?.mineral);
  }

  for (const row of buyerOrdersRes.data ?? []) {
    const listing = Array.isArray(row.listing) ? row.listing[0] : row.listing;
    const mineral = listing?.mineral as MineralId | undefined;
    if (mineral) {
      addMineral(mineral);
      orderCounts.set(mineral, (orderCounts.get(mineral) ?? 0) + 1);
    }
  }

  for (const row of sellerOrdersRes.data ?? []) {
    const listing = Array.isArray(row.listing) ? row.listing[0] : row.listing;
    const mineral = listing?.mineral as MineralId | undefined;
    if (mineral) {
      addMineral(mineral);
      orderCounts.set(mineral, (orderCounts.get(mineral) ?? 0) + 1);
    }
  }

  return {
    minerals: Array.from(mineralSet),
    orderCounts,
  };
}

export async function getMarketInsightForUser(userId: string): Promise<MarketInsight | null> {
  const { minerals, orderCounts } = await getUserTradedMinerals(userId);
  const primaryMineral = pickPrimaryMineral(minerals, orderCounts);

  if (!primaryMineral) {
    return null;
  }

  const history = await getPriceHistoryForMineral(primaryMineral, weekCutoffDate());
  const sparkline: PriceSparklinePoint[] = history.map((point) => ({
    date: point.date,
    price: point.price,
  }));

  if (sparkline.length < 2) {
    return null;
  }

  const percentChange = computeWeeklyPercentChange(sparkline);
  if (percentChange === null) {
    return null;
  }

  const latestCurrency = history[history.length - 1]?.currency ?? 'USD';

  return {
    mineral: primaryMineral,
    percentChange,
    sparkline,
    currency: latestCurrency,
  };
}
