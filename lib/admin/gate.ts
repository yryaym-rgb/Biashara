import 'server-only';
import { createHmac } from 'crypto';
import { cookies } from 'next/headers';
import { secureCompareStrings } from '@/lib/admin/secure-compare';

export const ADMIN_GATE_COOKIE = 'biashara_admin_gate';

function getPassphrase(): string {
  const passphrase = process.env.ADMIN_PASSPHRASE;
  if (!passphrase) {
    if (process.env.NODE_ENV === 'test' || process.env.NEXT_PHASE === 'phase-production-build') {
      return 'build-passphrase';
    }
    throw new Error('ADMIN_PASSPHRASE is not configured');
  }
  return passphrase;
}

export function getAdminGateSecret(): string {
  const secret = process.env.ADMIN_GATE_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'test' || process.env.NEXT_PHASE === 'phase-production-build') {
      return 'build-gate';
    }
    throw new Error('ADMIN_GATE_SECRET is not configured');
  }
  return secret;
}

export function isValidAdminGateSegment(segment: string): boolean {
  const secret = process.env.ADMIN_GATE_SECRET;
  if (!secret) {
    return false;
  }
  return secureCompareStrings(segment, secret);
}

function buildGateCookieValue(): string {
  return createHmac('sha256', getPassphrase()).update('biashara-admin-gate').digest('hex');
}

export function verifyAdminPassphrase(passphrase: string): boolean {
  const expected = process.env.ADMIN_PASSPHRASE;
  if (!expected) {
    return false;
  }
  return secureCompareStrings(passphrase, expected);
}

export function isAdminGateCookieValid(value: string | undefined): boolean {
  if (!value) {
    return false;
  }
  const expected = buildGateCookieValue();
  return secureCompareStrings(value, expected);
}

export async function hasAdminGateAccess(): Promise<boolean> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(ADMIN_GATE_COOKIE);
  return isAdminGateCookieValid(cookie?.value);
}

export function getAdminGateCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 8,
  };
}

export function getAdminGateCookieValue(): string {
  return buildGateCookieValue();
}
