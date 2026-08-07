import type { MineralId } from '@/lib/constants/minerals';
import type { MarketplaceSearchParams } from '@/lib/marketplace/params';

export function buildMarketplaceQueryString(
  params: Partial<MarketplaceSearchParams>,
  overrides?: Partial<MarketplaceSearchParams>,
): string {
  const merged = { ...params, ...overrides };
  const search = new URLSearchParams();

  if (merged.q?.trim()) {
    search.set('q', merged.q.trim());
  }
  if (merged.mineral) {
    search.set('mineral', merged.mineral);
  }
  if (merged.province) {
    search.set('province', merged.province);
  }
  if (merged.minPrice !== undefined) {
    search.set('minPrice', String(merged.minPrice));
  }
  if (merged.maxPrice !== undefined) {
    search.set('maxPrice', String(merged.maxPrice));
  }
  if (merged.page && merged.page > 1) {
    search.set('page', String(merged.page));
  }

  const query = search.toString();
  return query ? `?${query}` : '';
}

export function toBaseSearchParams(params: MarketplaceSearchParams): Record<string, string> {
  const record: Record<string, string> = {};
  if (params.q?.trim()) record.q = params.q.trim();
  if (params.mineral) record.mineral = params.mineral;
  if (params.province) record.province = params.province;
  if (params.minPrice !== undefined) record.minPrice = String(params.minPrice);
  if (params.maxPrice !== undefined) record.maxPrice = String(params.maxPrice);
  return record;
}

export function parseMineralParam(value?: string): MineralId | undefined {
  if (!value) return undefined;
  const minerals: MineralId[] = ['cobalt', 'copper', 'gold', 'coltan', 'lithium', 'diamond'];
  return minerals.includes(value as MineralId) ? (value as MineralId) : undefined;
}
