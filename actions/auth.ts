'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  signInWithPassword,
  signUp,
  signOut,
  resetPassword,
  resendVerificationEmail,
  verifyEmailToken,
  exchangeCodeForSession,
} from '@/lib/auth/actions';
import type { Locale } from '@/lib/i18n/config';
import type { Database } from '@/types/database.types';

type UserRole = Database['public']['Enums']['user_role'];

async function updateRegistrationProfile(
  userId: string,
  role: UserRole,
  locale: Locale,
) {
  const admin = createAdminClient();
  await admin
    .from('profiles')
    .update({ role, locale })
    .eq('id', userId);
}

export async function loginAction(
  email: string,
  password: string,
  _locale: Locale,
) {
  return signInWithPassword(email, password);
}

export async function registerAction(input: unknown, locale: Locale) {
  const result = await signUp(input, locale);

  if (result.data?.user?.id && result.data.role) {
    await updateRegistrationProfile(
      result.data.user.id,
      result.data.role,
      result.data.locale ?? locale,
    );
  }

  return result;
}

export async function logoutAction(locale: Locale) {
  return signOut(locale);
}

export async function forgotPasswordAction(email: string, locale: Locale) {
  return resetPassword(email, locale);
}

export async function resendVerificationAction(email: string) {
  return resendVerificationEmail(email);
}

export async function verifyEmailAction(tokenHash: string, type: 'signup' | 'email') {
  return verifyEmailToken(tokenHash, type);
}

export async function exchangeAuthCodeAction(code: string) {
  return exchangeCodeForSession(code);
}

export async function revalidateDashboard() {
  revalidatePath('/dashboard');
}
