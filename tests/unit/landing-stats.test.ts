import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getLandingPlatformStats } from '@/lib/marketing/landing-stats.queries';

const mockFrom = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: mockFrom,
  }),
}));

function chain(result: { data?: unknown; count?: number | null; error?: null }) {
  const builder: Record<string, unknown> = {};
  for (const method of ['select', 'eq', 'neq', 'in']) {
    builder[method] = vi.fn(() => builder);
  }
  Object.assign(builder, result);
  return builder;
}

const mockServerFrom = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    from: mockServerFrom,
  }),
}));

describe('getLandingPlatformStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns real aggregate counts from Supabase', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return chain({ count: 4, error: null });
      }
      throw new Error(`Unexpected admin table: ${table}`);
    });

    mockServerFrom.mockImplementation((table: string) => {
      if (table === 'listings') {
        return chain({
          data: [
            { origin_province: 'Haut-Katanga', mineral: 'cobalt' },
            { origin_province: 'Lualaba', mineral: 'copper' },
            { origin_province: 'Haut-Katanga', mineral: 'gold' },
          ],
          error: null,
        });
      }
      throw new Error(`Unexpected server table: ${table}`);
    });

    await expect(getLandingPlatformStats()).resolves.toEqual({
      verifiedUsers: 4,
      activeListings: 3,
      provincesRepresented: 2,
      mineralsTraded: 3,
    });
  });
});
