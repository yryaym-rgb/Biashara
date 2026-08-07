import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Database } from '@/types/database.types';

async function fetchUserEmail(userId: string): Promise<string | null> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.getUserById(userId);
    if (error || !data.user) {
      return null;
    }
    return data.user.email ?? null;
  } catch {
    return null;
  }
}

type KycDocumentStatus = Database['public']['Enums']['kyc_document_status'];
type ListingStatus = Database['public']['Enums']['listing_status'];
type UserRole = Database['public']['Enums']['user_role'];
type KycStatus = Database['public']['Enums']['kyc_status'];

export interface DashboardStats {
  pendingKycDocuments: number;
  pendingListings: number;
  verifiedUsers: number;
  activeListings: number;
  pendingUsers: number;
}

export interface AuditActivityRow {
  id: string;
  action: string;
  entity: string;
  entity_id: string | null;
  created_at: string;
  actor_name: string | null;
}

export interface AdminUserRow {
  id: string;
  company_name: string | null;
  role: UserRole;
  kyc_status: KycStatus;
  created_at: string;
  listings_count: number;
  orders_count: number;
}

export interface AdminUserDetail {
  profile: Database['public']['Tables']['profiles']['Row'];
  email: string | null;
  kyc_documents: Database['public']['Tables']['kyc_documents']['Row'][];
  listings: Database['public']['Tables']['listings']['Row'][];
  orders: Database['public']['Tables']['orders']['Row'][];
}

export interface KycReviewRow {
  id: string;
  user_id: string;
  type: Database['public']['Enums']['kyc_document_type'];
  status: KycDocumentStatus;
  created_at: string;
  rejection_reason: string | null;
  company_name: string | null;
  storage_path: string;
}

export interface ListingModerationRow {
  id: string;
  mineral: Database['public']['Enums']['mineral_type'];
  title: string;
  quantity: number;
  unit: Database['public']['Enums']['quantity_unit'];
  price_amount: number | null;
  price_currency: string;
  status: ListingStatus;
  created_at: string;
  rejection_reason: string | null;
  seller: {
    company_name: string | null;
    kyc_status: KycStatus;
  } | null;
  listing_photos: Array<{ storage_path: string; sort_order: number }>;
}

export interface AuditLogRow {
  id: string;
  action: string;
  entity: string;
  entity_id: string | null;
  diff: Database['public']['Tables']['audit_log']['Row']['diff'];
  created_at: string;
  actor_name: string | null;
}

const USERS_PAGE_SIZE = 20;
const AUDIT_PAGE_SIZE = 30;

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  const [
    pendingKycRes,
    pendingListingsRes,
    verifiedUsersRes,
    activeListingsRes,
    pendingUsersRes,
  ] = await Promise.all([
    supabase
      .from('kyc_documents')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending_review'),
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('kyc_status', 'approved'),
    supabase
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active'),
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('kyc_status', 'pending'),
  ]);

  return {
    pendingKycDocuments: pendingKycRes.count ?? 0,
    pendingListings: pendingListingsRes.count ?? 0,
    verifiedUsers: verifiedUsersRes.count ?? 0,
    activeListings: activeListingsRes.count ?? 0,
    pendingUsers: pendingUsersRes.count ?? 0,
  };
}

export async function getRecentAuditActivity(limit = 10): Promise<AuditActivityRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('audit_log')
    .select(
      `
        id,
        action,
        entity,
        entity_id,
        created_at,
        actor:profiles!audit_log_actor_id_fkey(company_name)
      `,
    )
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    action: row.action,
    entity: row.entity,
    entity_id: row.entity_id,
    created_at: row.created_at,
    actor_name: (row.actor as { company_name: string | null } | null)?.company_name ?? null,
  }));
}

export interface GetUsersParams {
  page?: number;
  q?: string;
  role?: UserRole;
  kycStatus?: KycStatus;
}

export async function getAdminUsers(params: GetUsersParams) {
  const supabase = await createClient();
  const page = Math.max(1, params.page ?? 1);
  const from = (page - 1) * USERS_PAGE_SIZE;
  const to = from + USERS_PAGE_SIZE - 1;

  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (params.role) {
    query = query.eq('role', params.role);
  }

  if (params.kycStatus) {
    query = query.eq('kyc_status', params.kycStatus);
  }

  if (params.q?.trim()) {
    query = query.ilike('company_name', `%${params.q.trim()}%`);
  }

  const { data: profiles, error, count } = await query.range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const rows: AdminUserRow[] = [];

  for (const profile of profiles ?? []) {
    const [listingsRes, buyerOrdersRes, sellerOrdersRes] = await Promise.all([
      supabase
        .from('listings')
        .select('id', { count: 'exact', head: true })
        .eq('seller_id', profile.id),
      supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('buyer_id', profile.id),
      supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('seller_id', profile.id),
    ]);

    rows.push({
      id: profile.id,
      company_name: profile.company_name,
      role: profile.role,
      kyc_status: profile.kyc_status,
      created_at: profile.created_at,
      listings_count: listingsRes.count ?? 0,
      orders_count: (buyerOrdersRes.count ?? 0) + (sellerOrdersRes.count ?? 0),
    });
  }

  return {
    users: rows,
    total: count ?? 0,
    page,
    pageSize: USERS_PAGE_SIZE,
  };
}

