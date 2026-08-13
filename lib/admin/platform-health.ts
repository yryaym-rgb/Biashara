import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import {
  buildPlatformHealthSnapshot,
  resolveApiHealth,
  resolveAuthHealth,
  resolveDatabaseHealth,
  resolveStorageHealth,
  type PlatformHealthSnapshot,
  type PlatformHealthState,
} from '@/lib/admin/platform-health.logic';

function getAppBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (configured) {
    return configured.replace(/\/$/, '');
  }

  const vercel = process.env.VERCEL_URL;
  if (vercel) {
    return `https://${vercel}`;
  }

  return 'http://localhost:3000';
}

async function checkApiHealth(): Promise<PlatformHealthState> {
  try {
    const response = await fetch(`${getAppBaseUrl()}/api/health`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });

    let body: { status?: string } | undefined;
    try {
      body = (await response.json()) as { status?: string };
    } catch {
      body = undefined;
    }

    return resolveApiHealth({ ok: response.ok, body });
  } catch {
    return 'unavailable';
  }
}

async function checkDatabaseHealth(): Promise<PlatformHealthState> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('profiles').select('id').limit(1);
    return resolveDatabaseHealth(error);
  } catch (error) {
    return resolveDatabaseHealth(error);
  }
}

async function checkAuthHealth(): Promise<PlatformHealthState> {
  try {
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
    return resolveAuthHealth(error);
  } catch (error) {
    return resolveAuthHealth(error);
  }
}

async function checkStorageHealth(): Promise<PlatformHealthState> {
  try {
    const admin = createAdminClient();
    const { error } = await admin.storage.listBuckets();
    return resolveStorageHealth(error);
  } catch (error) {
    return resolveStorageHealth(error);
  }
}

export async function checkPlatformHealth(): Promise<PlatformHealthSnapshot> {
  const checkedAt = new Date().toISOString();

  const [api, database, auth, storage] = await Promise.all([
    checkApiHealth(),
    checkDatabaseHealth(),
    checkAuthHealth(),
    checkStorageHealth(),
  ]);

  return buildPlatformHealthSnapshot(
    {
      api,
      database,
      auth,
      storage,
    },
    checkedAt,
  );
}
