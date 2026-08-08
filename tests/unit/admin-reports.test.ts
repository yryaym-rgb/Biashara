import { describe, it, expect } from 'vitest';
import {
  aggregateDisputeRateByPeriod,
  aggregateMineralDistribution,
  aggregateStatusFunnel,
  aggregateVolumeByPeriod,
  computeDisputeRate,
} from '@/lib/admin/reports.logic';

describe('admin reports logic', () => {
  it('computes dispute rate honestly with zero total', () => {
    expect(computeDisputeRate(0, 0)).toBe(0);
    expect(computeDisputeRate(2, 10)).toBe(0.2);
  });

  it('aggregates transaction volume by period', () => {
    const points = aggregateVolumeByPeriod(
      [
        { created_at: '2026-01-01T10:00:00Z', price_amount: 100, quantity: 2 },
        { created_at: '2026-01-01T14:00:00Z', price_amount: 50, quantity: 1 },
        { created_at: '2026-01-02T10:00:00Z', price_amount: 200, quantity: 1 },
      ],
      'daily',
    );

    expect(points).toEqual([
      { period: '2026-01-01', volume: 250 },
      { period: '2026-01-02', volume: 200 },
    ]);
  });

  it('aggregates mineral distribution from real order data', () => {
    const segments = aggregateMineralDistribution([
      { listing: { mineral: 'cobalt' } },
      { listing: { mineral: 'cobalt' } },
      { listing: { mineral: 'copper' } },
    ]);

    expect(segments).toEqual([
      { mineral: 'cobalt', count: 2 },
      { mineral: 'copper', count: 1 },
    ]);
  });

  it('aggregates status funnel in defined order', () => {
    const funnel = aggregateStatusFunnel(
      [{ status: 'approved' }, { status: 'none' }, { status: 'approved' }],
      ['none', 'pending', 'approved', 'rejected'],
    );

    expect(funnel).toEqual([
      { status: 'none', count: 1 },
      { status: 'pending', count: 0 },
      { status: 'approved', count: 2 },
      { status: 'rejected', count: 0 },
    ]);
  });

  it('aggregates dispute rate by period', () => {
    const trend = aggregateDisputeRateByPeriod(
      [
        { created_at: '2026-01-01T10:00:00Z', status: 'disputed' },
        { created_at: '2026-01-01T14:00:00Z', status: 'delivered' },
        { created_at: '2026-01-02T10:00:00Z', status: 'delivered' },
      ],
      'daily',
    );

    expect(trend[0]?.rate).toBe(0.5);
    expect(trend[1]?.rate).toBe(0);
  });
});
