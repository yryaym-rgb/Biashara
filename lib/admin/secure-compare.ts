import 'server-only';
import { createHash, timingSafeEqual } from 'crypto';

/** SHA-256 digest comparison via crypto.timingSafeEqual (handles unequal lengths). */
export function secureCompareStrings(a: string, b: string): boolean {
  const hashA = createHash('sha256').update(a).digest();
  const hashB = createHash('sha256').update(b).digest();
  return timingSafeEqual(hashA, hashB);
}
