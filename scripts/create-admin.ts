/**
 * Bootstrap the initial admin user.
 * Run: npx tsx scripts/create-admin.ts
 *
 * Requires: SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD in .env
 * Justification: no admin seed in migrations — one-time documented setup only.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

async function createAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!url || !serviceKey || !email || !password) {
    console.error('Missing required environment variables. See .env.example');
    process.exit(1);
  }

  if (password.length < 12) {
    console.error('ADMIN_PASSWORD must be at least 12 characters');
    process.exit(1);
  }

  const supabase = createClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users.find((u) => u.email === email);

  let userId: string;

  if (existing) {
    userId = existing.id;
    console.info(`Admin user already exists: ${email}`);
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { role: 'admin' },
    });

    if (error || !data.user) {
      console.error('Failed to create admin:', error?.message);
      process.exit(1);
    }

    userId = data.user.id;
    console.info(`Created admin user: ${email}`);
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: 'admin', kyc_status: 'approved' })
    .eq('id', userId);

  if (profileError) {
    console.error('Failed to update profile:', profileError.message);
    process.exit(1);
  }

  await supabase.auth.admin.updateUserById(userId, {
    app_metadata: { role: 'admin' },
  });

  console.info('Admin profile updated successfully');
}

createAdmin().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
