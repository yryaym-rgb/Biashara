import { describe, it, expect } from 'vitest';
import {
  buildSuggestionGroups,
  rankTradedMinerals,
} from '@/lib/platform/suggestions';
import type { MarketplaceListingRow } from '@/lib/marketplace/queries';

function makeListing(
  id: string,
  mineral: string,
  sellerId: string,
): MarketplaceListingRow {
  return {
    id,
    mineral: mineral as MarketplaceListingRow['mineral'],
    seller_id: sellerId,
    title: `Listing ${id}`,
    status: 'active',
    seller: null,
    listing_photos: [],
  } as unknown as MarketplaceListingRow;
}

describe('suggestion query logic', () => {
  it('ranks minerals by trading frequency', () => {
    expect(rankTradedMinerals(['copper', 'gold', 'copper', 'copper', 'gold'])).toEqual([
      'copper',
      'gold',
    ]);
  });

  it('excludes the user own listings from suggestions', () => {
    const groups = buildSuggestionGroups(
      ['copper'],
      [
        makeListing('a', 'copper', 'user-1'),
        makeListing('b', 'copper', 'other-seller'),
      ],
      'user-1',
    );

    expect(groups).toHaveLength(1);
    expect(groups[0]?.listings).toHaveLength(1);
    expect(groups[0]?.listings[0]?.id).toBe('b');
  });

  it('returns no groups when no matching listings exist', () => {
    const groups = buildSuggestionGroups(
      ['gold'],
      [makeListing('a', 'copper', 'other-seller')],
      'user-1',
    );

    expect(groups).toEqual([]);
  });

  it('limits listings per mineral', () => {
    const groups = buildSuggestionGroups(
      ['copper'],
      [
        makeListing('a', 'copper', 'seller-1'),
        makeListing('b', 'copper', 'seller-2'),
        makeListing('c', 'copper', 'seller-3'),
        makeListing('d', 'copper', 'seller-4'),
      ],
      'user-1',
      2,
    );

    expect(groups[0]?.listings).toHaveLength(2);
  });

  it('returns empty when user has no traded minerals', () => {
    expect(buildSuggestionGroups([], [makeListing('a', 'copper', 'seller-1')], 'user-1')).toEqual(
      [],
    );
  });
});
