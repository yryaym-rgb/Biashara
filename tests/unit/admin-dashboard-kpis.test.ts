import { describe, it, expect } from 'vitest';
import {
  buildWeeklyCumulativeSnapshots,
  buildWeeklyStatusSnapshots,
  computeSnapshotTrendPercent,
  wasStatusOpenAtWeekEnd,
} from '@/lib/admin/dashboard-kpis.logic';

describe('admin dashboard KPI logic', () => {
  it('detects status open at week end using updated_at', () => {
    const row = {
      created_at: '2026-01-01T10:00:00Z',
      updated_at: '2026-01-15T10:00:00Z',
      status: 'sold',
    };

    expect(wasStatusOpenAtWeekEnd(row, '2026-01-06', 'active')).toBe(true);
    expect(wasStatusOpenAtWeekEnd(row, '2026-01-13', 'active')).toBe(false);
  });

  it('builds cumulative user snapshots', () => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setUTCDate(weekAgo.getUTCDate() - 10);
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setUTCDate(twoWeeksAgo.getUTCDate() - 17);

    const points = buildWeeklyCumulativeSnapshots(
      [{ created_at: twoWeeksAgo.toISOString() }, { created_at: weekAgo.toISOString() }],
      4,
    );

    expect(points.length).toBeGreaterThanOrEqual(2);
    const last = points[points.length - 1];
    expect(last?.value).toBe(2);
  });

  it('computes trend only with meaningful baseline', () => {
    expect(computeSnapshotTrendPercent([])).toBeNull();
    expect(
      computeSnapshotTrendPercent([
        { period: '2026-01-06', value: 0 },
        { period: '2026-01-13', value: 5 },
      ]),
    ).toBeNull();
    expect(
      computeSnapshotTrendPercent([
        { period: '2026-01-06', value: 4 },
        { period: '2026-01-13', value: 6 },
      ]),
    ).toBe(50);
  });

  it('builds weekly open-status snapshots from real timestamps', () => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setUTCDate(weekAgo.getUTCDate() - 10);
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setUTCDate(twoWeeksAgo.getUTCDate() - 17);

    const points = buildWeeklyStatusSnapshots(
      [
        {
          created_at: twoWeeksAgo.toISOString(),
          updated_at: twoWeeksAgo.toISOString(),
          status: 'open',
        },
        {
          created_at: weekAgo.toISOString(),
          updated_at: weekAgo.toISOString(),
          status: 'open',
        },
      ],
      'open',
      4,
    );

    expect(points.length).toBeGreaterThanOrEqual(2);
    const last = points[points.length - 1];
    expect(last?.value).toBe(2);
  });
});
