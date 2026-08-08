import 'server-only';

import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database.types';

type OrderStatus = Database['public']['Enums']['order_status'];

export interface TransactionExportRow {
  id: string;
  date: string;
  mineral: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalAmount: number;
  currency: string;
  counterpartName: string;
  status: OrderStatus;
}

function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function getUserTransactionsForExport(
  userId: string,
): Promise<TransactionExportRow[]> {
  const supabase = await createClient();

  const [buyerOrdersRes, sellerOrdersRes] = await Promise.all([
    supabase
      .from('orders')
      .select(
        `
          id,
          status,
          price_amount,
          quantity,
          unit,
          currency,
          created_at,
          buyer:profiles!orders_buyer_id_fkey(company_name),
          seller:profiles!orders_seller_id_fkey(company_name),
          listing:listings(mineral)
        `,
      )
      .eq('buyer_id', userId)
      .order('created_at', { ascending: false }),
    supabase
      .from('orders')
      .select(
        `
          id,
          status,
          price_amount,
          quantity,
          unit,
          currency,
          created_at,
          buyer:profiles!orders_buyer_id_fkey(company_name),
          seller:profiles!orders_seller_id_fkey(company_name),
          listing:listings(mineral)
        `,
      )
      .eq('seller_id', userId)
      .order('created_at', { ascending: false }),
  ]);

  if (buyerOrdersRes.error) {
    throw new Error(buyerOrdersRes.error.message);
  }
  if (sellerOrdersRes.error) {
    throw new Error(sellerOrdersRes.error.message);
  }

  const rows: TransactionExportRow[] = [];
  const seen = new Set<string>();

  const pushOrder = (
    row: NonNullable<typeof buyerOrdersRes.data>[number],
    role: 'buyer' | 'seller',
  ) => {
    if (seen.has(row.id)) {
      return;
    }
    seen.add(row.id);

    const listing = Array.isArray(row.listing) ? row.listing[0] : row.listing;
    const buyer = Array.isArray(row.buyer) ? row.buyer[0] : row.buyer;
    const seller = Array.isArray(row.seller) ? row.seller[0] : row.seller;
    const counterpart =
      role === 'buyer'
        ? seller?.company_name?.trim() || ''
        : buyer?.company_name?.trim() || '';

    rows.push({
      id: row.id,
      date: row.created_at,
      mineral: listing?.mineral ?? '',
      quantity: Number(row.quantity),
      unit: row.unit,
      pricePerUnit: Number(row.price_amount),
      totalAmount: Number(row.price_amount) * Number(row.quantity),
      currency: row.currency,
      counterpartName: counterpart,
      status: row.status,
    });
  };

  for (const row of buyerOrdersRes.data ?? []) {
    pushOrder(row, 'buyer');
  }
  for (const row of sellerOrdersRes.data ?? []) {
    pushOrder(row, 'seller');
  }

  return rows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function buildTransactionsCsv(
  rows: TransactionExportRow[],
  headers: {
    date: string;
    mineral: string;
    quantity: string;
    price: string;
    total: string;
    counterpart: string;
    status: string;
    reference: string;
  },
): string {
  const headerLine = [
    headers.date,
    headers.mineral,
    headers.quantity,
    headers.price,
    headers.total,
    headers.counterpart,
    headers.status,
    headers.reference,
  ].join(',');

  const dataLines = rows.map((row) =>
    [
      escapeCsvField(row.date.slice(0, 10)),
      escapeCsvField(row.mineral),
      escapeCsvField(`${row.quantity} ${row.unit}`),
      escapeCsvField(`${row.pricePerUnit} ${row.currency}`),
      escapeCsvField(`${row.totalAmount} ${row.currency}`),
      escapeCsvField(row.counterpartName),
      escapeCsvField(row.status),
      escapeCsvField(row.id),
    ].join(','),
  );

  return [headerLine, ...dataLines].join('\n');
}
