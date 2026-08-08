'use client';

import * as React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';
import { Link } from '@/lib/i18n/navigation';
import { Tag } from 'lucide-react';
import { acceptOffer, declineOffer } from '@/actions/offers';
import {
  canRespondToOffer,
  getOfferChainDepth,
  isWaitingOnOtherParty,
  type OfferChain,
} from '@/lib/platform/offer-chain';
import { offerStatusVariant } from '@/lib/admin/display';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ListingThumb } from '@/components/marketplace/listing-thumb';
import { CounterOfferForm } from '@/components/platform/counter-offer-form';
import { formatPricePerUnit } from '@/lib/utils/format';
import { resolveIntlLocale } from '@/lib/utils/format';
import type { MineralId } from '@/lib/constants/minerals';
import type { Database } from '@/types/database.types';

export interface OfferChainCardProps {
  chain: OfferChain;
  tab: 'sent' | 'received';
  userId: string;
}

function formatOfferDate(timestamp: string, locale: string): string {
  return new Intl.DateTimeFormat(resolveIntlLocale(locale), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(timestamp));
}

export function OfferChainCard({ chain, tab, userId }: OfferChainCardProps) {
  const t = useTranslations('platform.offers');
  const tMinerals = useTranslations('minerals');
  const tUnits = useTranslations('units');
  const locale = useLocale();
  const router = useRouter();

  const [counterOpen, setCounterOpen] = React.useState(false);
  const [loadingAction, setLoadingAction] = React.useState<'accept' | 'decline' | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);

  const latest = chain.latest;
  const offerMap = new Map(chain.offers.map((offer) => [offer.id, offer]));
  const depth = getOfferChainDepth(latest, offerMap);
  const canAct = canRespondToOffer(latest, userId, depth);
  const waiting = isWaitingOnOtherParty(latest, userId, depth);
  const photo = latest.listing.listing_photos[0]?.storage_path ?? null;

  const counterpart =
    tab === 'sent'
      ? latest.seller?.company_name?.trim() || t('counterpartyUnknown')
      : latest.buyer?.company_name?.trim() || t('counterpartyUnknown');

  const unitLabel = tUnits(latest.listing.unit);

  async function handleAccept() {
    setActionError(null);
    setLoadingAction('accept');
    try {
      const result = await acceptOffer({ offerId: latest.id });
      if (result.error) {
        setActionError(String(result.error));
        return;
      }
      router.refresh();
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleDecline() {
    setActionError(null);
    setLoadingAction('decline');
    try {
      const result = await declineOffer(latest.id);
      if (result.error) {
        setActionError(String(result.error));
        return;
      }
      router.refresh();
    } finally {
      setLoadingAction(null);
    }
  }

  const isTerminal = ['declined', 'expired'].includes(latest.status);
  const isAccepted = latest.status === 'accepted';

  return (
    <article className="rounded-card border border-border bg-bg p-4 md:p-6 card-shadow">
      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        <ListingThumb
          mineral={latest.listing.mineral as MineralId}
          storagePath={photo}
          alt={latest.listing.title}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-[18px] font-semibold text-ink">{latest.listing.title}</h3>
              <p className="mt-1 text-[13px] text-muted">
                {tMinerals(latest.listing.mineral)} · {counterpart}
              </p>
            </div>
            <Badge
              variant={offerStatusVariant(
                latest.status as Database['public']['Enums']['offer_status'],
              )}
            >
              {t(latest.status as 'pending')}
            </Badge>
          </div>

          <div className="mt-4 flex flex-wrap gap-6 text-[15px]">
            <p className="tabular-nums font-semibold text-ink">
              {formatPricePerUnit(
                latest.offered_price,
                latest.listing.price_currency,
                unitLabel,
                locale,
              )}
            </p>
            <p className="text-body">
              {latest.quantity} {unitLabel}
            </p>
            <p className="text-[13px] text-muted">
              {t('submittedOn', { date: formatOfferDate(latest.created_at, locale) })}
            </p>
          </div>

          {chain.offers.length > 1 ? (
            <div className="mt-4 rounded-card border border-border bg-bg-tint p-4">
              <p className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-muted">
                {t('chainLabel')}
              </p>
              <ol className="space-y-3">
                {chain.offers.map((offer) => (
                  <li
                    key={offer.id}
                    className="border-b border-border pb-3 text-[13px] text-body last:border-b-0 last:pb-0"
                  >
                    <span className="font-semibold text-ink">
                      {formatPricePerUnit(
                        offer.offered_price,
                        offer.listing.price_currency,
                        unitLabel,
                        locale,
                      )}
                    </span>
                    {' · '}
                    {offer.quantity} {unitLabel}
                    {' · '}
                    <Badge
                      variant={offerStatusVariant(
                        offer.status as Database['public']['Enums']['offer_status'],
                      )}
                    >
                      {t(offer.status as 'pending')}
                    </Badge>
                    {' · '}
                    <span className="text-muted">
                      {formatOfferDate(offer.created_at, locale)}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          {actionError ? (
            <p className="mt-4 text-[13px] text-danger" role="alert">
              {actionError}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-3">
            {isAccepted && latest.order_id ? (
              <Button variant="primary" size="sm" asChild>
                <Link href={`/orders/${latest.order_id}`}>{t('viewOrder')}</Link>
              </Button>
            ) : null}

            {canAct && tab === 'received' ? (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  loading={loadingAction === 'accept'}
                  onClick={handleAccept}
                >
                  {t('accept')}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  loading={loadingAction === 'decline'}
                  onClick={handleDecline}
                >
                  {t('decline')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCounterOpen((open) => !open)}
                >
                  {t('counter')}
                </Button>
              </>
            ) : null}

            {canAct && tab === 'sent' ? (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  loading={loadingAction === 'accept'}
                  onClick={handleAccept}
                >
                  {t('accept')}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  loading={loadingAction === 'decline'}
                  onClick={handleDecline}
                >
                  {t('decline')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCounterOpen((open) => !open)}
                >
                  {t('counter')}
                </Button>
              </>
            ) : null}

            {waiting && tab === 'sent' ? (
              <p className="text-[15px] text-muted">{t('waitingSeller')}</p>
            ) : null}

            {waiting && tab === 'received' ? (
              <p className="text-[15px] text-muted">{t('waitingBuyer')}</p>
            ) : null}

            {isTerminal ? (
              <p className="text-[15px] text-muted">{t(latest.status as 'declined')}</p>
            ) : null}
          </div>

          {counterOpen && canAct ? (
            <CounterOfferForm
              parentOfferId={latest.id}
              onCancel={() => setCounterOpen(false)}
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}

export interface OffersTabPanelProps {
  chains: OfferChain[];
  tab: 'sent' | 'received';
  userId: string;
  emptyTitle: string;
  emptyDescription: string;
}

export function OffersTabPanel({
  chains,
  tab,
  userId,
  emptyTitle,
  emptyDescription,
}: OffersTabPanelProps) {
  const t = useTranslations('platform.offers');

  if (chains.length === 0) {
    return (
      <EmptyState
        icon={<Tag className="h-6 w-6" strokeWidth={1.75} />}
        title={emptyTitle}
        description={emptyDescription}
        action={
          <Button variant="primary" asChild>
            <Link href="/marketplace">{t('emptyCta')}</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {chains.map((chain) => (
        <OfferChainCard key={chain.rootId} chain={chain} tab={tab} userId={userId} />
      ))}
    </div>
  );
}
