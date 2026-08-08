import 'server-only';

import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database.types';

function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildCsv(headers: string[], rows: string[][]): string {
  const headerLine = headers.map(escapeCsvField).join(',');
  const dataLines = rows.map((row) => row.map(escapeCsvField).join(','));
  return [headerLine, ...dataLines].join('\n');
}

export async function getUsersExportRows() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, company_name, role, country, phone, locale, kyc_status, created_at, updated_at')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getListingsExportRows() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('listings')
    .select(
      'id, seller_id, mineral, title, grade, purity, quantity, unit, price_amount, price_currency, price_type, origin_province, status, created_at, updated_at',
    )
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getOrdersExportRows() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .select(
      `
        id,
        offer_id,
        listing_id,
        buyer_id,
        seller_id,
        price_amount,
        quantity,
        unit,
        currency,
        status,
        dispute_reason,
        disputed_at,
        created_at,
        updated_at,
        listing:listings(mineral, title)
      `,
    )
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getAuditLogExportRows() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('audit_log')
    .select('id, actor_id, action, entity, entity_id, diff, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

function headerValues(headers: Record<string, string>, keys: string[]): string[] {
  return keys.map((key) => headers[key] ?? key);
}

export function buildUsersCsv(
  rows: Awaited<ReturnType<typeof getUsersExportRows>>,
  headers: Record<string, string>,
): string {
  return buildCsv(
    headerValues(headers, [
      'id',
      'companyName',
      'role',
      'country',
      'phone',
      'locale',
      'kycStatus',
      'createdAt',
      'updatedAt',
    ]),
    rows.map((row) => [
      row.id,
      row.company_name ?? '',
      row.role,
      row.country,
      row.phone ?? '',
      row.locale,
      row.kyc_status,
      row.created_at,
      row.updated_at,
    ]),
  );
}

export function buildListingsCsv(
  rows: Awaited<ReturnType<typeof getListingsExportRows>>,
  headers: Record<string, string>,
): string {
  return buildCsv(
    headerValues(headers, [
      'id',
      'sellerId',
      'mineral',
      'title',
      'grade',
      'purity',
      'quantity',
      'unit',
      'priceAmount',
      'priceCurrency',
      'priceType',
      'originProvince',
      'status',
      'createdAt',
      'updatedAt',
    ]),
    rows.map((row) => [
      row.id,
      row.seller_id,
      row.mineral,
      row.title,
      row.grade ?? '',
      String(row.purity ?? ''),
      String(row.quantity),
      row.unit,
      String(row.price_amount ?? ''),
      row.price_currency,
      row.price_type,
      row.origin_province ?? '',
      row.status,
      row.created_at,
      row.updated_at,
    ]),
  );
}

export function buildOrdersCsv(
  rows: Awaited<ReturnType<typeof getOrdersExportRows>>,
  headers: Record<string, string>,
): string {
  return buildCsv(
    headerValues(headers, [
      'id',
      'offerId',
      'listingId',
      'buyerId',
      'sellerId',
      'mineral',
      'listingTitle',
      'priceAmount',
      'quantity',
      'unit',
      'currency',
      'status',
      'disputeReason',
      'disputedAt',
      'createdAt',
      'updatedAt',
    ]),
    rows.map((row) => {
      const listing = Array.isArray(row.listing) ? row.listing[0] : row.listing;
      return [
        row.id,
        row.offer_id,
        row.listing_id,
        row.buyer_id,
        row.seller_id,
        listing?.mineral ?? '',
        listing?.title ?? '',
        String(row.price_amount),
        String(row.quantity),
        row.unit,
        row.currency,
        row.status,
        row.dispute_reason ?? '',
        row.disputed_at ?? '',
        row.created_at,
        row.updated_at,
      ];
    }),
  );
}

export function buildAuditLogCsv(
  rows: Awaited<ReturnType<typeof getAuditLogExportRows>>,
  headers: Record<string, string>,
): string {
  return buildCsv(
    headerValues(headers, ['id', 'actorId', 'action', 'entity', 'entityId', 'diff', 'createdAt']),
    rows.map((row) => [
      row.id,
      row.actor_id ?? '',
      row.action,
      row.entity,
      row.entity_id ?? '',
      row.diff ? JSON.stringify(row.diff) : '',
      row.created_at,
    ]),
  );
}

export type ExportType = 'users' | 'listings' | 'orders' | 'audit-log';

export async function generateExportCsv(
  type: ExportType,
  headers: Record<string, string>,
): Promise<string> {
  switch (type) {
    case 'users':
      return buildUsersCsv(await getUsersExportRows(), headers);
    case 'listings':
      return buildListingsCsv(await getListingsExportRows(), headers);
    case 'orders':
      return buildOrdersCsv(await getOrdersExportRows(), headers);
    case 'audit-log':
      return buildAuditLogCsv(await getAuditLogExportRows(), headers);
    default: {
      const _exhaustive: never = type;
      throw new Error(`Unknown export type: ${_exhaustive}`);
    }
  }
}
