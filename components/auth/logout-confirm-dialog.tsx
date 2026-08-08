'use client';

import { useEffect, useRef, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export interface LogoutConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

export function LogoutConfirmDialog({ open, onClose, onConfirm }: LogoutConfirmDialogProps) {
  const t = useTranslations('common');
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="max-w-md rounded-card border border-border bg-bg p-0 shadow-[var(--shadow-card-hover)] backdrop:bg-[color-mix(in_srgb,var(--ink)_40%,transparent)]"
      onClose={onClose}
      aria-labelledby="logout-confirm-title"
    >
      <Card className="border-0 shadow-none">
        <CardContent className="p-6">
          <h3 id="logout-confirm-title" className="mb-6 text-[18px] font-semibold text-ink">
            {t('logoutConfirm')}
          </h3>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
              {t('cancel')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              loading={isPending}
              className="text-danger"
              onClick={() => {
                startTransition(async () => {
                  await onConfirm();
                });
              }}
            >
              {t('logout')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </dialog>
  );
}
