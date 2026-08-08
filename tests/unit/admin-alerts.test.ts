import { describe, it, expect } from 'vitest';
import {
  buildAdminAlerts,
  computeDisputeRateForUser,
  DISPUTE_RATE_THRESHOLD,
  isHighDisputeRateUser,
  isOlderThanHours,
  MIN_ORDERS_FOR_DISPUTE_RATE,
  PENDING_KYC_AGE_HOURS,
  PENDING_LISTING_AGE_HOURS,
} from '@/lib/admin/alerts.logic';

describe('admin alert thresholds', () => {
  it('flags listings older than 48 hours', () => {
    const now = new Date('2026-01-10T12:00:00Z');
    const old = '2026-01-07T10:00:00Z';
    const recent = '2026-01-09T14:00:00Z';

    expect(isOlderThanHours(old, PENDING_LISTING_AGE_HOURS, now)).toBe(true);
    expect(isOlderThanHours(recent, PENDING_LISTING_AGE_HOURS, now)).toBe(false);
  });

  it('flags KYC documents older than 48 hours', () => {
    const now = new Date('2026-01-10T12:00:00Z');
    const old = '2026-01-07T10:00:00Z';

    expect(isOlderThanHours(old, PENDING_KYC_AGE_HOURS, now)).toBe(true);
  });

  it('flags high dispute rate users with transparent formula', () => {
    expect(isHighDisputeRateUser(1, 1)).toBe(false);
    expect(isHighDisputeRateUser(1, 2)).toBe(true);
    expect(computeDisputeRateForUser(1, 4)).toBe(0.25);
    expect(isHighDisputeRateUser(1, 4)).toBe(true);
    expect(MIN_ORDERS_FOR_DISPUTE_RATE).toBe(2);
    expect(DISPUTE_RATE_THRESHOLD).toBe(0.25);
  });
});

describe('buildAdminAlerts', () => {
  it('returns empty list when nothing needs attention', () => {
    expect(
      buildAdminAlerts({
        agingListings: [],
        agingKycDocs: [],
        unresolvedDisputes: [],
        highDisputeRateUsers: [],
        listingModerationPath: (id) => `/listings/${id}`,
        kycReviewPath: '/kyc',
        orderPath: (id) => `/orders/${id}`,
        userPath: (id) => `/users/${id}`,
      }),
    ).toEqual([]);
  });

  it('prioritizes unresolved disputes above aging listings', () => {
    const items = buildAdminAlerts({
      agingListings: [{ id: 'l1', title: 'Cobalt lot', createdAt: '2026-01-01' }],
      agingKycDocs: [],
      unresolvedDisputes: [{ id: 'o1', listingTitle: 'Copper', createdAt: '2026-01-05' }],
      highDisputeRateUsers: [],
      listingModerationPath: (id) => `/listings/${id}`,
      kycReviewPath: '/kyc',
      orderPath: (id) => `/orders/${id}`,
      userPath: (id) => `/users/${id}`,
    });

    expect(items).toHaveLength(2);
    expect(items[0]?.type).toBe('unresolved_dispute');
    expect(items[1]?.type).toBe('aging_listing');
  });
});
