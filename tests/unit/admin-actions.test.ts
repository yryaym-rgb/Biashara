import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hasAllRequiredKycDocuments } from '@/lib/constants/kyc-requirements';

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

vi.mock('@/lib/email', () => ({
  sendTransactionalEmail: vi.fn(),
}));

vi.mock('@/lib/notifications/create', () => ({
  createNotification: vi.fn().mockResolvedValue({ id: 'mock-notification-id' }),
}));

const baseProfile = {
  id: '00000000-0000-0000-0000-000000000001',
  role: 'buyer' as const,
  company_name: 'Test Co',
  country: 'CD',
  phone: null,
  locale: 'fr' as const,
  kyc_status: 'approved' as const,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const adminProfile = { ...baseProfile, role: 'admin' as const };

function createQueryChain(result: { data?: unknown; error?: unknown | null }) {
  const chain: {
    select: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    single: ReturnType<typeof vi.fn>;
    maybeSingle: ReturnType<typeof vi.fn>;
    then: (onFulfilled: (value: typeof result) => unknown) => unknown;
  } = {
    select: vi.fn(),
    eq: vi.fn(),
    update: vi.fn(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
    then: (onFulfilled) => onFulfilled(result),
  };

  chain.select.mockImplementation(() => chain);
  chain.eq.mockImplementation(() => chain);
  chain.update.mockImplementation(() => chain);
  chain.single.mockResolvedValue(result);
  chain.maybeSingle.mockResolvedValue(result);

  return chain;
}

describe('admin actions authorization', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.ADMIN_GATE_SECRET = 'test-gate';
    process.env.ADMIN_PASSPHRASE = 'test-passphrase';
  });

  it('approveKycDocument rejects non-admin users', async () => {
    mockGetProfile.mockResolvedValue(baseProfile);
    const { approveKycDocument } = await import('@/actions/admin/kyc');
    await expect(approveKycDocument({ documentId: '00000000-0000-0000-0000-000000000010' })).rejects.toThrow(
      'Forbidden',
    );
  });

  it('rejectKycDocument rejects non-admin users', async () => {
    mockGetProfile.mockResolvedValue(baseProfile);
    const { rejectKycDocument } = await import('@/actions/admin/kyc');
    await expect(
      rejectKycDocument({
        documentId: '00000000-0000-0000-0000-000000000010',
        reason: 'Invalid document',
      }),
    ).rejects.toThrow('Forbidden');
  });

  it('approveListing rejects non-admin users', async () => {
    mockGetProfile.mockResolvedValue(baseProfile);
    const { approveListing } = await import('@/actions/admin/listings');
    await expect(
      approveListing({ listingId: '00000000-0000-0000-0000-000000000020' }),
    ).rejects.toThrow('Forbidden');
  });

  it('rejectListing rejects non-admin users', async () => {
    mockGetProfile.mockResolvedValue(baseProfile);
    const { rejectListing } = await import('@/actions/admin/listings');
    await expect(
      rejectListing({
        listingId: '00000000-0000-0000-0000-000000000020',
        reason: 'Policy violation',
      }),
    ).rejects.toThrow('Forbidden');
  });
});

describe('admin KYC approval profile promotion', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mockGetProfile.mockResolvedValue(adminProfile);
    process.env.ADMIN_GATE_SECRET = 'test-gate';
    process.env.ADMIN_PASSPHRASE = 'test-passphrase';
  });

  it('updates profile kyc_status when all required documents are approved', async () => {
    const userId = '00000000-0000-0000-0000-000000000099';
    const docId = '00000000-0000-0000-0000-000000000010';

    const docFetch = createQueryChain({
      data: {
        id: docId,
        user_id: userId,
        type: 'id_card',
        status: 'pending',
        storage_path: 'path/doc.pdf',
      },
    });

    const profileFetch = createQueryChain({
      data: { role: 'buyer', locale: 'fr' },
    });

    const updateDoc = createQueryChain({ data: {}, error: null });
    updateDoc.single = vi.fn();

    const approvedDocsFetch = createQueryChain({
      data: [{ type: 'id_card' }],
    });

    const profileUpdate = createQueryChain({ data: {}, error: null });

    mockFrom
      .mockReturnValueOnce(docFetch)
      .mockReturnValueOnce(profileFetch)
      .mockReturnValueOnce(updateDoc)
      .mockReturnValueOnce(approvedDocsFetch)
      .mockReturnValueOnce(profileUpdate);

    mockCreateClient.mockResolvedValue({ from: mockFrom });

    const { approveKycDocument } = await import('@/actions/admin/kyc');
    const result = await approveKycDocument({ documentId: docId });

    expect(result).toEqual({ success: true });
    expect(updateDoc.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'approved' }),
    );
    expect(profileUpdate.update).toHaveBeenCalledWith({ kyc_status: 'approved' });
    expect(hasAllRequiredKycDocuments('buyer', ['id_card'])).toBe(true);
  });
});

