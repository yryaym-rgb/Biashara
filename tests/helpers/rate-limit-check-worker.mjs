import { PGlite } from '@electric-sql/pglite';

const dbPath = process.env.RATE_LIMIT_DB_PATH;
if (!dbPath) {
  throw new Error('RATE_LIMIT_DB_PATH is required');
}

const [action, bucketKey, limit, windowSeconds] = process.argv.slice(2);
if (!action || !bucketKey || !limit || !windowSeconds) {
  throw new Error('usage: rate-limit-check-worker <action> <bucketKey> <limit> <windowSeconds>');
}

const pg = new PGlite(dbPath);

const result = await pg.query(
  'SELECT check_rate_limit($1, $2, $3, $4) AS result',
  [bucketKey, action, Number(limit), Number(windowSeconds)],
);

if (process.send) {
  process.send(result.rows[0].result);
} else {
  console.log(JSON.stringify(result.rows[0].result));
}
