import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFrom = vi.fn();
const mockCheckRateLimit = vi.fn();
const mockGetClientIpFromHeaders = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: mockFrom,
  }),
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: (...args: unknown[]) => mockCheckRateLimit(...args),
  getClientIpFromHeaders: () => mockGetClientIpFromHeaders(),
  WAITLIST_SIGNUP_RATE_LIMIT: { limit: 5, windowMs: 60 * 60 * 1000 },
}));

function createInsertChain(result: { error?: { code?: string; message?: string } | null }) {
  const chain = {
    insert: vi.fn(),
    then: (onFulfilled: (value: typeof result) => unknown) => onFulfilled(result),
  };
  chain.insert.mockImplementation(() => chain);
  return chain;
}

describe('waitlistSignupAction', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mockGetClientIpFromHeaders.mockResolvedValue('127.0.0.1');
    mockCheckRateLimit.mockResolvedValue({ success: true, remaining: 4 });
  });

  it('rejects invalid email', async () => {
    const { waitlistSignupAction } = await import('@/actions/waitlist');
    const result = await waitlistSignupAction({ email: 'not-an-email' });
    expect(result).toEqual({ ok: false, errorKey: 'invalidEmail' });
  });

  it('inserts a valid email', async () => {
    mockFrom.mockReturnValue(createInsertChain({ error: null }));
    const { waitlistSignupAction } = await import('@/actions/waitlist');
    const result = await waitlistSignupAction({
      email: 'buyer@example.com',
      countryInterest: 'ZM',
    });
    expect(result).toEqual({ ok: true, alreadyRegistered: false });
    expect(mockFrom).toHaveBeenCalledWith('waitlist_signups');
  });

  it('handles duplicate email gracefully', async () => {
    mockFrom.mockReturnValue(
      createInsertChain({ error: { code: '23505', message: 'duplicate key value' } }),
    );
    const { waitlistSignupAction } = await import('@/actions/waitlist');
    const result = await waitlistSignupAction({ email: 'buyer@example.com' });
    expect(result).toEqual({ ok: true, alreadyRegistered: true });
  });

  it('returns rateLimited when throttled', async () => {
    mockCheckRateLimit.mockResolvedValue({ success: false, remaining: 0 });
    const { waitlistSignupAction } = await import('@/actions/waitlist');
    const result = await waitlistSignupAction({ email: 'buyer@example.com' });
    expect(result).toEqual({ ok: false, errorKey: 'rateLimited' });
  });
});
