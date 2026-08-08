import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isValidLotCode, getCurrentCustodyStage } from '@/lib/platform/custody-stages';

const COOPERATIVE_ID = '00000000-0000-0000-0000-000000000040';
const SITE_ID = '00000000-0000-0000-0000-000000000041';
const LOT_ID = '00000000-0000-0000-0000-000000000042';

const mockGetProfile = vi.fn();
const mockFrom = vi.fn();
const mockRpc = vi.fn();
const mockCreateClient = vi.fn();
const mockRevalidatePath = vi.fn();

vi.mock('@/lib/auth/session', () => ({
  getProfile: () => mockGetProfile(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => mockCreateClient(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}));

const cooperativeProfile = {
  id: COOPERATIVE_ID,
  role: 'cooperative' as const,
  company_name: 'Coop Minière',
  country: 'CD',
  phone: null,
  locale: 'fr' as const,
  kyc_status: 'approved' as const,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const buyerProfile = {
  ...cooperativeProfile,
  id: 'buyer-1',
  role: 'buyer' as const,
  kyc_status: 'approved' as const,
};

const pendingCooperativeProfile = {
  ...cooperativeProfile,
  kyc_status: 'pending' as const,
};

function createSelectChain(result: { data?: unknown; error?: unknown | null }) {
  const chain = {
    from: vi.fn(),
    select: vi.fn(),
    eq: vi.fn(),
    is: vi.fn(),
    maybeSingle: vi.fn(),
    single: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  chain.from.mockReturnValue(chain);
  chain.select.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.is.mockReturnValue(chain);
  chain.insert.mockReturnValue(chain);
  chain.update.mockReturnValue(chain);
  chain.delete.mockReturnValue(chain);
  chain.maybeSingle.mockResolvedValue(result);
  chain.single.mockResolvedValue(result);

  return chain;
}

describe('lot code helpers', () => {
  it('validates correctly formatted lot codes', () => {
    expect(isValidLotCode('BIA-CB-2026-000001')).toBe(true);
    expect(isValidLotCode('BIA-AU-2025-123456')).toBe(true);
    expect(isValidLotCode('BIA-XX-2026-000001')).toBe(false);
    expect(isValidLotCode('INVALID')).toBe(false);
  });

  it('derives current stage from custody events', () => {
    expect(getCurrentCustodyStage(['extraction', 'weighing'])).toBe('weighing');
    expect(getCurrentCustodyStage(['analysis', 'extraction'])).toBe('analysis');
    expect(getCurrentCustodyStage([])).toBeNull();
  });
});

describe('createLotAction authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateClient.mockReturnValue({
      from: mockFrom,
      rpc: mockRpc,
    });
  });

  it('rejects buyers', async () => {
    mockGetProfile.mockResolvedValue(buyerProfile);
    const { createLotAction } = await import('@/actions/lots');

    const result = await createLotAction({
      mineral: 'cobalt',
      initialWeightKg: 120,
      siteId: SITE_ID,
      extractionDate: '2026-01-15',
    });

    expect(result.error).toBe('forbidden');
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('rejects cooperatives without KYC approval', async () => {
    mockGetProfile.mockResolvedValue(pendingCooperativeProfile);
    const { createLotAction } = await import('@/actions/lots');

    const result = await createLotAction({
      mineral: 'cobalt',
      initialWeightKg: 120,
      siteId: SITE_ID,
      extractionDate: '2026-01-15',
    });

    expect(result.error).toBe('forbidden');
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('uses generate_lot_code RPC and rejects invalid codes', async () => {
    mockGetProfile.mockResolvedValue(cooperativeProfile);

    const siteSelect = createSelectChain({
      data: { id: SITE_ID, site_name: 'Site A', province: 'Lualaba' },
      error: null,
    });

    mockRpc.mockResolvedValue({ data: 'INVALID-CODE', error: null });
    mockFrom.mockImplementation(() => siteSelect);

    const { createLotAction } = await import('@/actions/lots');
    const result = await createLotAction({
      mineral: 'cobalt',
      initialWeightKg: 120,
      siteId: SITE_ID,
      extractionDate: '2026-01-15',
    });

    expect(mockRpc).toHaveBeenCalledWith('generate_lot_code', { p_mineral: 'cobalt' });
    expect(result.error).toBe('lotCodeInvalid');
  });

  it('creates lot and extraction event for approved cooperative', async () => {
    mockGetProfile.mockResolvedValue(cooperativeProfile);

    const siteSelect = createSelectChain({
      data: { id: SITE_ID, site_name: 'Site A', province: 'Lualaba' },
      error: null,
    });

    const lotInsertChain = createSelectChain({
      data: { id: LOT_ID, lot_code: 'BIA-CB-2026-000001' },
      error: null,
    });

    const eventInsertChain = createSelectChain({
      data: { id: 'event-1' },
      error: null,
    });

    let lotCalls = 0;
    mockFrom.mockImplementation((table: string) => {
      if (table === 'cooperative_sites') {
        return siteSelect;
      }
      if (table === 'lot_traceability') {
        lotCalls += 1;
        return lotInsertChain;
      }
      if (table === 'custody_events') {
        return eventInsertChain;
      }
      return siteSelect;
    });

    mockRpc.mockResolvedValue({ data: 'BIA-CB-2026-000001', error: null });

    const { createLotAction } = await import('@/actions/lots');
    const result = await createLotAction({
      mineral: 'cobalt',
      initialWeightKg: 120,
      siteId: SITE_ID,
      extractionDate: '2026-01-15',
      notes: 'Lot test',
    });

    expect(result.error).toBeUndefined();
    expect(result.data?.lot_code).toBe('BIA-CB-2026-000001');
    expect(lotInsertChain.insert).toHaveBeenCalled();
    expect(eventInsertChain.insert).toHaveBeenCalled();
    expect(lotCalls).toBeGreaterThan(0);
  });
});

describe('addLotCustodyCheckpointAction authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateClient.mockReturnValue({
      from: mockFrom,
      rpc: mockRpc,
    });
  });

  it('rejects buyers', async () => {
    mockGetProfile.mockResolvedValue(buyerProfile);
    const { addLotCustodyCheckpointAction } = await import('@/actions/lots');

    const result = await addLotCustodyCheckpointAction({
      lotId: LOT_ID,
      eventType: 'weighing',
      note: 'Pesée effectuée',
    });

    expect(result.error).toBe('forbidden');
  });
});
