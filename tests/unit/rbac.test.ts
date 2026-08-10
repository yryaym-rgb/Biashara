import { describe, it, expect } from 'vitest';
import {
  requireAuth,
  requireRole,
  requireKycApproved,
  canAccessRoute,
  classifyRoute,
  isPublicMarketplaceRoute,
  isPublicDirectoryRoute,
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
    expect(classifyRoute('/admin')).toBe('marketing');
    expect(classifyRoute('/login')).toBe('auth');
    expect(classifyRoute('/')).toBe('marketing');
  });

  it('identifies public marketplace routes', () => {
    expect(isPublicMarketplaceRoute('/marketplace')).toBe(true);
    expect(isPublicMarketplaceRoute('/marketplace/new')).toBe(false);
    expect(isPublicMarketplaceRoute('/marketplace/abc/edit')).toBe(false);
    expect(isPublicMarketplaceRoute('/marketplace/abc')).toBe(true);
  });

  it('allows public marketplace browsing', () => {
    expect(canAccessRoute('/marketplace', null, 'fr').allowed).toBe(true);
    expect(
      canAccessRoute('/marketplace/00000000-0000-0000-0000-000000000001', null, 'fr').allowed,
    ).toBe(true);
    expect(canAccessRoute('/en/marketplace', null, 'en').allowed).toBe(true);
  });

  it('allows public directory browsing', () => {
    expect(canAccessRoute('/directory', null, 'fr').allowed).toBe(true);
    expect(
      canAccessRoute('/directory/00000000-0000-4000-8000-000000000001', null, 'fr').allowed,
    ).toBe(true);
    expect(isPublicDirectoryRoute('/directory')).toBe(true);
  });

  it('blocks unauthenticated marketplace new listing', () => {
    const result = canAccessRoute('/marketplace/new', null, 'fr');
    expect(result.allowed).toBe(false);
    expect(result.redirectTo).toBe('/login');
  });

  it('allows authenticated sellers to open new listing page regardless of KYC', () => {
    const seller = { ...baseProfile, role: 'seller' as const, kyc_status: 'pending' as const };
    const result = canAccessRoute('/marketplace/new', seller, 'fr');
    expect(result.allowed).toBe(true);
  });

  it('blocks unauthenticated platform access', () => {
    const result = canAccessRoute('/dashboard', null, 'fr');
    expect(result.allowed).toBe(false);
    expect(result.redirectTo).toBe('/login');
  });

  it('treats /admin literal as marketing (no special route)', () => {
    const result = canAccessRoute('/admin', baseProfile, 'fr');
    expect(result.allowed).toBe(true);
  });

  it('redirects authenticated users away from auth routes', () => {
    const result = canAccessRoute('/login', baseProfile, 'fr');
    expect(result.allowed).toBe(false);
    expect(result.redirectTo).toBe('/dashboard');
  });
});
