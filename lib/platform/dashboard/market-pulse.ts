import type { MineralId } from '@/lib/constants/minerals';

/** Minerals with real spot prices shown in the dashboard market pulse widget. */
export const DASHBOARD_MARKET_PULSE_MINERALS: MineralId[] = [
  'gold',
  'copper',
  'cobalt',
  'lithium',
];

export function isMarketPulsePriceAvailable(price: number | null | undefined): boolean {
  return price !== null && price !== undefined;
}
