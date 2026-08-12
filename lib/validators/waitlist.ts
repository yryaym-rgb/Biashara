import { z } from 'zod';

export const WAITLIST_COUNTRY_CODES = ['ZM', 'TZ', 'RW', 'KE', 'UG', 'OTHER'] as const;

export const waitlistSignupSchema = z.object({
  email: z.string().trim().email().max(320),
  countryInterest: z.enum(WAITLIST_COUNTRY_CODES).optional().nullable(),
});

export type WaitlistSignupInput = z.infer<typeof waitlistSignupSchema>;
