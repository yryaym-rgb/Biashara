import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getNotificationContent } from '@/lib/notifications/messages';
import { parseNotificationPayload } from '@/lib/notifications/payload';

const {
  mockCreateNotification,
  mockAdminFrom,
  mockCreateAdminClient,
  mockFrom,
  mockCreateClient,
  mockGetProfile,
  mockRevalidatePath,
  mockGetOfferForAction,
  mockGetOrderForAction,
} = vi.hoisted(() => ({
  mockCreateNotification: vi.fn().mockResolvedValue({ id: 'mock-notification-id' }),
  mockAdminFrom: vi.fn(),
  mockCreateAdminClient: vi.fn(),
  mockFrom: vi.fn(),
  mockCreateClient: vi.fn(),
  mockGetProfile: vi.fn(),
  mockRevalidatePath: vi.fn(),
  mockGetOfferForAction: vi.fn(),
  mockGetOrderForAction: vi.fn(),
}));

vi.mock('@/lib/notifications/create', () => ({
  createNotification: (...args: unknown[]) => mockCreateNotification(...args),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => mockCreateClient(),
}));

vi.mock('@/lib/auth/session', () => ({
  getProfile: () => mockGetProfile(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}));

vi.mock('@/lib/email', () => ({
  sendTransactionalEmail: vi.fn(),
}));

vi.mock('@/lib/platform/offers', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/platform/offers')>();
  return {
    ...actual,
    getOfferForAction: (...args: unknown[]) => mockGetOfferForAction(...args),
  };
});

vi.mock('@/lib/platform/orders', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/platform/orders')>();
  return {
    ...actual,
    getOrderForAction: (...args: unknown[]) => mockGetOrderForAction(...args),
  };
});

const USER_ID = '00000000-0000-0000-0000-000000000001';
const OTHER_USER_ID = '00000000-0000-0000-0000-000000000099';
const DOC_ID = '00000000-0000-0000-0000-000000000010';
const LISTING_ID = '00000000-0000-0000-0000-000000000020';
const OFFER_ID = '00000000-0000-0000-0000-000000000030';
const ORDER_ID = '00000000-0000-0000-0000-000000000040';

