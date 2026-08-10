import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  canSelectRfpWinner,
  canViewRfpBid,
  isCompetingSellerBlocked,
} from '@/lib/rfps/access';
import { getNotificationContent } from '@/lib/notifications/messages';

const BUYER_ID = '00000000-0000-0000-0000-000000000001';
const SELLER_A_ID = '00000000-0000-0000-0000-000000000002';
const SELLER_B_ID = '00000000-0000-0000-0000-000000000003';
const ADMIN_ID = '00000000-0000-0000-0000-000000000099';
const RFP_ID = '00000000-0000-0000-0000-000000000010';
const BID_A_ID = '00000000-0000-0000-0000-000000000020';
const BID_B_ID = '00000000-0000-0000-0000-000000000021';

const {
  mockCreateNotification,
  mockFrom,
  mockCreateClient,
  mockGetProfile,
  mockRevalidatePath,
} = vi.hoisted(() => ({
  mockCreateNotification: vi.fn().mockResolvedValue({ id: 'mock-notification-id' }),
  mockFrom: vi.fn(),
  mockCreateClient: vi.fn(),
  mockGetProfile: vi.fn(),
  mockRevalidatePath: vi.fn(),
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

function createQueryChain(result: { data?: unknown; error?: unknown | null; count?: number | null }) {
  const chain = {
    select: vi.fn(),
    eq: vi.fn(),
    update: vi.fn(),
    insert: vi.fn(),
    order: vi.fn(),
    maybeSingle: vi.fn(),
    single: vi.fn(),
    then: (onFulfilled: (value: typeof result) => unknown) => onFulfilled(result),
  };

  chain.select.mockImplementation(() => chain);
  chain.eq.mockImplementation(() => chain);
  chain.update.mockImplementation(() => chain);
  chain.insert.mockImplementation(() => chain);
  chain.order.mockImplementation(() => chain);
  chain.maybeSingle.mockResolvedValue(result);
  chain.single.mockResolvedValue(result);

  return chain;
}

describe('RFP bid visibility (RLS mirror)', () => {
  const baseContext = {
    bidId: BID_A_ID,
    rfpId: RFP_ID,
    sellerId: SELLER_A_ID,
    buyerId: BUYER_ID,
    isAdmin: false,
  };

  it('allows the RFP buyer to view any bid on their request', () => {
    expect(
      canViewRfpBid({
        ...baseContext,
        viewerId: BUYER_ID,
      }),
    ).toBe(true);
  });

  it('allows a seller to view only their own bid', () => {
    expect(
      canViewRfpBid({
        ...baseContext,
        viewerId: SELLER_A_ID,
      }),
    ).toBe(true);

    expect(
      canViewRfpBid({
        ...baseContext,
        viewerId: SELLER_B_ID,
      }),
    ).toBe(false);
  });

  it('blocks a competing seller from viewing another seller bid', () => {
    expect(
      isCompetingSellerBlocked({
        ...baseContext,
        viewerId: SELLER_B_ID,
      }),
    ).toBe(true);
  });

  it('allows admins to view any bid', () => {
    expect(
      canViewRfpBid({
        ...baseContext,
        viewerId: ADMIN_ID,
        isAdmin: true,
      }),
    ).toBe(true);

    expect(
      isCompetingSellerBlocked({
        ...baseContext,
        viewerId: ADMIN_ID,
        isAdmin: true,
      }),
    ).toBe(false);
  });

  it('denies anonymous viewers bid access', () => {
    expect(
      canViewRfpBid({
        ...baseContext,
        viewerId: null,
      }),
    ).toBe(false);
  });
});

describe('RFP winner selection authorization', () => {
  it('allows only the RFP buyer while the request is open', () => {
    expect(
      canSelectRfpWinner({
        rfpId: RFP_ID,
        buyerId: BUYER_ID,
        rfpStatus: 'open',
        actorId: BUYER_ID,
        actorRole: 'buyer',
      }),
    ).toBe(true);
  });

  it('rejects a seller attempting to select a winner', () => {
    expect(
      canSelectRfpWinner({
        rfpId: RFP_ID,
        buyerId: BUYER_ID,
        rfpStatus: 'open',
        actorId: SELLER_A_ID,
        actorRole: 'seller',
      }),
    ).toBe(false);
  });

  it('rejects selection after the RFP is already awarded', () => {
    expect(
      canSelectRfpWinner({
        rfpId: RFP_ID,
        buyerId: BUYER_ID,
        rfpStatus: 'awarded',
        actorId: BUYER_ID,
        actorRole: 'buyer',
      }),
    ).toBe(false);
  });

  it('allows admins to select a winner', () => {
    expect(
      canSelectRfpWinner({
        rfpId: RFP_ID,
        buyerId: BUYER_ID,
        rfpStatus: 'open',
        actorId: ADMIN_ID,
        actorRole: 'admin',
      }),
    ).toBe(true);
  });
});

describe('RFP notification content', () => {
  it('routes bid-received notifications to the RFP detail page', () => {
    const content = getNotificationContent('rfp', {
      action: 'bid_received',
      rfpId: RFP_ID,
      mineral: 'cobalt',
      bidId: BID_A_ID,
    });

    expect(content.messageKey).toBe('rfpBidReceived');
    expect(content.href).toBe(`/rfps/${RFP_ID}`);
  });

  it('uses distinct message keys for selected and rejected bidders', () => {
    const selected = getNotificationContent('rfp', {
      action: 'bid_selected',
      rfpId: RFP_ID,
      mineral: 'copper',
      bidId: BID_A_ID,
    });
    const rejected = getNotificationContent('rfp', {
      action: 'bid_rejected',
      rfpId: RFP_ID,
      mineral: 'copper',
      bidId: BID_B_ID,
    });

    expect(selected.messageKey).toBe('rfpBidSelected');
    expect(rejected.messageKey).toBe('rfpBidRejected');
    expect(selected.messageKey).not.toBe(rejected.messageKey);
  });
});

describe('RFP server actions', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mockCreateNotification.mockResolvedValue({ id: 'mock-notification-id' });
  });

  it('rejects winner selection from a non-buyer at the action layer', async () => {
    mockGetProfile.mockResolvedValue({
      id: SELLER_A_ID,
      role: 'seller',
      kyc_status: 'approved',
    });

    const rfpFetch = createQueryChain({
      data: { id: RFP_ID, buyer_id: BUYER_ID, status: 'open', mineral: 'gold' },
    });
    mockFrom.mockReturnValue(rfpFetch);
    mockCreateClient.mockResolvedValue({ from: mockFrom });

    const { selectRfpBid } = await import('@/actions/rfps');
    const result = await selectRfpBid({ rfpId: RFP_ID, bidId: BID_A_ID });

    expect(result).toEqual({ error: 'forbidden' });
    expect(mockCreateNotification).not.toHaveBeenCalled();
  });

  it('notifies every bidder with distinct payloads when the buyer selects a winner', async () => {
    mockGetProfile.mockResolvedValue({
      id: BUYER_ID,
      role: 'buyer',
      kyc_status: 'approved',
    });

    const rfpFetch = createQueryChain({
      data: { id: RFP_ID, buyer_id: BUYER_ID, status: 'open', mineral: 'gold' },
    });
    const selectedBidFetch = createQueryChain({
      data: { id: BID_A_ID, seller_id: SELLER_A_ID, status: 'pending' },
    });
    const allBidsFetch = createQueryChain({
      data: [
        { id: BID_A_ID, seller_id: SELLER_A_ID, status: 'pending' },
        { id: BID_B_ID, seller_id: SELLER_B_ID, status: 'pending' },
      ],
    });
    const rfpUpdate = createQueryChain({ error: null });
    const bidUpdate = createQueryChain({ error: null });
    const existingConversation = createQueryChain({ data: null });
    const createdConversation = {
      from: vi.fn(),
      insert: vi.fn(),
      select: vi.fn(),
      single: vi.fn(),
    };
    createdConversation.from.mockReturnValue(createdConversation);
    createdConversation.insert.mockReturnValue(createdConversation);
    createdConversation.select.mockReturnValue(createdConversation);
    createdConversation.single.mockResolvedValue({
      data: { id: 'conversation-1' },
      error: null,
    });

    mockFrom
      .mockReturnValueOnce(rfpFetch)
      .mockReturnValueOnce(selectedBidFetch)
      .mockReturnValueOnce(allBidsFetch)
      .mockReturnValueOnce(rfpUpdate)
      .mockReturnValueOnce(bidUpdate)
      .mockReturnValueOnce(bidUpdate)
      .mockReturnValueOnce(existingConversation)
      .mockReturnValueOnce(createdConversation);

    mockCreateClient.mockResolvedValue({ from: mockFrom });

    const { selectRfpBid } = await import('@/actions/rfps');
    const result = await selectRfpBid({ rfpId: RFP_ID, bidId: BID_A_ID });

    expect(result).toEqual({ conversationId: 'conversation-1' });
    expect(mockCreateNotification).toHaveBeenCalledTimes(2);
    expect(mockCreateNotification).toHaveBeenCalledWith(SELLER_A_ID, 'rfp', {
      action: 'bid_selected',
      rfpId: RFP_ID,
      mineral: 'gold',
      bidId: BID_A_ID,
    });
    expect(mockCreateNotification).toHaveBeenCalledWith(SELLER_B_ID, 'rfp', {
      action: 'bid_rejected',
      rfpId: RFP_ID,
      mineral: 'gold',
      bidId: BID_B_ID,
    });
  });

  it('notifies the buyer when a seller submits a bid', async () => {
    mockGetProfile.mockResolvedValue({
      id: SELLER_A_ID,
      role: 'seller',
      kyc_status: 'approved',
    });

    const rfpFetch = createQueryChain({
      data: { id: RFP_ID, buyer_id: BUYER_ID, status: 'open', mineral: 'coltan' },
    });
    const insertBid = {
      from: vi.fn(),
      insert: vi.fn(),
      select: vi.fn(),
      single: vi.fn(),
    };
    insertBid.from.mockReturnValue(insertBid);
    insertBid.insert.mockReturnValue(insertBid);
    insertBid.select.mockReturnValue(insertBid);
    insertBid.single.mockResolvedValue({ data: { id: BID_A_ID }, error: null });

    mockFrom.mockReturnValueOnce(rfpFetch).mockReturnValueOnce(insertBid);
    mockCreateClient.mockResolvedValue({ from: mockFrom });

    const { submitRfpBid } = await import('@/actions/rfps');
    await submitRfpBid({
      rfpId: RFP_ID,
      offeredPrice: 1200,
      quantity: 10,
    });

    expect(mockCreateNotification).toHaveBeenCalledWith(BUYER_ID, 'rfp', {
      action: 'bid_received',
      rfpId: RFP_ID,
      mineral: 'coltan',
      bidId: BID_A_ID,
    });
  });
});
