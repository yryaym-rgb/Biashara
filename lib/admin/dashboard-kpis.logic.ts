import { bucketDate, hasSufficientChartData, type VolumeGranularity } from '@/lib/admin/reports.logic';

export interface WeeklySnapshotPoint {
  period: string;
  value: number;
}

const SNAPSHOT_WEEKS = 12;

function weekEndFromPeriod(period: string): Date {
  const weekEnd = new Date(`${period}T00:00:00Z`);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
  weekEnd.setUTCHours(23, 59, 59, 999);
  return weekEnd;
}

function recentWeeklyPeriods(weeks: number): string[] {
  const periods = new Set<string>();
  const now = new Date();

  for (let offset = weeks - 1; offset >= 0; offset -= 1) {
    const date = new Date(now);
    date.setUTCDate(date.getUTCDate() - offset * 7);
    periods.add(bucketDate(date.toISOString(), 'weekly'));
  }

  return Array.from(periods).sort();
}

/**
 * True when the row matched `openStatus` at the end of the ISO week containing `period`.
 * Uses created_at / updated_at — no fabricated snapshots.
 */
export function wasStatusOpenAtWeekEnd(
  row: { created_at: string; updated_at: string; status: string },
  period: string,
  openStatus: string,
): boolean {
  const weekEnd = weekEndFromPeriod(period);
  const created = new Date(row.created_at);
  if (created > weekEnd) {
    return false;
  }
  if (row.status === openStatus) {
    return true;
  }
  return new Date(row.updated_at) > weekEnd;
}

export function buildWeeklyStatusSnapshots(
  rows: Array<{ created_at: string; updated_at: string; status: string }>,
  openStatus: string,
  weeks = SNAPSHOT_WEEKS,
): WeeklySnapshotPoint[] {
  return recentWeeklyPeriods(weeks).map((period) => ({
    period,
    value: rows.filter((row) => wasStatusOpenAtWeekEnd(row, period, openStatus)).length,
  }));
}

export function buildWeeklyCumulativeSnapshots(
  rows: Array<{ created_at: string }>,
  weeks = SNAPSHOT_WEEKS,
): WeeklySnapshotPoint[] {
  return recentWeeklyPeriods(weeks).map((period) => {
    const weekEnd = weekEndFromPeriod(period);
    const value = rows.filter((row) => new Date(row.created_at) <= weekEnd).length;
    return { period, value };
  });
}

export function aggregateCountByPeriod(
  rows: Array<{ created_at: string }>,
  granularity: VolumeGranularity,
): WeeklySnapshotPoint[] {
  const byPeriod = new Map<string, number>();

  for (const row of rows) {
    const period = bucketDate(row.created_at, granularity);
    byPeriod.set(period, (byPeriod.get(period) ?? 0) + 1);
  }

  return Array.from(byPeriod.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, value]) => ({ period, value }));
}

/**
 * Period-over-period % change from the last two snapshot points.
 * Returns null when comparison is not meaningful (missing data or zero baseline).
 */
export function computeSnapshotTrendPercent(points: WeeklySnapshotPoint[]): number | null {
  if (points.length < 2) {
    return null;
  }

  const sorted = [...points].sort((a, b) => a.period.localeCompare(b.period));
  const previous = sorted[sorted.length - 2]?.value;
  const current = sorted[sorted.length - 1]?.value;

  if (previous === undefined || current === undefined) {
    return null;
  }

  if (previous === 0) {
    return null;
  }

  return ((current - previous) / previous) * 100;
}

export function hasSparklineData(points: WeeklySnapshotPoint[]): boolean {
  return hasSufficientChartData(points);
}
