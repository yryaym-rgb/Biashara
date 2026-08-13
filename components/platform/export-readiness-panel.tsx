'use client';

import * as React from 'react';
import { useRouter } from '@/lib/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { updateExportReadinessItemAction } from '@/actions/export-readiness';
import {
  EXPORT_READINESS_ITEM_COUNT,
  EXPORT_READINESS_ITEM_KEYS,
  type ExportReadinessItemKey,
} from '@/lib/constants/export-readiness';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldWrapper, Select, Textarea } from '@/components/ui/input';
import { Link } from '@/lib/i18n/navigation';
import { formatDateTime } from '@/lib/utils/dates';
import type {
  ExportReadinessDocumentOption,
  ExportReadinessItemView,
} from '@/lib/platform/export-readiness';

export interface ExportReadinessPanelProps {
  items: ExportReadinessItemView[];
  documents: ExportReadinessDocumentOption[];
  locale: string;
}

function buildItemState(items: ExportReadinessItemView[]) {
  return Object.fromEntries(
    items.map((item) => [
      item.item_key,
      {
        isComplete: item.is_complete,
        notes: item.notes ?? '',
        documentId: item.document_id,
        completedAt: item.completed_at,
      },
    ]),
  ) as Record<
    ExportReadinessItemKey,
    {
      isComplete: boolean;
      notes: string;
      documentId: string | null;
      completedAt: string | null;
    }
  >;
}

