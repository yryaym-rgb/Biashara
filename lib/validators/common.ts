import { z } from 'zod';

export const uuidSchema = z.string().uuid();

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const currencySchema = z.string().length(3).toUpperCase();

export const localeSchema = z.enum(['fr', 'en']);

export const phoneSchema = z
  .string()
  .min(8)
  .max(20)
  .regex(/^\+?[0-9\s\-()]+$/, 'Invalid phone format');

export type PaginationInput = z.infer<typeof paginationSchema>;