const adminProfile = {
  id: USER_ID,
  role: 'admin' as const,
  company_name: 'Admin Co',
  country: 'CD',
  phone: null,
  locale: 'fr' as const,
  kyc_status: 'approved' as const,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const sellerProfile = {
  ...adminProfile,
  id: 'seller-1',
  role: 'seller' as const,
};

const buyerProfile = {
  ...adminProfile,
  id: 'buyer-1',
  role: 'buyer' as const,
};

function createQueryChain(result: { data?: unknown; error?: unknown | null; count?: number | null }) {
  const chain: {
    select: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    is: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    insert: ReturnType<typeof vi.fn>;
    order: ReturnType<typeof vi.fn>;
    limit: ReturnType<typeof vi.fn>;
    range: ReturnType<typeof vi.fn>;
    single: ReturnType<typeof vi.fn>;
    maybeSingle: ReturnType<typeof vi.fn>;
    then: (onFulfilled: (value: typeof result) => unknown) => unknown;
  } = {
    select: vi.fn(),
    eq: vi.fn(),
    is: vi.fn(),
    update: vi.fn(),
    insert: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
    range: vi.fn(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
    then: (onFulfilled) => onFulfilled(result),
  };

  chain.select.mockImplementation(() => chain);
  chain.eq.mockImplementation(() => chain);
  chain.is.mockImplementation(() => chain);
  chain.update.mockImplementation(() => chain);
  chain.insert.mockImplementation(() => chain);
  chain.order.mockImplementation(() => chain);
  chain.limit.mockImplementation(() => chain);
  chain.range.mockImplementation(() => chain);
  chain.single.mockResolvedValue(result);
  chain.maybeSingle.mockResolvedValue(result);

  return chain;
}

describe('notification message helpers', () => {
  it('builds KYC approval content with settings link', () => {
    const content = getNotificationContent('kyc', {
      action: 'approved',
      documentType: 'id_card',
    });

    expect(content.messageKey).toBe('kycApproved');
    expect(content.values.documentType).toBe('id_card');
    expect(content.href).toBe('/settings?tab=kyc');
  });

  it('builds listing rejection content with listings tab link', () => {
    const content = getNotificationContent('listing', {
      action: 'rejected',
      listingId: LISTING_ID,
      title: 'Cobalt lot',
      reason: 'Incomplete',
    });

    expect(content.messageKey).toBe('listingRejected');
    expect(content.values.title).toBe('Cobalt lot');
    expect(content.href).toBe('/settings?tab=listings');
  });

  it('builds order dispute content with order detail link', () => {
    const content = getNotificationContent('order', {
      action: 'disputed',
      orderId: ORDER_ID,
    });

    expect(content.messageKey).toBe('orderDisputed');
    expect(content.href).toBe(`/orders/${ORDER_ID}`);
  });

  it('parses JSON payloads safely', () => {
    expect(parseNotificationPayload({ action: 'received', offerId: OFFER_ID })).toEqual({
      action: 'received',
      offerId: OFFER_ID,
    });
    expect(parseNotificationPayload(null)).toEqual({});
  });
});


describe('notification queries and actions', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mockGetProfile.mockResolvedValue(buyerProfile);
  });

  it('counts unread notifications for the current user', async () => {
    const countChain = createQueryChain({ count: 3, error: null });
    mockFrom.mockReturnValue(countChain);
    mockCreateClient.mockResolvedValue({ from: mockFrom });

    const { getUnreadNotificationCount } = await import('@/lib/notifications/queries');
    const count = await getUnreadNotificationCount('buyer-1');

    expect(count).toBe(3);
    expect(countChain.eq).toHaveBeenCalledWith('user_id', 'buyer-1');
    expect(countChain.is).toHaveBeenCalledWith('read_at', null);
  });

  it('marks a single notification as read for the authenticated user', async () => {
    const updateChain = createQueryChain({ data: { id: 'notif-1' }, error: null });
    mockFrom.mockReturnValue(updateChain);
    mockCreateClient.mockResolvedValue({ from: mockFrom });

    const { markNotificationRead } = await import('@/actions/notifications');
    const result = await markNotificationRead('notif-1');

    expect(result).toEqual({ success: true });
    expect(updateChain.update).toHaveBeenCalledWith({ read_at: expect.any(String) });
    expect(updateChain.eq).toHaveBeenCalledWith('id', 'notif-1');
    expect(updateChain.eq).toHaveBeenCalledWith('user_id', 'buyer-1');
    expect(mockRevalidatePath).toHaveBeenCalledWith('/', 'layout');
  });

  it('marks all unread notifications as read', async () => {
    const updateChain = createQueryChain({ error: null });
    mockFrom.mockReturnValue(updateChain);
    mockCreateClient.mockResolvedValue({ from: mockFrom });

    const { markAllNotificationsRead } = await import('@/actions/notifications');
    const result = await markAllNotificationsRead();

    expect(result).toEqual({ success: true });
    expect(updateChain.update).toHaveBeenCalledWith({ read_at: expect.any(String) });
    expect(updateChain.eq).toHaveBeenCalledWith('user_id', 'buyer-1');
    expect(updateChain.is).toHaveBeenCalledWith('read_at', null);
  });
});

