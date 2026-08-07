import { z } from 'zod';
import { localeSchema } from './common';
import type { Database } from '@/types/database.types';

const registerRoles = [
  'buyer',
  'seller',
  'cooperative',
] as const satisfies readonly Database['public']['Enums']['user_role'][];

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const registerStep1Schema = z
  .object({
    fullName: z.string().min(2).max(200),
    email: z.string().email(),
    password: z.string().min(12).max(128),
    passwordConfirm: z.string().min(12).max(128),
    role: z.enum(registerRoles),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: 'termsRequired' }),
    }),
    locale: localeSchema.default('fr'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'passwordMismatch',
    path: ['passwordConfirm'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const otpLoginSchema = z.object({
  email: z.string().email(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterStep1Input = z.infer<typeof registerStep1Schema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
