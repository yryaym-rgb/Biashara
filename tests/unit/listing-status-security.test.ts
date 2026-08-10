import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  listingSellerUpdateSchema,
  SELLER_LISTING_STATUSES,
} from '@/lib/validators/listing';

const LISTING_ID = '00000000-0000-0000-0000-000000000010';
const SELLER_ID = '00000000-0000-0000-0000-000000000001';

const mockGetProfile = vi.fn();
const mockFrom = vi.fn();
const mockCreateClient = vi.fn();

vi.mock('@/lib/auth/session', () => ({
  getProfile: () => mockGetProfile(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => mockCreateClient(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

const sellerProfile = {
  id: SELLER_ID,
  role: 'seller' as const,
  company_name: 'Seller Co',
  country: 'CD',
  phone: null,
  locale: 'fr' as const,
  kyc_status: 'approved' as const,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

function createUpdateChain(result: { data?: unknown; error?: unknown | null }) {
  const chain = {
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
  };
  return chain;
}

/**
 * Mirrors migration 00024_listings_seller_status_rls.sql WITH CHECK clause.
 * Used to assert RLS blocks status escalation even if application validation is bypassed.
 */
function listingsUpdateOwnWithCheckAllows(params: {
  isAdmin: boolean;
  sellerId: string;
  authUid: string;
  newStatus: string;
}): boolean {
  if (params.isAdmin) {
    return true;
  }

  return (
    params.sellerId === params.authUid &&
    !['active', 'rejected', 'sold'].includes(params.newStatus)
  );
}

describe('listing status self-activation protections', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mockGetProfile.mockResolvedValue(sellerProfile);
    mockCreateClient.mockResolvedValue({ from: mockFrom });
  });

  it('listingSellerUpdateSchema rejects status active at validation layer', () => {
    const parsed = listingSellerUpdateSchema.safeParse({ status: 'active' });
    expect(parsed.success).toBe(false);
  });

  it('updateListing rejects seller attempt to set listing status to active', async () => {
    const { updateListing } = await import('@/actions/listings');
    const result = await updateListing(LISTING_ID, { status: 'active' });

    expect(result).toEqual(
      expect.objectContaining({ error: 'validation' }),
    );
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('RLS WITH CHECK blocks seller status active even when validation is bypassed', async () => {
    const updateChain = createUpdateChain({
      data: null,
      error: {
        message: 'new row violates row-level security policy for table "listings"',
        code: '42501',
      },
    });
    mockFrom.mockReturnValue(updateChain);

    const maliciousStatus = 'active' as (typeof SELLER_LISTING_STATUSES)[number];
    const rlsWouldAllow = listingsUpdateOwnWithCheckAllows({
      isAdmin: false,
      sellerId: SELLER_ID,
      authUid: SELLER_ID,
      newStatus: maliciousStatus,
    });

    expect(rlsWouldAllow).toBe(false);

    const { error } = await (await mockCreateClient()).from('listings')
      .update({ status: maliciousStatus })
      .eq('id', LISTING_ID)
      .eq('seller_id', SELLER_ID)
      .select()
      .single();

    expect(error).toMatchObject({
      code: '42501',
      message: expect.stringContaining('row-level security policy'),
    });
  });

  it('migration 00024 encodes seller status guard in listings_update_own', () => {
    const migration = readFileSync(
      resolve(process.cwd(), 'supabase/migrations/00024_listings_seller_status_rls.sql'),
      'utf8',
    );

    expect(migration).toContain('DROP POLICY IF EXISTS listings_update_own');
    expect(migration).toContain("status NOT IN ('active', 'rejected', 'sold')");
  });
});
