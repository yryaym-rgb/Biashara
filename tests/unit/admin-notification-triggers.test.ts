import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  mockCreateNotification,
  mockAdminFrom,
  mockCreateAdminClient,
  mockFrom,
  mockCreateClient,
  mockGetProfile,
  mockNotifyAdminsPendingKyc,
  mockNotifyAdminsPendingListing,
} = vi.hoisted(() => ({
  mockCreateNotification: vi.fn().mockResolvedValue({ id: 'mock-notification-id' }),
  mockAdminFrom: vi.fn(),
  mockCreateAdminClient: vi.fn(),
  mockFrom: vi.fn(),
  mockCreateClient: vi.fn(),
  mockGetProfile: vi.fn(),
  mockNotifyAdminsPendingKyc: vi.fn().mockResolvedValue(undefined),
  mockNotifyAdminsPendingListing: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/notifications/create', () => ({
  createNotification: (...args: unknown[]) => mockCreateNotification(...args),
}));

vi.mock('@/lib/notifications/admin', () => ({
  notifyAdminsPendingKyc: (...args: unknown[]) => mockNotifyAdminsPendingKyc(...args),
  notifyAdminsPendingListing: (...args: unknown[]) => mockNotifyAdminsPendingListing(...args),
  getAdminUserIds: vi.fn().mockResolvedValue(['admin-1']),
  notifyAdmins: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => mockCreateClient(),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => mockCreateAdminClient(),
}));

vi.mock('@/lib/auth/session', () => ({
  getProfile: () => mockGetProfile(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/actions/lots', () => ({
  linkLotToListingAction: vi.fn().mockResolvedValue({}),
}));

const sellerProfile = {
  id: 'seller-1',
  role: 'seller' as const,
  company_name: 'Mine Katanga',
  country: 'CD',
  phone: null,
  locale: 'fr' as const,
  kyc_status: 'approved' as const,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

function createQueryChain(result: { data?: unknown; error?: unknown | null }) {
  const chain: {
    select: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    upsert: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    insert: ReturnType<typeof vi.fn>;
    single: ReturnType<typeof vi.fn>;
    maybeSingle: ReturnType<typeof vi.fn>;
    then: (onFulfilled: (value: typeof result) => unknown) => unknown;
  } = {
    select: vi.fn(),
    eq: vi.fn(),
    upsert: vi.fn(),
    update: vi.fn(),
    insert: vi.fn(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
    then: (onFulfilled) => onFulfilled(result),
  };

  chain.select.mockImplementation(() => chain);
  chain.eq.mockImplementation(() => chain);
  chain.upsert.mockImplementation(() => chain);
  chain.update.mockImplementation(() => chain);
  chain.insert.mockImplementation(() => chain);
  chain.single.mockResolvedValue(result);
  chain.maybeSingle.mockResolvedValue(result);

  return chain;
}

describe('admin notification triggers', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
    process.env.ADMIN_GATE_SECRET = 'test-gate';
    mockGetProfile.mockResolvedValue(sellerProfile);
  });

  it('notifies admins when a KYC document is uploaded', async () => {
    const upsertChain = createQueryChain({
      data: { id: 'doc-1', type: 'id_card' },
      error: null,
    });
    const profileUpdate = createQueryChain({ error: null });

    mockFrom.mockReturnValueOnce(upsertChain).mockReturnValueOnce(profileUpdate);
    mockCreateClient.mockResolvedValue({ from: mockFrom });

    const { uploadKycDocument } = await import('@/actions/kyc');
    await uploadKycDocument({ type: 'id_card', storagePath: 'seller-1/id_card/file.pdf' });

    expect(mockNotifyAdminsPendingKyc).toHaveBeenCalledWith({
      documentType: 'id_card',
      applicantName: 'Mine Katanga',
    });
  });

  it('notifies admins when a listing is created for moderation', async () => {
    const insertChain = createQueryChain({
      data: {
        id: 'listing-1',
        title: 'Cobalt ore',
        seller_id: 'seller-1',
      },
      error: null,
    });

    mockFrom.mockReturnValue(insertChain);
    mockCreateClient.mockResolvedValue({ from: mockFrom });

    const { createListing } = await import('@/actions/listings');
    await createListing({
      mineral: 'cobalt',
      title: 'Cobalt ore',
      description: 'High grade cobalt ore from Lualaba.',
      quantity: 100,
      unit: 'MT',
      priceType: 'indicative',
      originProvince: 'Lualaba',
      certifications: [],
    });

    expect(mockNotifyAdminsPendingListing).toHaveBeenCalledWith({
      listingId: 'listing-1',
      listingTitle: 'Cobalt ore',
    });
  });
});

describe('admin system notification messages', () => {
  it('builds pending KYC admin notification content with admin href', async () => {
    const { getNotificationContent } = await import('@/lib/notifications/messages');

    const content = getNotificationContent('system', {
      action: 'pending_kyc',
      href: '/secret/kyc-review',
      documentType: 'id_card',
      applicantName: 'Coop Lualaba',
    });

    expect(content.messageKey).toBe('adminPendingKyc');
    expect(content.values.applicantName).toBe('Coop Lualaba');
    expect(content.href).toBe('/secret/kyc-review');
  });
});
