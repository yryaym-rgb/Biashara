import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetProfile = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockSignOut = vi.fn();
const mockCreateClient = vi.fn();

vi.mock('@/lib/auth/session', () => ({
  getProfile: () => mockGetProfile(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => mockCreateClient(),
}));

vi.mock('next/headers', () => ({
  headers: () =>
    Promise.resolve({
      get: (name: string) => (name === 'x-forwarded-for' ? '127.0.0.1' : null),
    }),
}));

const adminProfile = {
  id: '00000000-0000-0000-0000-000000000001',
  role: 'admin' as const,
  company_name: 'Admin Co',
  country: 'CD',
  phone: null,
  locale: 'fr' as const,
  kyc_status: 'approved' as const,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const buyerProfile = { ...adminProfile, role: 'buyer' as const };

describe('adminLoginAction', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mockCreateClient.mockResolvedValue({
      auth: {
        signInWithPassword: mockSignInWithPassword,
        signOut: mockSignOut,
      },
    });
  });

  it('returns success when credentials are valid and user is admin', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null });
    mockGetProfile.mockResolvedValue(adminProfile);

    const { adminLoginAction } = await import('@/actions/admin/auth');
    const result = await adminLoginAction('admin@example.com', 'valid-password');

    expect(result).toEqual({ success: true });
    expect(mockSignOut).not.toHaveBeenCalled();
  });

  it('returns generic error on invalid credentials', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: { message: 'Invalid login credentials' } });

    const { adminLoginAction } = await import('@/actions/admin/auth');
    const result = await adminLoginAction('admin@example.com', 'wrong-password');

    expect(result).toEqual({ error: 'invalidCredentials' });
  });

  it('signs out and returns generic error when user is not admin', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null });
    mockGetProfile.mockResolvedValue(buyerProfile);
    mockSignOut.mockResolvedValue({ error: null });

    const { adminLoginAction } = await import('@/actions/admin/auth');
    const result = await adminLoginAction('buyer@example.com', 'valid-password');

    expect(result).toEqual({ error: 'invalidCredentials' });
    expect(mockSignOut).toHaveBeenCalled();
  });

  it('returns generic error on invalid email format', async () => {
    const { adminLoginAction } = await import('@/actions/admin/auth');
    const result = await adminLoginAction('not-an-email', 'password');

    expect(result).toEqual({ error: 'invalidCredentials' });
    expect(mockSignInWithPassword).not.toHaveBeenCalled();
  });
});
