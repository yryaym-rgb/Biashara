export type PlatformHealthState = 'operational' | 'unavailable';

export type PlatformHealthSystemKey = 'api' | 'database' | 'auth' | 'storage';

export interface PlatformHealthSystemResult {
  key: PlatformHealthSystemKey;
  status: PlatformHealthState;
}

export interface PlatformHealthSnapshot {
  systems: PlatformHealthSystemResult[];
  checkedAt: string;
}

export function resolveApiHealth(response: {
  ok: boolean;
  body?: { status?: string };
}): PlatformHealthState {
  if (!response.ok) {
    return 'unavailable';
  }

  return response.body?.status === 'ok' ? 'operational' : 'unavailable';
}

export function resolveDatabaseHealth(error: unknown): PlatformHealthState {
  return error ? 'unavailable' : 'operational';
}

export function resolveAuthHealth(error: unknown): PlatformHealthState {
  return error ? 'unavailable' : 'operational';
}

export function resolveStorageHealth(error: unknown): PlatformHealthState {
  return error ? 'unavailable' : 'operational';
}

export function buildPlatformHealthSnapshot(
  results: Record<PlatformHealthSystemKey, PlatformHealthState>,
  checkedAt: string,
): PlatformHealthSnapshot {
  const systems: PlatformHealthSystemResult[] = (
    ['api', 'database', 'auth', 'storage'] as const
  ).map((key) => ({
    key,
    status: results[key],
  }));

  return { systems, checkedAt };
}
