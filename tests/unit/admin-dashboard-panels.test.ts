import { describe, it, expect } from 'vitest';
import {
  buildAdminLiveActivityFeed,
  adminLiveActivityLookbackCutoff,
  ADMIN_LIVE_ACTIVITY_LIMIT,
} from '@/lib/admin/dashboard-activity.logic';
import {
  computeKycFunnelCounts,
  countNeedsReviewUsers,
} from '@/lib/admin/dashboard-kyc-intelligence.logic';

describe('buildAdminLiveActivityFeed', () => {
  it('merges meaningful events newest first and limits output', () => {
    const events = buildAdminLiveActivityFeed({
      verifiedProfiles: [
        {
          id: 'user-1',
          company_name: 'Coop Lualaba',
          role: 'cooperative',
          updated_at: '2026-08-10T10:00:00.000Z',
        },
      ],
      kycSubmitted: [
        {
          id: 'kyc-1',
          user_id: 'user-2',
          created_at: '2026-08-09T12:00:00.000Z',
          applicant: { company_name: 'Mine Katanga' },
        },
        {
          id: 'kyc-2',
          user_id: 'user-2',
          created_at: '2026-08-09T12:05:00.000Z',
          applicant: { company_name: 'Mine Katanga' },
        },
      ],
      listings: [
        {
          id: 'listing-1',
          mineral: 'cobalt',
          origin_province: 'Lualaba',
          title: 'Cobalt ore',
          status: 'pending_review',
          created_at: '2026-08-08T08:00:00.000Z',
          updated_at: '2026-08-08T08:00:00.000Z',
          seller: { company_name: 'Seller A' },
        },
        {
          id: 'listing-2',
          mineral: 'copper',
          origin_province: 'Haut-Katanga',
          title: 'Copper cathodes',
          status: 'active',
          created_at: '2026-08-07T08:00:00.000Z',
          updated_at: '2026-08-11T08:00:00.000Z',
          seller: { company_name: 'Seller B' },
        },
      ],
      rfps: [
        {
          id: 'rfp-1',
          mineral: 'gold',
          created_at: '2026-08-11T06:00:00.000Z',
          buyer: { company_name: 'Buyer X' },
        },
      ],
      offersAccepted: [
        {
          id: 'offer-1',
          updated_at: '2026-08-11T07:00:00.000Z',
          buyer: { company_name: 'Buyer Y' },
          listing: { mineral: 'lithium', title: 'Lithium' },
        },
      ],
      ordersDisputed: [
        {
          id: 'order-1',
          disputed_at: '2026-08-11T09:00:00.000Z',
          created_at: '2026-08-01T08:00:00.000Z',
          listing: { title: 'Disputed lot', mineral: 'coltan' },
        },
      ],
      limit: 8,
    });

    expect(events.map((event) => event.kind)).toEqual([
      'order_disputed',
      'listing_published',
      'offer_accepted',
      'rfp_created',
      'account_verified',
      'kyc_submitted',
      'listing_submitted',
    ]);
    expect(events.find((event) => event.kind === 'kyc_submitted')?.id).toBe('kyc_submitted:kyc-1');
    expect(events.every((event) => event.dotColor)).toBe(true);
  });

  it('dedupes kyc submissions per user', () => {
    const events = buildAdminLiveActivityFeed({
      verifiedProfiles: [],
      kycSubmitted: [
        {
          id: 'kyc-a',
          user_id: 'user-1',
          created_at: '2026-08-10T08:00:00.000Z',
          applicant: { company_name: 'A' },
        },
        {
          id: 'kyc-b',
          user_id: 'user-1',
          created_at: '2026-08-10T09:00:00.000Z',
          applicant: { company_name: 'A' },
        },
      ],
      listings: [],
      rfps: [],
      offersAccepted: [],
      ordersDisputed: [],
    });

    expect(events.filter((event) => event.kind === 'kyc_submitted')).toHaveLength(1);
  });
});

describe('adminLiveActivityLookbackCutoff', () => {
  it('uses a 30-day lookback window', () => {
    const now = new Date('2026-08-10T12:00:00.000Z');
    expect(adminLiveActivityLookbackCutoff(now)).toBe('2026-07-11T12:00:00.000Z');
    expect(ADMIN_LIVE_ACTIVITY_LIMIT).toBe(8);
  });
});

describe('computeKycFunnelCounts', () => {
  it('computes verified percentage from real document counts', () => {
    const funnel = computeKycFunnelCounts({
      pending: 3,
      approved: 7,
      rejected: 2,
      needsReview: 1,
    });

    expect(funnel).toEqual({
      pending: 3,
      needsReview: 1,
      verified: 7,
      rejected: 2,
      total: 12,
      verifiedPercent: 58,
    });
  });

  it('returns zero percent when no documents exist', () => {
    const funnel = computeKycFunnelCounts({
      pending: 0,
      approved: 0,
      rejected: 0,
      needsReview: 0,
    });

    expect(funnel.verifiedPercent).toBe(0);
    expect(funnel.total).toBe(0);
  });
});

describe('countNeedsReviewUsers', () => {
  it('counts users with both pending and rejected documents', () => {
    expect(
      countNeedsReviewUsers(
        ['user-1', 'user-2', 'user-3'],
        ['user-2', 'user-4'],
      ),
    ).toBe(1);
  });
});
