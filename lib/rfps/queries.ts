import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth/session';
import type { Database } from '@/types/database.types';
import type { MineralId } from '@/lib/constants/minerals';

type MineralType = Database['public']['Enums']['mineral_type'];

export const RFP_PAGE_SIZE = 20;

export type RfpBuyerProfile = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'company_name' | 'kyc_status'
>;

export type RfpRow = Database['public']['Tables']['rfps']['Row'] & {
  buyer: RfpBuyerProfile | null;
};

export type RfpBidSellerProfile = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'company_name' | 'kyc_status'
>;

export type RfpBidRow = Database['public']['Tables']['rfp_bids']['Row'] & {
  seller: RfpBidSellerProfile | null;
};

export interface RfpSearchParams {
  mineral?: MineralId;
  page: number;
}

export interface RfpListResult {
  rfps: RfpRow[];
  total: number;
  page: number;
  pageSize: number;
}

export function parseRfpSearchParams(
  raw: Record<string, string | string[] | undefined>,
): RfpSearchParams {
  const mineralRaw = typeof raw.mineral === 'string' ? raw.mineral : undefined;
  const pageRaw = typeof raw.page === 'string' ? Number.parseInt(raw.page, 10) : 1;
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  return {
    mineral: mineralRaw as MineralId | undefined,
    page,
  };
}

export async function getOpenRfps(params: RfpSearchParams): Promise<RfpListResult> {
  const supabase = await createClient();
  const from = (params.page - 1) * RFP_PAGE_SIZE;
  const to = from + RFP_PAGE_SIZE - 1;

  let query = supabase
    .from('rfps')
    .select(
      `
        *,
        buyer:profiles!rfps_buyer_id_fkey(company_name, kyc_status)
      `,
      { count: 'exact' },
    )
    .eq('status', 'open')
    .order('deadline', { ascending: true })
    .order('created_at', { ascending: false });

  if (params.mineral) {
    query = query.eq('mineral', params.mineral as MineralType);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return {
    rfps: (data ?? []) as RfpRow[],
    total: count ?? 0,
    page: params.page,
    pageSize: RFP_PAGE_SIZE,
  };
}

export async function getRfpById(rfpId: string): Promise<RfpRow | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('rfps')
    .select(
      `
        *,
        buyer:profiles!rfps_buyer_id_fkey(company_name, kyc_status)
      `,
    )
    .eq('id', rfpId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as RfpRow | null) ?? null;
}

export async function getRfpBidsForBuyer(rfpId: string): Promise<RfpBidRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('rfp_bids')
    .select(
      `
        *,
        seller:profiles!rfp_bids_seller_id_fkey(company_name, kyc_status)
      `,
    )
    .eq('rfp_id', rfpId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as RfpBidRow[];
}

export async function getOwnRfpBid(rfpId: string, sellerId: string): Promise<RfpBidRow | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('rfp_bids')
    .select(
      `
        *,
        seller:profiles!rfp_bids_seller_id_fkey(company_name, kyc_status)
      `,
    )
    .eq('rfp_id', rfpId)
    .eq('seller_id', sellerId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as RfpBidRow | null) ?? null;
}

export async function getRfpConversationId(
  rfpId: string,
  sellerId: string,
): Promise<string | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('conversations')
    .select('id')
    .eq('rfp_id', rfpId)
    .eq('seller_id', sellerId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.id ?? null;
}

export function formatRfpTargetPriceRange(
  min: number | null,
  max: number | null,
  negotiableLabel: string,
): string {
  if (min === null && max === null) {
    return negotiableLabel;
  }

  if (min !== null && max !== null) {
    return `${min} – ${max}`;
  }

  if (min !== null) {
    return `≥ ${min}`;
  }

  return `≤ ${max}`;
}

export async function canCurrentUserViewRfp(rfp: RfpRow): Promise<boolean> {
  const profile = await getProfile();
  if (!profile) {
    return rfp.status === 'open';
  }

  if (profile.role === 'admin' || profile.id === rfp.buyer_id) {
    return true;
  }

  if (rfp.status === 'open') {
    return true;
  }

  const supabase = await createClient();
  const { count, error } = await supabase
    .from('rfp_bids')
    .select('id', { count: 'exact', head: true })
    .eq('rfp_id', rfp.id)
    .eq('seller_id', profile.id);

  if (error) {
    throw new Error(error.message);
  }

  return (count ?? 0) > 0;
}
