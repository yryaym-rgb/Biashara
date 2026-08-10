import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/lib/i18n/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { RfpBidForm } from '@/components/rfps/rfp-bid-form';
import { RfpBidsPanel } from '@/components/rfps/rfp-bids-panel';
import { formatQuantityValue } from '@/lib/marketplace/format';
import {
  canCurrentUserViewRfp,
  formatRfpTargetPriceRange,
  getOwnRfpBid,
  getRfpBidsForBuyer,
  getRfpConversationId,
  type RfpRow,
} from '@/lib/rfps/queries';
import type { Profile } from '@/lib/auth/session';
import type { MineralId } from '@/lib/constants/minerals';
import { isKycApproved, isSellerRole } from '@/lib/rbac';
import { formatDate } from '@/lib/utils/dates';

export interface RfpDetailContentProps {
  rfp: RfpRow;
  profile: Profile | null;
  locale: string;
}

export async function RfpDetailContent({ rfp, profile, locale }: RfpDetailContentProps) {
  const canView = await canCurrentUserViewRfp(rfp);
  if (!canView) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: 'platform.rfps.detail' });
  const tMinerals = await getTranslations({ locale, namespace: 'minerals' });
  const tUnits = await getTranslations({ locale, namespace: 'units' });
  const tRfps = await getTranslations({ locale, namespace: 'platform.rfps' });

  const mineral = rfp.mineral as MineralId;
  const quantityFormatted = formatQuantityValue(rfp.quantity, locale);
  const unitLabel = tUnits(rfp.unit);
  const priceRange = formatRfpTargetPriceRange(
    rfp.target_price_min,
    rfp.target_price_max,
    tRfps('negotiable'),
  );
  const deadline = formatDate(rfp.deadline, locale);
  const isBuyer = profile?.id === rfp.buyer_id;
  const canBid =
    profile &&
    isSellerRole(profile.role) &&
    isKycApproved(profile.kyc_status) &&
    rfp.status === 'open' &&
    !isBuyer;

  const ownBid = canBid ? await getOwnRfpBid(rfp.id, profile.id) : null;
  const bids = isBuyer ? await getRfpBidsForBuyer(rfp.id) : [];
  const conversationId =
    isBuyer && rfp.status === 'awarded' && bids.length > 0
      ? await getRfpConversationId(
          rfp.id,
          bids.find((bid) => bid.status === 'selected')?.seller_id ?? '',
        )
      : null;

  const loginHref = `/login?redirect=${encodeURIComponent(`/rfps/${rfp.id}`)}`;

  return (
    <Container className="pb-16 md:pb-24">
      <div className="pt-8">
        <Button asChild variant="ghost" size="sm" className="mb-6 h-auto px-0 py-1">
          <Link href="/rfps">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            {t('back')}
          </Link>
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted">
              {tMinerals(mineral)}
            </p>
            <h1 className="mt-2 text-[34px] font-bold leading-tight text-ink">
              {t('title', { mineral: tMinerals(mineral) })}
            </h1>
            {rfp.status !== 'open' ? (
              <div className="mt-3">
                <Badge variant={rfp.status === 'awarded' ? 'success' : 'danger'}>
                  {t(`status.${rfp.status}`)}
                </Badge>
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 text-base text-body">
            <p>
              <span className="font-semibold text-ink">{t('quantity')}: </span>
              {quantityFormatted} {unitLabel}
            </p>
            <p>
              <span className="font-semibold text-ink">{t('targetPrice')}: </span>
              {priceRange}
            </p>
            <p>
              <span className="font-semibold text-ink">{t('deadline')}: </span>
              {deadline}
            </p>
            {rfp.delivery_terms ? (
              <p>
                <span className="font-semibold text-ink">{t('deliveryTerms')}: </span>
                {rfp.delivery_terms}
              </p>
            ) : null}
          </div>

          <div>
            <h2 className="text-[18px] font-semibold text-ink">{t('description')}</h2>
            <p className="mt-3 whitespace-pre-wrap text-base text-body">{rfp.description}</p>
          </div>

          {isBuyer ? (
            <RfpBidsPanel
              rfpId={rfp.id}
              bids={bids}
              rfpStatus={rfp.status}
              conversationId={conversationId}
              unitLabel={unitLabel}
              locale={locale}
            />
          ) : null}
        </div>

        <aside className="flex flex-col gap-6">
          {canBid && !ownBid ? (
            <RfpBidForm rfpId={rfp.id} maxQuantity={rfp.quantity} />
          ) : null}

          {ownBid ? (
            <div className="rounded-card border border-border p-6">
              <h3 className="text-[18px] font-semibold text-ink">{t('yourBid')}</h3>
              <p className="mt-3 text-[20px] font-bold tabular-nums text-ink">
                {ownBid.offered_price}
              </p>
              <p className="mt-1 text-[13px] text-muted">
                {t('bidQuantityLine', {
                  quantity: formatQuantityValue(ownBid.quantity, locale),
                  unit: unitLabel,
                })}
              </p>
              <Badge variant="info" className="mt-3">
                {t(`bidStatus.${ownBid.status}`)}
              </Badge>
            </div>
          ) : null}

          {!profile ? (
            <div className="rounded-card border border-border p-6">
              <p className="text-base text-body">{t('loginToBid')}</p>
              <Button asChild variant="primary" className="mt-4">
                <Link href={loginHref}>{t('loginCta')}</Link>
              </Button>
            </div>
          ) : null}

          {profile && !canBid && !isBuyer && profile.kyc_status !== 'approved' ? (
            <div className="rounded-card border border-border p-6">
              <p className="text-base text-body">{t('kycRequired')}</p>
              <Button asChild variant="secondary" className="mt-4">
                <Link href="/settings">{t('kycCta')}</Link>
              </Button>
            </div>
          ) : null}
        </aside>
      </div>
    </Container>
  );
}
