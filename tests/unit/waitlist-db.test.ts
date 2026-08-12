// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PGlite } from '@electric-sql/pglite';

const migrationSql = readFileSync(
  resolve(process.cwd(), 'tests/fixtures/waitlist-pglite-schema.sql'),
  'utf8',
);

describe('waitlist_signups table', () => {
  let pg: PGlite;

  beforeAll(async () => {
    pg = new PGlite();
    await pg.exec(migrationSql);
  });

  afterAll(async () => {
    await pg.close();
  });

  it('accepts a real email insert', async () => {
    const email = `waitlist-test-${Date.now()}@example.com`;
    await pg.exec(
      `INSERT INTO waitlist_signups (email, country_interest) VALUES ('${email}', 'ZM')`,
    );

    const result = await pg.query<{ email: string; country_interest: string | null }>(
      `SELECT email, country_interest FROM waitlist_signups WHERE email = '${email}'`,
    );

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]?.email).toBe(email);
    expect(result.rows[0]?.country_interest).toBe('ZM');
  });

  it('rejects duplicate emails at the database level', async () => {
    const email = `waitlist-dup-${Date.now()}@example.com`;
    await pg.exec(`INSERT INTO waitlist_signups (email) VALUES ('${email}')`);

    await expect(
      pg.exec(`INSERT INTO waitlist_signups (email) VALUES ('${email}')`),
    ).rejects.toThrow();
  });
});
