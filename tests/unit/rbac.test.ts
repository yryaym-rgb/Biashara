import { describe, it, expect } from 'vitest';
import {
  requireAuth,
  requireRole,
  requireKycApproved,
  canAccessRoute,
  classifyRoute,
  UnauthorizedError,
  ForbiddenError,
  KycRequiredError,
} from '@/lib/rbac';
import type { Profile } from '@/lib/auth/session';

const baseProfile: Profile = {
  id: '00000000-0000-0000-0000-000000000001',
  role: 'buyer',
  company_name: 'Test Co',
  country: 'CD',
  phone: null,
  locale: 'fr',
  kyc_status: 'approved',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('rbac', () => {
  it('requireAuth throws when profile is null', () => {
    expect(() => requireAuth(null)).toThrow(UnauthorizedError);
  });

  it('requireRole throws for wrong role', () => {
    expect(() => requireRole(baseProfile, ['admin'])).toThrow(ForbiddenError);
  });

  it('requireRole passes for matching role', () => {
    expect(requireRole(baseProfile, ['buyer']).id).toBe(baseProfile.id);
  });

  it('requireKycApproved throws when not approved', () => {
    const pending = { ...baseProfile, kyc_status: 'pending' as const };
    expect(() => requireKycApproved(pending)).toThrow(KycRequiredError);
  });

  it('classifies platform routes', () => {
    expect(classifyRoute('/dashboard')).toBe('platform');
    expect(classifyRoute('/en/dashboard')).toBe('platform');
    expect(classifyRoute('/admin')).toBe('admin');
    expect(classifyRoute('/login')).toBe('auth');
    expect(classifyRoute('/')).toBe('marketing');
  });

  it('blocks unauthenticated platform access', () => {
    const result = canAccessRoute('/dashboard', null, 'fr');
    expect(result.allowed).toBe(false);
    expect(result.redirectTo).toBe('/login');
  });

  it('blocks non-admin from admin routes', () => {
    const result = canAccessRoute('/admin', baseProfile, 'fr');
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('forbidden');
  });

  it('allows admin access', () => {
    const admin = { ...baseProfile, role: 'admin' as const };
    const result = canAccessRoute('/admin', admin, 'fr');
    expect(result.allowed).toBe(true);
  });

  it('redirects authenticated users away from auth routes', () => {
    const result = canAccessRoute('/login', baseProfile, 'fr');
    expect(result.allowed).toBe(false);
    expect(result.redirectTo).toBe('/dashboard');
  });
});
