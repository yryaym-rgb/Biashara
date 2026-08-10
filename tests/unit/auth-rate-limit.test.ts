import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockCheckRateLimit = vi.fn();
const mockGetClientIpFromHeaders = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockSignUp = vi.fn();
const mockResetPassword = vi.fn();
const mockResendVerificationEmail = vi.fn();

vi.mock('@/lib/rate-limit', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/rate-limit')>();
  return {
    ...actual,
    checkRateLimit: (...args: unknown[]) => mockCheckRateLimit(...args),
    getClientIpFromHeaders: () => mockGetClientIpFromHeaders(),
    withConstantTiming: async (_minMs: number, fn: () => Promise<unknown>) => fn(),
  };
});

vi.mock('@/lib/auth/actions', () => ({
  signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
  signUp: (...args: unknown[]) => mockSignUp(...args),
  resetPassword: (...args: unknown[]) => mockResetPassword(...args),
  resendVerificationEmail: (...args: unknown[]) => mockResendVerificationEmail(...args),
  signOut: vi.fn(),
  verifyEmailToken: vi.fn(),
  exchangeCodeForSession: vi.fn(),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}));

vi.mock('@/lib/auth/registration', () => ({
  setRegistrationCookies: vi.fn(),
  clearRegistrationCookies: vi.fn(),
}));

vi.mock('@/lib/auth/session', () => ({
  getUser: vi.fn(),
}));

describe('auth action rate limits', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mockGetClientIpFromHeaders.mockResolvedValue('203.0.113.5');
    mockCheckRateLimit.mockResolvedValue({
      success: true,
      remaining: 9,
      resetAt: Date.now() + 900_000,
    });
  });

  it('loginAction returns generic invalid credentials when rate limited', async () => {
    mockCheckRateLimit.mockResolvedValueOnce({
      success: false,
      remaining: 0,
      resetAt: Date.now() + 900_000,
    });

    const { loginAction } = await import('@/actions/auth');
    const result = await loginAction('user@example.com', 'password', 'fr');

    expect(result).toEqual({
      error: 'Invalid login credentials',
      errorKey: 'invalidCredentials',
    });
    expect(mockSignInWithPassword).not.toHaveBeenCalled();
    expect(mockCheckRateLimit).toHaveBeenCalledWith('login:203.0.113.5', 10, 15 * 60 * 1000);
  });

  it('registerAction returns generic unknown error when rate limited', async () => {
    mockCheckRateLimit.mockResolvedValueOnce({
      success: false,
      remaining: 0,
      resetAt: Date.now() + 3_600_000,
    });

    const { registerAction } = await import('@/actions/auth');
    const result = await registerAction({ email: 'user@example.com' }, 'fr');

    expect(result).toEqual({
      error: 'Registration failed',
      errorKey: 'unknown',
    });
    expect(mockSignUp).not.toHaveBeenCalled();
    expect(mockCheckRateLimit).toHaveBeenCalledWith('register:203.0.113.5', 5, 60 * 60 * 1000);
  });

  it('forgotPasswordAction returns success when rate limited', async () => {
    mockCheckRateLimit.mockResolvedValueOnce({
      success: false,
      remaining: 0,
      resetAt: Date.now() + 3_600_000,
    });

    const { forgotPasswordAction } = await import('@/actions/auth');
    const result = await forgotPasswordAction('user@example.com', 'fr');

    expect(result).toEqual({ success: true });
    expect(mockResetPassword).not.toHaveBeenCalled();
    expect(mockCheckRateLimit).toHaveBeenCalledWith(
      'forgot-password:203.0.113.5',
      5,
      60 * 60 * 1000,
    );
  });

  it('resendVerificationAction returns success when rate limited', async () => {
    mockCheckRateLimit.mockResolvedValueOnce({
      success: false,
      remaining: 0,
      resetAt: Date.now() + 3_600_000,
    });

    const { resendVerificationAction } = await import('@/actions/auth');
    const result = await resendVerificationAction('user@example.com');

    expect(result).toEqual({ success: true });
    expect(mockResendVerificationEmail).not.toHaveBeenCalled();
    expect(mockCheckRateLimit).toHaveBeenCalledWith(
      'resend-verification:203.0.113.5',
      5,
      60 * 60 * 1000,
    );
  });

  it('loginAction proceeds when under the rate limit', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({ data: { user: { id: 'user-1' } } });

    const { loginAction } = await import('@/actions/auth');
    const result = await loginAction('user@example.com', 'password', 'fr');

    expect(result).toEqual({ data: { user: { id: 'user-1' } } });
    expect(mockSignInWithPassword).toHaveBeenCalledWith('user@example.com', 'password');
  });
});
