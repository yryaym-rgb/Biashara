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

  it('builds admin paths with gate segment only (no /admin prefix)', () => {
    expect(adminPath()).toBe('/secret-gate-123');
    expect(adminUsersPath()).toBe('/secret-gate-123/users');
    expect(adminUsersPath('user-uuid')).toBe('/secret-gate-123/users/user-uuid');
  });

  it('validates gate segment with timing-safe compare', () => {
    expect(isValidAdminGateSegment('secret-gate-123')).toBe(true);
    expect(isValidAdminGateSegment('wrong')).toBe(false);
  });

  it('rejects gate segment when ADMIN_GATE_SECRET is unset', () => {
    delete process.env.ADMIN_GATE_SECRET;
    expect(isValidAdminGateSegment('secret-gate-123')).toBe(false);
  });

  it('verifies passphrase with timing-safe compare', () => {
    expect(verifyAdminPassphrase('my-passphrase')).toBe(true);
    expect(verifyAdminPassphrase('wrong')).toBe(false);
    expect(verifyAdminPassphrase('my-passphrase-extra')).toBe(false);
  });

  it('rejects passphrase when ADMIN_PASSPHRASE is unset', () => {
    delete process.env.ADMIN_PASSPHRASE;
    expect(verifyAdminPassphrase('my-passphrase')).toBe(false);
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
