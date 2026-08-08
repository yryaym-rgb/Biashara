import { z } from 'zod';

export const messageCreateSchema = z.object({
  conversationId: z.string().uuid(),
  body: z.string().min(1).max(5000),
});

export const conversationCreateSchema = z.object({
  listingId: z.string().uuid(),
});

export const markConversationReadSchema = z.object({
  conversationId: z.string().uuid(),
});

export type MessageCreateInput = z.infer<typeof messageCreateSchema>;
export type ConversationCreateInput = z.infer<typeof conversationCreateSchema>;
export type MarkConversationReadInput = z.infer<typeof markConversationReadSchema>;
