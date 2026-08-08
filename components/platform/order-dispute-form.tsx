'use client';

import * as React from 'react';
import { useRouter } from '@/lib/i18n/navigation';
import { useTranslations } from 'next-intl';
import { disputeOrder } from '@/actions/orders';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import type { Database } from '@/types/database.types';

export interface OrderDisputeFormProps {
  orderId: string;
  status: Database['public']['Enums']['order_status'];
  hasConversation: boolean;
}

export function OrderDisputeForm({
  orderId,
  status,
  hasConversation,
}: OrderDisputeFormProps) {
  const t = useTranslations('platform.orders');
  const tValidation = useTranslations('validation');
  const router = useRouter();

  const [open, setOpen] = React.useState(false);
  const [reason, setReason] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [submitted, setSubmitted] = React.useState(status === 'disputed');

  if (submitted || status === 'disputed') {
    return (
      <div className="rounded-card border border-border bg-bg-tint p-6">
        <p className="text-[15px] text-body">{t('disputeSubmitted')}</p>
        {hasConversation ? (
          <p className="mt-2 text-[13px] text-muted">{t('disputeContactHint')}</p>
        ) : null}
      </div>
    );
  }

  if (!open) {
    return (
      <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
        {t('disputeCta')}
      </Button>
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await disputeOrder({ orderId, reason });
      if (result.error) {
        if (result.error === 'validation') {
          setError(tValidation('required'));
        } else if (result.error === 'forbidden') {
          setError(t('disputeForbidden'));
        } else {
          setError(t('disputeError'));
        }
        return;
      }

      setSubmitted(true);
      router.refresh();
    } catch {
      setError(t('disputeError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-card border border-border p-6"
    >
      <h3 className="text-[18px] font-semibold text-ink">{t('disputeTitle')}</h3>
      <Textarea
        label={t('disputeReasonLabel')}
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        rows={4}
        required
      />
      {error ? (
        <p className="text-[13px] text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant="primary" loading={loading}>
          {t('disputeSubmit')}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setOpen(false);
            setReason('');
            setError(null);
          }}
          disabled={loading}
        >
          {t('disputeCancel')}
        </Button>
      </div>
    </form>
  );
}
