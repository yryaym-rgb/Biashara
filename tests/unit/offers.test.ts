import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  buildOfferChains,
  canRespondToOffer,
  getOfferChainDepth,
  isSellerTurn,
  isWaitingOnOtherParty,
  type PlatformOfferRow,
} from '@/lib/platform/offer-chain';

const OFFER_ID = '00000000-0000-0000-0000-000000000001';
const OFFER_ID_2 = '00000000-0000-0000-0000-000000000002';
const ORDER_ID = '00000000-0000-0000-0000-000000000010';

const listing = {
  id: 'listing-1',
  title: 'Cobalt lot',
  mineral: 'cobalt' as const,
  unit: 'MT' as const,
  price_currency: 'USD',
  seller_id: 'seller-1',
  listing_photos: [],
};

function makeOffer(
  overrides: Partial<PlatformOfferRow> & Pick<PlatformOfferRow, 'id' | 'status' | 'parent_offer_id'>,
): PlatformOfferRow {
  return {
    listing_id: listing.id,
    buyer_id: 'buyer-1',
    offered_price: 1000,
    quantity: 10,
    message: null,
    created_at: '2026-01-01T00:00:00.000Z',
    buyer: { company_name: 'Buyer Co' },
    seller: { company_name: 'Seller Co' },
    order_id: null,
    listing,
    ...overrides,
  };
}

describe('offer chain helpers', () => {
  it('computes chain depth from parent links', () => {
    const root = makeOffer({ id: 'o1', status: 'countered', parent_offer_id: null });
    const child = makeOffer({ id: 'o2', status: 'pending', parent_offer_id: 'o1' });
    const map = new Map([
      ['o1', root],
      ['o2', child],
    ]);

    expect(getOfferChainDepth(root, map)).toBe(0);
    expect(getOfferChainDepth(child, map)).toBe(1);
  });

  it('alternates respondent turns by depth', () => {
    expect(isSellerTurn(0)).toBe(true);
    expect(isSellerTurn(1)).toBe(false);
    expect(isSellerTurn(2)).toBe(true);
  });

  it('groups offers into chronological chains', () => {
    const root = makeOffer({
      id: 'o1',
      status: 'countered',
      parent_offer_id: null,
      created_at: '2026-01-01T00:00:00.000Z',
    });
    const child = makeOffer({
      id: 'o2',
      status: 'pending',
      parent_offer_id: 'o1',
      created_at: '2026-01-02T00:00:00.000Z',
    });

    const chains = buildOfferChains([child, root]);
    expect(chains).toHaveLength(1);
    expect(chains[0]?.latest.id).toBe('o2');
    expect(chains[0]?.offers.map((offer) => offer.id)).toEqual(['o1', 'o2']);
  });

  it('allows only the seller to act on the initial pending offer', () => {
    const offer = makeOffer({ id: 'o1', status: 'pending', parent_offer_id: null });
    const map = new Map([[offer.id, offer]]);

    expect(canRespondToOffer(offer, 'seller-1', 0)).toBe(true);
    expect(canRespondToOffer(offer, 'buyer-1', 0)).toBe(false);
    expect(isWaitingOnOtherParty(offer, 'buyer-1', 0)).toBe(true);
  });

  it('allows the buyer to act after a seller counter', () => {
    const root = makeOffer({ id: 'o1', status: 'countered', parent_offer_id: null });
    const latest = makeOffer({ id: 'o2', status: 'pending', parent_offer_id: 'o1' });
    const map = new Map([
      ['o1', root],
      ['o2', latest],
    ]);
    const depth = getOfferChainDepth(latest, map);

    expect(canRespondToOffer(latest, 'buyer-1', depth)).toBe(true);
    expect(canRespondToOffer(latest, 'seller-1', depth)).toBe(false);
  });
});

const mockGetProfile = vi.fn();
const mockRpc = vi.fn();
const mockFrom = vi.fn();
const mockCreateClient = vi.fn();
const mockGetOfferForAction = vi.fn();
const mockRevalidatePath = vi.fn();

vi.mock('@/lib/auth/session', () => ({
  getProfile: () => mockGetProfile(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => mockCreateClient(),
}));

vi.mock('@/lib/platform/offers', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/platform/offers')>();
  return {
    ...actual,
    getOfferForAction: (...args: unknown[]) => mockGetOfferForAction(...args),
  };
});

