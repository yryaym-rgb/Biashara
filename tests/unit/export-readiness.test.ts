import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const SELLER_ID = '00000000-0000-0000-0000-000000000050';
const OTHER_USER_ID = '00000000-0000-0000-0000-000000000051';
const DOCUMENT_ID = '00000000-0000-0000-0000-000000000052';

const mockGetProfile = vi.fn();
const mockFrom = vi.fn();
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

const buyerProfile = {
  ...sellerProfile,
  id: 'buyer-1',
  role: 'buyer' as const,
};

function createUpdateChain(result: { data?: unknown; error?: unknown | null }) {
  const chain = {
    from: vi.fn(),
    select: vi.fn(),
    eq: vi.fn(),
    update: vi.fn(),
    maybeSingle: vi.fn(),
    single: vi.fn(),
  };

  chain.from.mockReturnValue(chain);
  chain.select.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.update.mockReturnValue(chain);
  chain.maybeSingle.mockResolvedValue(result);
  chain.single.mockResolvedValue(result);

  return chain;
}

describe('export_readiness_items RLS migration', () => {
  it('enables own-only access with admin read oversight', () => {
    const migration = readFileSync(
      resolve(process.cwd(), 'supabase/migrations/00028_export_readiness_items.sql'),
      'utf8',
    );

    expect(migration).toContain('ALTER TABLE public.export_readiness_items ENABLE ROW LEVEL SECURITY');
    expect(migration).toContain('CREATE POLICY export_readiness_items_select');
    expect(migration).toContain('user_id = auth.uid() OR public.is_admin()');
    expect(migration).toContain('CREATE POLICY export_readiness_items_insert');
    expect(migration).toContain('user_id = auth.uid()');
    expect(migration).toContain('public.is_seller_or_cooperative()');
    expect(migration).toContain('CREATE POLICY export_readiness_items_update');
    expect(migration).not.toMatch(/FOR DELETE/i);
  });

  it('defines the five fixed checklist item keys', () => {
    const migration = readFileSync(
      resolve(process.cwd(), 'supabase/migrations/00028_export_readiness_items.sql'),
      'utf8',
    );

    expect(migration).toContain("'ceec_certification'");
    expect(migration).toContain("'export_permit'");
    expect(migration).toContain("'taxes_paid'");
    expect(migration).toContain("'customs_forms'");
    expect(migration).toContain("'quality_certificates'");
  });
});

describe('updateExportReadinessItemAction authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateClient.mockReturnValue({
      from: mockFrom,
    });
  });

  it('rejects buyers', async () => {
    mockGetProfile.mockResolvedValue(buyerProfile);
    const { updateExportReadinessItemAction } = await import('@/actions/export-readiness');

    const result = await updateExportReadinessItemAction({
      itemKey: 'export_permit',
      isComplete: true,
    });

    expect(result.error).toBe('forbidden');
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('updates only the authenticated seller own row', async () => {
    mockGetProfile.mockResolvedValue(sellerProfile);

    const updateChain = createUpdateChain({
      data: {
        id: 'item-1',
        user_id: SELLER_ID,
        item_key: 'export_permit',
        is_complete: true,
        completed_at: '2026-08-11T08:00:00.000Z',
        notes: null,
        document_id: null,
        created_at: '2026-08-01T00:00:00.000Z',
        updated_at: '2026-08-11T08:00:00.000Z',
      },
      error: null,
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'export_readiness_items') {
        return updateChain;
      }
      throw new Error(`Unexpected table: ${table}`);
    });

    const { updateExportReadinessItemAction } = await import('@/actions/export-readiness');
    const result = await updateExportReadinessItemAction({
      itemKey: 'export_permit',
      isComplete: true,
    });

    expect(result.data?.is_complete).toBe(true);
    expect(updateChain.eq).toHaveBeenCalledWith('user_id', SELLER_ID);
    expect(updateChain.eq).toHaveBeenCalledWith('item_key', 'export_permit');
    expect(mockRevalidatePath).toHaveBeenCalledWith('/settings');
  });

  it('rejects document attachments that do not belong to the user', async () => {
    mockGetProfile.mockResolvedValue(sellerProfile);

    const documentChain = createUpdateChain({ data: null, error: null });
    mockFrom.mockImplementation((table: string) => {
      if (table === 'kyc_documents') {
        return documentChain;
      }
      throw new Error(`Unexpected table: ${table}`);
    });

    const { updateExportReadinessItemAction } = await import('@/actions/export-readiness');
    const result = await updateExportReadinessItemAction({
      itemKey: 'customs_forms',
      documentId: DOCUMENT_ID,
    });

    expect(result.error).toBe('documentNotFound');
    expect(documentChain.eq).toHaveBeenCalledWith('user_id', SELLER_ID);
    expect(documentChain.eq).toHaveBeenCalledWith('id', DOCUMENT_ID);
  });

  it('does not expose other users checklist rows in the update filter', async () => {
    mockGetProfile.mockResolvedValue(sellerProfile);

    const updateChain = createUpdateChain({
      data: {
        id: 'item-2',
        user_id: SELLER_ID,
        item_key: 'taxes_paid',
        is_complete: false,
        completed_at: null,
        notes: 'Paid',
        document_id: null,
        created_at: '2026-08-01T00:00:00.000Z',
        updated_at: '2026-08-11T08:00:00.000Z',
      },
      error: null,
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'export_readiness_items') {
        return updateChain;
      }
      throw new Error(`Unexpected table: ${table}`);
    });

    const { updateExportReadinessItemAction } = await import('@/actions/export-readiness');
    await updateExportReadinessItemAction({
      itemKey: 'taxes_paid',
      notes: 'Paid',
    });

    const userIdFilters = updateChain.eq.mock.calls.filter(([field]) => field === 'user_id');
    expect(userIdFilters).toEqual([['user_id', SELLER_ID]]);
    expect(userIdFilters.some(([, value]) => value === OTHER_USER_ID)).toBe(false);
  });
});

describe('export readiness privacy surface', () => {
  it('is only referenced from private settings surfaces', () => {
    const repoRoot = process.cwd();
    const allowedPaths = [
      'components/platform/export-readiness-panel.tsx',
      'components/platform/settings-page-content.tsx',
      'app/[locale]/(platform)/settings/page.tsx',
      'lib/platform/export-readiness.ts',
      'actions/export-readiness.ts',
      'lib/constants/export-readiness.ts',
      'lib/validators/export-readiness.ts',
      'tests/unit/export-readiness.test.ts',
      'types/database.types.ts',
      'messages/fr.json',
      'messages/en.json',
      'supabase/migrations/00028_export_readiness_items.sql',
    ];

    const sourceFiles = [
      'components',
      'app',
      'lib',
      'actions',
    ].flatMap((dir) => {
      const { readdirSync, statSync } = require('node:fs');
      const { join } = require('node:path');

      function walk(current: string): string[] {
        return readdirSync(current).flatMap((entry: string) => {
          const fullPath = join(current, entry);
          if (statSync(fullPath).isDirectory()) {
            return walk(fullPath);
          }
          if (/\.(tsx|ts|jsx|js)$/.test(entry)) {
            return [fullPath];
          }
          return [];
        });
      }

      return walk(resolve(repoRoot, dir));
    });

    const offenders = sourceFiles.filter((filePath: string) => {
      const content = readFileSync(filePath, 'utf8');
      if (!content.includes('exportReadiness') && !content.includes('export_readiness')) {
        return false;
      }

      const relative = filePath.replace(`${repoRoot}/`, '');
      return !allowedPaths.includes(relative);
    });

    expect(offenders).toEqual([]);
  });
});
