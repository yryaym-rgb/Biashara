import 'server-only';

import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database.types';

export const ORDERS_PAGE_SIZE = 10;

type OrderStatus = Database['public']['Enums']['order_status'];
type QuantityUnit = Database['public']['Enums']['quantity_unit'];
type MineralType = Database['public']['Enums']['mineral_type'];

export interface PlatformOrderListRow {
  id: string;
  status: OrderStatus;
  price_amount: number;
  quantity: number;
  unit: QuantityUnit;
  currency: string;
  created_at: string;
  buyer_id: string;
  seller_id: string;
  listing: {
    title: string;
    mineral: MineralType;
  } | null;
  buyer: {
    company_name: string | null;
    kyc_status: Database['public']['Enums']['kyc_status'];
  } | null;
  seller: {
    company_name: string | null;
    kyc_status: Database['public']['Enums']['kyc_status'];
  } | null;
}

export interface PlatformOrdersListResult {
  orders: PlatformOrderListRow[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PlatformOrderDetail {
  id: string;
  listing_id: string;
  status: OrderStatus;
  price_amount: number;
  quantity: number;
  unit: QuantityUnit;
  currency: string;
  created_at: string;
  updated_at: string;
  buyer_id: string;
  seller_id: string;
  dispute_reason: string | null;
  disputed_at: string | null;
  listing: {
    title: string;
    mineral: MineralType;
    origin_province: string;
    certifications: string[];
  } | null;
  buyer: {
    company_name: string | null;
    kyc_status: Database['public']['Enums']['kyc_status'];
  } | null;
  seller: {
    company_name: string | null;
    kyc_status: Database['public']['Enums']['kyc_status'];
  } | null;
  conversation_id: string | null;
}

const ORDER_LIST_SELECT = `
  id,
  status,
  price_amount,
  quantity,
  unit,
  currency,
  created_at,
  buyer_id,
  seller_id,
  buyer:profiles!orders_buyer_id_fkey(company_name, kyc_status),
  seller:profiles!orders_seller_id_fkey(company_name, kyc_status),
  listing:listings(title, mineral)
`;

const ORDER_DETAIL_SELECT = `
  id,
  listing_id,
  status,
  price_amount,
  quantity,
  unit,
  currency,
  created_at,
  updated_at,
  buyer_id,
  seller_id,
  dispute_reason,
  disputed_at,
  buyer:profiles!orders_buyer_id_fkey(company_name, kyc_status),
  seller:profiles!orders_seller_id_fkey(company_name, kyc_status),
  listing:listings(title, mineral, origin_province, certifications)
`;

function normalizeRelation<T>(value: T | T[] | null): T | null {
  if (!value) {
    return null;
  }
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export async function getOrdersForUser(
  userId: string,
  page = 1,
): Promise<PlatformOrdersListResult> {
  const supabase = await createClient();
  const from = (page - 1) * ORDERS_PAGE_SIZE;
  const to = from + ORDERS_PAGE_SIZE - 1;

  const { data, error, count } = await supabase
    .from('orders')
    .select(ORDER_LIST_SELECT, { count: 'exact' })
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const orders: PlatformOrderListRow[] = (data ?? []).map((row) => ({
    id: row.id,
    status: row.status,
    price_amount: row.price_amount,
    quantity: row.quantity,
    unit: row.unit,
    currency: row.currency,
    created_at: row.created_at,
    buyer_id: row.buyer_id,
    seller_id: row.seller_id,
    listing: normalizeRelation(row.listing),
    buyer: normalizeRelation(row.buyer),
    seller: normalizeRelation(row.seller),
  }));

  return {
    orders,
    total: count ?? 0,
    page,
    pageSize: ORDERS_PAGE_SIZE,
  };
}

export async function getOrderDetailForUser(
  orderId: string,
  userId: string,
  isAdmin: boolean,
): Promise<PlatformOrderDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_DETAIL_SELECT)
    .eq('id', orderId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  if (!isAdmin && data.buyer_id !== userId && data.seller_id !== userId) {
    return null;
  }

  const { data: conversation } = await supabase
    .from('conversations')
    .select('id')
    .eq('listing_id', data.listing_id)
    .eq('buyer_id', data.buyer_id)
    .maybeSingle();

  return {
    id: data.id,
    listing_id: data.listing_id,
    status: data.status,
    price_amount: data.price_amount,
    quantity: data.quantity,
    unit: data.unit,
    currency: data.currency,
    created_at: data.created_at,
    updated_at: data.updated_at,
    buyer_id: data.buyer_id,
    seller_id: data.seller_id,
    dispute_reason: data.dispute_reason,
    disputed_at: data.disputed_at,
    listing: normalizeRelation(data.listing),
    buyer: normalizeRelation(data.buyer),
    seller: normalizeRelation(data.seller),
    conversation_id: conversation?.id ?? null,
  };
}

export async function getOrderForAction(orderId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .select('id, status, buyer_id, seller_id')
    .eq('id', orderId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
