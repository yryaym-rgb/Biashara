import * as React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetCooperativeLots = vi.fn();
const mockGetCooperativeSites = vi.fn();
const mockGetLotById = vi.fn();
const mockGetProfile = vi.fn();

vi.mock('@/lib/platform/lots', () => ({
  getCooperativeLots: (...args: unknown[]) => mockGetCooperativeLots(...args),
  getCooperativeSites: (...args: unknown[]) => mockGetCooperativeSites(...args),
  getLotById: (...args: unknown[]) => mockGetLotById(...args),
}));

vi.mock('@/lib/auth/session', () => ({
  getProfile: () => mockGetProfile(),
}));

vi.mock('next-intl/server', () => ({
  setRequestLocale: vi.fn(),
  getTranslations: vi.fn(async ({ namespace }: { namespace: string }) => {
    const key = (name: string) => `${namespace}.${name}`;
    return (name: string) => key(name);
  }),
}));

vi.mock('@/lib/i18n/navigation', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('@/components/ui/container', () => ({
  Container: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
}));

vi.mock('@/components/ui/empty-state', () => ({
  EmptyState: ({ title }: { title: string }) => <div data-testid="empty-state">{title}</div>,
}));

vi.mock('@/components/platform/lots-list-content', () => ({
  LotsListContent: ({
    loadError,
    lots,
  }: {
    loadError?: boolean;
    lots: unknown[];
  }) => (
    <div data-testid="lots-list" data-load-error={String(Boolean(loadError))}>
      {lots.length} lots
    </div>
  ),
}));

vi.mock('@/components/platform/lot-new-form', () => ({
  LotNewForm: ({ sites }: { sites: unknown[] }) => (
    <div data-testid="lot-new-form">{sites.length} sites</div>
  ),
}));

vi.mock('@/components/platform/lot-detail-content', () => ({
  LotDetailContent: () => <div data-testid="lot-detail">detail</div>,
}));

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NOT_FOUND');
  }),
}));

const cooperativeProfile = {
  id: 'coop-1',
  role: 'cooperative' as const,
  kyc_status: 'approved' as const,
  company_name: 'Coop Test',
  country: 'CD',
  phone: '+243900000000',
  created_at: '2026-01-01T00:00:00Z',
};

const sampleLot = {
  id: 'lot-1',
  cooperative_id: 'coop-1',
  lot_code: 'BIA-CB-2026-000001',
  mineral: 'cobalt' as const,
  initial_weight_kg: 100,
  extraction_date: '2026-01-15',
  notes: null,
  site_id: 'site-1',
  listing_id: null,
  origin_mine: 'Site A',
  origin_province: 'Lualaba',
  origin_country: 'CD',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  cooperative_site: null,
  custody_events: [],
  current_stage: null,
};

describe('lots list page loading', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetProfile.mockResolvedValue(cooperativeProfile);
  });

  it('renders when cooperative lots query fails instead of throwing', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockGetCooperativeLots.mockRejectedValue(
      new Error('relation "lot_traceability" does not exist'),
    );

    const LotsPage = (await import('@/app/[locale]/(platform)/lots/page')).default;
    const result = await LotsPage({
      params: Promise.resolve({ locale: 'fr' }),
    });

    expect(mockGetCooperativeLots).toHaveBeenCalledWith('coop-1');
    expect(consoleError).toHaveBeenCalled();
    expect(result).toBeTruthy();

    consoleError.mockRestore();
  });

  it('loads cooperative lots when query succeeds', async () => {
    mockGetCooperativeLots.mockResolvedValue([
      {
        id: 'lot-1',
        lot_code: 'BIA-CB-2026-000001',
        mineral: 'cobalt',
        custody_event_count: 1,
        current_stage: 'extraction',
      },
    ]);

    const LotsPage = (await import('@/app/[locale]/(platform)/lots/page')).default;
    const result = await LotsPage({
      params: Promise.resolve({ locale: 'fr' }),
    });

    expect(mockGetCooperativeLots).toHaveBeenCalledWith('coop-1');
    expect(result).toBeTruthy();
  });
});

describe('lot new page loading', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetProfile.mockResolvedValue(cooperativeProfile);
  });

  it('renders when cooperative sites query fails instead of throwing', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockGetCooperativeSites.mockRejectedValue(
      new Error('relation "cooperative_sites" does not exist'),
    );

    const LotNewPage = (await import('@/app/[locale]/(platform)/lots/new/page')).default;
    const result = await LotNewPage({
      params: Promise.resolve({ locale: 'fr' }),
    });

    expect(mockGetCooperativeSites).toHaveBeenCalledWith('coop-1');
    expect(consoleError).toHaveBeenCalled();
    expect(result).toBeTruthy();

    consoleError.mockRestore();
  });

  it('loads cooperative sites when query succeeds', async () => {
    mockGetCooperativeSites.mockResolvedValue([
      {
        id: 'site-1',
        cooperative_id: 'coop-1',
        site_name: 'Kolwezi',
        zea_reference: 'ZEA-1',
        province: 'Lualaba',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
    ]);

    const LotNewPage = (await import('@/app/[locale]/(platform)/lots/new/page')).default;
    const result = await LotNewPage({
      params: Promise.resolve({ locale: 'fr' }),
    });

    expect(mockGetCooperativeSites).toHaveBeenCalledWith('coop-1');
    expect(result).toBeTruthy();
  });
});

describe('lot detail page loading', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetProfile.mockResolvedValue(cooperativeProfile);
  });

  it('renders error state when lot query fails instead of throwing', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockGetLotById.mockRejectedValue(new Error('permission denied for table lot_traceability'));

    const LotDetailPage = (await import('@/app/[locale]/(platform)/lots/[id]/page')).default;
    const result = await LotDetailPage({
      params: Promise.resolve({ locale: 'fr', id: 'lot-1' }),
    });

    expect(mockGetLotById).toHaveBeenCalledWith('lot-1');
    expect(consoleError).toHaveBeenCalled();
    expect(result).toBeTruthy();

    consoleError.mockRestore();
  });

  it('renders detail when lot query succeeds', async () => {
    mockGetLotById.mockResolvedValue(sampleLot);

    const LotDetailPage = (await import('@/app/[locale]/(platform)/lots/[id]/page')).default;
    const result = await LotDetailPage({
      params: Promise.resolve({ locale: 'fr', id: 'lot-1' }),
    });

    expect(mockGetLotById).toHaveBeenCalledWith('lot-1');
    expect(result).toBeTruthy();
  });
});
