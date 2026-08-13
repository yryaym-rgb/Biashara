import 'server-only';

import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database.types';

export interface ModerationPreviewListing {
  id: string;
  mineral: Database['public']['Enums']['mineral_type'];
  quantity: number;
  unit: Database['public']['Enums']['quantity_unit'];
  originProvince: string;
  submittedAt: string;
}

export interface AdminModerationPreview {
  pendingCount: number;
  recentPending: ModerationPreviewListing[];
}

const PREVIEW_LIMIT = 3;

export async function getAdminModerationPreview(): Promise<AdminModerationPreview> {
  const supabase = await createClient();

  const [countRes, listingsRes] = await Promise.all([
    supabase
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending_review'),
    supabase
      .from('listings')
      .select('id, mineral, quantity, unit, origin_province, created_at')
      .eq('status', 'pending_review')
      .order('created_at', { ascending: false })
      .limit(PREVIEW_LIMIT),
  ]);

  if (countRes.error) {
    throw new Error(countRes.error.message);
  }
  if (listingsRes.error) {
    throw new Error(listingsRes.error.message);
  }

  return {
    pendingCount: countRes.count ?? 0,
    recentPending: (listingsRes.data ?? []).map((row) => ({
      id: row.id,
      mineral: row.mineral,
      quantity: row.quantity,
      unit: row.unit,
      originProvince: row.origin_province,
      submittedAt: row.created_at,
    })),
  };
}
