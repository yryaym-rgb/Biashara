import type { MineralSearchCount } from '@/lib/marketplace/mineral-search.logic';
import type { MineralId } from '@/lib/constants/minerals';

export interface MineralSearchApiResponse {
  suggestions: MineralSearchCount[];
}

export async function fetchMineralSearchCounts(
  mineralIds: MineralId[],
  signal?: AbortSignal,
): Promise<MineralSearchCount[]> {
  if (mineralIds.length === 0) {
    return [];
  }

  const params = new URLSearchParams({ minerals: mineralIds.join(',') });
  const response = await fetch(`/api/marketplace/mineral-search?${params.toString()}`, {
    signal,
  });

  if (!response.ok) {
    throw new Error('mineral_search_failed');
  }

  const payload = (await response.json()) as MineralSearchApiResponse;
  return payload.suggestions ?? [];
}
