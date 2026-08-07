'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

export interface RejectDialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<{ error?: string } | { success?: boolean }>;
}

export function RejectDialog({ open, title, onClose, onConfirm }: RejectDialogProps) {
  const t = useTranslations('admin.common');
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      setReason('');
      setError(null);
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="max-w-lg rounded-card border border-border bg-bg p-0 shadow-[var(--shadow-card-hover)] backdrop:bg-[color-mix(in_srgb,var(--ink)_40%,transparent)]"
      onClose={onClose}
    >
      <Card className="border-0 shadow-none">
        <CardContent className="p-6">
          <h3 className="mb-4">{title}</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!reason.trim()) {
                setError(t('rejectionReasonRequired'));
                return;
              }
              startTransition(async () => {
                const result = await onConfirm(reason.trim());
                if ('error' in result && result.error) {
                  setError(t('actionFailed'));
                  return;
                }
                onClose();
              });
            }}
          >
            <Textarea
              label={t('rejectionReasonLabel')}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError(null);
              }}
              required
              rows={4}
              error={error ?? undefined}
            />
            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
                {t('cancel')}
              </Button>
              <Button type="submit" variant="secondary" loading={isPending} className="text-danger">
                {t('confirmReject')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </dialog>
  );
}
