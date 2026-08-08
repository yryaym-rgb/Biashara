/**
 * Operational alert thresholds (transparent, threshold-based — not AI):
 *
 * PENDING_LISTING_AGE_HOURS = 48
 *   Listings with status 'pending_review' and created_at older than 48 hours.
 *
 * PENDING_KYC_AGE_HOURS = 48
 *   KYC documents with status 'pending' and created_at older than 48 hours.
 *
 * UNRESOLVED_DISPUTE:
 *   Orders with status 'disputed' (no separate disputes table).
 *
 * HIGH_DISPUTE_RATE_USERS (optional):
 *   disputeRate = disputedOrders / totalOrders (as buyer or seller)
 *   Flag when: totalOrders >= MIN_ORDERS_FOR_RATE (2) AND disputeRate >= DISPUTE_RATE_THRESHOLD (0.25)
 */
export const PENDING_LISTING_AGE_HOURS = 48;
export const PENDING_KYC_AGE_HOURS = 48;
export const MIN_ORDERS_FOR_DISPUTE_RATE = 2;
export const DISPUTE_RATE_THRESHOLD = 0.25;

export type AdminAlertType =
  | 'aging_listing'
  | 'aging_kyc'
  | 'unresolved_dispute'
  | 'high_dispute_rate_user';

export interface AdminAlertItem {
  id: string;
  type: AdminAlertType;
  title: string;
  subtitle: string;
  href: string;
  priority: number;
  createdAt: string;
}

const ALERT_PRIORITY: Record<AdminAlertType, number> = {
  unresolved_dispute: 1,
  aging_listing: 2,
  aging_kyc: 3,
  high_dispute_rate_user: 4,
};

export function computeDisputeRateForUser(disputed: number, total: number): number {
  if (total === 0) {
    return 0;
  }
  return disputed / total;
}

export function isHighDisputeRateUser(disputed: number, total: number): boolean {
  return total >= MIN_ORDERS_FOR_DISPUTE_RATE && computeDisputeRateForUser(disputed, total) >= DISPUTE_RATE_THRESHOLD;
}

export function isOlderThanHours(isoDate: string, hours: number, now = new Date()): boolean {
  const created = new Date(isoDate).getTime();
  const threshold = now.getTime() - hours * 60 * 60 * 1000;
  return created < threshold;
}

export function buildAdminAlerts(input: {
  agingListings: Array<{ id: string; title: string; createdAt: string }>;
  agingKycDocs: Array<{ id: string; companyName: string; type: string; createdAt: string }>;
  unresolvedDisputes: Array<{ id: string; listingTitle: string; createdAt: string }>;
  highDisputeRateUsers: Array<{ userId: string; companyName: string; disputeRate: number; createdAt: string }>;
  listingModerationPath: (id: string) => string;
  kycReviewPath: string;
  orderPath: (id: string) => string;
  userPath: (id: string) => string;
}): AdminAlertItem[] {
  const items: AdminAlertItem[] = [];

  for (const dispute of input.unresolvedDisputes) {
    items.push({
      id: `dispute-${dispute.id}`,
      type: 'unresolved_dispute',
      title: dispute.listingTitle,
      subtitle: dispute.id.slice(0, 8),
      href: input.orderPath(dispute.id),
      priority: ALERT_PRIORITY.unresolved_dispute,
      createdAt: dispute.createdAt,
    });
  }

  for (const listing of input.agingListings) {
    items.push({
      id: `listing-${listing.id}`,
      type: 'aging_listing',
      title: listing.title,
      subtitle: listing.createdAt,
      href: input.listingModerationPath(listing.id),
      priority: ALERT_PRIORITY.aging_listing,
      createdAt: listing.createdAt,
    });
  }

  for (const doc of input.agingKycDocs) {
    items.push({
      id: `kyc-${doc.id}`,
      type: 'aging_kyc',
      title: doc.companyName,
      subtitle: doc.type,
      href: input.kycReviewPath,
      priority: ALERT_PRIORITY.aging_kyc,
      createdAt: doc.createdAt,
    });
  }

  for (const user of input.highDisputeRateUsers) {
    items.push({
      id: `user-dispute-${user.userId}`,
      type: 'high_dispute_rate_user',
      title: user.companyName,
      subtitle: String(Math.round(user.disputeRate * 100)),
      href: input.userPath(user.userId),
      priority: ALERT_PRIORITY.high_dispute_rate_user,
      createdAt: user.createdAt,
    });
  }

  return items.sort((a, b) => a.priority - b.priority || b.createdAt.localeCompare(a.createdAt));
}
