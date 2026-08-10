import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { safeQuery } from '@/lib/safe-query';

describe('safeQuery', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the query result when the query succeeds', async () => {
    const result = await safeQuery('test/success', () => Promise.resolve({ total: 3 }), { total: 0 });
    expect(result).toEqual({ total: 3 });
    expect(console.error).not.toHaveBeenCalled();
  });

  it('returns the fallback and logs when the query throws', async () => {
    const invalidTableError = new Error('relation "listings_invalid" does not exist');

    const result = await safeQuery(
      'test/invalid-table',
      () => Promise.reject(invalidTableError),
      [],
    );

    expect(result).toEqual([]);
    expect(console.error).toHaveBeenCalledWith(
      '[test/invalid-table] Failed to load:',
      invalidTableError,
    );
  });

  it('accepts a promise directly', async () => {
    const result = await safeQuery('test/promise', Promise.reject(new Error('boom')), 0);
    expect(result).toBe(0);
  });

  it('lets other parallel queries succeed when one fails (dashboard hub pattern)', async () => {
    const activityCounts = { listings: 0, offers: 0, orders: 0, conversations: 0 };
    const recentActivity = [{ id: 'event-1' }];

    const [counts, activity] = await Promise.all([
      safeQuery(
        'dashboard/activity-counts',
        () => Promise.reject(new Error('relation "listings_invalid" does not exist')),
        activityCounts,
      ),
      safeQuery('dashboard/recent-activity', () => Promise.resolve(recentActivity), []),
    ]);

    expect(counts).toEqual(activityCounts);
    expect(activity).toEqual(recentActivity);
  });

  it('degrades public list pages to empty results when listing queries fail', async () => {
    const emptyMarketplace = { listings: [], total: 0, page: 2, pageSize: 10 };

    const result = await safeQuery(
      'marketplace/listings',
      () => Promise.reject(new Error('relation "listings_invalid" does not exist')),
      emptyMarketplace,
    );

    expect(result).toEqual(emptyMarketplace);
    expect(result.listings).toHaveLength(0);
  });
});