export function ExportReadinessPanel({ items, documents, locale }: ExportReadinessPanelProps) {
  const t = useTranslations('platform.settings.exportReadiness');
  const tKyc = useTranslations('kyc');
  const router = useRouter();
  const [expandedKey, setExpandedKey] = React.useState<ExportReadinessItemKey | null>(null);
  const [itemState, setItemState] = React.useState(() => buildItemState(items));
  const [savingKey, setSavingKey] = React.useState<ExportReadinessItemKey | null>(null);
  const [errorKey, setErrorKey] = React.useState<ExportReadinessItemKey | null>(null);

  React.useEffect(() => {
    setItemState((current) => {
      const next = buildItemState(items);
      const unchanged = EXPORT_READINESS_ITEM_KEYS.every((key) => {
        const currentItem = current[key];
        const nextItem = next[key];
        return (
          currentItem?.isComplete === nextItem?.isComplete &&
          currentItem?.notes === nextItem?.notes &&
          currentItem?.documentId === nextItem?.documentId &&
          currentItem?.completedAt === nextItem?.completedAt
        );
      });
      return unchanged ? current : next;
    });
  }, [items]);

  const completedCount = EXPORT_READINESS_ITEM_KEYS.filter(
    (key) => itemState[key]?.isComplete,
  ).length;

  async function persistItem(
    itemKey: ExportReadinessItemKey,
    patch: {
      isComplete?: boolean;
      notes?: string | null;
      documentId?: string | null;
    },
  ) {
    setSavingKey(itemKey);
    setErrorKey(null);

    const result = await updateExportReadinessItemAction({
      itemKey,
      ...patch,
    });

    setSavingKey(null);

    if (result.error) {
      setErrorKey(itemKey);
      return;
    }

    if (result.data) {
      setItemState((current) => ({
        ...current,
        [itemKey]: {
          isComplete: result.data.is_complete,
          notes: result.data.notes ?? '',
          documentId: result.data.document_id,
          completedAt: result.data.completed_at,
        },
      }));
    }

    router.refresh();
  }

  function toggleExpanded(itemKey: ExportReadinessItemKey) {
    setExpandedKey((current) => (current === itemKey ? null : itemKey));
  }

  const documentOptions = [
    { value: '', label: t('documentNone') },
    ...documents.map((doc) => ({
      value: doc.id,
      label: t('documentOption', {
        type: tKyc(doc.type),
        date: formatDateTime(doc.createdAt, locale),
      }),
    })),
  ];

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="space-y-2">
          <CardTitle>{t('title')}</CardTitle>
          <p className="text-[15px] text-body">{t('description')}</p>
        </div>
        <p
          className="rounded-card border border-border bg-bg-tint px-4 py-3 text-[13px] text-body"
          role="note"
        >
          {t('disclaimer')}
        </p>
        <p className="text-[15px] font-semibold tabular-nums text-ink">
          {t('progress', { completed: completedCount, total: EXPORT_READINESS_ITEM_COUNT })}
        </p>
        <div
          className="h-2 w-full overflow-hidden rounded-[6px] bg-bg-tint"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={EXPORT_READINESS_ITEM_COUNT}
          aria-valuenow={completedCount}
          aria-label={t('progressAria', {
            completed: completedCount,
            total: EXPORT_READINESS_ITEM_COUNT,
          })}
        >
          <div
            className="h-full bg-brand-gold transition-[width] duration-150 ease-out"
            style={{ width: `${(completedCount / EXPORT_READINESS_ITEM_COUNT) * 100}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {EXPORT_READINESS_ITEM_KEYS.map((itemKey) => {
          const state = itemState[itemKey];
          const isExpanded = expandedKey === itemKey;
          const isSaving = savingKey === itemKey;
          const hasError = errorKey === itemKey;

          return (
            <div
              key={itemKey}
              className="rounded-card border border-border p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <label className="flex flex-1 items-start gap-3 text-[15px] text-ink">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-border text-brand-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue/35"
                    checked={state.isComplete}
                    disabled={isSaving}
                    onChange={(event) => {
                      const isComplete = event.target.checked;
                      setItemState((current) => ({
                        ...current,
                        [itemKey]: { ...current[itemKey], isComplete },
                      }));
                      void persistItem(itemKey, { isComplete });
                    }}
                  />
                  <span className="font-semibold">{t(`items.${itemKey}.title`)}</span>
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0 self-start"
                  onClick={() => toggleExpanded(itemKey)}
                  aria-expanded={isExpanded}
                >
                  {t('learnMore')}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                </Button>
              </div>

              {isExpanded ? (
                <p className="mt-3 text-[15px] text-body">{t(`items.${itemKey}.description`)}</p>
              ) : null}

              {state.isComplete && state.completedAt ? (
                <p className="mt-2 text-[13px] text-muted">
                  {t('completedOn', { date: formatDateTime(state.completedAt, locale) })}
                </p>
              ) : null}

              <div className="mt-4 space-y-4">
                <FieldWrapper id={`${itemKey}-notes`} label={t('notesLabel')}>
                  <Textarea
                    id={`${itemKey}-notes`}
                    value={state.notes}
                    disabled={isSaving}
                    rows={3}
                    placeholder={t('notesPlaceholder')}
                    onChange={(event) => {
                      const notes = event.target.value;
                      setItemState((current) => ({
                        ...current,
                        [itemKey]: { ...current[itemKey], notes },
                      }));
                    }}
                    onBlur={() => {
                      const original = items.find((item) => item.item_key === itemKey);
                      const originalNotes = original?.notes ?? '';
                      if (state.notes === originalNotes) {
                        return;
                      }
                      void persistItem(itemKey, {
                        notes: state.notes.trim() ? state.notes.trim() : null,
                      });
                    }}
                  />
                </FieldWrapper>

                <FieldWrapper
                  id={`${itemKey}-document`}
                  label={t('documentLabel')}
                  hint={t('documentHint')}
                >
                  <Select
                    id={`${itemKey}-document`}
                    value={state.documentId ?? ''}
                    disabled={isSaving}
                    options={documentOptions}
                    onChange={(event) => {
                      const documentId = event.target.value || null;
                      setItemState((current) => ({
                        ...current,
                        [itemKey]: { ...current[itemKey], documentId },
                      }));
                      void persistItem(itemKey, { documentId });
                    }}
                  />
                </FieldWrapper>
              </div>

              {hasError ? (
                <p className="mt-2 text-[13px] text-danger" role="alert">
                  {t('saveError')}
                </p>
              ) : null}
            </div>
          );
        })}

        <p className="text-[13px] text-muted">
          <Link href="/documents" className="inline-flex items-center gap-1 text-brand-blue underline-offset-2 hover:underline">
            {t('documentsLink')}
            <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
