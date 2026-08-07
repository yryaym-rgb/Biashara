import 'server-only';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { registerStep1Schema } from '@/lib/validators/auth';
import { sendAuthEmail } from '@/lib/email';
import { mapAuthError } from '@/lib/auth/errors';
import type { Locale } from '@/lib/i18n/config';

export async function signInWithPassword(email: string, password: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: error.message, errorKey: mapAuthError(error.message) };
  }
  return { data };
}

export async function signUp(input: unknown, locale: Locale) {
  const parsed = registerStep1Schema.safeParse(input);
  if (!parsed.success) {
    return { error: 'validation', details: parsed.error.flatten() };
  }

  const { email, password, role, fullName } = parsed.data;
  const supabase = await createClient();
  const prefix = locale === 'fr' ? '' : `/${locale}`;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { locale, role, full_name: fullName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}${prefix}/verify`,
    },
  });

  if (error) {
    return { error: error.message, errorKey: mapAuthError(error.message) };
  }

  if (data.session) {
    return { data: { user: data.user, hasSession: true, role, locale } };
  }

  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (!signInError && signInData.session) {
    return { data: { user: data.user, hasSession: true, role, locale } };
  }

  await sendAuthEmail({
    to: email,
    template: 'signup_confirmation',
    locale,
    data: { email },
  });

  return { data: { user: data.user, hasSession: false, role, locale } };
}

export async function signOut(locale: Locale) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const prefix = locale === 'fr' ? '' : `/${locale}`;
  redirect(`${prefix}/login`);
}

export async function resetPassword(email: string, locale: Locale) {
  const supabase = await createClient();
  const prefix = locale === 'fr' ? '' : `/${locale}`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}${prefix}/forgot-password`,
  });

  if (error) {
    return { error: error.message, errorKey: mapAuthError(error.message) };
  }

  return { success: true };
}

export async function resendVerificationEmail(email: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  });

  if (error) {
    return { error: error.message, errorKey: mapAuthError(error.message) };
  }

  return { success: true };
}

export async function verifyEmailToken(tokenHash: string, type: 'signup' | 'email') {
  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error) {
    return { error: error.message, errorKey: mapAuthError(error.message) };
  }

  return { success: true };
}

export async function exchangeCodeForSession(code: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return { error: error.message, errorKey: mapAuthError(error.message) };
  }

  return { success: true };
}
