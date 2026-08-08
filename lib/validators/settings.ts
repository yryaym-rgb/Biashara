import { z } from 'zod';
import { phoneSchema } from './common';
import { PROFILE_COUNTRY_CODES } from '@/lib/constants/countries';

export const profileSettingsFormSchema = z.object({
  companyName: z.string().trim().min(1).max(200),
  country: z.enum(PROFILE_COUNTRY_CODES),
  phone: z.union([z.literal(''), phoneSchema]).optional(),
});

export const changePasswordSchema = z
  .object({
    password: z.string().min(12).max(128),
    passwordConfirm: z.string().min(12).max(128),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'passwordMismatch',
    path: ['passwordConfirm'],
  });

export type ProfileSettingsFormInput = z.infer<typeof profileSettingsFormSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
