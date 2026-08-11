'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';
import {
  createMiningEvent,
  deleteMiningEvent,
  updateMiningEvent,
} from '@/actions/admin/mining-events';
import { MINING_EVENT_CATEGORIES } from '@/lib/constants/mining-events';
import {
  miningEventCreateSchema,
  miningEventUpdateSchema,
} from '@/lib/validators/admin';
import { Button } from '@/components/ui/button';
import { Input, Select, Textarea } from '@/components/ui/input';
import type { MiningEventRow } from '@/lib/calendar/queries';

export interface MiningEventFormProps {
  mode: 'create' | 'edit';
  event?: MiningEventRow;
  cancelHref: string;
}

export function MiningEventForm({ mode, event, cancelHref }: MiningEventFormProps) {
  const t = useTranslations('admin.miningEvents.form');
  const tCategories = useTranslations('marketing.calendar.categories');
  const tValidation = useTranslations('validation');
  const router = useRouter();

  const [title, setTitle] = React.useState(event?.title ?? '');
  const [description, setDescription] = React.useState(event?.description ?? '');
  const [eventDate, setEventDate] = React.useState(event?.event_date ?? '');
  const [category, setCategory] = React.useState(event?.category ?? '');
  const [sourceUrl, setSourceUrl] = React.useState(event?.source_url ?? '');
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(submitEvent: React.FormEvent) {
    submitEvent.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const payload = {
      title: title.trim(),
      description: description.trim(),
      eventDate,
      category,
      sourceUrl: sourceUrl.trim() || undefined,
    };

    const parsed =
      mode === 'edit' && event
        ? miningEventUpdateSchema.safeParse({ ...payload, eventId: event.id })
        : miningEventCreateSchema.safeParse(payload);

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as string;
        if (field === 'sourceUrl') {
          errors[field] = tValidation('invalidUrl');
        } else if (field === 'description') {
          errors[field] = tValidation('descriptionMin');
        } else {
          errors[field] = tValidation('required');
        }
      }
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const result =
        mode === 'edit'
          ? await updateMiningEvent(parsed.data)
          : await createMiningEvent(parsed.data);

      if (result.error) {
        setFormError(t('submitError'));
        return;
      }

      router.push(cancelHref);
      router.refresh();
    } catch {
      setFormError(t('submitError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex max-w-2xl flex-col gap-6 rounded-card border border-border p-6"
    >
      {formError ? (
        <p className="text-[13px] text-danger" role="alert">
          {formError}
        </p>
      ) : null}

      <Input
        label={t('title')}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        error={fieldErrors.title}
        required
        maxLength={200}
      />

      <Textarea
        label={t('description')}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        error={fieldErrors.description}
        required
        rows={5}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={t('eventDate')}
          type="date"
          value={eventDate}
          onChange={(event) => setEventDate(event.target.value)}
          error={fieldErrors.eventDate}
          required
        />

        <Select
          label={t('category')}
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          error={fieldErrors.category}
          placeholder={t('categoryPlaceholder')}
          options={MINING_EVENT_CATEGORIES.map((value) => ({
            value,
            label: tCategories(value),
          }))}
          required
        />
      </div>

      <Input
        label={t('sourceUrl')}
        type="url"
        value={sourceUrl}
        onChange={(event) => setSourceUrl(event.target.value)}
        error={fieldErrors.sourceUrl}
        hint={t('sourceUrlHint')}
      />

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={loading}>
          {mode === 'edit' ? t('save') : t('create')}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push(cancelHref)}>
          {t('cancel')}
        </Button>
      </div>
    </form>
  );
}

export interface MiningEventDeleteButtonProps {
  eventId: string;
}

export function MiningEventDeleteButton({ eventId }: MiningEventDeleteButtonProps) {
  const t = useTranslations('admin.miningEvents');
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  async function handleDelete() {
    if (!window.confirm(t('deleteConfirm'))) {
      return;
    }

    setLoading(true);
    try {
      const result = await deleteMiningEvent({ eventId });
      if (result.error) {
        window.alert(t('deleteError'));
        return;
      }
      router.refresh();
    } catch {
      window.alert(t('deleteError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={handleDelete}
      disabled={loading}
      className="text-danger"
    >
      {t('delete')}
    </Button>
  );
}