describe('notification trigger points', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mockFrom.mockReset();
    mockCreateClient.mockReset();
    mockCreateNotification.mockResolvedValue({ id: 'mock-notification-id' });
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
    process.env.ADMIN_GATE_SECRET = 'test-gate';
    process.env.ADMIN_PASSPHRASE = 'test-passphrase';
    mockGetProfile.mockResolvedValue(adminProfile);
  });

  it('fires KYC approval notification for the applicant', async () => {
    const docFetch = createQueryChain({
      data: { id: DOC_ID, user_id: OTHER_USER_ID, type: 'id_card' },
    });
    const profileFetch = createQueryChain({ data: { role: 'seller', locale: 'fr' } });
    const updateDoc = createQueryChain({ error: null });
    const approvedDocsFetch = createQueryChain({ data: [{ type: 'id_card' }] });
    const profileUpdate = createQueryChain({ error: null });

    mockFrom
      .mockReturnValueOnce(docFetch)
      .mockReturnValueOnce(profileFetch)
      .mockReturnValueOnce(updateDoc)
      .mockReturnValueOnce(approvedDocsFetch)
      .mockReturnValueOnce(profileUpdate);
    mockCreateClient.mockResolvedValue({ from: mockFrom });

    const { approveKycDocument } = await import('@/actions/admin/kyc');
    await approveKycDocument({ documentId: DOC_ID });

    expect(mockCreateNotification).toHaveBeenCalledWith(OTHER_USER_ID, 'kyc', {
      action: 'approved',
      documentType: 'id_card',
    });
  });

  it('fires listing rejection notification for the seller', async () => {
    const updateChain = createQueryChain({
      data: { id: LISTING_ID, seller_id: OTHER_USER_ID, title: 'Copper ore' },
      error: null,
    });
    updateChain.single = vi.fn().mockResolvedValue({
      data: { id: LISTING_ID, seller_id: OTHER_USER_ID, title: 'Copper ore' },
      error: null,
    });

    mockFrom.mockReturnValue(updateChain);
    mockCreateClient.mockResolvedValue({ from: mockFrom });

    const { rejectListing } = await import('@/actions/admin/listings');
    await rejectListing({ listingId: LISTING_ID, reason: 'Incomplete docs' });

    expect(mockCreateNotification).toHaveBeenCalledWith(OTHER_USER_ID, 'listing', {
      action: 'rejected',
      listingId: LISTING_ID,
      title: 'Copper ore',
      reason: 'Incomplete docs',
    });
  });

  it('fires new-offer notification for the seller on createOffer', async () => {
    mockGetProfile.mockResolvedValue(buyerProfile);

    const insertOfferChain = {
      from: vi.fn(),
      insert: vi.fn(),
      select: vi.fn(),
      single: vi.fn(),
    };
    insertOfferChain.from.mockReturnValue(insertOfferChain);
    insertOfferChain.insert.mockReturnValue(insertOfferChain);
    insertOfferChain.select.mockReturnValue(insertOfferChain);
    insertOfferChain.single.mockResolvedValue({ data: { id: OFFER_ID }, error: null });

    const listingFetch = createQueryChain({
      data: { seller_id: 'seller-1', title: 'Gold concentrate' },
      error: null,
    });

    mockFrom
      .mockImplementationOnce(() => insertOfferChain)
      .mockImplementationOnce(() => listingFetch);
    mockCreateClient.mockResolvedValue({ from: mockFrom });

    const { createOffer } = await import('@/actions/offers');
    await createOffer({
      listingId: LISTING_ID,
      offeredPrice: 1000,
      quantity: 10,
    });

    expect(mockCreateNotification).toHaveBeenCalledWith('seller-1', 'offer', {
      action: 'received',
      offerId: OFFER_ID,
      listingTitle: 'Gold concentrate',
    });
  });

  it('fires offer-accepted notification for the buyer', async () => {
    mockGetProfile.mockResolvedValue(sellerProfile);
    mockGetOfferForAction.mockResolvedValue({
      id: OFFER_ID,
      buyer_id: 'buyer-1',
      listing: { seller_id: 'seller-1', title: 'Coltan batch' },
      status: 'pending',
      parent_offer_id: null,
    });

    mockCreateClient.mockResolvedValue({
      rpc: vi.fn().mockResolvedValue({ data: ORDER_ID, error: null }),
    });

    const { acceptOffer } = await import('@/actions/offers');
    await acceptOffer({ offerId: OFFER_ID });

    expect(mockCreateNotification).toHaveBeenCalledWith('buyer-1', 'offer', {
      action: 'accepted',
      offerId: OFFER_ID,
      listingTitle: 'Coltan batch',
    });
  });

  it('fires order status notification for the buyer on progressOrderStatus', async () => {
    mockGetProfile.mockResolvedValue(sellerProfile);
    mockGetOrderForAction.mockResolvedValue({
      id: ORDER_ID,
      status: 'confirmed',
      buyer_id: 'buyer-1',
      seller_id: 'seller-1',
    });

    const updateChain = createQueryChain({
      data: { id: ORDER_ID, status: 'processing', buyer_id: 'buyer-1', seller_id: 'seller-1' },
      error: null,
    });

    mockFrom.mockReturnValue(updateChain);
    mockCreateClient.mockResolvedValue({ from: mockFrom });

    const { progressOrderStatus } = await import('@/actions/orders');
    await progressOrderStatus({ orderId: ORDER_ID });

    expect(mockCreateNotification).toHaveBeenCalledWith('buyer-1', 'order', {
      action: 'status_changed',
      orderId: ORDER_ID,
      status: 'processing',
    });
  });

  it('fires dispute notification for the seller on disputeOrder', async () => {
    mockGetProfile.mockResolvedValue(buyerProfile);
    mockGetOrderForAction.mockResolvedValue({
      id: ORDER_ID,
      status: 'processing',
      buyer_id: 'buyer-1',
      seller_id: 'seller-1',
    });

    const updateChain = createQueryChain({
      data: { id: ORDER_ID, status: 'disputed', buyer_id: 'buyer-1', seller_id: 'seller-1' },
      error: null,
    });

    mockFrom.mockReturnValue(updateChain);
    mockCreateClient.mockResolvedValue({ from: mockFrom });

    const { disputeOrder } = await import('@/actions/orders');
    await disputeOrder({ orderId: ORDER_ID, reason: 'Quality issue' });

    expect(mockCreateNotification).toHaveBeenCalledWith('seller-1', 'order', {
      action: 'disputed',
      orderId: ORDER_ID,
      reason: 'Quality issue',
    });
  });
});
