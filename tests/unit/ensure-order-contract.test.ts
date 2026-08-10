import { describe, it, expect, vi, beforeEach } from 'vitest';

const ORDER_ID = '00000000-0000-0000-0000-000000000099';
const CONTRACT_ID = '00000000-0000-0000-0000-000000000088';

const mockCreateClient = vi.fn();
const mockGenerateOrderSummaryPdf = vi.fn();
const mockGetTranslations = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => mockCreateClient(),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => {
    throw new Error('ensureOrderContract must not use service-role client');
  }),
}));

vi.mock('@/lib/contracts/generate-order-summary-pdf', () => ({
  generateOrderSummaryPdf: (...args: unknown[]) => mockGenerateOrderSummaryPdf(...args),
}));

vi.mock('next-intl/server', () => ({
  getTranslations: (...args: unknown[]) => mockGetTranslations(...args),
}));

function createContractsSelectChain(result: { data: unknown }) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue(result),
  };
}

function createContractsInsertChain(result: { data: unknown; error: unknown }) {
  return {
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
  };
}

function createStorageChain() {
  return {
    upload: vi.fn().mockResolvedValue({ error: null }),
    createSignedUrl: vi.fn().mockResolvedValue({
      data: { signedUrl: 'https://example.com/contract.pdf' },
      error: null,
    }),
  };
}

const baseOrder = {
  id: ORDER_ID,
  created_at: '2026-01-01T00:00:00.000Z',
  price_amount: 1000,
  quantity: 10,
  unit: 'mt',
  currency: 'USD',
  listing: { title: 'Cobalt lot', mineral: 'cobalt' },
  buyer: { company_name: 'Buyer Co' },
  seller: { company_name: 'Seller Co' },
} as const;

describe('ensureOrderContract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetTranslations.mockResolvedValue((key: string) => key);
    mockGenerateOrderSummaryPdf.mockResolvedValue(new Uint8Array([1, 2, 3]));
  });

  it('inserts a contract row via the user-scoped Supabase client', async () => {
    const contractsSelect = createContractsSelectChain({ data: null });
    const contractsInsert = createContractsInsertChain({
      data: {
        id: CONTRACT_ID,
        storage_path: `${ORDER_ID}/order-summary.pdf`,
        buyer_signed: false,
        seller_signed: false,
        buyer_signed_at: null,
        seller_signed_at: null,
      },
      error: null,
    });
    const storage = createStorageChain();

    let contractsCalls = 0;
    mockCreateClient.mockResolvedValue({
      from: (table: string) => {
        if (table !== 'contracts') {
          throw new Error(`Unexpected table: ${table}`);
        }
        contractsCalls += 1;
        return contractsCalls === 1 ? contractsSelect : contractsInsert;
      },
      storage: {
        from: () => storage,
      },
    });

    const { ensureOrderContract } = await import('@/lib/contracts/ensure-order-contract');
    const result = await ensureOrderContract(baseOrder as never, 'fr');

    expect(contractsInsert.insert).toHaveBeenCalledWith({
      order_id: ORDER_ID,
      storage_path: `${ORDER_ID}/order-summary.pdf`,
    });
    expect(result).toMatchObject({
      id: CONTRACT_ID,
      pdfUrl: 'https://example.com/contract.pdf',
    });
  });
});
