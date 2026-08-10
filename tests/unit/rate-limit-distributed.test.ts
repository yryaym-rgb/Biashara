// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { fork } from 'child_process';
import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'fs';
import { splitRateLimitKey } from '@/lib/rate-limit';

const migrationSql = readFileSync(
  join(process.cwd(), 'tests/fixtures/rate-limit-pglite-schema.sql'),
  'utf8',
);

interface RpcRateLimitResult {
  success: boolean;
  remaining: number;
  reset_at: number;
}

function runRateLimitInFork(
  dbPath: string,
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RpcRateLimitResult> {
  const { action, bucketKey } = splitRateLimitKey(key);
  const workerPath = join(process.cwd(), 'tests/helpers/rate-limit-check-worker.mjs');

  return new Promise((resolve, reject) => {
    const child = fork(workerPath, [action, bucketKey, String(limit), String(windowSeconds)], {
      env: { ...process.env, RATE_LIMIT_DB_PATH: dbPath },
      stdio: ['ignore', 'ignore', 'pipe', 'ipc'],
    });

    let stderr = '';
    child.stderr?.on('data', (chunk) => {
      stderr += String(chunk);
    });

    child.on('message', (message) => {
      resolve(message as RpcRateLimitResult);
    });

    child.on('error', reject);

    child.on('exit', (code) => {
      if (code !== 0 && !stderr) {
        reject(new Error(`rate-limit worker exited with code ${code}`));
      } else if (code !== 0) {
        reject(new Error(stderr));
      }
    });
  });
}

describe('postgres-backed rate limit across processes', () => {
  it('shares and enforces counts between forked worker processes', async () => {
    const dbPath = mkdtempSync(join(tmpdir(), 'rate-limit-pglite-'));
    const pg = new PGlite(dbPath);
    await pg.exec(migrationSql);
    await pg.close();

    const limit = 5;
    const windowSeconds = 900;
    const key = 'login:192.168.1.10';

    const results: RpcRateLimitResult[] = [];
    for (let i = 0; i < 6; i += 1) {
      results.push(await runRateLimitInFork(dbPath, key, limit, windowSeconds));
    }

    expect(results.filter((result) => result.success).length).toBe(5);
    expect(results.filter((result) => !result.success).length).toBe(1);
    expect(results.every((result) => typeof result.reset_at === 'number')).toBe(true);
  });
});

describe('splitRateLimitKey', () => {
  it('parses action and bucket key from composite keys', () => {
    expect(splitRateLimitKey('admin-gate:127.0.0.1')).toEqual({
      action: 'admin-gate',
      bucketKey: '127.0.0.1',
    });
    expect(splitRateLimitKey('prices:10.0.0.1')).toEqual({
      action: 'prices',
      bucketKey: '10.0.0.1',
    });
  });
});
