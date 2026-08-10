import { setRequestLocale, getTranslations } from 'next-intl/server';
import { requireAuth } from '@/lib/rbac';
import { getProfile } from '@/lib/auth/session';
import { Container } from '@/components/ui/container';
import { MessagesInboxContent } from '@/components/platform/messages-inbox-content';
import {
  getConversationThreadContext,
  getConversationsForUser,
  getMessagesForConversation,
} from '@/lib/platform/messages';
import { safeQuery } from '@/lib/safe-query';

export const dynamic = 'force-dynamic';

export default async function MessagesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ conversation?: string }>;
}) {
  const { locale } = await params;
  const { conversation: conversationId } = await searchParams;
  setRequestLocale(locale);

  const profile = requireAuth(await getProfile());
  const t = await getTranslations({ locale, namespace: 'platform.messages' });

  const conversations = await safeQuery(
    'messages/conversations',
    () => getConversationsForUser(profile.id, t('counterpartyUnknown')),
    [],
  );
  const selectedConversationId =
    conversationId && conversations.some((conversation) => conversation.id === conversationId)
      ? conversationId
      : null;

  const [selectedConversation, initialMessages] = await Promise.all([
    selectedConversationId
      ? safeQuery(
          'messages/thread-context',
          () =>
            getConversationThreadContext(
              selectedConversationId,
              profile.id,
              t('counterpartyUnknown'),
            ),
          null,
        )
      : Promise.resolve(null),
    selectedConversationId
      ? safeQuery(
          'messages/thread-messages',
          () => getMessagesForConversation(selectedConversationId),
          [],
        )
      : Promise.resolve([]),
  ]);

  return (
    <Container>
      <MessagesInboxContent
        conversations={conversations}
        initialMessages={initialMessages}
        selectedConversation={selectedConversation}
        selectedConversationId={selectedConversationId}
        userId={profile.id}
        locale={locale}
      />
    </Container>
  );
}
