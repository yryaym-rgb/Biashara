import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getAdminGateSecret,
  isValidAdminGateSegment,
  verifyAdminPassphrase,
  isAdminGateCookieValid,
  getAdminGateCookieValue,
} from '@/lib/admin/gate';
import { adminPath, adminUsersPath } from '@/lib/admin/path';

describe('admin path helper', () => {
  beforeEach(() => {
    process.env.ADMIN_GATE_SECRET = 'secret-gate-123';
    process.env.ADMIN_PASSPHRASE = 'my-passphrase';
  });

  afterEach(() => {
    delete process.env.ADMIN_GATE_SECRET;
    delete process.env.ADMIN_PASSPHRASE;
  });

  it('builds admin paths with gate segment', () => {
    expect(adminPath()).toBe('/admin/secret-gate-123');
    expect(adminUsersPath()).toBe('/admin/secret-gate-123/users');
    expect(adminUsersPath('user-uuid')).toBe('/admin/secret-gate-123/users/user-uuid');
  });

  it('validates gate segment', () => {
    expect(isValidAdminGateSegment('secret-gate-123')).toBe(true);
    expect(isValidAdminGateSegment('wrong')).toBe(false);
  });

  it('verifies passphrase with timing-safe compare', () => {
    expect(verifyAdminPassphrase('my-passphrase')).toBe(true);
    expect(verifyAdminPassphrase('wrong')).toBe(false);
  });

  it('validates gate cookie value', () => {
    const value = getAdminGateCookieValue();
    expect(isAdminGateCookieValid(value)).toBe(true);
    expect(isAdminGateCookieValid('invalid')).toBe(false);
  });

  it('reads gate secret from env', () => {
    expect(getAdminGateSecret()).toBe('secret-gate-123');
  });
});
