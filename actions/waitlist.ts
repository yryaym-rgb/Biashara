'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import {
  checkRateLimit,
  getClientIpFromHeaders,
  WAITLIST_SIGNUP_RATE_LIMIT,
} from '@/lib/rate-limit';
import { waitlistSignupSchema } from '@/lib/validators/waitlist';

export type WaitlistSignupResult =
  | { ok: true; alreadyRegistered: boolean }
  | { ok: false; errorKey: 'invalidEmail' | 'rateLimited' | 'unknown' };

export async function waitlistSignupAction(input: unknown): Promise<WaitlistSignupResult> {
  const parsed = waitlistSignupSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errorKey: 'invalidEmail' };
  }

  const ip = await getClientIpFromHeaders();
  const limit = await checkRateLimit(
    `waitlist:${ip}`,
    WAITLIST_SIGNUP_RATE_LIMIT.limit,
    WAITLIST_SIGNUP_RATE_LIMIT.windowMs,
  );

  if (!limit.success) {
    return { ok: false, errorKey: 'rateLimited' };
  }

  const email = parsed.data.email.toLowerCase();
  const countryInterest = parsed.data.countryInterest ?? null;

  try {
    const admin = createAdminClient();
    const { error } = await admin.from('waitlist_signups').insert({
      email,
      country_interest: countryInterest,
    });

    if (error?.code === '23505') {
      return { ok: true, alreadyRegistered: true };
    }

    if (error) {
      console.error('[waitlist] insert failed:', error);
      return { ok: false, errorKey: 'unknown' };
    }

    return { ok: true, alreadyRegistered: false };
  } catch (error) {
    console.error('[waitlist] unexpected error:', error);
    return { ok: false, errorKey: 'unknown' };
  }
}
