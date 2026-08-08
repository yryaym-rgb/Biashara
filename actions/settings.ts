'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth/session';
import { requireAuth } from '@/lib/rbac';
import { mapAuthError } from '@/lib/auth/errors';
import {
  changePasswordSchema,
  profileSettingsFormSchema,
} from '@/lib/validators/settings';

function revalidateSettingsPaths() {
  revalidatePath('/settings');
  revalidatePath('/dashboard');
}

export async function updateProfileAction(input: unknown) {
  const profile = requireAuth(await getProfile());
  const parsed = profileSettingsFormSchema.safeParse(input);

  if (!parsed.success) {
    return { error: 'validation', details: parsed.error.flatten() };
  }

  const supabase = await createClient();
  const phone = parsed.data.phone?.trim() ? parsed.data.phone.trim() : null;

  const { error } = await supabase
    .from('profiles')
    .update({
      company_name: parsed.data.companyName,
      country: parsed.data.country,
      phone,
    })
    .eq('id', profile.id);

  if (error) {
    return { error: error.message };
  }

  revalidateSettingsPaths();
  return { success: true };
}

export async function changePasswordAction(input: unknown) {
  const profile = requireAuth(await getProfile());
  void profile;

  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'validation', details: parsed.error.flatten() };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message, errorKey: mapAuthError(error.message) };
  }

  return { success: true };
}
