import 'server-only';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { registerSchema } from '@/lib/validators/profile';
import { sendAuthEmail } from '@/lib/email';
import type { Locale } from '@/lib/i18n/config';

export async function signInWithPassword(email: string, password: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: error.message };
  }
  return { data };
}

export async function signUp(input: unknown, locale: Locale) {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'validation', details: parsed.error.flatten() };
  }

  const { email, password, role, companyName } = parsed.data;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { locale },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/${locale === 'fr' ? '' : `${locale}/`}verify`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    await supabase
      .from('profiles')
      .update({
        role,
        company_name: companyName ?? null,
        locale,
      })
      .eq('id', data.user.id);
  }

  await sendAuthEmail({
    to: email,
    template: 'signup_confirmation',
    locale,
    data: { email },
  });

  return { data };
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
    return { error: error.message };
  }

  await sendAuthEmail({
    to: email,
    template: 'password_reset',
    locale,
    data: { email },
  });

  return { success: true };
}
