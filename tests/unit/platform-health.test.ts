import { describe, it, expect } from 'vitest';
import {
  buildPlatformHealthSnapshot,
  resolveApiHealth,
  resolveAuthHealth,
  resolveDatabaseHealth,
  resolveStorageHealth,
} from '@/lib/admin/platform-health.logic';

describe('platform health logic', () => {
  it('marks API operational when health endpoint returns ok', () => {
    expect(resolveApiHealth({ ok: true, body: { status: 'ok' } })).toBe('operational');
  });

  it('marks API unavailable when response is not ok', () => {
    expect(resolveApiHealth({ ok: false, body: { status: 'ok' } })).toBe('unavailable');
  });

  it('marks API unavailable when status is not ok', () => {
    expect(resolveApiHealth({ ok: true, body: { status: 'degraded' } })).toBe('unavailable');
  });

  it('marks database operational when query has no error', () => {
    expect(resolveDatabaseHealth(null)).toBe('operational');
  });

  it('marks database unavailable when query errors', () => {
    expect(resolveDatabaseHealth(new Error('connection failed'))).toBe('unavailable');
  });

  it('marks auth operational when admin auth check has no error', () => {
    expect(resolveAuthHealth(null)).toBe('operational');
  });

  it('marks storage unavailable when bucket listing errors', () => {
    expect(resolveStorageHealth(new Error('storage unavailable'))).toBe('unavailable');
  });

  it('builds a snapshot with all four systems in order', () => {
    const snapshot = buildPlatformHealthSnapshot(
      {
        api: 'operational',
        database: 'operational',
        auth: 'unavailable',
        storage: 'operational',
      },
      '2026-08-13T05:00:00.000Z',
    );

    expect(snapshot.checkedAt).toBe('2026-08-13T05:00:00.000Z');
    expect(snapshot.systems.map((system) => system.key)).toEqual([
      'api',
      'database',
      'auth',
      'storage',
    ]);
    expect(snapshot.systems.find((system) => system.key === 'auth')?.status).toBe('unavailable');
  });
});