describe('admin listing approval', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mockGetProfile.mockResolvedValue(adminProfile);
    process.env.ADMIN_GATE_SECRET = 'test-gate';
    process.env.ADMIN_PASSPHRASE = 'test-passphrase';
  });

  it('sets listing status to active for marketplace visibility', async () => {
    const listingId = '00000000-0000-0000-0000-000000000020';
    const updateChain = createQueryChain({
      data: { id: listingId },
      error: null,
    });
    updateChain.single = vi.fn().mockResolvedValue({ data: { id: listingId, seller_id: 'seller-1', title: 'Cobalt' }, error: null });

    mockFrom.mockReturnValue(updateChain);
    mockCreateClient.mockResolvedValue({ from: mockFrom });

    const { approveListing } = await import('@/actions/admin/listings');
    const result = await approveListing({ listingId });

    expect(result).toEqual({ success: true });
    expect(updateChain.update).toHaveBeenCalledWith({
      status: 'active',
      rejection_reason: null,
    });
    expect(updateChain.eq).toHaveBeenCalledWith('id', listingId);
    expect(updateChain.eq).toHaveBeenCalledWith('status', 'pending_review');
  });
});

describe('admin mutating actions audit trail', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mockGetProfile.mockResolvedValue(adminProfile);
    process.env.ADMIN_GATE_SECRET = 'test-gate';
    process.env.ADMIN_PASSPHRASE = 'test-passphrase';
  });

  it('approveKycDocument performs audited kyc_documents update', async () => {
    const docId = '00000000-0000-0000-0000-000000000010';
    const userId = '00000000-0000-0000-0000-000000000099';

    const docFetch = createQueryChain({
      data: { id: docId, user_id: userId, type: 'id_card' },
    });
    const profileFetch = createQueryChain({ data: { role: 'seller', locale: 'fr' } });
    const updateDoc = createQueryChain({ error: null });
    const approvedDocsFetch = createQueryChain({
      data: [{ type: 'id_card' }, { type: 'business_registration' }],
    });
    const profileUpdate = createQueryChain({ error: null });

    mockFrom
      .mockReturnValueOnce(docFetch)
      .mockReturnValueOnce(profileFetch)
      .mockReturnValueOnce(updateDoc)
      .mockReturnValueOnce(approvedDocsFetch)
      .mockReturnValueOnce(profileUpdate);

    mockCreateClient.mockResolvedValue({ from: mockFrom });

    const { approveKycDocument } = await import('@/actions/admin/kyc');
    await approveKycDocument({ documentId: docId });

    expect(updateDoc.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'approved',
        reviewer_id: adminProfile.id,
        reviewed_at: expect.any(String),
      }),
    );
  });

  it('rejectListing performs audited listings update with rejection reason', async () => {
    const listingId = '00000000-0000-0000-0000-000000000020';
    const sellerId = '00000000-0000-0000-0000-000000000099';
    const updateChain = createQueryChain({
      data: { id: listingId, seller_id: sellerId, title: 'Test listing' },
      error: null,
    });
    updateChain.single = vi.fn().mockResolvedValue({
      data: { id: listingId, seller_id: sellerId, title: 'Test listing' },
      error: null,
    });

    mockFrom.mockReturnValue(updateChain);
    mockCreateClient.mockResolvedValue({ from: mockFrom });

    const { rejectListing } = await import('@/actions/admin/listings');
    await rejectListing({ listingId, reason: 'Incomplete documentation' });

    expect(updateChain.update).toHaveBeenCalledWith({
      status: 'rejected',
      rejection_reason: 'Incomplete documentation',
    });
  });
});
