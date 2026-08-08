'use client';

import * as React from 'react';
import { useRouter } from '@/lib/i18n/navigation';
import { useTranslations } from 'next-intl';
import { progressOrderStatus } from '@/actions/orders';
import { Button } from '@/components/ui/button';
import type { Database } from '@/types/database.types';
import type { NormalOrderStatus } from '@/lib/platform/order-status';

export interface OrderProgressActionsProps {
  orderId: string;
  status: Database['public']['Enums']['order_status'];
  nextStatus: NormalOrderStatus | null;
}

export function OrderProgressActions({
  orderId,
  status,
  nextStatus,
}: OrderProgressActionsProps) {
  const t = useTranslations('platform.orders');
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (!nextStatus) {
    return null;
  }

  async function handleProgress() {
    setLoading(true);
    setError(null);

    try {
      const result = await progressOrderStatus({ orderId });
      if (result.error) {
        if (result.error === 'forbidden') {
          setError(t('progressForbidden'));
        } else if (result.error === 'invalidTransition') {
          setError(t('progressInvalid'));
        } else {
          setError(t('progressError'));
        }
        return;
      }

      router.refresh();
    } catch {
      setError(t('progressError'));
    } finally {
      setLoading(false);
    }
  }

  const statusLabel =
    nextStatus === 'in_transit' ? t('inTransit') : t(nextStatus as 'confirmed');

  return (
    <div className="flex flex-col gap-3 rounded-card border border-border p-6">
      <h3 className="text-[18px] font-semibold text-ink">{t('progressTitle')}</h3>
      <p className="text-[15px] text-body">{t('progressDescription')}</p>
      {error ? (
        <p className="text-[13px] text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <Button
        type="button"
        variant="primary"
        loading={loading}
        onClick={() => void handleProgress()}
        className="w-full sm:w-auto"
      >
        {t('progressCta', { status: statusLabel })}
      </Button>
      <p className="text-[13px] text-muted">
        {t('currentStatus', {
          status: status === 'in_transit' ? t('inTransit') : t(status as 'confirmed'),
        })}
      </p>
    </div>
  );
}
