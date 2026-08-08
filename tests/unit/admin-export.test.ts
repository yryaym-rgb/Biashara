import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetProfile = vi.fn();
const mockGenerateExportCsv = vi.fn();

vi.mock('@/lib/auth/session', () => ({
  getProfile: () => mockGetProfile(),
}));

vi.mock('@/lib/admin/export', () => ({
  generateExportCsv: (...args: unknown[]) => mockGenerateExportCsv(...args),
}));

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}));

const baseProfile = {
  id: '00000000-0000-0000-0000-000000000001',
  role: 'buyer' as const,
  company_name: 'Test Co',
  country: 'CD',
  phone: null,
  locale: 'fr' as const,
  kyc_status: 'approved' as const,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const adminProfile = { ...baseProfile, role: 'admin' as const };

describe('admin export authorization', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mockGenerateExportCsv.mockResolvedValue('id,name\n1,Test');
  });

  it('rejects non-admin users for CSV export', async () => {
    mockGetProfile.mockResolvedValue(baseProfile);
    const { GET } = await import('@/app/api/admin/export/[type]/route');

    const response = await GET(new Request('http://localhost/api/admin/export/users'), {
      params: Promise.resolve({ type: 'users' }),
    });

    expect(response.status).toBe(403);
    expect(mockGenerateExportCsv).not.toHaveBeenCalled();
  });

  it('allows admin users for CSV export', async () => {
    mockGetProfile.mockResolvedValue(adminProfile);
    const { GET } = await import('@/app/api/admin/export/[type]/route');

    const response = await GET(new Request('http://localhost/api/admin/export/users'), {
      params: Promise.resolve({ type: 'users' }),
    });

    expect(response.status).toBe(200);
    expect(mockGenerateExportCsv).toHaveBeenCalledWith('users', expect.any(Object));
    expect(response.headers.get('Cache-Control')).toContain('no-store');
  });

  it('rejects non-admin users for PDF export', async () => {
    mockGetProfile.mockResolvedValue(baseProfile);
    const { GET } = await import('@/app/api/admin/export/report-pdf/route');

    const response = await GET();

    expect(response.status).toBe(403);
  });

  it('rejects non-admin users for admin search', async () => {
    mockGetProfile.mockResolvedValue(baseProfile);
    const { GET } = await import('@/app/api/admin/search/route');
    const { NextRequest } = await import('next/server');

    const request = new NextRequest('http://localhost/api/admin/search?q=test');
    const response = await GET(request);

    expect(response.status).toBe(403);
  });
});
