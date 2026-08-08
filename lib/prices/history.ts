import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';
import type { MineralId } from '@/lib/constants/minerals';
import type { Database } from '@/types/database.types';

type MineralType = Database['public']['Enums']['mineral_type'];

export interface PriceHistoryPoint {
  date: string;
  price: number;
  currency: string;
}

export async function getPriceHistoryForMineral(
  mineral: MineralId,
  sinceDate?: string,
): Promise<PriceHistoryPoint[]> {
  const admin = createAdminClient();

  let query = admin
    .from('price_history')
    .select('price, currency, recorded_date')
    .eq('mineral', mineral as MineralType)
    .order('recorded_date', { ascending: true });

  if (sinceDate) {
    query = query.gte('recorded_date', sinceDate);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    date: row.recorded_date,
    price: Number(row.price),
    currency: row.currency,
  }));
}
