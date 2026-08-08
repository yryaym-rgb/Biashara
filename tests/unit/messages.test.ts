import { describe, it, expect } from 'vitest';
import {
  buildConversationListItems,
  conversationHasUnread,
  countUnreadConversations,
  isUnreadMessage,
  pickLatestMessage,
  truncateMessagePreview,
} from '@/lib/platform/messages';

const USER_ID = '00000000-0000-4000-8000-000000000001';
const OTHER_ID = '00000000-0000-4000-8000-000000000002';

describe('message unread helpers', () => {
  it('treats counterpart messages without read_at as unread', () => {
    expect(isUnreadMessage({ sender_id: OTHER_ID, read_at: null }, USER_ID)).toBe(true);
    expect(isUnreadMessage({ sender_id: USER_ID, read_at: null }, USER_ID)).toBe(false);
    expect(
      isUnreadMessage({ sender_id: OTHER_ID, read_at: '2026-01-01T00:00:00.000Z' }, USER_ID),
    ).toBe(false);
  });

  it('detects unread state for a conversation', () => {
    expect(
      conversationHasUnread(
        [
          { sender_id: USER_ID, read_at: null },
          { sender_id: OTHER_ID, read_at: null },
        ],
        USER_ID,
      ),
    ).toBe(true);

    expect(
      conversationHasUnread(
        [
          { sender_id: USER_ID, read_at: null },
          { sender_id: OTHER_ID, read_at: '2026-01-01T00:00:00.000Z' },
        ],
        USER_ID,
      ),
    ).toBe(false);
  });

  it('counts distinct conversations with unread messages', () => {
    expect(
      countUnreadConversations(
        [
          {
            conversation_id: '11111111-1111-4111-8111-111111111111',
            sender_id: OTHER_ID,
            read_at: null,
          },
          {
            conversation_id: '11111111-1111-4111-8111-111111111111',
            sender_id: OTHER_ID,
            read_at: null,
          },
          {
            conversation_id: '22222222-2222-4222-8222-222222222222',
            sender_id: OTHER_ID,
            read_at: '2026-01-01T00:00:00.000Z',
          },
          {
            conversation_id: '33333333-3333-4333-8333-333333333333',
            sender_id: OTHER_ID,
            read_at: null,
          },
        ],
        USER_ID,
      ),
    ).toBe(2);
  });
});

describe('message list helpers', () => {
  it('truncates long previews with an ellipsis', () => {
    const longBody = 'a'.repeat(120);
    expect(truncateMessagePreview(longBody, 80)).toBe(`${'a'.repeat(80)}…`);
    expect(truncateMessagePreview('  short message  ')).toBe('short message');
  });

  it('picks the latest message by created_at', () => {
    expect(
      pickLatestMessage([
        { created_at: '2026-01-01T10:00:00.000Z' },
        { created_at: '2026-01-02T10:00:00.000Z' },
      ]),
    ).toEqual({ created_at: '2026-01-02T10:00:00.000Z' });
  });

  it('builds conversation rows ordered by latest message time with unread flags', () => {
    const conversations = [
      {
        id: '11111111-1111-4111-8111-111111111111',
        listing_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        buyer_id: USER_ID,
        seller_id: OTHER_ID,
        created_at: '2026-01-01T00:00:00.000Z',
        listing: {
          title: 'Cobalt lot A',
          mineral: 'cobalt' as const,
          listing_photos: [{ storage_path: 'photos/a.jpg', sort_order: 0 }],
        },
        buyer: { company_name: 'Buyer Co' },
        seller: { company_name: 'Seller Co' },
      },
      {
        id: '22222222-2222-4222-8222-222222222222',
        listing_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
        buyer_id: OTHER_ID,
        seller_id: USER_ID,
        created_at: '2026-01-01T00:00:00.000Z',
        listing: {
          title: 'Copper lot B',
          mineral: 'copper' as const,
          listing_photos: [],
        },
        buyer: { company_name: 'Buyer Two' },
        seller: { company_name: 'Seller Co' },
      },
    ];

    const messages = [
      {
        id: 'm1',
        conversation_id: '11111111-1111-4111-8111-111111111111',
        sender_id: OTHER_ID,
        body: 'Hello buyer',
        read_at: null,
        created_at: '2026-01-02T10:00:00.000Z',
      },
      {
        id: 'm2',
        conversation_id: '22222222-2222-4222-8222-222222222222',
        sender_id: OTHER_ID,
        body: 'Latest seller message',
        read_at: '2026-01-03T00:00:00.000Z',
        created_at: '2026-01-03T12:00:00.000Z',
      },
    ];

    const items = buildConversationListItems(conversations, messages, USER_ID, 'Counterparty');

    expect(items.map((item) => item.id)).toEqual([
      '22222222-2222-4222-8222-222222222222',
      '11111111-1111-4111-8111-111111111111',
    ]);
    expect(items[0]?.counterpartyName).toBe('Buyer Two');
    expect(items[0]?.hasUnread).toBe(false);
    expect(items[1]?.hasUnread).toBe(true);
    expect(items[1]?.lastMessagePreview).toBe('Hello buyer');
  });
});

describe('mark as read eligibility', () => {
  it('only marks counterpart messages that are still unread', () => {
    const messages = [
      { sender_id: USER_ID, read_at: null },
      { sender_id: OTHER_ID, read_at: null },
      { sender_id: OTHER_ID, read_at: '2026-01-01T00:00:00.000Z' },
    ];

    const eligible = messages.filter((message) => isUnreadMessage(message, USER_ID));
    expect(eligible).toHaveLength(1);
    expect(eligible[0]?.sender_id).toBe(OTHER_ID);
  });
});
