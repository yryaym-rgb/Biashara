'use client';

import * as React from 'react';
import { useRouter } from '@/lib/i18n/navigation';
import { useTranslations } from 'next-intl';
import { createLotAction } from '@/actions/lots';
import { MINERAL_IDS } from '@/lib/constants/minerals';
import { lotCreateSchema } from '@/lib/validators/lot';
import { Button } from '@/components/ui/button';
import { Input, Select, Textarea } from '@/components/ui/input';
import type { CooperativeSiteRow } from '@/lib/platform/lots.types';

export interface LotNewFormProps {
  sites: CooperativeSiteRow[];
}

export function LotNewForm({ sites }: LotNewFormProps) {
  const t = useTranslations('platform.lots.new');
  const tMinerals = useTranslations('minerals');
  const tValidation = useTranslations('validation');
  const router = useRouter();

  const [mineral, setMineral] = React.useState('');
  const [initialWeightKg, setInitialWeightKg] = React.useState('');
  const [siteId, setSiteId] = React.useState(sites[0]?.id ?? '');
  const [extractionDate, setExtractionDate] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const siteOptions = sites.map((site) => ({
    value: site.id,
    label: `${site.site_name} (${site.zea_reference})`,
  }));

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const parsed = lotCreateSchema.safeParse({
      mineral,
      initialWeightKg: Number(initialWeightKg),
      siteId,
      extractionDate,
      notes: notes.trim() || undefined,
    });

    if (!parsed.success) {
      setFormError(tValidation('required'));
      return;
    }

    setLoading(true);
    try {
      const result = await createLotAction(parsed.data);
      if (result.error) {
        if (result.error === 'forbidden') {
          setFormError(t('forbidden'));
        } else if (result.error === 'siteNotFound') {
          setFormError(t('siteNotFound'));
        } else {
          setFormError(t('error'));
        }
        return;
      }

      router.push(`/lots/${result.data?.id}`);
      router.refresh();
    } catch {
      setFormError(t('error'));
    } finally {
      setLoading(false);
    }
  }

  if (sites.length === 0) {
    return (
      <p className="text-[15px] text-body">
        {t('noSites')}{' '}
        <a href="/settings" className="text-brand-blue underline-offset-2 hover:underline">
          {t('noSitesCta')}
        </a>
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <p className="text-[13px] text-muted">{t('selfReportedNotice')}</p>

      {formError ? (
        <p className="text-[13px] text-danger" role="alert">
          {formError}
        </p>
      ) : null}

      <Select
        label={t('mineral')}
        value={mineral}
        onChange={(event) => setMineral(event.target.value)}
        error={fieldErrors.mineral}
        required
        placeholder={t('mineral')}
        options={MINERAL_IDS.map((id) => ({
          value: id,
          label: tMinerals(id),
        }))}
      />

      <Input
        label={t('initialWeight')}
        type="number"
        min="0"
        step="0.001"
        value={initialWeightKg}
        onChange={(event) => setInitialWeightKg(event.target.value)}
        hint={t('initialWeightHint')}
        error={fieldErrors.initialWeightKg}
        required
      />

      <Select
        label={t('site')}
        value={siteId}
        onChange={(event) => setSiteId(event.target.value)}
        options={siteOptions}
        error={fieldErrors.siteId}
        required
      />

      <Input
        label={t('extractionDate')}
        type="date"
        value={extractionDate}
        onChange={(event) => setExtractionDate(event.target.value)}
        error={fieldErrors.extractionDate}
        required
      />

      <Textarea
        label={t('notes')}
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        rows={4}
        hint={t('notesHint')}
      />

      <Button type="submit" variant="primary" loading={loading} className="w-full sm:w-auto">
        {t('submit')}
      </Button>
    </form>
  );
}
