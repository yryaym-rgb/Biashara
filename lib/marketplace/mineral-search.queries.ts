import 'server-only';

import { z } from 'zod';
import { MINERAL_IDS, type MineralId } from '@/lib/constants/minerals';
import { createClient } from '@/lib/supabase/server';
import {
  aggregateMineralSearchCounts,
  type MineralSearchCount,
} from '@/lib/marketplace/mineral-search.logic';
import type { Database } from '@/types/database.types';

type MineralType = Database['public']['Enums']['mineral_type'];

const mineralIdsSchema = z
  .array(z.enum(MINERAL_IDS as unknown as [string, ...string[]]))
  .min(1)
  .max(MINERAL_IDS.length);

export function parseMineralSearchIds(raw: string | null): MineralId[] | null {
  if (!raw?.trim()) {
    return null;
  }

  const parsed = mineralIdsSchema.safeParse(
    raw
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean),
  );

  if (!parsed.success) {
    return null;
  }

  return parsed.data as MineralId[];
}

/**
 * Live marketplace counts for hero mineral autocomplete.
 *
 * Queries (via Supabase anon client, RLS-scoped to active listings):
 * 1. Active listing count per mineral:
 *    SELECT mineral, seller_id FROM listings
 *    WHERE status = 'active' AND mineral IN (...)
 *    → COUNT rows grouped by mineral
 *
 * 2. Verified supplier count per mineral:
 *    Same rows joined to profiles (listings_seller_id_fkey) for kyc_status
 *    → COUNT DISTINCT seller_id WHERE profiles.kyc_status = 'approved' per mineral
 */
export async function getMineralSearchCounts(
  mineralIds: MineralId[],
): Promise<MineralSearchCount[]> {
  const validated = mineralIdsSchema.parse(mineralIds);
  if (validated.length === 0) {
    return [];
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('listings')
    .select('mineral, seller_id, seller:profiles!listings_seller_id_fkey(kyc_status)')
    .eq('status', 'active')
    .in('mineral', validated as MineralType[]);

  if (error) {
    throw new Error(error.message);
  }

  return aggregateMineralSearchCounts(
    validated as MineralId[],
    (data ?? []).map((row) => ({
      mineral: row.mineral as MineralId,
      seller_id: row.seller_id,
      seller: row.seller,
    })),
  );
}
