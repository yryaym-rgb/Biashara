'use client';

import * as React from 'react';
import { useRouter } from '@/lib/i18n/navigation';
import { useTranslations } from 'next-intl';
import { addLotCustodyCheckpointAction } from '@/actions/lots';
import { CUSTODY_STAGE_IDS } from '@/lib/validators/lot';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Select, Textarea } from '@/components/ui/input';
import { formatDateTime } from '@/lib/utils/dates';
import type { CustodyEventRow } from '@/lib/platform/lots';

export interface LotCustodySectionProps {
  lotId: string;
  events: CustodyEventRow[];
  canEdit: boolean;
  locale: string;
}

export function LotCustodySection({
  lotId,
  events,
  canEdit,
  locale,
}: LotCustodySectionProps) {
  const t = useTranslations('platform.lots.custody');
  const router = useRouter();

  const [eventType, setEventType] = React.useState('');
  const [note, setNote] = React.useState('');
  const [occurredAt, setOccurredAt] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const stageOptions = CUSTODY_STAGE_IDS.map((stage) => ({
    value: stage,
    label: t(`stages.${stage}`),
  }));

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canEdit) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await addLotCustodyCheckpointAction({
        lotId,
        eventType,
        note,
        occurredAt: occurredAt ? new Date(occurredAt).toISOString() : undefined,
      });

      if (result.error) {
        setError(result.error === 'forbidden' ? t('forbidden') : t('saveError'));
        return;
      }

      setEventType('');
      setNote('');
      setOccurredAt('');
      router.refresh();
    } catch {
      setError(t('saveError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <p className="text-[13px] text-muted">{t('selfReportedNotice')}</p>

        {error ? (
          <p className="text-[13px] text-danger" role="alert">
            {error}
          </p>
        ) : null}

        {events.length === 0 ? (
          <p className="text-[15px] text-body">{t('empty')}</p>
        ) : (
          <ol className="flex flex-col gap-4">
            {events.map((checkpoint) => (
              <li
                key={checkpoint.id}
                className="rounded-card border border-border p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-brand-blue">
                    {t(`stages.${checkpoint.event_type as (typeof CUSTODY_STAGE_IDS)[number]}`)}
                  </p>
                  <p className="text-[13px] text-muted">
                    {formatDateTime(checkpoint.occurred_at, locale)}
                  </p>
                </div>
                {checkpoint.notes ? (
                  <p className="mt-2 text-[15px] text-body">{checkpoint.notes}</p>
                ) : null}
              </li>
            ))}
          </ol>
        )}

        {canEdit ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 border-t border-border pt-6">
            <h3 className="text-[18px] font-semibold text-ink">{t('addTitle')}</h3>
            <Select
              label={t('stageLabel')}
              value={eventType}
              onChange={(event) => setEventType(event.target.value)}
              options={stageOptions}
              placeholder={t('stageLabel')}
              required
            />
            <Textarea
              label={t('noteLabel')}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
              required
            />
            <Input
              label={t('timestampLabel')}
              type="datetime-local"
              value={occurredAt}
              onChange={(event) => setOccurredAt(event.target.value)}
              hint={t('timestampHint')}
            />
            <Button
              type="submit"
              variant="secondary"
              loading={loading}
              className="w-full sm:w-auto"
            >
              {t('addCta')}
            </Button>
          </form>
        ) : null}
      </CardContent>
    </Card>
  );
}