export async function getAdminUserDetail(userId: string): Promise<AdminUserDetail | null> {
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!profile) {
    return null;
  }

  const [kycRes, listingsRes, buyerOrdersRes, sellerOrdersRes, emailRes] = await Promise.all([
    supabase
      .from('kyc_documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    supabase
      .from('listings')
      .select('*')
      .eq('seller_id', userId)
      .order('created_at', { ascending: false }),
    supabase
      .from('orders')
      .select('*')
      .eq('buyer_id', userId)
      .order('created_at', { ascending: false }),
    supabase
      .from('orders')
      .select('*')
      .eq('seller_id', userId)
      .order('created_at', { ascending: false }),
    fetchUserEmail(userId),
  ]);

  const orders = [
    ...(buyerOrdersRes.data ?? []),
    ...(sellerOrdersRes.data ?? []),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return {
    profile,
    email: emailRes,
    kyc_documents: kycRes.data ?? [],
    listings: listingsRes.data ?? [],
    orders,
  };
}

export async function getKycSignedUrl(storagePath: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from('kyc-docs')
    .createSignedUrl(storagePath, 300);

  if (error || !data?.signedUrl) {
    return null;
  }

  return data.signedUrl;
}

export async function getKycDocumentsForReview(
  status: KycDocumentStatus,
): Promise<KycReviewRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('kyc_documents')
    .select(
      `
        id,
        user_id,
        type,
        status,
        created_at,
        rejection_reason,
        storage_path,
        applicant:profiles!kyc_documents_user_id_fkey(company_name)
      `,
    )
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    user_id: row.user_id,
    type: row.type,
    status: row.status,
    created_at: row.created_at,
    rejection_reason: row.rejection_reason,
    storage_path: row.storage_path,
    company_name: (row.applicant as { company_name: string | null } | null)?.company_name ?? null,
  }));
}

export async function getListingsForModeration(
  status: ListingStatus,
): Promise<ListingModerationRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('listings')
    .select(
      `
        id,
        mineral,
        title,
        quantity,
        unit,
        price_amount,
        price_currency,
        status,
        created_at,
        rejection_reason,
        seller:profiles!listings_seller_id_fkey(company_name, kyc_status),
        listing_photos(storage_path, sort_order)
      `,
    )
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ListingModerationRow[];
}

export interface GetAuditLogParams {
  page?: number;
  entity?: string;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
}

export async function getAuditLog(params: GetAuditLogParams) {
  const supabase = await createClient();
  const page = Math.max(1, params.page ?? 1);
  const from = (page - 1) * AUDIT_PAGE_SIZE;
  const to = from + AUDIT_PAGE_SIZE - 1;

  let query = supabase
    .from('audit_log')
    .select(
      `
        id,
        action,
        entity,
        entity_id,
        diff,
        created_at,
        actor:profiles!audit_log_actor_id_fkey(company_name)
      `,
      { count: 'exact' },
    )
    .order('created_at', { ascending: false });

  if (params.entity) {
    query = query.eq('entity', params.entity);
  }

  if (params.action) {
    query = query.eq('action', params.action);
  }

  if (params.dateFrom) {
    query = query.gte('created_at', params.dateFrom);
  }

  if (params.dateTo) {
    query = query.lte('created_at', `${params.dateTo}T23:59:59.999Z`);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const rows: AuditLogRow[] = (data ?? []).map((row) => ({
    id: row.id,
    action: row.action,
    entity: row.entity,
    entity_id: row.entity_id,
    diff: row.diff,
    created_at: row.created_at,
    actor_name: (row.actor as { company_name: string | null } | null)?.company_name ?? null,
  }));

  return {
    entries: rows,
    total: count ?? 0,
    page,
    pageSize: AUDIT_PAGE_SIZE,
  };
}

export async function getUserKycDocuments(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('kyc_documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getUserListings(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('seller_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export { USERS_PAGE_SIZE, AUDIT_PAGE_SIZE };
