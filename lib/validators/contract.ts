import { z } from 'zod';

export const contractSignSchema = z.object({
  orderId: z.string().uuid(),
  party: z.enum(['buyer', 'seller']),
});

export const contractUploadSchema = z.object({
  orderId: z.string().uuid(),
  storagePath: z.string().min(1).max(500),
});

export type ContractSignInput = z.infer<typeof contractSignSchema>;
export type ContractUploadInput = z.infer<typeof contractUploadSchema>;
