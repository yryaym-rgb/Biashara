import * as React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetCooperativeSites = vi.fn();
const mockGetUserKycDocuments = vi.fn();
const mockGetUserListings = vi.fn();
const mockGetProfile = vi.fn();
const mockGetUser = vi.fn();

vi.mock('@/lib/platform/lots', () => ({
  getCooperativeSites: (...args: unknown[]) => mockGetCooperativeSites(...args),
}));

vi.mock('@/lib/admin/queries', () => ({
  getUserKycDocuments: (...args: unknown[]) => mockGetUserKycDocuments(...args),
  getUserListings: (...args: unknown[]) => mockGetUserListings(...args),
}));

vi.mock('@/lib/auth/session', () => ({
  getProfile: () => mockGetProfile(),
  getUser: () => mockGetUser(),
}));

vi.mock('next-intl/server', () => ({
  setRequestLocale: vi.fn(),
}));

vi.mock('@/components/ui/container', () => ({
  Container: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: () => <div data-testid="skeleton" />,
}));

vi.mock('@/components/platform/settings-page-content', () => ({
  SettingsPageContent: () => <div data-testid="settings-content">Settings</div>,
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

describe('settings page cooperative sites loading', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetProfile.mockResolvedValue(cooperativeProfile);
    mockGetUser.mockResolvedValue({ email: 'coop@example.com' });
    mockGetUserKycDocuments.mockResolvedValue([]);
    mockGetUserListings.mockResolvedValue([]);
  });

  it('renders settings when cooperative sites query fails instead of throwing', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockGetCooperativeSites.mockRejectedValue(new Error('relation "cooperative_sites" does not exist'));

    const SettingsPage = (await import('@/app/[locale]/(platform)/settings/page')).default;
    const result = await SettingsPage({
      params: Promise.resolve({ locale: 'fr' }),
      searchParams: Promise.resolve({}),
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

    const SettingsPage = (await import('@/app/[locale]/(platform)/settings/page')).default;
    const result = await SettingsPage({
      params: Promise.resolve({ locale: 'fr' }),
      searchParams: Promise.resolve({ tab: 'profile' }),
    });

    expect(mockGetCooperativeSites).toHaveBeenCalledWith('coop-1');
    expect(result).toBeTruthy();
  });
});