vi.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}));

const sellerProfile = {
  id: 'seller-1',
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
  const chain: {
    from: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    select: ReturnType<typeof vi.fn>;
    single: ReturnType<typeof vi.fn>;
  } = {
    from: vi.fn(),
    update: vi.fn(),
    eq: vi.fn(),
    select: vi.fn(),
    single: vi.fn(),
  };

  chain.from.mockReturnValue(chain);
  chain.update.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.select.mockReturnValue(chain);
  chain.single.mockResolvedValue(result);

  return chain;
}

describe('offer actions', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mockGetProfile.mockResolvedValue(sellerProfile);
  });

  it('acceptOffer calls create_order_from_offer RPC for authorized seller', async () => {
    const pendingOffer = makeOffer({ id: OFFER_ID, status: 'pending', parent_offer_id: null });
    mockGetOfferForAction.mockResolvedValue(pendingOffer);
    mockRpc.mockResolvedValue({ data: ORDER_ID, error: null });
    mockCreateClient.mockResolvedValue({ rpc: mockRpc });

    const { acceptOffer } = await import('@/actions/offers');
    const result = await acceptOffer({ offerId: OFFER_ID });

    expect(result.orderId).toBe(ORDER_ID);
    expect(mockRpc).toHaveBeenCalledWith('create_order_from_offer', {
      p_offer_id: OFFER_ID,
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith('/offers');
  });

  it('acceptOffer rejects unauthorized buyer on initial seller turn', async () => {
    mockGetProfile.mockResolvedValue({
      ...sellerProfile,
      id: 'buyer-1',
      role: 'buyer',
    });
    const pendingOffer = makeOffer({ id: OFFER_ID, status: 'pending', parent_offer_id: null });
    mockGetOfferForAction.mockResolvedValue(pendingOffer);
    mockCreateClient.mockResolvedValue({ rpc: mockRpc });

    const { acceptOffer } = await import('@/actions/offers');
    const result = await acceptOffer({ offerId: OFFER_ID });

    expect(result.error).toBe('forbidden');
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it('counterOffer marks parent countered and inserts pending child', async () => {
    const pendingOffer = makeOffer({ id: OFFER_ID, status: 'pending', parent_offer_id: null });
    mockGetOfferForAction.mockResolvedValue(pendingOffer);

    const updateChain = createUpdateChain({ data: { id: OFFER_ID }, error: null });
    const insertChain = {
      from: vi.fn(),
      insert: vi.fn(),
      select: vi.fn(),
      single: vi.fn(),
    };
    insertChain.from.mockReturnValue(insertChain);
    insertChain.insert.mockReturnValue(insertChain);
    insertChain.select.mockReturnValue(insertChain);
    insertChain.single.mockResolvedValue({ data: { id: OFFER_ID_2 }, error: null });

    mockFrom
      .mockImplementationOnce(() => updateChain)
      .mockImplementationOnce(() => insertChain);

    mockCreateClient.mockResolvedValue({ from: mockFrom });

    const { counterOffer } = await import('@/actions/offers');
    const result = await counterOffer({
      parentOfferId: OFFER_ID,
      offeredPrice: 1200,
      quantity: 8,
      message: 'Counter',
    });

    expect(result.data).toEqual({ id: OFFER_ID_2 });
    expect(updateChain.update).toHaveBeenCalledWith({ status: 'countered' });
    expect(insertChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        parent_offer_id: OFFER_ID,
        buyer_id: 'buyer-1',
        status: 'pending',
      }),
    );
  });

  it('declineOffer updates status for authorized seller', async () => {
    const pendingOffer = makeOffer({ id: OFFER_ID, status: 'pending', parent_offer_id: null });
    mockGetOfferForAction.mockResolvedValue(pendingOffer);

    const updateChain = createUpdateChain({
      data: { id: OFFER_ID, status: 'declined' },
      error: null,
    });
    mockFrom.mockImplementation(() => updateChain);
    mockCreateClient.mockResolvedValue({ from: mockFrom });

    const { declineOffer } = await import('@/actions/offers');
    const result = await declineOffer(OFFER_ID);

    expect(result.data).toEqual({ id: OFFER_ID, status: 'declined' });
    expect(updateChain.update).toHaveBeenCalledWith({ status: 'declined' });
  });
});
