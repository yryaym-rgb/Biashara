import { z } from 'zod';

export const contractConfirmSchema = z.object({
  orderId: z.string().uuid(),
  party: z.enum(['buyer', 'seller']),
});

export const contractUploadSchema = z.object({
  orderId: z.string().uuid(),
  storagePath: z.string().min(1).max(500),
});

export type ContractConfirmInput = z.infer<typeof contractConfirmSchema>;
export type ContractUploadInput = z.infer<typeof contractUploadSchema>;

/** @deprecated Use contractConfirmSchema */
export const contractSignSchema = contractConfirmSchema;
/** @deprecated Use ContractConfirmInput */
export type ContractSignInput = ContractConfirmInput;
