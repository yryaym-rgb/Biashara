import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  canSellerProgressShipmentStatus,
  getNextShipmentStatus,
  getShipmentProgressOptions,
} from '@/lib/platform/shipment-status';

const ORDER_ID = '00000000-0000-0000-0000-000000000030';
const SHIPMENT_ID = '00000000-0000-0000-0000-000000000031';

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
    maybeSingle: vi.fn(),
  };

  chain.from.mockReturnValue(chain);
  chain.update.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.select.mockReturnValue(chain);
  chain.single.mockResolvedValue(result);
  chain.maybeSingle.mockResolvedValue(result);

  return chain;
}

function createSelectChain(result: { data?: unknown; error?: unknown | null }) {
  const chain = {
    from: vi.fn(),
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn(),
    single: vi.fn(),
  };

  chain.from.mockReturnValue(chain);
  chain.select.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.maybeSingle.mockResolvedValue(result);
  chain.single.mockResolvedValue(result);

  return chain;
}

describe('shipment status helpers', () => {
  it('returns the next status in the normal path', () => {
    expect(getNextShipmentStatus('pending')).toBe('picked_up');
    expect(getNextShipmentStatus('picked_up')).toBe('in_transit');
    expect(getNextShipmentStatus('in_transit')).toBe('customs');
    expect(getNextShipmentStatus('customs')).toBe('delivered');
    expect(getNextShipmentStatus('delivered')).toBeNull();
  });

  it('validates seller progression sequencing', () => {
    expect(canSellerProgressShipmentStatus('pending', 'picked_up')).toBe(true);
    expect(canSellerProgressShipmentStatus('pending', 'in_transit')).toBe(false);
    expect(canSellerProgressShipmentStatus('in_transit', 'customs')).toBe(true);
  });

  it('allows exception from any non-exception state', () => {
    expect(canSellerProgressShipmentStatus('pending', 'exception')).toBe(true);
    expect(canSellerProgressShipmentStatus('customs', 'exception')).toBe(true);
    expect(canSellerProgressShipmentStatus('exception', 'exception')).toBe(false);
    expect(canSellerProgressShipmentStatus('exception', 'delivered')).toBe(false);
  });

  it('exposes one normal step plus exception in progress options', () => {
    expect(getShipmentProgressOptions('pending')).toEqual(['picked_up', 'exception']);
    expect(getShipmentProgressOptions('delivered')).toEqual([]);
  });
});

describe('contract confirmation actions', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mockGetProfile.mockResolvedValue(buyerProfile);
  });

  it('confirmOrderTerms allows only the buyer to confirm as buyer', async () => {
    mockGetOrderForAction.mockResolvedValue({
      id: ORDER_ID,
      status: 'confirmed',
      buyer_id: 'buyer-1',
      seller_id: 'seller-1',
    });

    const orderSelect = createSelectChain({
      data: { buyer_id: 'buyer-1', seller_id: 'seller-1' },
      error: null,
    });
    const contractSelect = createSelectChain({
      data: { buyer_signed: false, seller_signed: false },
      error: null,
    });
    const updateChain = createUpdateChain({
      data: { order_id: ORDER_ID, buyer_signed: true },
      error: null,
    });

    let contractsCall = 0;
    mockFrom.mockImplementation((table: string) => {
      if (table === 'orders') {
        return orderSelect;
      }
      if (table === 'contracts') {
        contractsCall += 1;
        return contractsCall === 1 ? contractSelect : updateChain;
      }
      return updateChain;
    });
    mockCreateClient.mockResolvedValue({ from: mockFrom });

    const { confirmOrderTerms } = await import('@/actions/contracts');
    const result = await confirmOrderTerms({ orderId: ORDER_ID, party: 'buyer' });

    expect(result.data).toEqual({ order_id: ORDER_ID, buyer_signed: true });
    expect(updateChain.update).toHaveBeenCalledWith(
      expect.objectContaining({ buyer_signed: true }),
    );
  });

  it('confirmOrderTerms rejects buyer confirming as seller', async () => {
    const orderSelect = createSelectChain({
      data: { buyer_id: 'buyer-1', seller_id: 'seller-1' },
      error: null,
    });
    mockFrom.mockImplementation(() => orderSelect);
    mockCreateClient.mockResolvedValue({ from: mockFrom });

    const { confirmOrderTerms } = await import('@/actions/contracts');
    const result = await confirmOrderTerms({ orderId: ORDER_ID, party: 'seller' });

    expect(result.error).toBe('forbidden');
  });

  it('confirmOrderTerms rejects seller confirming as buyer', async () => {
    mockGetProfile.mockResolvedValue(sellerProfile);
    const orderSelect = createSelectChain({
      data: { buyer_id: 'buyer-1', seller_id: 'seller-1' },
      error: null,
    });
    mockFrom.mockImplementation(() => orderSelect);
    mockCreateClient.mockResolvedValue({ from: mockFrom });

    const { confirmOrderTerms } = await import('@/actions/contracts');
    const result = await confirmOrderTerms({ orderId: ORDER_ID, party: 'buyer' });

    expect(result.error).toBe('forbidden');
  });
});

