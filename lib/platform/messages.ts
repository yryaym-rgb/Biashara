import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { displayName } from '@/lib/admin/display';
import type { MineralId } from '@/lib/constants/minerals';
import type { Database } from '@/types/database.types';

type MessageRow = Pick<
  Database['public']['Tables']['messages']['Row'],
  'id' | 'conversation_id' | 'sender_id' | 'body' | 'read_at' | 'created_at'
>;

export type { MessageRow };

export interface ConversationListItem {
  id: string;
  listingId: string | null;
  rfpId: string | null;
  listingTitle: string;
  mineral: MineralId;
  listingPhotoPath: string | null;
  counterpartyName: string;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  hasUnread: boolean;
}

export interface ConversationThreadContext {
  id: string;
  listingId: string | null;
  rfpId: string | null;
  listingTitle: string;
  mineral: MineralId;
  counterpartyName: string;
}

const PREVIEW_MAX_LENGTH = 80;

export function isUnreadMessage(
  message: Pick<MessageRow, 'sender_id' | 'read_at'>,
  userId: string,
): boolean {
  return message.sender_id !== userId && message.read_at === null;
}

export function conversationHasUnread(
  messages: Array<Pick<MessageRow, 'sender_id' | 'read_at'>>,
  userId: string,
): boolean {
  return messages.some((message) => isUnreadMessage(message, userId));
}

export function countUnreadConversations(
  messages: Array<Pick<MessageRow, 'conversation_id' | 'sender_id' | 'read_at'>>,
  userId: string,
): number {
  const unreadConversationIds = new Set<string>();

  for (const message of messages) {
    if (isUnreadMessage(message, userId)) {
      unreadConversationIds.add(message.conversation_id);
    }
  }

  return unreadConversationIds.size;
}

export function truncateMessagePreview(body: string, maxLength = PREVIEW_MAX_LENGTH): string {
  const trimmed = body.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return `${trimmed.slice(0, maxLength).trimEnd()}…`;
}

export function pickLatestMessage<T extends { created_at: string }>(messages: T[]): T | null {
  if (messages.length === 0) {
    return null;
  }

  return messages.reduce((latest, message) =>
    message.created_at > latest.created_at ? message : latest,
  );
}

function resolveListingPhotoPath(
  photos: Array<{ storage_path: string; sort_order: number }> | null | undefined,
): string | null {
  if (!photos?.length) {
    return null;
  }

  const sorted = [...photos].sort((a, b) => a.sort_order - b.sort_order);
  return sorted[0]?.storage_path ?? null;
}

export function buildConversationListItems(
  conversations: Array<{
    id: string;
    listing_id: string | null;
    rfp_id: string | null;
    buyer_id: string;
    seller_id: string;
    created_at: string;
    listing:
      | {
          title: string;
          mineral: MineralId;
          listing_photos: Array<{ storage_path: string; sort_order: number }> | null;
        }
      | Array<{
          title: string;
          mineral: MineralId;
          listing_photos: Array<{ storage_path: string; sort_order: number }> | null;
        }>
      | null;
    rfp:
      | {
          mineral: MineralId;
          description: string;
        }
      | Array<{
          mineral: MineralId;
          description: string;
        }>
      | null;
    buyer: { company_name: string | null } | Array<{ company_name: string | null }> | null;
    seller: { company_name: string | null } | Array<{ company_name: string | null }> | null;
  }>,
  messages: MessageRow[],
  userId: string,
  counterpartyFallback: string,
): ConversationListItem[] {
  const messagesByConversation = new Map<string, MessageRow[]>();

  for (const message of messages) {
    const existing = messagesByConversation.get(message.conversation_id) ?? [];
    existing.push(message);
    messagesByConversation.set(message.conversation_id, existing);
  }

  const items = conversations.map((conversation) => {
    const listing = Array.isArray(conversation.listing)
      ? conversation.listing[0]
      : conversation.listing;
    const rfp = Array.isArray(conversation.rfp) ? conversation.rfp[0] : conversation.rfp;
    const buyer = Array.isArray(conversation.buyer) ? conversation.buyer[0] : conversation.buyer;
    const seller = Array.isArray(conversation.seller)
      ? conversation.seller[0]
      : conversation.seller;
    const conversationMessages = messagesByConversation.get(conversation.id) ?? [];
    const latestMessage = pickLatestMessage(conversationMessages);
    const counterparty =
      conversation.buyer_id === userId ? seller?.company_name : buyer?.company_name;
    const mineral = (listing?.mineral ?? rfp?.mineral ?? 'cobalt') as MineralId;
    const listingTitle = listing?.title ?? rfp?.description ?? '';

    return {
      id: conversation.id,
      listingId: conversation.listing_id,
      rfpId: conversation.rfp_id,
      listingTitle,
      mineral,
      listingPhotoPath: resolveListingPhotoPath(listing?.listing_photos ?? null),
      counterpartyName: displayName(counterparty ?? null, counterpartyFallback),
      lastMessagePreview: latestMessage ? truncateMessagePreview(latestMessage.body) : null,
      lastMessageAt: latestMessage?.created_at ?? conversation.created_at,
      hasUnread: conversationHasUnread(conversationMessages, userId),
    };
  });

  return items.sort(
    (a, b) => new Date(b.lastMessageAt ?? 0).getTime() - new Date(a.lastMessageAt ?? 0).getTime(),
  );
}

