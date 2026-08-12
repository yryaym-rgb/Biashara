import { MINERAL_IDS, type MineralId } from '@/lib/constants/minerals';

export interface MineralSearchLabel {
  id: MineralId;
  label: string;
}

export interface MineralSearchCount {
  mineralId: MineralId;
  activeListingCount: number;
  verifiedSupplierCount: number;
}

export function normalizeMineralSearchQuery(query: string): string {
  return query.trim().toLowerCase();
}

export function filterMineralsByQuery(
  query: string,
  minerals: MineralSearchLabel[],
): MineralId[] {
  const normalized = normalizeMineralSearchQuery(query);
  if (!normalized) {
    return [];
  }

  return minerals
    .filter(
      ({ id, label }) =>
        id.includes(normalized) || label.trim().toLowerCase().includes(normalized),
    )
    .map(({ id }) => id);
}

export function buildMineralSearchLabels(
  labels: Record<MineralId, string>,
): MineralSearchLabel[] {
  return MINERAL_IDS.map((id) => ({ id, label: labels[id] }));
}

type ListingSellerKyc = { kyc_status: string } | null;

export interface ActiveListingMineralRow {
  mineral: MineralId;
  seller_id: string;
  seller: ListingSellerKyc | ListingSellerKyc[] | null;
}

function resolveSellerKycStatus(
  seller: ListingSellerKyc | ListingSellerKyc[] | null,
): string | null {
  if (!seller) {
    return null;
  }

  if (Array.isArray(seller)) {
    return seller[0]?.kyc_status ?? null;
  }

  return seller.kyc_status;
}

/** Aggregates live listing rows into per-mineral counts — no fabricated numbers. */
export function aggregateMineralSearchCounts(
  mineralIds: MineralId[],
  rows: ActiveListingMineralRow[],
): MineralSearchCount[] {
  const activeListingCounts = new Map<MineralId, number>();
  const verifiedSupplierIds = new Map<MineralId, Set<string>>();

  for (const mineralId of mineralIds) {
    activeListingCounts.set(mineralId, 0);
    verifiedSupplierIds.set(mineralId, new Set());
  }

  for (const row of rows) {
    const mineralId = row.mineral;
    if (!mineralIds.includes(mineralId)) {
      continue;
    }

    activeListingCounts.set(mineralId, (activeListingCounts.get(mineralId) ?? 0) + 1);

    if (resolveSellerKycStatus(row.seller) === 'approved') {
      verifiedSupplierIds.get(mineralId)?.add(row.seller_id);
    }
  }

  return mineralIds.map((mineralId) => ({
    mineralId,
    activeListingCount: activeListingCounts.get(mineralId) ?? 0,
    verifiedSupplierCount: verifiedSupplierIds.get(mineralId)?.size ?? 0,
  }));
}
