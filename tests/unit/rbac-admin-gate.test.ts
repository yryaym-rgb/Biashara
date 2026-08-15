import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  classifyRoute,
  canAccessRoute,
  isAdminGatePath,
  stripLocale,
} from '@/lib/rbac';

describe('rbac admin gate paths', () => {
  beforeEach(() => {
    process.env.ADMIN_GATE_SECRET = 'secret-gate-xyz';
  });

  afterEach(() => {
    delete process.env.ADMIN_GATE_SECRET;
  });

  it('classifies secret gate paths as admin', () => {
    expect(isAdminGatePath('/secret-gate-xyz')).toBe(true);
    expect(isAdminGatePath('/secret-gate-xyz/users')).toBe(true);
    expect(isAdminGatePath('/en/secret-gate-xyz/kyc-review')).toBe(true);
    expect(classifyRoute('/secret-gate-xyz')).toBe('admin');
    expect(classifyRoute('/en/secret-gate-xyz/users')).toBe('admin');
  });

  it('does not classify /admin literal as admin', () => {
    expect(isAdminGatePath('/admin')).toBe(false);
    expect(classifyRoute('/admin')).toBe('marketing');
  });

  it('rejects wrong gate segment', () => {
    expect(isAdminGatePath('/wrong-gate')).toBe(false);
    expect(classifyRoute('/wrong-gate')).toBe('marketing');
  });

  it('allows unauthenticated access to secret gate routes (layout handles auth)', () => {
    const result = canAccessRoute('/secret-gate-xyz', null, 'fr');
    expect(result.allowed).toBe(true);
  });

  it('allows non-admin users to reach secret gate routes (layout handles auth)', () => {
    const baseProfile = {
      id: '00000000-0000-0000-0000-000000000001',
      role: 'buyer' as const,
      company_name: 'Test Co',
      country: 'CD',
      phone: null,
      locale: 'fr',
      kyc_status: 'approved' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const result = canAccessRoute('/secret-gate-xyz', baseProfile, 'fr');
    expect(result.allowed).toBe(true);
  });

  it('allows admin access to secret gate routes', () => {
    const admin = {
      id: '00000000-0000-0000-0000-000000000001',
      role: 'admin' as const,
      company_name: 'Test Co',
      country: 'CD',
      phone: null,
      locale: 'fr',
      kyc_status: 'approved' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const result = canAccessRoute('/secret-gate-xyz/users', admin, 'fr');
    expect(result.allowed).toBe(true);
  });

  it('stripLocale removes non-default locale prefixes', () => {
    expect(stripLocale('/en/secret-gate-xyz')).toBe('/secret-gate-xyz');
    expect(stripLocale('/zh/secret-gate-xyz')).toBe('/secret-gate-xyz');
    expect(stripLocale('/secret-gate-xyz')).toBe('/secret-gate-xyz');
  });
});
