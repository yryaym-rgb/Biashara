import type { Database } from '@/types/database.types';

export const ADMIN_LIVE_ACTIVITY_LIMIT = 8;
export const ADMIN_LIVE_ACTIVITY_LOOKBACK_DAYS = 30;

export type AdminLiveActivityKind =
  | 'account_verified'
  | 'kyc_submitted'
  | 'listing_published'
  | 'listing_submitted'
  | 'rfp_created'
  | 'offer_accepted'
  | 'order_disputed';

export type AdminLiveActivityDotColor = 'green' | 'blue' | 'gold' | 'red';

export type AdminLiveActivityRole = Database['public']['Enums']['user_role'];
export type AdminLiveActivityMineral = Database['public']['Enums']['mineral_type'];

export interface AdminLiveActivityEvent {
  id: string;
  kind: AdminLiveActivityKind;
  timestamp: string;
  dotColor: AdminLiveActivityDotColor;
  actorName: string | null;
  role?: AdminLiveActivityRole;
  mineral?: AdminLiveActivityMineral;
  province?: string;
  entityId: string;
}

export interface RawVerifiedProfileEvent {
  id: string;
  company_name: string | null;
  role: AdminLiveActivityRole;
  updated_at: string;
}

export interface RawKycSubmittedEvent {
  id: string;
  user_id: string;
  created_at: string;
  applicant: { company_name: string | null } | null;
}

export interface RawListingEvent {
  id: string;
  mineral: AdminLiveActivityMineral;
  origin_province: string;
  title: string;
  status: Database['public']['Enums']['listing_status'];
  created_at: string;
  updated_at: string;
  seller: { company_name: string | null } | null;
}

export interface RawRfpEvent {
  id: string;
  mineral: AdminLiveActivityMineral;
  created_at: string;
  buyer: { company_name: string | null } | null;
}

export interface RawOfferAcceptedEvent {
  id: string;
  updated_at: string;
  buyer: { company_name: string | null } | null;
  listing: { mineral: AdminLiveActivityMineral; title: string } | null;
}

export interface RawOrderDisputedEvent {
  id: string;
  disputed_at: string | null;
  created_at: string;
  listing: { title: string; mineral: AdminLiveActivityMineral } | null;
}

const DOT_COLORS: Record<AdminLiveActivityKind, AdminLiveActivityDotColor> = {
  account_verified: 'green',
  kyc_submitted: 'gold',
  listing_published: 'blue',
  listing_submitted: 'gold',
  rfp_created: 'blue',
  offer_accepted: 'blue',
  order_disputed: 'red',
};

function buildEventId(kind: AdminLiveActivityKind, id: string): string {
  return `${kind}:${id}`;
}

/**
 * Meaningful admin dashboard events (included):
 * - account_verified: profile KYC approved (cooperative/user verified)
 * - kyc_submitted: new pending KYC dossier (deduped per user)
 * - listing_submitted: listing entered moderation queue (pending_review)
 * - listing_published: listing approved and active on marketplace
 * - rfp_created: new purchase request posted
 * - offer_accepted: marketplace offer accepted
 * - order_disputed: order flagged as disputed (critical)
 *
 * Filtered out (audit-log noise / low-level):
 * - Raw audit_log insert/update/delete rows
 * - Per-document KYC approve/reject audit entries
 * - Offer pending/declined/countered/expired
 * - Order lifecycle updates except disputes
 * - Draft/paused/sold/rejected listing state changes
 * - Profile or listing field-level updates
 */
export function buildAdminLiveActivityFeed(input: {
  verifiedProfiles: RawVerifiedProfileEvent[];
  kycSubmitted: RawKycSubmittedEvent[];
  listings: RawListingEvent[];
  rfps: RawRfpEvent[];
  offersAccepted: RawOfferAcceptedEvent[];
  ordersDisputed: RawOrderDisputedEvent[];
  limit?: number;
}): AdminLiveActivityEvent[] {
  const limit = input.limit ?? ADMIN_LIVE_ACTIVITY_LIMIT;
  const events: AdminLiveActivityEvent[] = [];

  for (const profile of input.verifiedProfiles) {
    events.push({
      id: buildEventId('account_verified', profile.id),
      kind: 'account_verified',
      timestamp: profile.updated_at,
      dotColor: DOT_COLORS.account_verified,
      actorName: profile.company_name,
      role: profile.role,
      entityId: profile.id,
    });
  }

  const kycSeenUsers = new Set<string>();
  const sortedKyc = [...input.kycSubmitted].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  for (const doc of sortedKyc) {
    if (kycSeenUsers.has(doc.user_id)) {
      continue;
    }
    kycSeenUsers.add(doc.user_id);
    events.push({
      id: buildEventId('kyc_submitted', doc.id),
      kind: 'kyc_submitted',
      timestamp: doc.created_at,
      dotColor: DOT_COLORS.kyc_submitted,
      actorName: doc.applicant?.company_name ?? null,
      entityId: doc.id,
    });
  }

  for (const listing of input.listings) {
    const sellerName = listing.seller?.company_name ?? null;

    if (listing.status === 'pending_review') {
      events.push({
        id: buildEventId('listing_submitted', listing.id),
        kind: 'listing_submitted',
        timestamp: listing.created_at,
        dotColor: DOT_COLORS.listing_submitted,
        actorName: sellerName,
        mineral: listing.mineral,
        province: listing.origin_province,
        entityId: listing.id,
      });
    }

    if (listing.status === 'active') {
      events.push({
        id: buildEventId('listing_published', listing.id),
        kind: 'listing_published',
        timestamp: listing.updated_at,
        dotColor: DOT_COLORS.listing_published,
        actorName: sellerName,
        mineral: listing.mineral,
        province: listing.origin_province,
        entityId: listing.id,
      });
    }
  }

  for (const rfp of input.rfps) {
    events.push({
      id: buildEventId('rfp_created', rfp.id),
      kind: 'rfp_created',
      timestamp: rfp.created_at,
      dotColor: DOT_COLORS.rfp_created,
      actorName: rfp.buyer?.company_name ?? null,
      mineral: rfp.mineral,
      entityId: rfp.id,
    });
  }

  for (const offer of input.offersAccepted) {
    events.push({
      id: buildEventId('offer_accepted', offer.id),
      kind: 'offer_accepted',
      timestamp: offer.updated_at,
      dotColor: DOT_COLORS.offer_accepted,
      actorName: offer.buyer?.company_name ?? null,
      mineral: offer.listing?.mineral,
      entityId: offer.id,
    });
  }

  for (const order of input.ordersDisputed) {
    events.push({
      id: buildEventId('order_disputed', order.id),
      kind: 'order_disputed',
      timestamp: order.disputed_at ?? order.created_at,
      dotColor: DOT_COLORS.order_disputed,
      actorName: order.listing?.title ?? null,
      mineral: order.listing?.mineral,
      entityId: order.id,
    });
  }

  return events
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

export function adminLiveActivityLookbackCutoff(now = new Date()): string {
  const cutoff = new Date(now);
  cutoff.setUTCDate(cutoff.getUTCDate() - ADMIN_LIVE_ACTIVITY_LOOKBACK_DAYS);
  return cutoff.toISOString();
}
