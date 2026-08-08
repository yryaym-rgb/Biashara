import { describe, it, expect } from 'vitest';
import {
  assertResultsScopedToUser,
  filterResultsForUser,
  flattenSearchResults,
  hasSearchResults,
  isSearchQueryValid,
  matchesSearchQuery,
  normalizeSearchQuery,
  type CommandPaletteResult,
  type CommandPaletteSearchResult,
} from '@/lib/platform/command-palette.logic';

const USER_A = '00000000-0000-0000-0000-000000000001';
const USER_B = '00000000-0000-0000-0000-000000000002';

function makeResult(
  overrides: Partial<CommandPaletteResult> & Pick<CommandPaletteResult, 'id' | 'type'>,
): CommandPaletteResult {
  return {
    title: 'Test',
    subtitle: 'Subtitle',
    href: '/dashboard',
    userId: USER_A,
    ...overrides,
  };
}

describe('command palette search helpers', () => {
  it('normalizes and validates search queries', () => {
    expect(normalizeSearchQuery('  Cobalt  ')).toBe('cobalt');
    expect(isSearchQueryValid('')).toBe(false);
    expect(isSearchQueryValid('c')).toBe(true);
  });

  it('matches case-insensitive substrings', () => {
    expect(matchesSearchQuery('Copper Cathodes', 'copp')).toBe(true);
    expect(matchesSearchQuery('Gold ore', 'silver')).toBe(false);
  });
});

describe('command palette user scoping', () => {
  it('asserts all results belong to the requesting user', () => {
    const ownResults = [
      makeResult({ id: '1', type: 'listing' }),
      makeResult({ id: '2', type: 'order' }),
    ];

    const mixedResults = [
      makeResult({ id: '1', type: 'listing', userId: USER_A }),
      makeResult({ id: '2', type: 'order', userId: USER_B }),
    ];

    expect(assertResultsScopedToUser(ownResults, USER_A)).toBe(true);
    expect(assertResultsScopedToUser(mixedResults, USER_A)).toBe(false);
  });

  it('filters out results from other users', () => {
    const results = [
      makeResult({ id: '1', type: 'listing', userId: USER_A }),
      makeResult({ id: '2', type: 'offer', userId: USER_B }),
      makeResult({ id: '3', type: 'order', userId: USER_A }),
    ];

    const filtered = filterResultsForUser(results, USER_A);

    expect(filtered).toHaveLength(2);
    expect(filtered.every((result) => result.userId === USER_A)).toBe(true);
    expect(assertResultsScopedToUser(filtered, USER_A)).toBe(true);
  });

  it('never returns another user data after filtering', () => {
    const grouped: CommandPaletteSearchResult = {
      listings: [makeResult({ id: 'l1', type: 'listing', userId: USER_B })],
      offers: [makeResult({ id: 'o1', type: 'offer', userId: USER_A })],
      orders: [],
      conversations: [],
    };

    const filtered = {
      listings: filterResultsForUser(grouped.listings, USER_A),
      offers: filterResultsForUser(grouped.offers, USER_A),
      orders: filterResultsForUser(grouped.orders, USER_A),
      conversations: filterResultsForUser(grouped.conversations, USER_A),
    };

    const flat = flattenSearchResults(filtered);

    expect(hasSearchResults(filtered)).toBe(true);
    expect(flat).toHaveLength(1);
    expect(flat[0]?.userId).toBe(USER_A);
    expect(assertResultsScopedToUser(flat, USER_A)).toBe(true);
    expect(flat.some((result) => result.userId === USER_B)).toBe(false);
  });
});
