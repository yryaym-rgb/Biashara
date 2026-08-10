import 'server-only';

import { headers } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

export const PRICES_RATE_LIMIT = { limit: 60, windowMs: 60_000 };
export const ACTIVITY_FEED_RATE_LIMIT = { limit: 60, windowMs: 60_000 };
export const ADMIN_GATE_RATE_LIMIT = { limit: 5, windowMs: 15 * 60 * 1000 };
export const ADMIN_LOGIN_RATE_LIMIT = { limit: 5, windowMs: 15 * 60 * 1000 };
export const AUTH_LOGIN_RATE_LIMIT = { limit: 10, windowMs: 15 * 60 * 1000 };
export const AUTH_REGISTER_RATE_LIMIT = { limit: 5, windowMs: 60 * 60 * 1000 };
export const AUTH_FORGOT_PASSWORD_RATE_LIMIT = { limit: 5, windowMs: 60 * 60 * 1000 };
export const AUTH_RESEND_VERIFICATION_RATE_LIMIT = { limit: 5, windowMs: 60 * 60 * 1000 };

export const AUTH_RESPONSE_MIN_MS = 400;

interface RateLimitRpcResult {
  success: boolean;
  remaining: number;
  reset_at: number;
}

export function splitRateLimitKey(key: string): { action: string; bucketKey: string } {
  const separatorIndex = key.indexOf(':');
  if (separatorIndex === -1) {
    return { action: key, bucketKey: 'unknown' };
  }
  return {
    action: key.slice(0, separatorIndex),
    bucketKey: key.slice(separatorIndex + 1),
  };
}

function parseRpcResult(data: unknown, windowMs: number): RateLimitResult {
  if (!data || typeof data !== 'object') {
    return { success: false, remaining: 0, resetAt: Date.now() + windowMs };
  }

  const row = data as RateLimitRpcResult;
  return {
    success: Boolean(row.success),
    remaining: typeof row.remaining === 'number' ? row.remaining : 0,
    resetAt: typeof row.reset_at === 'number' ? row.reset_at : Date.now() + windowMs,
  };
}

/**
 * Postgres-backed rate limit via Supabase RPC — shared across serverless instances.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const { action, bucketKey } = splitRateLimitKey(key);
  const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000));

  try {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc('check_rate_limit', {
      p_bucket_key: bucketKey,
      p_action: action,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });

    if (error) {
      console.error('[rate-limit] check failed', error.message);
      return { success: false, remaining: 0, resetAt: Date.now() + windowMs };
    }

    return parseRpcResult(data, windowMs);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'rate_limit_error';
    console.error('[rate-limit] check failed', message);
    return { success: false, remaining: 0, resetAt: Date.now() + windowMs };
  }
}

export async function getClientIpFromHeaders(): Promise<string> {
  const headersList = await headers();
  return headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
}

export async function withConstantTiming<T>(minMs: number, fn: () => Promise<T>): Promise<T> {
  const start = Date.now();
  try {
    return await fn();
  } finally {
    const elapsed = Date.now() - start;
    if (elapsed < minMs) {
      await new Promise((resolve) => setTimeout(resolve, minMs - elapsed));
    }
  }
}
