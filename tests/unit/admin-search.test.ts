import { describe, it, expect } from 'vitest';
import {
  assertAdminSearchIsPlatformWide,
  flattenAdminSearchResults,
  hasAdminSearchResults,
  isAdminSearchQueryValid,
  matchesAdminSearchQuery,
  normalizeAdminSearchQuery,
  type AdminSearchGroupedResult,
} from '@/lib/admin/search.logic';

describe('admin search logic', () => {
  it('normalizes and validates search queries', () => {
    expect(normalizeAdminSearchQuery('  Cobalt  ')).toBe('cobalt');
    expect(isAdminSearchQueryValid('')).toBe(false);
    expect(isAdminSearchQueryValid('c')).toBe(true);
  });

  it('matches case-insensitive substrings', () => {
    expect(matchesAdminSearchQuery('Copper Cathodes', 'copp')).toBe(true);
    expect(matchesAdminSearchQuery('Gold ore', 'silver')).toBe(false);
  });

  it('asserts platform-wide results have no userId field', () => {
    const platformWide = [
      { id: '1', type: 'user' as const, title: 'Co', subtitle: 'buyer', href: '/users/1' },
    ];
    const userScoped = [
      {
        id: '1',
        type: 'user' as const,
        title: 'Co',
        subtitle: 'buyer',
        href: '/users/1',
        userId: 'user-1',
      },
    ];

    expect(assertAdminSearchIsPlatformWide(platformWide)).toBe(true);
    expect(assertAdminSearchIsPlatformWide(userScoped as never)).toBe(false);
  });

  it('flattens grouped results', () => {
    const grouped: AdminSearchGroupedResult = {
      users: [{ id: 'u1', type: 'user', title: 'A', subtitle: 'buyer', href: '/u1' }],
      listings: [],
      orders: [{ id: 'o1', type: 'order', title: 'B', subtitle: 'c', href: '/o1' }],
    };

    const flat = flattenAdminSearchResults(grouped);
    expect(flat).toHaveLength(2);
    expect(hasAdminSearchResults(grouped)).toBe(true);
  });
});

describe('admin search independence from platform command palette', () => {
  it('does not import from lib/platform/command-palette.logic', async () => {
    const adminLogic = await import('@/lib/admin/search.logic');
    const platformLogic = await import('@/lib/platform/command-palette.logic');

    expect(adminLogic.normalizeAdminSearchQuery).not.toBe(platformLogic.normalizeSearchQuery);
    expect('userId' in ({} as Record<string, unknown>)).toBe(false);
    expect(adminLogic).not.toHaveProperty('filterResultsForUser');
    expect(adminLogic).not.toHaveProperty('assertResultsScopedToUser');
  });
});
