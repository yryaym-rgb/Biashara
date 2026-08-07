import { z } from 'zod';
import { localeSchema, phoneSchema } from './common';
import type { Database } from '@/types/database.types';

const userRoles = [
  'buyer',
  'seller',
  'cooperative',
  'admin',
  'institution',
] as const satisfies readonly Database['public']['Enums']['user_role'][];

export const userRoleSchema = z.enum(userRoles);

export const profileUpdateSchema = z.object({
  companyName: z.string().min(1).max(200).optional(),
  country: z.string().length(2).optional(),
  phone: phoneSchema.optional(),
  locale: localeSchema.optional(),
});

const registerRoles = [
  'buyer',
  'seller',
  'cooperative',
  'institution',
] as const satisfies readonly Database['public']['Enums']['user_role'][];

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12).max(128),
  role: z.enum(registerRoles),
  companyName: z.string().min(1).max(200).optional(),
  locale: localeSchema.default('fr'),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
