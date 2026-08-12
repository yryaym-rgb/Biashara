import { describe, it, expect } from 'vitest';
import {
  aggregateMineralSearchCounts,
  buildMineralSearchLabels,
  filterMineralsByQuery,
  normalizeMineralSearchQuery,
} from '@/lib/marketplace/mineral-search.logic';

const labels = buildMineralSearchLabels({
  cobalt: 'Cobalt',
  copper: 'Cuivre',
  gold: 'Or',
  coltan: 'Coltan',
  lithium: 'Lithium',
  diamond: 'Diamant',
});

describe('mineral search logic', () => {
  it('normalizes queries for matching', () => {
    expect(normalizeMineralSearchQuery('  CoBalt ')).toBe('cobalt');
  });

  it('matches mineral ids and localized labels', () => {
    expect(filterMineralsByQuery('cob', labels)).toEqual(['cobalt']);
    expect(filterMineralsByQuery('cuiv', labels)).toEqual(['copper']);
    expect(filterMineralsByQuery('or', labels)).toContain('gold');
  });

  it('returns no matches for empty queries', () => {
    expect(filterMineralsByQuery('', labels)).toEqual([]);
    expect(filterMineralsByQuery('   ', labels)).toEqual([]);
  });

  it('aggregates live listing rows into per-mineral counts', () => {
    const counts = aggregateMineralSearchCounts(['cobalt', 'copper'], [
      {
        mineral: 'cobalt',
        seller_id: 'seller-1',
        seller: { kyc_status: 'approved' },
      },
      {
        mineral: 'cobalt',
        seller_id: 'seller-1',
        seller: { kyc_status: 'approved' },
      },
      {
        mineral: 'cobalt',
        seller_id: 'seller-2',
        seller: { kyc_status: 'pending' },
      },
      {
        mineral: 'copper',
        seller_id: 'seller-3',
        seller: { kyc_status: 'approved' },
      },
    ]);

    expect(counts).toEqual([
      { mineralId: 'cobalt', activeListingCount: 3, verifiedSupplierCount: 1 },
      { mineralId: 'copper', activeListingCount: 1, verifiedSupplierCount: 1 },
    ]);
  });

  it('returns zero counts when no live rows exist for a mineral', () => {
    const counts = aggregateMineralSearchCounts(['lithium'], []);

    expect(counts).toEqual([
      { mineralId: 'lithium', activeListingCount: 0, verifiedSupplierCount: 0 },
    ]);
  });
});
