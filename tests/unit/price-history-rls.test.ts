import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const mockAdminFrom = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: mockAdminFrom,
  }),
}));

describe('price_history RLS migration', () => {
  it('enables public SELECT and omits client write policies', () => {
    const migration = readFileSync(
      resolve(process.cwd(), 'supabase/migrations/00025_price_history_rls.sql'),
      'utf8',
    );

    expect(migration).toContain('ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY');
    expect(migration).toContain('CREATE POLICY price_history_select_all');
    expect(migration).toContain('FOR SELECT USING (true)');
    expect(migration).not.toMatch(/FOR INSERT/i);
    expect(migration).not.toMatch(/FOR UPDATE/i);
    expect(migration).not.toMatch(/FOR DELETE/i);
  });

  it('matches price_cache public-read pattern', () => {
    const priceCachePolicy = readFileSync(
      resolve(process.cwd(), 'supabase/migrations/00011_rls_policies.sql'),
      'utf8',
    );

    expect(priceCachePolicy).toContain('CREATE POLICY price_cache_select_all');
    expect(priceCachePolicy).toContain('FOR SELECT USING (true)');
  });
});

describe('getPriceHistoryForMineral', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockOrder = vi.fn().mockResolvedValue({
      data: [{ price: 100, currency: 'USD', recorded_date: '2026-08-01' }],
      error: null,
    });

    mockAdminFrom.mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      order: mockOrder,
    });
  });

  it('reads price history via service-role client', async () => {
    const { getPriceHistoryForMineral } = await import('@/lib/prices/history');
    const points = await getPriceHistoryForMineral('cobalt');

    expect(points).toEqual([{ date: '2026-08-01', price: 100, currency: 'USD' }]);
    expect(mockAdminFrom).toHaveBeenCalledWith('price_history');
  });
});
