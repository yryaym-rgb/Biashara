import type { MineralId } from '@/lib/constants/minerals';
import { MINERALS } from '@/lib/constants/minerals';

export interface PriceSparklinePoint {
  date: string;
  price: number;
}

const MIN_SPARKLINE_POINTS = 2;

export function computeWeeklyPercentChange(
  history: PriceSparklinePoint[],
): number | null {
  if (history.length < MIN_SPARKLINE_POINTS) {
    return null;
  }

  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
  const oldest = sorted[0]!;
  const newest = sorted[sorted.length - 1]!;

  if (oldest.price <= 0) {
    return null;
  }

  const pct = ((newest.price - oldest.price) / oldest.price) * 100;
  return Math.round(pct * 100) / 100;
}

export function pickPrimaryMineral(
  minerals: MineralId[],
  orderCounts: Map<MineralId, number>,
): MineralId | null {
  if (minerals.length === 0) {
    return null;
  }

  const spotMinerals = minerals.filter((id) => {
    const mineral = MINERALS.find((m) => m.id === id);
    return mineral?.hasSpotPrice === true;
  });

  if (spotMinerals.length === 0) {
    return null;
  }

  return spotMinerals.sort((a, b) => {
    const countDiff = (orderCounts.get(b) ?? 0) - (orderCounts.get(a) ?? 0);
    if (countDiff !== 0) {
      return countDiff;
    }
    return a.localeCompare(b);
  })[0] ?? null;
}
