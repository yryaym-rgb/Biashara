'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { markConversationAsRead, sendMessage } from '@/actions/messages';
import { ListingThumb } from '@/components/marketplace/listing-thumb';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Textarea } from '@/components/ui/input';
import { Link, useRouter } from '@/lib/i18n/navigation';
import { createClient } from '@/lib/supabase/client';
import type {
  ConversationListItem,
  ConversationThreadContext,
  MessageRow,
} from '@/lib/platform/messages';
import { messageCreateSchema } from '@/lib/validators/message';
import { RelativeTime } from '@/components/ui/relative-time';
import { cn } from '@/lib/utils/cn';

export interface MessagesInboxContentProps {
  conversations: ConversationListItem[];
  initialMessages: MessageRow[];
  selectedConversation: ConversationThreadContext | null;
  selectedConversationId: string | null;
  userId: string;
  locale: string;
}

export function MessagesInboxContent({
  conversations,
  initialMessages,
  selectedConversation,
  selectedConversationId,
  userId,
  locale,
}: MessagesInboxContentProps) {
  const t = useTranslations('platform.messages');
  const tMinerals = useTranslations('minerals');
  const tValidation = useTranslations('validation');
  const router = useRouter();

  const [messages, setMessages] = React.useState<MessageRow[]>(initialMessages);
  const [draft, setDraft] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [sendError, setSendError] = React.useState<string | null>(null);
  const [unreadByConversation, setUnreadByConversation] = React.useState<Record<string, boolean>>(
    () => Object.fromEntries(conversations.map((conversation) => [conversation.id, conversation.hasUnread])),
  );

  const threadEndRef = React.useRef<HTMLDivElement>(null);
  const markedReadConversationRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    setMessages((current) =>
      current === initialMessages ? current : initialMessages,
    );
  }, [initialMessages, selectedConversationId]);

  React.useEffect(() => {
    const nextUnread = Object.fromEntries(
      conversations.map((conversation) => [conversation.id, conversation.hasUnread]),
    );
    setUnreadByConversation((current) => {
      const currentKeys = Object.keys(current);
      const nextKeys = Object.keys(nextUnread);
      if (
        currentKeys.length === nextKeys.length &&
        nextKeys.every((key) => current[key] === nextUnread[key])
      ) {
        return current;
      }
      return nextUnread;
    });
  }, [conversations]);

  React.useEffect(() => {
    if (!selectedConversationId) {
      markedReadConversationRef.current = null;
      return;
    }

    if (markedReadConversationRef.current === selectedConversationId) {
      return;
    }

    markedReadConversationRef.current = selectedConversationId;

    void markConversationAsRead({ conversationId: selectedConversationId }).then((result) => {
      if (!result.error) {
        setUnreadByConversation((current) => ({
          ...current,
          [selectedConversationId]: false,
        }));
        router.refresh();
      }
    });
  }, [selectedConversationId, router]);

  React.useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedConversationId]);

  React.useEffect(() => {
    if (!selectedConversationId) {
      return;
    }

    const supabase = createClient();
    const channel = supabase
      .channel(`messages:${selectedConversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as MessageRow;
          setMessages((current) => {
            if (current.some((message) => message.id === newMessage.id)) {
              return current;
            }
            return [...current, newMessage];
          });

          if (newMessage.sender_id !== userId) {
            void markConversationAsRead({ conversationId: selectedConversationId }).then(() => {
              router.refresh();
            });
            setUnreadByConversation((current) => ({
              ...current,
              [selectedConversationId]: false,
            }));
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [selectedConversationId, userId, router]);

  function selectConversation(conversationId: string) {
    router.push(`/messages?conversation=${conversationId}`);
  }

  function clearConversation() {
    router.push('/messages');
  }

  async function handleSend(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedConversationId) {
      return;
    }

    const parsed = messageCreateSchema.safeParse({
      conversationId: selectedConversationId,
      body: draft.trim(),
    });

    if (!parsed.success) {
      setSendError(tValidation('required'));
      return;
    }

    setSending(true);
    setSendError(null);

    try {
      const result = await sendMessage(parsed.data);
      if (result.error || !result.data) {
        setSendError(tValidation('required'));
        return;
      }

      setMessages((current) => {
        if (current.some((message) => message.id === result.data!.id)) {
          return current;
        }
        return [...current, result.data!];
      });
      setDraft('');
    } catch {
      setSendError(tValidation('required'));
    } finally {
      setSending(false);
    }
  }

  if (conversations.length === 0) {
    return (
      <EmptyState
        icon={<MessageSquare className="h-6 w-6" strokeWidth={1.75} />}
        title={t('empty')}
        description={t('emptyDescription')}
        action={
          <Button variant="primary" asChild>
            <Link href="/marketplace">{t('emptyCta')}</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex min-h-[560px] overflow-hidden rounded-card border border-border bg-bg shadow-[var(--shadow-card)]">
      <aside
        className={cn(
          'flex w-full shrink-0 flex-col border-border lg:w-[360px] lg:border-r',
          selectedConversationId ? 'hidden lg:flex' : 'flex',
        )}
        aria-label={t('conversationListLabel')}
      >
        <ul className="divide-y divide-border overflow-y-auto">
          {conversations.map((conversation) => {
            const isSelected = conversation.id === selectedConversationId;
            const hasUnread = unreadByConversation[conversation.id] ?? conversation.hasUnread;

            return (
              <li key={conversation.id}>
                <button
                  type="button"
                  onClick={() => selectConversation(conversation.id)}
                  className={cn(
                    'flex w-full items-start gap-3 px-4 py-4 text-left',
                    'hover:bg-bg-tint motion-safe:transition-colors motion-safe:duration-150',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]',
                    isSelected && 'bg-bg-tint',
                  )}
                  aria-current={isSelected ? 'true' : undefined}
                >
                  <ListingThumb
                    mineral={conversation.mineral}
                    storagePath={conversation.listingPhotoPath}
                    alt={conversation.listingTitle}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-[15px] font-semibold text-ink">
                        {conversation.counterpartyName}
                      </p>
                      {conversation.lastMessageAt ? (
                        <RelativeTime
                          className="shrink-0 text-[12px] text-muted"
                          date={conversation.lastMessageAt}
                          locale={locale}
                        />
                      ) : null}
                    </div>
                    <p className="truncate text-[13px] text-muted">
                      {tMinerals(conversation.mineral)} · {conversation.listingTitle}
                    </p>
                    {conversation.lastMessagePreview ? (
                      <p className="mt-1 truncate text-[13px] text-body">
                        {conversation.lastMessagePreview}
                      </p>
                    ) : null}
                  </div>
                  {hasUnread ? (
                    <span
                      className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-blue"
                      aria-label={t('unreadIndicator')}
                    />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <section
        className={cn(
          'flex min-w-0 flex-1 flex-col',
          selectedConversationId ? 'flex' : 'hidden lg:flex',
        )}
        aria-label={t('threadLabel')}
      >
        {selectedConversation ? (
          <>
            <header className="flex items-center gap-3 border-b border-border px-4 py-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={clearConversation}
                aria-label={t('backToList')}
              >
                <ArrowLeft className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
              </Button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[18px] font-semibold text-ink">
                  {selectedConversation.counterpartyName}
                </p>
                <Link
                  href={`/marketplace/${selectedConversation.listingId}`}
                  className="truncate text-[13px] text-brand-blue hover:underline"
                >
                  {tMinerals(selectedConversation.mineral)} · {selectedConversation.listingTitle}
                </Link>
              </div>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((message) => {
                const isSelf = message.sender_id === userId;

                return (
                  <div
                    key={message.id}
                    className={cn('flex', isSelf ? 'justify-end' : 'justify-start')}
                  >
                    <div
                      className={cn(
                        'max-w-[min(100%,28rem)] rounded-card border px-4 py-3 text-[15px] leading-[1.65]',
                        isSelf
                          ? 'border-brand-blue bg-[color-mix(in_srgb,var(--brand-blue)_8%,var(--bg))] text-ink'
                          : 'border-border bg-bg-tint text-body',
                      )}
                    >
                      <p className="whitespace-pre-wrap break-words">{message.body}</p>
                      <RelativeTime
                        className="mt-2 block text-[12px] text-muted"
                        date={message.created_at}
                        locale={locale}
                      />
                    </div>
                  </div>
                );
              })}
              <div ref={threadEndRef} />
            </div>

            <form
              onSubmit={handleSend}
              className="flex flex-col gap-3 border-t border-border px-4 py-4"
            >
              {sendError ? (
                <p className="text-[13px] text-danger" role="alert">
                  {sendError}
                </p>
              ) : null}
              <Textarea
                label={t('composeLabel')}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                rows={3}
                required
              />
              <div className="flex justify-end">
                <Button type="submit" variant="primary" loading={sending}>
                  {t('send')}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center px-4 py-12 text-center">
            <p className="max-w-sm text-[15px] text-body">{t('selectConversation')}</p>
          </div>
        )}
      </section>
    </div>
  );
}