describe('shipment actions', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mockGetProfile.mockResolvedValue(sellerProfile);
    mockGetOrderForAction.mockResolvedValue({
      id: ORDER_ID,
      status: 'confirmed',
      buyer_id: 'buyer-1',
      seller_id: 'seller-1',
    });
  });

  it('progressShipmentStatus advances one step for the seller', async () => {
    const shipmentSelect = createSelectChain({
      data: {
        id: SHIPMENT_ID,
        order_id: ORDER_ID,
        status: 'pending',
        checkpoints: [],
      },
      error: null,
    });
    const updateChain = createUpdateChain({
      data: { id: SHIPMENT_ID, status: 'picked_up' },
      error: null,
    });

    let shipmentCalls = 0;
    mockFrom.mockImplementation(() => {
      shipmentCalls += 1;
      return shipmentCalls === 1 ? shipmentSelect : updateChain;
    });
    mockCreateClient.mockResolvedValue({ from: mockFrom });

    const { progressShipmentStatus } = await import('@/actions/shipments');
    const result = await progressShipmentStatus({
      shipmentId: SHIPMENT_ID,
      status: 'picked_up',
    });

    expect(result).toMatchObject({ data: { id: SHIPMENT_ID, status: 'picked_up' } });
    expect(updateChain.update).toHaveBeenCalledWith({ status: 'picked_up' });
  });

  it('progressShipmentStatus rejects skipping steps', async () => {
    const shipmentSelect = createSelectChain({
      data: {
        id: SHIPMENT_ID,
        order_id: ORDER_ID,
        status: 'pending',
        checkpoints: [],
      },
      error: null,
    });
    mockFrom.mockImplementation(() => shipmentSelect);
    mockCreateClient.mockResolvedValue({ from: mockFrom });

    const { progressShipmentStatus } = await import('@/actions/shipments');
    const result = await progressShipmentStatus({
      shipmentId: SHIPMENT_ID,
      status: 'in_transit',
    });

    expect(result.error).toBe('invalidTransition');
  });

  it('progressShipmentStatus allows exception from any state', async () => {
    const shipmentSelect = createSelectChain({
      data: {
        id: SHIPMENT_ID,
        order_id: ORDER_ID,
        status: 'in_transit',
        checkpoints: [],
      },
      error: null,
    });
    const updateChain = createUpdateChain({
      data: { id: SHIPMENT_ID, status: 'exception' },
      error: null,
    });

    let shipmentCalls = 0;
    mockFrom.mockImplementation(() => {
      shipmentCalls += 1;
      return shipmentCalls === 1 ? shipmentSelect : updateChain;
    });
    mockCreateClient.mockResolvedValue({ from: mockFrom });

    const { progressShipmentStatus } = await import('@/actions/shipments');
    const result = await progressShipmentStatus({
      shipmentId: SHIPMENT_ID,
      status: 'exception',
    });

    expect(result).toMatchObject({ data: { id: SHIPMENT_ID, status: 'exception' } });
  });

  it('progressShipmentStatus rejects buyers', async () => {
    mockGetProfile.mockResolvedValue(buyerProfile);
    const shipmentSelect = createSelectChain({
      data: {
        id: SHIPMENT_ID,
        order_id: ORDER_ID,
        status: 'pending',
        checkpoints: [],
      },
      error: null,
    });
    mockFrom.mockImplementation(() => shipmentSelect);
    mockCreateClient.mockResolvedValue({ from: mockFrom });

    const { progressShipmentStatus } = await import('@/actions/shipments');
    const result = await progressShipmentStatus({
      shipmentId: SHIPMENT_ID,
      status: 'picked_up',
    });

    expect(result.error).toBe('forbidden');
  });
});
