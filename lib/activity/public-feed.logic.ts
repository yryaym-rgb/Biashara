import type {
  PublicActivityFeedEntry,
  PublicActivityKind,
  PublicActivityRole,
} from '@/lib/activity/public-feed.types';

export const PUBLIC_ACTIVITY_FEED_LIMIT = 20;
export const PUBLIC_ACTIVITY_LOOKBACK_DAYS = 30;
export const PUBLIC_ACTIVITY_KYC_LOOKBACK_HOURS = 24;
export const PUBLIC_ACTIVITY_EMPTY_THRESHOLD = 3;

const FORBIDDEN_OUTPUT_KEYS = [
  'company_name',
  'companyName',
  'seller_id',
  'buyer_id',
  'price_amount',
  'priceAmount',
  'quantity',
  'offered_price',
  'offeredPrice',
  'title',
  'email',
  'phone',
] as const;

export interface RawListingEvent {
  id: string;
  mineral: PublicActivityFeedEntry['mineral'];
  origin_province: string;
  created_at: string;
}

export interface RawRfpEvent {
  id: string;
  mineral: PublicActivityFeedEntry['mineral'];
  created_at: string;
}

export interface RawOrderEvent {
  id: string;
  created_at: string;
  listing: { mineral: PublicActivityFeedEntry['mineral'] } | null;
}

export interface RawVerifiedAccountEvent {
  id: string;
  role: PublicActivityRole;
  province: string | null;
  updated_at: string;
}

function buildEventId(kind: PublicActivityKind, id: string): string {
  return `${kind}:${id}`;
}

export function buildPublicActivityFeed(input: {
  listings: RawListingEvent[];
  rfps: RawRfpEvent[];
  orders: RawOrderEvent[];
  verifiedAccounts: RawVerifiedAccountEvent[];
  limit?: number;
  emptyThreshold?: number;
}): { events: PublicActivityFeedEntry[]; isEmpty: boolean } {
  const limit = input.limit ?? PUBLIC_ACTIVITY_FEED_LIMIT;
  const emptyThreshold = input.emptyThreshold ?? PUBLIC_ACTIVITY_EMPTY_THRESHOLD;

  const events: PublicActivityFeedEntry[] = [];

  for (const listing of input.listings) {
    if (!listing.mineral) continue;
    events.push({
      id: buildEventId('listing_published', listing.id),
      kind: 'listing_published',
      timestamp: listing.created_at,
      mineral: listing.mineral,
      province: listing.origin_province,
    });
  }

  for (const rfp of input.rfps) {
    if (!rfp.mineral) continue;
    events.push({
      id: buildEventId('rfp_posted', rfp.id),
      kind: 'rfp_posted',
      timestamp: rfp.created_at,
      mineral: rfp.mineral,
    });
  }

  for (const order of input.orders) {
    const mineral = order.listing?.mineral;
    if (!mineral) continue;
    events.push({
      id: buildEventId('order_completed', order.id),
      kind: 'order_completed',
      timestamp: order.created_at,
      mineral,
    });
  }

  for (const account of input.verifiedAccounts) {
    if (!account.province) continue;
    events.push({
      id: buildEventId('account_verified', account.id),
      kind: 'account_verified',
      timestamp: account.updated_at,
      role: account.role,
      province: account.province,
    });
  }

  const sorted = events
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);

  return {
    events: sorted,
    isEmpty: sorted.length < emptyThreshold,
  };
}

export function assertPublicActivityFeedAnonymized(
  payload: unknown,
): asserts payload is PublicActivityFeedEntry[] | { events: PublicActivityFeedEntry[] } {
  const serialized = JSON.stringify(payload).toLowerCase();

  for (const key of FORBIDDEN_OUTPUT_KEYS) {
    if (serialized.includes(key.toLowerCase())) {
      throw new Error(`Public activity feed leaked forbidden field: ${key}`);
    }
  }

  const pricePattern = /"price[^"]*"\s*:\s*[0-9]/;
  if (pricePattern.test(serialized)) {
    throw new Error('Public activity feed leaked price data');
  }
}

export function activityLookbackCutoff(now = new Date()): string {
  const cutoff = new Date(now);
  cutoff.setUTCDate(cutoff.getUTCDate() - PUBLIC_ACTIVITY_LOOKBACK_DAYS);
  return cutoff.toISOString();
}

export function kycLookbackCutoff(now = new Date()): string {
  const cutoff = new Date(now);
  cutoff.setUTCHours(cutoff.getUTCHours() - PUBLIC_ACTIVITY_KYC_LOOKBACK_HOURS);
  return cutoff.toISOString();
}
