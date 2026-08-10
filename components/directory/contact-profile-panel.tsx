'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { createProfileConversation, sendMessage } from '@/actions/messages';
import { messageCreateSchema } from '@/lib/validators/message';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';

export interface ContactProfilePanelProps {
  targetUserId: string;
  canContact: boolean;
  contactAvailable: boolean;
  loginHref: string;
}

export function ContactProfilePanel({
  targetUserId,
  canContact,
  contactAvailable,
  loginHref,
}: ContactProfilePanelProps) {
  const t = useTranslations('platform.directory.detail');
  const tValidation = useTranslations('validation');

  const [conversationId, setConversationId] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  async function openConversation() {
    setLoading(true);
    setError(null);
    try {
      const result = await createProfileConversation({ targetUserId });
      if ('error' in result && result.error) {
        setError(t('contactUnavailable'));
        return;
      }
      if (!('data' in result) || !result.data) {
        setError(t('contactUnavailable'));
        return;
      }
      setConversationId(result.data.id);
    } catch {
      setError(t('contactUnavailable'));
    } finally {
      setLoading(false);
    }
  }

  async function handleSendMessage(event: React.FormEvent) {
    event.preventDefault();
    if (!conversationId) return;

    const parsed = messageCreateSchema.safeParse({
      conversationId,
      body: message.trim(),
    });

    if (!parsed.success) {
      setError(tValidation('required'));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await sendMessage(parsed.data);
      if (result.error) {
        setError(tValidation('required'));
        return;
      }
      setSuccess(true);
      setMessage('');
    } catch {
      setError(tValidation('required'));
    } finally {
      setLoading(false);
    }
  }

  if (!contactAvailable) {
    return (
      <p className="text-[15px] text-muted" role="status">
        {t('contactUnavailable')}
      </p>
    );
  }

  if (!canContact) {
    return (
      <Button asChild variant="secondary" className="w-full sm:w-auto">
        <Link href={loginHref}>{t('loginToContact')}</Link>
      </Button>
    );
  }

  if (!conversationId) {
    return (
      <Button
        type="button"
        variant="secondary"
        onClick={() => void openConversation()}
        loading={loading}
        className="w-full sm:w-auto"
      >
        {t('contact')}
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-card border border-border p-6">
      <p className="text-[15px] text-body" role="status">
        {t('contactSuccess')}
      </p>

      {error ? (
        <p className="text-[13px] text-danger" role="alert">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="text-[13px] text-success" role="status">
          {t('contactSend')}
        </p>
      ) : null}

      <form onSubmit={handleSendMessage} className="flex flex-col gap-4">
        <Textarea
          label={t('contactMessage')}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={4}
          required
        />
        <Button type="submit" variant="secondary" loading={loading}>
          {t('contactSend')}
        </Button>
      </form>
    </div>
  );
}
