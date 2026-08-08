import { describe, it, expect } from 'vitest';
import {
  accountAgeDays,
  computeTrustScore,
  isKycApprovedForTrust,
} from '@/lib/platform/trust-score';

describe('trust score calculation', () => {
  it('returns zero for a brand-new unverified account', () => {
    const result = computeTrustScore({
      kycApproved: false,
      completedOrderCount: 0,
      disputedOrderCount: 0,
      accountAgeDays: 0,
    });

    expect(result.score).toBe(0);
    expect(result.signals).toHaveLength(4);
    expect(result.signals.find((s) => s.key === 'kycApproved')?.met).toBe(false);
  });

  it('awards KYC approval points', () => {
    const result = computeTrustScore({
      kycApproved: true,
      completedOrderCount: 0,
      disputedOrderCount: 0,
      accountAgeDays: 0,
    });

    expect(result.score).toBe(30);
    expect(result.signals.find((s) => s.key === 'kycApproved')?.met).toBe(true);
  });

  it('caps completed order contribution at 30 points', () => {
    const result = computeTrustScore({
      kycApproved: true,
      completedOrderCount: 10,
      disputedOrderCount: 0,
      accountAgeDays: 0,
    });

    expect(result.score).toBe(60);
  });

  it('penalises disputed orders', () => {
    const result = computeTrustScore({
      kycApproved: true,
      completedOrderCount: 5,
      disputedOrderCount: 2,
      accountAgeDays: 0,
    });

    expect(result.score).toBe(30);
  });

  it('clamps score between 0 and 100', () => {
    const high = computeTrustScore({
      kycApproved: true,
      completedOrderCount: 100,
      disputedOrderCount: 0,
      accountAgeDays: 365,
    });

    expect(high.score).toBeLessThanOrEqual(100);

    const low = computeTrustScore({
      kycApproved: false,
      completedOrderCount: 0,
      disputedOrderCount: 10,
      accountAgeDays: 0,
    });

    expect(low.score).toBe(0);
  });

  it('computes account age in days', () => {
    const created = new Date('2026-01-01T00:00:00Z');
    const now = new Date('2026-02-01T00:00:00Z');
    expect(accountAgeDays(created.toISOString(), now)).toBe(31);
  });

  it('detects approved KYC status', () => {
    expect(isKycApprovedForTrust('approved')).toBe(true);
    expect(isKycApprovedForTrust('pending')).toBe(false);
  });
});
