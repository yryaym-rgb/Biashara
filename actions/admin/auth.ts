'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getProfile, getUser } from '@/lib/auth/session';
import { requireRole } from '@/lib/rbac';
import {
  ADMIN_GATE_COOKIE,
  getAdminGateCookieOptions,
  getAdminGateCookieValue,
  verifyAdminPassphrase,
} from '@/lib/admin/gate';
import { rateLimit } from '@/lib/rate-limit';
import { loginSchema } from '@/lib/validators/auth';
import type { Locale } from '@/lib/i18n/config';

const GATE_RESPONSE_MIN_MS = 400;
const ADMIN_GATE_RATE_LIMIT = { limit: 5, windowMs: 15 * 60 * 1000 };
const ADMIN_LOGIN_RATE_LIMIT = { limit: 5, windowMs: 15 * 60 * 1000 };

async function withConstantTiming<T>(minMs: number, fn: () => Promise<T>): Promise<T> {
  const start = Date.now();
  try {
    return await fn();
  } finally {
    const elapsed = Date.now() - start;
    if (elapsed < minMs) {
      await new Promise((resolve) => setTimeout(resolve, minMs - elapsed));
    }
  }
}

export async function verifyAdminGatePassphrase(passphrase: string) {
  return withConstantTiming(GATE_RESPONSE_MIN_MS, async () => {
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const limit = rateLimit(
      `admin-gate:${ip}`,
      ADMIN_GATE_RATE_LIMIT.limit,
      ADMIN_GATE_RATE_LIMIT.windowMs,
    );

    if (!limit.success || !verifyAdminPassphrase(passphrase)) {
      return { error: 'accessDenied' as const };
    }

    const cookieStore = await cookies();
    cookieStore.set(ADMIN_GATE_COOKIE, getAdminGateCookieValue(), getAdminGateCookieOptions());

    return { success: true as const };
  });
}

export async function adminLoginAction(email: string, password: string) {
  return withConstantTiming(GATE_RESPONSE_MIN_MS, async () => {
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const limit = rateLimit(
      `admin-login:${ip}`,
      ADMIN_LOGIN_RATE_LIMIT.limit,
      ADMIN_LOGIN_RATE_LIMIT.windowMs,
    );

    if (!limit.success) {
      return { error: 'invalidCredentials' as const };
    }

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      return { error: 'invalidCredentials' as const };
    }

    const supabase = await createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (signInError) {
      return { error: 'invalidCredentials' as const };
    }

    const profile = await getProfile();
    if (!profile || profile.role !== 'admin') {
      await supabase.auth.signOut();
      return { error: 'invalidCredentials' as const };
    }

    return { success: true as const };
  });
}

export async function adminLogoutAction(locale: Locale) {
  requireRole(await getProfile(), ['admin']);

  const supabase = await createClient();
  await supabase.auth.signOut();

  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_GATE_COOKIE);

  const prefix = locale === 'fr' ? '' : `/${locale}`;
  redirect(`${prefix}/login`);
}

export async function getAdminSessionInfo() {
  const profile = requireRole(await getProfile(), ['admin']);
  const user = await getUser();

  return {
    profile,
    email: user?.email ?? null,
  };
}
