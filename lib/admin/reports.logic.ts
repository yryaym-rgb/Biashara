export type VolumeGranularity = 'daily' | 'weekly';

export interface VolumePoint {
  period: string;
  volume: number;
}

export interface MineralSegment {
  mineral: string;
  count: number;
}

export interface UserGrowthPoint {
  period: string;
  newUsers: number;
  cumulativeUsers: number;
}

export interface FunnelSegment {
  status: string;
  count: number;
}

export interface DisputeRatePoint {
  period: string;
  rate: number;
  disputed: number;
  total: number;
}

/**
 * Dispute rate formula per period:
 *   rate = disputedOrders / totalOrders
 * Returns 0 when totalOrders is 0 (no fabricated rate).
 */
export function computeDisputeRate(disputed: number, total: number): number {
  if (total === 0) {
    return 0;
  }
  return disputed / total;
}

export function bucketDate(isoDate: string, granularity: VolumeGranularity): string {
  const date = new Date(isoDate);
  if (granularity === 'daily') {
    return date.toISOString().slice(0, 10);
  }
  const day = date.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setUTCDate(date.getUTCDate() + diff);
  return monday.toISOString().slice(0, 10);
}

export function aggregateVolumeByPeriod(
  orders: Array<{ created_at: string; price_amount: number; quantity: number }>,
  granularity: VolumeGranularity,
): VolumePoint[] {
  const byPeriod = new Map<string, number>();

  for (const order of orders) {
    const period = bucketDate(order.created_at, granularity);
    const amount = Number(order.price_amount) * Number(order.quantity);
    byPeriod.set(period, (byPeriod.get(period) ?? 0) + amount);
  }

  return Array.from(byPeriod.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, volume]) => ({ period, volume }));
}

export function aggregateMineralDistribution(
  orders: Array<{ listing: { mineral: string } | null }>,
): MineralSegment[] {
  const counts = new Map<string, number>();

  for (const order of orders) {
    const mineral = order.listing?.mineral;
    if (!mineral) {
      continue;
    }
    counts.set(mineral, (counts.get(mineral) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([mineral, count]) => ({ mineral, count }));
}

export function aggregateUserGrowth(
  profiles: Array<{ created_at: string }>,
  granularity: VolumeGranularity,
): UserGrowthPoint[] {
  const newByPeriod = new Map<string, number>();

  for (const profile of profiles) {
    const period = bucketDate(profile.created_at, granularity);
    newByPeriod.set(period, (newByPeriod.get(period) ?? 0) + 1);
  }

  const sortedPeriods = Array.from(newByPeriod.keys()).sort();
  let cumulative = 0;

  const profilesBeforeWindow = profiles.filter((p) => {
    const firstPeriod = sortedPeriods[0];
    if (!firstPeriod) {
      return false;
    }
    return bucketDate(p.created_at, granularity) < firstPeriod;
  }).length;

  cumulative = profilesBeforeWindow;

  return sortedPeriods.map((period) => {
    const newUsers = newByPeriod.get(period) ?? 0;
    cumulative += newUsers;
    return { period, newUsers, cumulativeUsers: cumulative };
  });
}

export function aggregateStatusFunnel(
  rows: Array<{ status: string }>,
  statusOrder: string[],
): FunnelSegment[] {
  const counts = new Map<string, number>();
  for (const status of statusOrder) {
    counts.set(status, 0);
  }

  for (const row of rows) {
    counts.set(row.status, (counts.get(row.status) ?? 0) + 1);
  }

  return statusOrder.map((status) => ({
    status,
    count: counts.get(status) ?? 0,
  }));
}

export function aggregateDisputeRateByPeriod(
  orders: Array<{ created_at: string; status: string }>,
  granularity: VolumeGranularity,
): DisputeRatePoint[] {
  const disputedByPeriod = new Map<string, number>();
  const totalByPeriod = new Map<string, number>();

  for (const order of orders) {
    const period = bucketDate(order.created_at, granularity);
    totalByPeriod.set(period, (totalByPeriod.get(period) ?? 0) + 1);
    if (order.status === 'disputed') {
      disputedByPeriod.set(period, (disputedByPeriod.get(period) ?? 0) + 1);
    }
  }

  const periods = Array.from(totalByPeriod.keys()).sort();

  return periods.map((period) => {
    const total = totalByPeriod.get(period) ?? 0;
    const disputed = disputedByPeriod.get(period) ?? 0;
    return {
      period,
      rate: computeDisputeRate(disputed, total),
      disputed,
      total,
    };
  });
}

export function hasSufficientChartData<T>(data: T[], minimum = 2): boolean {
  return data.length >= minimum;
}
