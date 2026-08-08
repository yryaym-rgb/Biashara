import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetProfile = vi.fn();
const mockFrom = vi.fn();
const mockUpdateUser = vi.fn();
const mockCreateClient = vi.fn();

vi.mock('@/lib/auth/session', () => ({
  getProfile: () => mockGetProfile(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => mockCreateClient(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
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

function createQueryChain(result: { data?: unknown; error?: unknown | null }) {
  const chain: {
    update: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    then: (onFulfilled: (value: typeof result) => unknown) => unknown;
  } = {
    update: vi.fn(),
    eq: vi.fn(),
    then: (onFulfilled) => onFulfilled(result),
  };

  chain.update.mockImplementation(() => chain);
  chain.eq.mockImplementation(() => chain);

  return chain;
}

describe('settings actions', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mockGetProfile.mockResolvedValue(baseProfile);
    mockCreateClient.mockReturnValue({
      from: mockFrom,
      auth: {
        updateUser: mockUpdateUser,
      },
    });
  });

  it('updateProfileAction rejects unauthenticated users', async () => {
    mockGetProfile.mockResolvedValue(null);
    const { updateProfileAction } = await import('@/actions/settings');
    await expect(
      updateProfileAction({
        companyName: 'Updated Co',
        country: 'CD',
        phone: '',
      }),
    ).rejects.toThrow('Unauthorized');
  });

  it('updateProfileAction validates input', async () => {
    const { updateProfileAction } = await import('@/actions/settings');
    const result = await updateProfileAction({
      companyName: '',
      country: 'CD',
      phone: '',
    });
    expect(result.error).toBe('validation');
  });

  it('updateProfileAction updates confirmed profile columns', async () => {
    const updateChain = createQueryChain({ error: null });
    mockFrom.mockReturnValue(updateChain);

    const { updateProfileAction } = await import('@/actions/settings');
    const result = await updateProfileAction({
      companyName: 'Updated Co',
      country: 'CG',
      phone: '+243 800 000 000',
    });

    expect(result.success).toBe(true);
    expect(mockFrom).toHaveBeenCalledWith('profiles');
    expect(updateChain.update).toHaveBeenCalledWith({
      company_name: 'Updated Co',
      country: 'CG',
      phone: '+243 800 000 000',
    });
    expect(updateChain.eq).toHaveBeenCalledWith('id', baseProfile.id);
  });

  it('updateProfileAction stores null when phone is empty', async () => {
    const updateChain = createQueryChain({ error: null });
    mockFrom.mockReturnValue(updateChain);

    const { updateProfileAction } = await import('@/actions/settings');
    const result = await updateProfileAction({
      companyName: 'Updated Co',
      country: 'CD',
      phone: '',
    });

    expect(result.success).toBe(true);
    expect(updateChain.update).toHaveBeenCalledWith({
      company_name: 'Updated Co',
      country: 'CD',
      phone: null,
    });
  });

  it('updateProfileAction returns database errors', async () => {
    const updateChain = createQueryChain({ error: { message: 'db failure' } });
    mockFrom.mockReturnValue(updateChain);

    const { updateProfileAction } = await import('@/actions/settings');
    const result = await updateProfileAction({
      companyName: 'Updated Co',
      country: 'CD',
      phone: '',
    });

    expect(result.error).toBe('db failure');
  });

  it('changePasswordAction rejects unauthenticated users', async () => {
    mockGetProfile.mockResolvedValue(null);
    const { changePasswordAction } = await import('@/actions/settings');
    await expect(
      changePasswordAction({
        password: 'validpassword1',
        passwordConfirm: 'validpassword1',
      }),
    ).rejects.toThrow('Unauthorized');
  });

  it('changePasswordAction validates password mismatch', async () => {
    const { changePasswordAction } = await import('@/actions/settings');
    const result = await changePasswordAction({
      password: 'validpassword1',
      passwordConfirm: 'validpassword2',
    });
    expect(result.error).toBe('validation');
  });

  it('changePasswordAction validates minimum password length', async () => {
    const { changePasswordAction } = await import('@/actions/settings');
    const result = await changePasswordAction({
      password: 'short',
      passwordConfirm: 'short',
    });
    expect(result.error).toBe('validation');
  });

  it('changePasswordAction updates password via Supabase auth', async () => {
    mockUpdateUser.mockResolvedValue({ error: null });

    const { changePasswordAction } = await import('@/actions/settings');
    const result = await changePasswordAction({
      password: 'validpassword1',
      passwordConfirm: 'validpassword1',
    });

    expect(result.success).toBe(true);
    expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'validpassword1' });
  });

  it('changePasswordAction maps auth errors', async () => {
    mockUpdateUser.mockResolvedValue({
      error: { message: 'Password should be at least 12 characters' },
    });

    const { changePasswordAction } = await import('@/actions/settings');
    const result = await changePasswordAction({
      password: 'validpassword1',
      passwordConfirm: 'validpassword1',
    });

    expect(result.error).toBe('Password should be at least 12 characters');
    expect(result.errorKey).toBe('weakPassword');
  });
});
