'use server';

import { cookies } from 'next/headers';
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
import { adminPath } from '@/lib/admin/path';
import type { Locale } from '@/lib/i18n/config';

export async function verifyAdminGatePassphrase(passphrase: string) {
  requireRole(await getProfile(), ['admin']);

  if (!verifyAdminPassphrase(passphrase)) {
    return { error: 'invalidPassphrase' };
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_GATE_COOKIE, getAdminGateCookieValue(), getAdminGateCookieOptions());

  return { success: true };
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
