import { describe, it, expect, vi, beforeEach } from 'vitest';

function createPdfFile(name = 'id.pdf') {
  const file = new File([new Uint8Array([1, 2, 3])], name, { type: 'application/pdf' });
  if (typeof file.arrayBuffer !== 'function') {
    Object.defineProperty(file, 'arrayBuffer', {
      value: async () => new Uint8Array([1, 2, 3]).buffer,
    });
  }
  return file;
}

const USER_A = '00000000-0000-0000-0000-000000000001';
const USER_B = '00000000-0000-0000-0000-000000000002';

const mockGetUser = vi.fn();
const mockCookies = vi.fn();
const mockCreateClient = vi.fn();
const mockCreateAdminClient = vi.fn();
const mockFrom = vi.fn();
const mockStorageFrom = vi.fn();
const mockUpload = vi.fn();
const mockUpsert = vi.fn();
const mockSelect = vi.fn();
const mockSingle = vi.fn();
const mockAdminGetUserById = vi.fn();

vi.mock('@/lib/auth/session', () => ({
  getUser: () => mockGetUser(),
  getProfile: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: () => mockCookies(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => mockCreateClient(),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => mockCreateAdminClient(),
}));

vi.mock('@/lib/notifications/admin', () => ({
  notifyAdminsPendingKyc: vi.fn().mockResolvedValue(undefined),
}));

function mockRegistrationCookies(userId: string | null) {
  mockCookies.mockResolvedValue({
    get: (name: string) =>
      name === 'biashara_reg_uid' && userId ? { value: userId } : undefined,
  });
}

function createKycSelectChain(data: { type: string }[]) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue({ data, error: null }),
  };
  return chain;
}

describe('KYC registration IDOR protections', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    mockCreateClient.mockResolvedValue({
      from: mockFrom,
    });

    mockCreateAdminClient.mockReturnValue({
      from: mockFrom,
      storage: { from: mockStorageFrom },
      auth: { admin: { getUserById: mockAdminGetUserById } },
    });

    mockStorageFrom.mockReturnValue({
      upload: mockUpload.mockResolvedValue({ error: null }),
    });

    mockAdminGetUserById.mockResolvedValue({
      data: { user: { id: USER_B } },
      error: null,
    });
  });

  it('rejects uploadRegistrationKycDocument when session user A supplies userId B', async () => {
    mockGetUser.mockResolvedValue({ id: USER_A });
    mockRegistrationCookies(null);

    const { uploadRegistrationKycDocument } = await import('@/actions/kyc');

    const formData = new FormData();
    formData.append('userId', USER_B);
    formData.append('type', 'id_card');
    formData.append('file', createPdfFile());

    const result = await uploadRegistrationKycDocument(formData);

    expect(result).toEqual({ error: 'forbidden' });
    expect(mockUpload).not.toHaveBeenCalled();
    expect(mockAdminGetUserById).not.toHaveBeenCalled();
  });

  it('rejects uploadRegistrationKycDocument when registration cookie is A but userId B is supplied', async () => {
    mockGetUser.mockResolvedValue(null);
    mockRegistrationCookies(USER_A);

    const { uploadRegistrationKycDocument } = await import('@/actions/kyc');

    const formData = new FormData();
    formData.append('userId', USER_B);
    formData.append('type', 'id_card');
    formData.append('file', createPdfFile());

    const result = await uploadRegistrationKycDocument(formData);

    expect(result).toEqual({ error: 'forbidden' });
    expect(mockUpload).not.toHaveBeenCalled();
  });

  it('allows uploadRegistrationKycDocument when registration cookie matches userId', async () => {
    mockGetUser.mockResolvedValue(null);
    mockRegistrationCookies(USER_A);

    const upsertChain = {
      upsert: mockUpsert.mockReturnThis(),
      select: mockSelect.mockReturnThis(),
      single: mockSingle.mockResolvedValue({
        data: { id: 'doc-1', type: 'id_card' },
        error: null,
      }),
    };
    const profilesChain = {
      update: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { company_name: 'Registration Co' },
        error: null,
      }),
    };
    profilesChain.eq.mockImplementation(function (this: typeof profilesChain) {
      return this;
    });
    const profilesUpdateEq = vi.fn().mockResolvedValue({ error: null });
    profilesChain.update.mockReturnValue({ eq: profilesUpdateEq });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'kyc_documents') {
        return upsertChain;
      }
      if (table === 'profiles') {
        return profilesChain;
      }
      throw new Error(`Unexpected table: ${table}`);
    });

    const { uploadRegistrationKycDocument } = await import('@/actions/kyc');

    const formData = new FormData();
    formData.append('userId', USER_A);
    formData.append('type', 'id_card');
    formData.append('file', createPdfFile());

    const result = await uploadRegistrationKycDocument(formData);

    expect(result.error).toBeUndefined();
    expect(mockUpload).toHaveBeenCalled();
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: USER_A, type: 'id_card' }),
    );
  });

  it('rejects getSubmittedKycDocumentTypesForUser when session user A queries user B', async () => {
    mockGetUser.mockResolvedValue({ id: USER_A });
    mockRegistrationCookies(null);

    const { getSubmittedKycDocumentTypesForUser } = await import('@/actions/kyc');
    const result = await getSubmittedKycDocumentTypesForUser(USER_B);

    expect(result).toEqual({ error: 'forbidden' });
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('returns submitted types for the authenticated session user', async () => {
    mockGetUser.mockResolvedValue({ id: USER_A });
    mockRegistrationCookies(null);

    const selectChain = createKycSelectChain([{ type: 'id_card' }]);
    mockFrom.mockReturnValue(selectChain);
    mockCreateClient.mockResolvedValue({ from: mockFrom });

    const { getSubmittedKycDocumentTypesForUser } = await import('@/actions/kyc');
    const result = await getSubmittedKycDocumentTypesForUser(USER_A);

    expect(result).toEqual(['id_card']);
  });
});
