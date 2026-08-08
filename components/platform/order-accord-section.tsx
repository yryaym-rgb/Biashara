'use client';

import * as React from 'react';
import { ExternalLink } from 'lucide-react';
import { useRouter } from '@/lib/i18n/navigation';
import { useTranslations } from 'next-intl';
import { confirmOrderTerms } from '@/actions/contracts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { OrderContractView } from '@/lib/contracts/ensure-order-contract';
import { formatDateTime } from '@/lib/utils/dates';

export interface OrderAccordSectionProps {
  orderId: string;
  contract: OrderContractView;
  isBuyer: boolean;
  isSeller: boolean;
  locale: string;
  downloadFileName: string;
}

function ConfirmationCheckbox({
  party,
  orderId,
  signed,
  signedAt,
  canConfirm,
  locale,
}: {
  party: 'buyer' | 'seller';
  orderId: string;
  signed: boolean;
  signedAt: string | null;
  canConfirm: boolean;
  locale: string;
}) {
  const t = useTranslations('platform.orders.accord');
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [checked, setChecked] = React.useState(signed);

  React.useEffect(() => {
    setChecked(signed);
  }, [signed]);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.checked || signed || !canConfirm) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await confirmOrderTerms({ orderId, party });
      if (result.error) {
        if (result.error === 'forbidden') {
          setError(t('confirmForbidden'));
        } else if (result.error === 'alreadyConfirmed') {
          setError(t('confirmAlreadyDone'));
        } else {
          setError(t('confirmError'));
        }
        return;
      }

      setChecked(true);
      router.refresh();
    } catch {
      setError(t('confirmError'));
    } finally {
      setLoading(false);
    }
  }

  const label = party === 'buyer' ? t('buyerRole') : t('sellerRole');

  return (
    <div className="flex flex-col gap-2 rounded-card border border-border p-4">
      <p className="text-[15px] font-semibold text-ink">{label}</p>
      <label className="flex items-start gap-3 text-[15px] text-body">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-border text-brand-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue/35"
          checked={checked}
          disabled={signed || !canConfirm || loading}
          onChange={(event) => void handleChange(event)}
          aria-describedby={error ? `${party}-confirm-error` : undefined}
        />
        <span>{t('confirmLabel')}</span>
      </label>
      {signed && signedAt ? (
        <p className="text-[13px] text-muted">
          {t('confirmedOn', { date: formatDateTime(signedAt, locale) })}
        </p>
      ) : null}
      {error ? (
        <p id={`${party}-confirm-error`} className="text-[13px] text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function OrderAccordSection({
  orderId,
  contract,
  isBuyer,
  isSeller,
  locale,
  downloadFileName,
}: OrderAccordSectionProps) {
  const t = useTranslations('platform.orders.accord');

  const bothConfirmed = contract.buyer_signed && contract.seller_signed;
  const statusLabel = bothConfirmed ? t('statusConfirmed') : t('statusPending');
  const statusVariant = bothConfirmed ? 'success' : 'warning';

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
        <CardTitle>{t('title')}</CardTitle>
        <Badge variant={statusVariant}>{statusLabel}</Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <p className="text-[15px] text-body">{t('description')}</p>

        {contract.pdfUrl ? (
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted">
              {t('documentLabel')}
            </p>
            <Button asChild variant="secondary" className="w-full sm:w-auto">
              <a href={contract.pdfUrl} target="_blank" rel="noopener noreferrer" download={downloadFileName}>
                <ExternalLink className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                {t('viewPdf')}
              </a>
            </Button>
          </div>
        ) : (
          <p className="text-[13px] text-muted">{t('pdfUnavailable')}</p>
        )}

        <div className="flex flex-col gap-4">
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted">
            {t('confirmationTitle')}
          </p>
          <ConfirmationCheckbox
            party="buyer"
            orderId={orderId}
            signed={contract.buyer_signed}
            signedAt={contract.buyer_signed_at}
            canConfirm={isBuyer}
            locale={locale}
          />
          <ConfirmationCheckbox
            party="seller"
            orderId={orderId}
            signed={contract.seller_signed}
            signedAt={contract.seller_signed_at}
            canConfirm={isSeller}
            locale={locale}
          />
        </div>

        <p className="text-[13px] text-muted">{t('legalDisclaimer')}</p>
      </CardContent>
    </Card>
  );
}
