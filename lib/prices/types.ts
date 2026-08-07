import type { MineralId } from '@/lib/constants/minerals';
import type { QuantityUnit } from '@/lib/constants/minerals';

export interface PriceEntry {
  mineral: MineralId;
  price: number | null;
  currency: string;
  unit: QuantityUnit;
  priceType: string;
  source: string;
  fetchedAt: string;
  isIndicative: boolean;
  change?: number | null;
}

export interface PricesResponse {
  minerals: PriceEntry[];
  cachedAt: string;
  fromCache: boolean;
  stale?: boolean;
}

export interface PriceHistoryPoint {
  date: string;
  price: number;
  currency: string;
}

export interface PriceHistoryResponse {
  mineral: MineralId;
  history: PriceHistoryPoint[];
}

export type PriceTimeframe = '1W' | '1M' | '3M' | '1Y' | 'ALL';

export const PRICE_TIMEFRAME_DAYS: Record<Exclude<PriceTimeframe, 'ALL'>, number> = {
  '1W': 7,
  '1M': 30,
  '3M': 90,
  '1Y': 365,
};
