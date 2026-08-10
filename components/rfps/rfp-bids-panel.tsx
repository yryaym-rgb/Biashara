'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/lib/i18n/navigation';
import { selectRfpBid } from '@/actions/rfps';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatQuantityValue } from '@/lib/marketplace/format';
import type { RfpBidRow } from '@/lib/rfps/queries';
import type { MineralId } from '@/lib/constants/minerals';

export interface RfpBidsPanelProps {
  rfpId: string;
  bids: RfpBidRow[];
  rfpStatus: 'open' | 'awarded' | 'cancelled';
  conversationId: string | null;
  unitLabel: string;
  locale: string;
}

export function RfpBidsPanel({
  rfpId,
  bids,
  rfpStatus,
  conversationId,
  unitLabel,
  locale,
}: RfpBidsPanelProps) {
  const t = useTranslations('platform.rfps.detail');
  const router = useRouter();
  const [loadingBidId, setLoadingBidId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSelect(bidId: string) {
    setError(null);
    setLoadingBidId(bidId);
    try {
      const result = await selectRfpBid({ rfpId, bidId });
      if (result.error) {
        setError(t('selectError'));
        return;
      }
      if (result.conversationId) {
        router.push(`/messages?conversation=${result.conversationId}`);
        return;
      }
      router.refresh();
    } catch {
      setError(t('selectError'));
    } finally {
      setLoadingBidId(null);
    }
  }

  if (bids.length === 0) {
    return (
      <div className="rounded-card border border-border p-6">
        <h3 className="text-[18px] font-semibold text-ink">{t('bidsTitle')}</h3>
        <p className="mt-3 text-base text-body">{t('bidsEmpty')}</p>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-border p-6">
      <h3 className="text-[18px] font-semibold text-ink">{t('bidsTitle')}</h3>

      {error ? (
        <p className="mt-3 text-[13px] text-danger" role="alert">
          {error}
        </p>
      ) : null}

      {rfpStatus === 'awarded' && conversationId ? (
        <div className="mt-4">
          <Button asChild variant="secondary" size="sm">
            <Link href={`/messages?conversation=${conversationId}`}>{t('openConversation')}</Link>
          </Button>
        </div>
      ) : null}

      <ul className="mt-6 flex flex-col gap-4">
        {bids.map((bid) => {
          const sellerName = bid.seller?.company_name ?? t('sellerUnknown');
          const quantityFormatted = formatQuantityValue(bid.quantity, locale);

          return (
            <li
              key={bid.id}
              className="flex flex-col gap-4 border-b border-border pb-4 last:border-b-0 last:pb-0 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-base font-semibold text-ink">{sellerName}</p>
                {bid.seller?.kyc_status === 'approved' ? (
                  <Badge variant="success" className="mt-2">
                    {t('kycVerified')}
                  </Badge>
                ) : null}
                <p className="mt-2 text-[13px] text-muted">
                  {t('bidQuantityLine', {
                    quantity: quantityFormatted,
                    unit: unitLabel,
                  })}
                </p>
                <p className="text-[20px] font-bold tabular-nums text-ink">
                  {bid.offered_price}
                </p>
                {bid.delivery_terms ? (
                  <p className="mt-1 text-[13px] text-body">{bid.delivery_terms}</p>
                ) : null}
                {bid.message ? (
                  <p className="mt-2 text-[13px] text-muted">{bid.message}</p>
                ) : null}
              </div>

              <div className="flex shrink-0 flex-col items-start gap-2 md:items-end">
                {bid.status === 'selected' ? (
                  <Badge variant="success">{t('bidSelected')}</Badge>
                ) : bid.status === 'rejected' ? (
                  <Badge variant="danger">{t('bidRejected')}</Badge>
                ) : rfpStatus === 'open' ? (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    loading={loadingBidId === bid.id}
                    onClick={() => void handleSelect(bid.id)}
                  >
                    {t('selectBid')}
                  </Button>
                ) : (
                  <Badge variant="info">{t('bidPending')}</Badge>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
