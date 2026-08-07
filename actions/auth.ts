'use server';

import { revalidatePath } from 'next/cache';
import { signInWithPassword, signUp, signOut, resetPassword } from '@/lib/auth/actions';
import type { Locale } from '@/lib/i18n/config';

export async function loginAction(
  email: string,
  password: string,
  _locale: Locale,
) {
  return signInWithPassword(email, password);
}

export async function registerAction(input: unknown, locale: Locale) {
  return signUp(input, locale);
}

export async function logoutAction(locale: Locale) {
  return signOut(locale);
}

export async function forgotPasswordAction(email: string, locale: Locale) {
  return resetPassword(email, locale);
}

export async function revalidateDashboard() {
  revalidatePath('/dashboard');
}
