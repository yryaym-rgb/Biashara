import 'server-only';

import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database.types';
import type { DashboardActivityCounts } from '@/lib/platform/dashboard';

const IN_PROGRESS_ORDER_STATUSES: Database['public']['Enums']['order_status'][] = [
  'confirmed',
  'processing',
  'in_transit',
];

type OfferStatus = Database['public']['Enums']['offer_status'];
type OrderStatus = Database['public']['Enums']['order_status'];
type ListingStatus = Database['public']['Enums']['listing_status'];

export interface SellerDashboardStats {
  activeListings: number;
  pendingOffersReceived: number;
  ordersInProgress: number;
  monthlyRevenue: number;
}

export interface BuyerDashboardStats {
  pendingOffersSent: number;
  activePurchaseRequests: number;
  ordersInProgress: number;
}

export interface DashboardActivityEvent {
  id: string;
  kind: 'offer' | 'order' | 'listing';
  entityId: string;
  listingTitle: string;
  status: string;
  timestamp: string;
}

function startOfCurrentMonth(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

export async function getSellerDashboardStats(userId: string): Promise<SellerDashboardStats> {
  const supabase = await createClient();
  const monthStart = startOfCurrentMonth();

  const [activeListingsRes, pendingOffersRes, ordersInProgressRes, monthlyOrdersRes] =
    await Promise.all([
      supabase
        .from('listings')
        .select('id', { count: 'exact', head: true })
        .eq('seller_id', userId)
        .eq('status', 'active'),
      supabase
        .from('offers')
        .select('id, listings!inner(seller_id)', { count: 'exact', head: true })
        .eq('listings.seller_id', userId)
        .eq('status', 'pending'),
      supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('seller_id', userId)
        .in('status', IN_PROGRESS_ORDER_STATUSES),
      supabase
        .from('orders')
        .select('price_amount, quantity')
        .eq('seller_id', userId)
        .gte('created_at', monthStart)
        .not('status', 'in', '(cancelled,disputed)'),
    ]);

  if (activeListingsRes.error) {
    throw new Error(activeListingsRes.error.message);
  }
  if (pendingOffersRes.error) {
    throw new Error(pendingOffersRes.error.message);
  }
  if (ordersInProgressRes.error) {
    throw new Error(ordersInProgressRes.error.message);
  }
  if (monthlyOrdersRes.error) {
    throw new Error(monthlyOrdersRes.error.message);
  }

  const monthlyRevenue = (monthlyOrdersRes.data ?? []).reduce(
    (sum, order) => sum + Number(order.price_amount) * Number(order.quantity),
    0,
  );

  return {
    activeListings: activeListingsRes.count ?? 0,
    pendingOffersReceived: pendingOffersRes.count ?? 0,
    ordersInProgress: ordersInProgressRes.count ?? 0,
    monthlyRevenue,
  };
}

export async function getBuyerDashboardStats(userId: string): Promise<BuyerDashboardStats> {
  const supabase = await createClient();

  const [pendingOffersRes, activeRfpsRes, ordersInProgressRes] = await Promise.all([
    supabase
      .from('offers')
      .select('id', { count: 'exact', head: true })
      .eq('buyer_id', userId)
      .eq('status', 'pending'),
    supabase
      .from('rfps')
      .select('id', { count: 'exact', head: true })
      .eq('buyer_id', userId)
      .eq('status', 'open'),
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('buyer_id', userId)
      .in('status', IN_PROGRESS_ORDER_STATUSES),
  ]);

  if (pendingOffersRes.error) {
    throw new Error(pendingOffersRes.error.message);
  }
  if (activeRfpsRes.error) {
    throw new Error(activeRfpsRes.error.message);
  }
  if (ordersInProgressRes.error) {
    throw new Error(ordersInProgressRes.error.message);
  }

  return {
    pendingOffersSent: pendingOffersRes.count ?? 0,
    activePurchaseRequests: activeRfpsRes.count ?? 0,
    ordersInProgress: ordersInProgressRes.count ?? 0,
  };
}

export async function getDashboardActivityCounts(userId: string): Promise<DashboardActivityCounts> {
  const supabase = await createClient();

  const [listingsRes, buyerOffersRes, sellerOffersRes, buyerOrdersRes, sellerOrdersRes, conversationsRes] =
    await Promise.all([
      supabase
        .from('listings')
        .select('id', { count: 'exact', head: true })
        .eq('seller_id', userId),
      supabase
        .from('offers')
        .select('id', { count: 'exact', head: true })
        .eq('buyer_id', userId),
      supabase
        .from('offers')
        .select('id, listings!inner(seller_id)', { count: 'exact', head: true })
        .eq('listings.seller_id', userId),
      supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('buyer_id', userId),
      supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('seller_id', userId),
      supabase
        .from('conversations')
        .select('id', { count: 'exact', head: true })
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`),
    ]);

  const errors = [
    listingsRes.error,
    buyerOffersRes.error,
    sellerOffersRes.error,
    buyerOrdersRes.error,
    sellerOrdersRes.error,
    conversationsRes.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    throw new Error(errors[0]!.message);
  }

  return {
    listings: listingsRes.count ?? 0,
    offers: (buyerOffersRes.count ?? 0) + (sellerOffersRes.count ?? 0),
    orders: (buyerOrdersRes.count ?? 0) + (sellerOrdersRes.count ?? 0),
    conversations: conversationsRes.count ?? 0,
  };
}

interface ActivityCandidate {
  id: string;
  kind: 'offer' | 'order' | 'listing';
  entityId: string;
  listingTitle: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

function pickActivityTimestamp(candidate: ActivityCandidate): string {
  return candidate.updatedAt > candidate.createdAt ? candidate.updatedAt : candidate.createdAt;
}

export async function getDashboardRecentActivity(
  userId: string,
  limit = 10,
): Promise<DashboardActivityEvent[]> {
  const supabase = await createClient();

  const [buyerOffersRes, sellerOffersRes, buyerOrdersRes, sellerOrdersRes, listingsRes] =
    await Promise.all([
      supabase
        .from('offers')
        .select(
          `
            id,
            status,
            created_at,
            updated_at,
            listing:listings(title)
          `,
        )
        .eq('buyer_id', userId)
        .order('updated_at', { ascending: false })
        .limit(limit),
      supabase
        .from('offers')
        .select(
          `
            id,
            status,
            created_at,
            updated_at,
            listing:listings!inner(title, seller_id)
          `,
        )
        .eq('listing.seller_id', userId)
        .order('updated_at', { ascending: false })
        .limit(limit),
      supabase
        .from('orders')
        .select(
          `
            id,
            status,
            created_at,
            updated_at,
            listing:listings(title)
          `,
        )
        .eq('buyer_id', userId)
        .order('updated_at', { ascending: false })
        .limit(limit),
      supabase
        .from('orders')
        .select(
          `
            id,
            status,
            created_at,
            updated_at,
            listing:listings(title)
          `,
        )
        .eq('seller_id', userId)
        .order('updated_at', { ascending: false })
        .limit(limit),
      supabase
        .from('listings')
        .select('id, title, status, created_at, updated_at')
        .eq('seller_id', userId)
        .neq('status', 'draft')
        .order('updated_at', { ascending: false })
        .limit(limit),
    ]);

  const errors = [
    buyerOffersRes.error,
    sellerOffersRes.error,
    buyerOrdersRes.error,
    sellerOrdersRes.error,
    listingsRes.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    throw new Error(errors[0]!.message);
  }

  const candidates: ActivityCandidate[] = [];

  const pushOffer = (row: {
    id: string;
    status: OfferStatus;
    created_at: string;
    updated_at: string;
    listing: { title: string } | { title: string }[] | null;
  }) => {
    const listing = Array.isArray(row.listing) ? row.listing[0] : row.listing;
    candidates.push({
      id: `offer-${row.id}`,
      kind: 'offer',
      entityId: row.id,
      listingTitle: listing?.title ?? '',
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  };

  const pushOrder = (row: {
    id: string;
    status: OrderStatus;
    created_at: string;
    updated_at: string;
    listing: { title: string } | { title: string }[] | null;
  }) => {
    const listing = Array.isArray(row.listing) ? row.listing[0] : row.listing;
    candidates.push({
      id: `order-${row.id}`,
      kind: 'order',
      entityId: row.id,
      listingTitle: listing?.title ?? '',
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  };

  for (const row of buyerOffersRes.data ?? []) {
    pushOffer(row);
  }
  for (const row of sellerOffersRes.data ?? []) {
    pushOffer(row);
  }
  for (const row of buyerOrdersRes.data ?? []) {
    pushOrder(row);
  }
  for (const row of sellerOrdersRes.data ?? []) {
    pushOrder(row);
  }
  for (const row of listingsRes.data ?? []) {
    candidates.push({
      id: `listing-${row.id}`,
      kind: 'listing',
      entityId: row.id,
      listingTitle: row.title,
      status: row.status as ListingStatus,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  const deduped = new Map<string, ActivityCandidate>();
  for (const candidate of candidates) {
    const existing = deduped.get(candidate.id);
    if (!existing || pickActivityTimestamp(candidate) > pickActivityTimestamp(existing)) {
      deduped.set(candidate.id, candidate);
    }
  }

  return Array.from(deduped.values())
    .sort(
      (a, b) =>
        new Date(pickActivityTimestamp(b)).getTime() - new Date(pickActivityTimestamp(a)).getTime(),
    )
    .slice(0, limit)
    .map((candidate) => ({
      id: candidate.id,
      kind: candidate.kind,
      entityId: candidate.entityId,
      listingTitle: candidate.listingTitle,
      status: candidate.status,
      timestamp: pickActivityTimestamp(candidate),
    }));
}

export interface SalesVolumePoint {
  date: string;
  volume: number;
}

const SALES_CHART_WINDOW_DAYS = 30;

function salesChartCutoff(): string {
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - SALES_CHART_WINDOW_DAYS);
  return cutoff.toISOString();
}

export async function getSellerSalesVolumeByDay(
  sellerId: string,
): Promise<SalesVolumePoint[]> {
  const supabase = await createClient();
  const cutoff = salesChartCutoff();

  const { data, error } = await supabase
    .from('orders')
    .select('created_at, price_amount, quantity')
    .eq('seller_id', sellerId)
    .gte('created_at', cutoff)
    .not('status', 'in', '(cancelled,disputed)')
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const byDay = new Map<string, number>();

  for (const order of data ?? []) {
    const day = order.created_at.slice(0, 10);
    const amount = Number(order.price_amount) * Number(order.quantity);
    byDay.set(day, (byDay.get(day) ?? 0) + amount);
  }

  return Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, volume]) => ({ date, volume }));
}

export interface DashboardRecentRow {
  id: string;
  kind: 'order' | 'offer';
  mineral: string;
  listingTitle: string;
  counterpartName: string;
  amount: number;
  currency: string;
  unit: string;
  quantity: number;
  status: string;
  timestamp: string;
  orderId?: string;
}

export async function getDashboardRecentOrders(
  userId: string,
  limit = 8,
): Promise<DashboardRecentRow[]> {
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
          currency,
          created_at,
          buyer:profiles!orders_buyer_id_fkey(company_name),
          seller:profiles!orders_seller_id_fkey(company_name),
          listing:listings(title, mineral, unit)
        `,
      )
      .eq('buyer_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit),
    supabase
      .from('orders')
      .select(
        `
          id,
          status,
          price_amount,
          quantity,
          currency,
          created_at,
          buyer:profiles!orders_buyer_id_fkey(company_name),
          seller:profiles!orders_seller_id_fkey(company_name),
          listing:listings(title, mineral, unit)
        `,
      )
      .eq('seller_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit),
  ]);

  if (buyerOrdersRes.error) {
    throw new Error(buyerOrdersRes.error.message);
  }
  if (sellerOrdersRes.error) {
    throw new Error(sellerOrdersRes.error.message);
  }

  const orderRows: DashboardRecentRow[] = [];

  const pushOrder = (
    row: NonNullable<typeof buyerOrdersRes.data>[number],
    role: 'buyer' | 'seller',
  ) => {
    const listing = Array.isArray(row.listing) ? row.listing[0] : row.listing;
    const buyer = Array.isArray(row.buyer) ? row.buyer[0] : row.buyer;
    const seller = Array.isArray(row.seller) ? row.seller[0] : row.seller;
    const counterpart =
      role === 'buyer'
        ? seller?.company_name?.trim() || ''
        : buyer?.company_name?.trim() || '';

    orderRows.push({
      id: row.id,
      kind: 'order',
      mineral: listing?.mineral ?? '',
      listingTitle: listing?.title ?? '',
      counterpartName: counterpart,
      amount: Number(row.price_amount) * Number(row.quantity),
      currency: row.currency,
      unit: listing?.unit ?? 'MT',
      quantity: Number(row.quantity),
      status: row.status,
      timestamp: row.created_at,
      orderId: row.id,
    });
  };

  for (const row of buyerOrdersRes.data ?? []) {
    pushOrder(row, 'buyer');
  }
  for (const row of sellerOrdersRes.data ?? []) {
    pushOrder(row, 'seller');
  }

  const dedupedOrders = Array.from(
    new Map(orderRows.map((row) => [row.id, row])).values(),
  )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);

  if (dedupedOrders.length > 0) {
    return dedupedOrders;
  }

  const [buyerOffersRes, sellerOffersRes] = await Promise.all([
    supabase
      .from('offers')
      .select(
        `
          id,
          status,
          offered_price,
          quantity,
          created_at,
          listing:listings(title, mineral, unit, price_currency, seller:profiles!listings_seller_id_fkey(company_name))
        `,
      )
      .eq('buyer_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit),
    supabase
      .from('offers')
      .select(
        `
          id,
          status,
          offered_price,
          quantity,
          created_at,
          buyer:profiles!offers_buyer_id_fkey(company_name),
          listing:listings!inner(title, mineral, unit, price_currency, seller_id)
        `,
      )
      .eq('listing.seller_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit),
  ]);

  if (buyerOffersRes.error) {
    throw new Error(buyerOffersRes.error.message);
  }
  if (sellerOffersRes.error) {
    throw new Error(sellerOffersRes.error.message);
  }

  const offerRows: DashboardRecentRow[] = [];

  for (const row of buyerOffersRes.data ?? []) {
    const listing = Array.isArray(row.listing) ? row.listing[0] : row.listing;
    const seller = listing?.seller
      ? Array.isArray(listing.seller)
        ? listing.seller[0]
        : listing.seller
      : null;

    offerRows.push({
      id: row.id,
      kind: 'offer',
      mineral: listing?.mineral ?? '',
      listingTitle: listing?.title ?? '',
      counterpartName: seller?.company_name?.trim() || '',
      amount: Number(row.offered_price) * Number(row.quantity),
      currency: listing?.price_currency ?? 'USD',
      unit: listing?.unit ?? 'MT',
      quantity: Number(row.quantity),
      status: row.status,
      timestamp: row.created_at,
    });
  }

  for (const row of sellerOffersRes.data ?? []) {
    const listing = Array.isArray(row.listing) ? row.listing[0] : row.listing;
    const buyer = Array.isArray(row.buyer) ? row.buyer[0] : row.buyer;

    offerRows.push({
      id: row.id,
      kind: 'offer',
      mineral: listing?.mineral ?? '',
      listingTitle: listing?.title ?? '',
      counterpartName: buyer?.company_name?.trim() || '',
      amount: Number(row.offered_price) * Number(row.quantity),
      currency: listing?.price_currency ?? 'USD',
      unit: listing?.unit ?? 'MT',
      quantity: Number(row.quantity),
      status: row.status,
      timestamp: row.created_at,
    });
  }

  return Array.from(new Map(offerRows.map((row) => [row.id, row])).values())
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}
