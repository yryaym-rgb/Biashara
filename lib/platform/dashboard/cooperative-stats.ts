import 'server-only';

import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database.types';

const IN_PROGRESS_ORDER_STATUSES: Database['public']['Enums']['order_status'][] = [
  'confirmed',
  'processing',
  'in_transit',
];

export interface CooperativeDashboardStats {
  lots: number;
  offers: number;
  openPurchaseRequests: number;
  ordersInProgress: number;
}

export async function getCooperativeDashboardStats(
  userId: string,
): Promise<CooperativeDashboardStats> {
  const supabase = await createClient();

  const [lotsRes, buyerOffersRes, sellerOffersRes, openRfpsRes, ordersInProgressRes] =
    await Promise.all([
      supabase
        .from('lot_traceability')
        .select('id', { count: 'exact', head: true })
        .eq('cooperative_id', userId),
      supabase
        .from('offers')
        .select('id', { count: 'exact', head: true })
        .eq('buyer_id', userId)
        .eq('status', 'pending'),
      supabase
        .from('offers')
        .select('id, listings!inner(seller_id)', { count: 'exact', head: true })
        .eq('listings.seller_id', userId)
        .eq('status', 'pending'),
      supabase
        .from('rfps')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'open'),
      supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('seller_id', userId)
        .in('status', IN_PROGRESS_ORDER_STATUSES),
    ]);

  const errors = [
    lotsRes.error,
    buyerOffersRes.error,
    sellerOffersRes.error,
    openRfpsRes.error,
    ordersInProgressRes.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    throw new Error(errors[0]!.message);
  }

  return {
    lots: lotsRes.count ?? 0,
    offers: (buyerOffersRes.count ?? 0) + (sellerOffersRes.count ?? 0),
    openPurchaseRequests: openRfpsRes.count ?? 0,
    ordersInProgress: ordersInProgressRes.count ?? 0,
  };
}
