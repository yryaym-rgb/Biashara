/**
 * Bootstrap E2E test accounts for every platform role.
 * Run: npx tsx scripts/setup-e2e-fixtures.ts
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env
 * Optional: E2E_FIXTURE_PASSWORD (default: BiasharaE2e!2026)
 *
 * Also run scripts/create-admin.ts for the admin account.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';
import {
  E2E_ACCOUNT_FIXTURES,
  type E2eAccountFixture,
} from '../tests/e2e/fixtures/accounts';

type PlatformFixtureRole = E2eAccountFixture['role'];

const DEFAULT_PASSWORD = 'BiasharaE2e!2026';

const FIXTURE_EMAILS: Record<PlatformFixtureRole, string> = {
  buyer: 'e2e-buyer@biashara.test',
  seller: 'e2e-seller@biashara.test',
  'cooperative-approved': 'e2e-coop-approved@biashara.test',
  'cooperative-pending': 'e2e-coop-pending@biashara.test',
};

async function ensureFixtureUser(
  supabase: ReturnType<typeof createClient<Database>>,
  fixture: E2eAccountFixture,
  password: string,
): Promise<void> {
  const email = FIXTURE_EMAILS[fixture.role];

  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users.find((user) => user.email === email);

  let userId: string;

  if (existing) {
    userId = existing.id;
    console.info(`[${fixture.role}] User already exists: ${email}`);
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { role: fixture.profileRole, locale: 'fr' },
    });

    if (error || !data.user) {
      throw new Error(`Failed to create ${fixture.role}: ${error?.message ?? 'unknown error'}`);
    }

    userId = data.user.id;
    console.info(`[${fixture.role}] Created user: ${email}`);
  }

  const companyName = `E2E ${fixture.role.replace(/-/g, ' ')}`;

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      role: fixture.profileRole,
      kyc_status: fixture.kycStatus,
      company_name: companyName,
      country: 'CD',
      phone: '+243900000001',
    })
    .eq('id', userId);

  if (profileError) {
    throw new Error(`Failed to update profile for ${fixture.role}: ${profileError.message}`);
  }

  await supabase.auth.admin.updateUserById(userId, {
    app_metadata: { role: fixture.profileRole, locale: 'fr' },
  });

  console.info(`[${fixture.role}] Profile updated (role=${fixture.profileRole}, kyc=${fixture.kycStatus})`);
}

async function setupE2eFixtures() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const password = process.env.E2E_FIXTURE_PASSWORD ?? DEFAULT_PASSWORD;

  if (!url || !serviceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. See .env.example');
    process.exit(1);
  }

  if (password.length < 12) {
    console.error('E2E_FIXTURE_PASSWORD must be at least 12 characters');
    process.exit(1);
  }

  const supabase = createClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  for (const fixture of E2E_ACCOUNT_FIXTURES) {
    await ensureFixtureUser(supabase, fixture, password);
  }

  console.info('\n--- Add these to your .env for Playwright ---\n');
  for (const fixture of E2E_ACCOUNT_FIXTURES) {
    console.info(`${fixture.emailEnv}=${FIXTURE_EMAILS[fixture.role]}`);
    console.info(`${fixture.passwordEnv}=${password}`);
  }
  console.info('\nAlso ensure E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD, ADMIN_GATE_SECRET, ADMIN_PASSPHRASE are set.');
  console.info('Run: npx tsx scripts/create-admin.ts');
}

setupE2eFixtures().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
