import type { MineralId } from '@/lib/constants/minerals';
import type { DirectorySearchParams } from '@/lib/directory/params';

export function buildDirectoryQueryString(
  params: Partial<DirectorySearchParams>,
  overrides?: Partial<DirectorySearchParams>,
): string {
  const merged = { ...params, ...overrides };
  const search = new URLSearchParams();

  if (merged.q?.trim()) {
    search.set('q', merged.q.trim());
  }
  if (merged.role) {
    search.set('role', merged.role);
  }
  if (merged.mineral) {
    search.set('mineral', merged.mineral);
  }
  if (merged.country) {
    search.set('country', merged.country);
  }
  if (merged.page && merged.page > 1) {
    search.set('page', String(merged.page));
  }

  const query = search.toString();
  return query ? `?${query}` : '';
}

export function toDirectoryBaseSearchParams(
  params: DirectorySearchParams,
): Record<string, string> {
  const record: Record<string, string> = {};
  if (params.q?.trim()) record.q = params.q.trim();
  if (params.role) record.role = params.role;
  if (params.mineral) record.mineral = params.mineral;
  if (params.country) record.country = params.country;
  return record;
}

export function parseDirectoryMineralParam(value?: string): MineralId | undefined {
  if (!value) return undefined;
  const minerals: MineralId[] = ['cobalt', 'copper', 'gold', 'coltan', 'lithium', 'diamond'];
  return minerals.includes(value as MineralId) ? (value as MineralId) : undefined;
}
