import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockFrom, mockSelect, mockEq, mockIn, mockCreateClient } = vi.hoisted(() => {
  const mockIn = vi.fn();
  const mockEq = vi.fn(() => ({ in: mockIn }));
  const mockSelect = vi.fn(() => ({ eq: mockEq }));
  const mockFrom = vi.fn(() => ({ select: mockSelect }));
  const mockCreateClient = vi.fn(() => ({ from: mockFrom }));

  return { mockFrom, mockSelect, mockEq, mockIn, mockCreateClient };
});

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => mockCreateClient(),
}));

import { getMineralSearchCounts } from '@/lib/marketplace/mineral-search.queries';

describe('getMineralSearchCounts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIn.mockResolvedValue({
      data: [
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
      ],
      error: null,
    });
  });

  it('queries active listings scoped to requested minerals and aggregates real rows', async () => {
    const result = await getMineralSearchCounts(['cobalt']);

    expect(mockFrom).toHaveBeenCalledWith('listings');
    expect(mockSelect).toHaveBeenCalledWith(
      'mineral, seller_id, seller:profiles!listings_seller_id_fkey(kyc_status)',
    );
    expect(mockEq).toHaveBeenCalledWith('status', 'active');
    expect(mockIn).toHaveBeenCalledWith('mineral', ['cobalt']);

    expect(result).toEqual([
      { mineralId: 'cobalt', activeListingCount: 2, verifiedSupplierCount: 1 },
    ]);
  });

  it('does not invent counts when Supabase returns no rows', async () => {
    mockIn.mockResolvedValueOnce({ data: [], error: null });

    const result = await getMineralSearchCounts(['gold', 'diamond']);

    expect(result).toEqual([
      { mineralId: 'gold', activeListingCount: 0, verifiedSupplierCount: 0 },
      { mineralId: 'diamond', activeListingCount: 0, verifiedSupplierCount: 0 },
    ]);
  });
});
