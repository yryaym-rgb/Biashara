import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  canSellerProgressStatus,
  formatOrderReference,
  getNextOrderStatus,
  isDisputableOrderStatus,
} from '@/lib/platform/order-status';

const ORDER_ID = '00000000-0000-0000-0000-000000000020';

const mockGetProfile = vi.fn();
const mockFrom = vi.fn();
const mockCreateClient = vi.fn();
const mockGetOrderForAction = vi.fn();
const mockRevalidatePath = vi.fn();

vi.mock('@/lib/auth/session', () => ({
  getProfile: () => mockGetProfile(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => mockCreateClient(),
}));

vi.mock('@/lib/platform/orders', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/platform/orders')>();
  return {
    ...actual,
    getOrderForAction: (...args: unknown[]) => mockGetOrderForAction(...args),
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

const buyerProfile = {
  ...sellerProfile,
  id: 'buyer-1',
  role: 'buyer' as const,
  company_name: 'Buyer Co',
};

function createUpdateChain(result: { data?: unknown; error?: unknown | null }) {
  const chain = {
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

describe('order status helpers', () => {
  it('returns the next status in the normal path', () => {
    expect(getNextOrderStatus('confirmed')).toBe('processing');
    expect(getNextOrderStatus('processing')).toBe('in_transit');
    expect(getNextOrderStatus('in_transit')).toBe('delivered');
    expect(getNextOrderStatus('delivered')).toBeNull();
  });

  it('validates seller progression sequencing', () => {
    expect(canSellerProgressStatus('confirmed', 'processing')).toBe(true);
    expect(canSellerProgressStatus('confirmed', 'in_transit')).toBe(false);
    expect(canSellerProgressStatus('processing', 'delivered')).toBe(false);
  });

  it('allows disputes only before terminal statuses', () => {
    expect(isDisputableOrderStatus('processing')).toBe(true);
    expect(isDisputableOrderStatus('delivered')).toBe(false);
    expect(isDisputableOrderStatus('disputed')).toBe(false);
  });

  it('formats a short order reference from the id', () => {
    expect(formatOrderReference('a1b2c3d4-e5f6-7890-abcd-ef1234567890')).toBe('A1B2C3D4');
  });
});

describe('order actions', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mockGetProfile.mockResolvedValue(sellerProfile);
  });

  it('progressOrderStatus advances one step for the seller', async () => {
    mockGetOrderForAction.mockResolvedValue({
      id: ORDER_ID,
      status: 'confirmed',
      buyer_id: 'buyer-1',
      seller_id: 'seller-1',
    });

    const updateChain = createUpdateChain({
      data: { id: ORDER_ID, status: 'processing' },
      error: null,
    });
    mockFrom.mockImplementation(() => updateChain);
    mockCreateClient.mockResolvedValue({ from: mockFrom });

    const { progressOrderStatus } = await import('@/actions/orders');
    const result = await progressOrderStatus({ orderId: ORDER_ID });

    expect(result.data).toEqual({ id: ORDER_ID, status: 'processing' });
    expect(updateChain.update).toHaveBeenCalledWith({ status: 'processing' });
    expect(mockRevalidatePath).toHaveBeenCalledWith('/orders');
    expect(mockRevalidatePath).toHaveBeenCalledWith(`/orders/${ORDER_ID}`);
  });

  it('progressOrderStatus rejects buyers', async () => {
    mockGetProfile.mockResolvedValue(buyerProfile);
    mockGetOrderForAction.mockResolvedValue({
      id: ORDER_ID,
      status: 'confirmed',
      buyer_id: 'buyer-1',
      seller_id: 'seller-1',
    });
    mockCreateClient.mockResolvedValue({ from: mockFrom });

    const { progressOrderStatus } = await import('@/actions/orders');
    const result = await progressOrderStatus({ orderId: ORDER_ID });

    expect(result.error).toBe('forbidden');
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('progressOrderStatus rejects progression from terminal delivered status', async () => {
    mockGetOrderForAction.mockResolvedValue({
      id: ORDER_ID,
      status: 'delivered',
      buyer_id: 'buyer-1',
      seller_id: 'seller-1',
    });
    mockCreateClient.mockResolvedValue({ from: mockFrom });

    const { progressOrderStatus } = await import('@/actions/orders');
    const result = await progressOrderStatus({ orderId: ORDER_ID });

    expect(result.error).toBe('invalidTransition');
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('disputeOrder marks order disputed for the buyer', async () => {
    mockGetProfile.mockResolvedValue(buyerProfile);
    mockGetOrderForAction.mockResolvedValue({
      id: ORDER_ID,
      status: 'processing',
      buyer_id: 'buyer-1',
      seller_id: 'seller-1',
    });

    const updateChain = createUpdateChain({
      data: { id: ORDER_ID, status: 'disputed' },
      error: null,
    });
    mockFrom.mockImplementation(() => updateChain);
    mockCreateClient.mockResolvedValue({ from: mockFrom });

    const { disputeOrder } = await import('@/actions/orders');
    const result = await disputeOrder({
      orderId: ORDER_ID,
      reason: 'La quantité reçue ne correspond pas à la commande.',
    });

    expect(result.data).toEqual({ id: ORDER_ID, status: 'disputed' });
    expect(updateChain.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'disputed',
        dispute_reason: 'La quantité reçue ne correspond pas à la commande.',
      }),
    );
    expect(mockRevalidatePath).toHaveBeenCalledWith(`/orders/${ORDER_ID}`);
  });

  it('disputeOrder rejects sellers', async () => {
    mockGetOrderForAction.mockResolvedValue({
      id: ORDER_ID,
      status: 'processing',
      buyer_id: 'buyer-1',
      seller_id: 'seller-1',
    });
    mockCreateClient.mockResolvedValue({ from: mockFrom });

    const { disputeOrder } = await import('@/actions/orders');
    const result = await disputeOrder({
      orderId: ORDER_ID,
      reason: 'Problème de qualité constaté sur le lot.',
    });

    expect(result.error).toBe('forbidden');
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('disputeOrder rejects terminal statuses', async () => {
    mockGetProfile.mockResolvedValue(buyerProfile);
    mockGetOrderForAction.mockResolvedValue({
      id: ORDER_ID,
      status: 'delivered',
      buyer_id: 'buyer-1',
      seller_id: 'seller-1',
    });
    mockCreateClient.mockResolvedValue({ from: mockFrom });

    const { disputeOrder } = await import('@/actions/orders');
    const result = await disputeOrder({
      orderId: ORDER_ID,
      reason: 'Problème signalé après livraison.',
    });

    expect(result.error).toBe('invalidTransition');
    expect(mockFrom).not.toHaveBeenCalled();
  });
});