export async function getConversationsForUser(
  userId: string,
  counterpartyFallback: string,
): Promise<ConversationListItem[]> {
  const supabase = await createClient();

  const { data: conversations, error } = await supabase
    .from('conversations')
    .select(
      `
        id,
        listing_id,
        rfp_id,
        buyer_id,
        seller_id,
        created_at,
        listing:listings(
          title,
          mineral,
          listing_photos(storage_path, sort_order)
        ),
        rfp:rfps(mineral, description),
        buyer:profiles!conversations_buyer_id_fkey(company_name),
        seller:profiles!conversations_seller_id_fkey(company_name)
      `,
    )
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);

  if (error) {
    throw new Error(error.message);
  }

  if (!conversations?.length) {
    return [];
  }

  const conversationIds = conversations.map((conversation) => conversation.id);
  const { data: messages, error: messagesError } = await supabase
    .from('messages')
    .select('id, conversation_id, sender_id, body, read_at, created_at')
    .in('conversation_id', conversationIds)
    .order('created_at', { ascending: true });

  if (messagesError) {
    throw new Error(messagesError.message);
  }

  return buildConversationListItems(conversations, messages ?? [], userId, counterpartyFallback);
}

export async function getUnreadConversationCount(userId: string): Promise<number> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('messages')
    .select('conversation_id, sender_id, read_at, conversations!inner(buyer_id, seller_id)')
    .neq('sender_id', userId)
    .is('read_at', null)
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`, { foreignTable: 'conversations' });

  if (error) {
    throw new Error(error.message);
  }

  return countUnreadConversations(data ?? [], userId);
}

export async function getConversationThreadContext(
  conversationId: string,
  userId: string,
  counterpartyFallback: string,
): Promise<ConversationThreadContext | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('conversations')
    .select(
      `
        id,
        listing_id,
        rfp_id,
        buyer_id,
        seller_id,
        listing:listings(title, mineral),
        rfp:rfps(mineral, description),
        buyer:profiles!conversations_buyer_id_fkey(company_name),
        seller:profiles!conversations_seller_id_fkey(company_name)
      `,
    )
    .eq('id', conversationId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data || (data.buyer_id !== userId && data.seller_id !== userId)) {
    return null;
  }

  const listing = Array.isArray(data.listing) ? data.listing[0] : data.listing;
  const rfp = Array.isArray(data.rfp) ? data.rfp[0] : data.rfp;
  const buyer = Array.isArray(data.buyer) ? data.buyer[0] : data.buyer;
  const seller = Array.isArray(data.seller) ? data.seller[0] : data.seller;
  const counterparty = data.buyer_id === userId ? seller?.company_name : buyer?.company_name;

  return {
    id: data.id,
    listingId: data.listing_id,
    rfpId: data.rfp_id,
    listingTitle: listing?.title ?? rfp?.description ?? '',
    mineral: (listing?.mineral ?? rfp?.mineral ?? 'cobalt') as MineralId,
    counterpartyName: displayName(counterparty ?? null, counterpartyFallback),
  };
}

export async function getMessagesForConversation(conversationId: string): Promise<MessageRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('messages')
    .select('id, conversation_id, sender_id, body, read_at, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
