import { getTranslations } from 'next-intl/server';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { Link } from '@/lib/i18n/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderAccordSection } from '@/components/platform/order-accord-section';
import { OrderDisputeForm } from '@/components/platform/order-dispute-form';
import { OrderProgressActions } from '@/components/platform/order-progress-actions';
import { OrderShipmentSection } from '@/components/platform/order-shipment-section';
import { OrderStatusTimeline } from '@/components/platform/order-status-timeline';
import type { OrderContractView } from '@/lib/contracts/ensure-order-contract';
import type { PlatformOrderShipment } from '@/lib/platform/order-shipment';
import { displayName, orderStatusVariant } from '@/lib/admin/display';
import {
  formatOrderReference,
  getNextOrderStatus,
  isDisputableOrderStatus,
} from '@/lib/platform/order-status';
import type { PlatformOrderDetail } from '@/lib/platform/orders';
import { formatCurrency, formatPricePerUnit } from '@/lib/utils/format';
import { formatDateTime } from '@/lib/utils/dates';
import type { MineralId } from '@/lib/constants/minerals';

export interface OrderDetailContentProps {
  order: PlatformOrderDetail;
  contract: OrderContractView | null;
  shipment: PlatformOrderShipment | null;
  userId: string;
  isAdmin: boolean;
  locale: string;
  contractDownloadName: string;
}

export async function OrderDetailContent({
  order,
  contract,
  shipment,
  userId,
  isAdmin,
  locale,
  contractDownloadName,
}: OrderDetailContentProps) {
  const t = await getTranslations({ locale, namespace: 'platform.orders' });
  const tMinerals = await getTranslations({ locale, namespace: 'minerals' });
  const tUnits = await getTranslations({ locale, namespace: 'units' });
  const tMarketplace = await getTranslations({ locale, namespace: 'platform.marketplace.detail' });

  const isBuyer = order.buyer_id === userId;
  const isSeller = order.seller_id === userId;
  const canManageProgress = isSeller || isAdmin;
  const canDispute = isBuyer || isAdmin;
  const counterpart = isBuyer ? order.seller : order.buyer;
  const unitLabel = tUnits(order.unit);
  const mineral = order.listing?.mineral as MineralId | undefined;
  const totalAmount = order.price_amount * order.quantity;
  const nextStatus = getNextOrderStatus(order.status);

  function formatStatus(): string {
    return order.status === 'in_transit' ? t('inTransit') : t(order.status as 'confirmed');
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-6 h-auto px-0 py-1">
          <Link href="/orders">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            {t('backToList')}
          </Link>
        </Button>

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-[34px] font-bold text-ink">
            {t('reference', { reference: formatOrderReference(order.id) })}
          </h1>
          <Badge variant={orderStatusVariant(order.status)}>{formatStatus()}</Badge>
        </div>
        <p className="mt-2 text-[13px] text-muted">
          {t('orderedOn', { date: formatDateTime(order.created_at, locale) })}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('timelineTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderStatusTimeline status={order.status} locale={locale} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('summaryTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-[15px] text-body">
            {mineral ? (
              <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted">
                {tMinerals(mineral)}
              </p>
            ) : null}
            <p className="text-[18px] font-semibold text-ink">
              {order.listing?.title ?? t('untitled')}
            </p>
            {order.listing?.origin_province ? (
              <p>
                <span className="font-semibold text-ink">{tMarketplace('origin')}: </span>
                {order.listing.origin_province}
              </p>
            ) : null}
            {order.listing && order.listing.certifications.length > 0 ? (
              <div className="flex flex-col gap-2">
                <span className="font-semibold text-ink">{tMarketplace('certifications')}</span>
                <div className="flex flex-wrap gap-2">
                  {order.listing.certifications.map((cert) => (
                    <Badge key={cert} variant="info">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="border-t border-border pt-4">
              <p className="text-[13px] text-muted">{t('snapshotLabel')}</p>
              <p className="mt-2 tabular-nums text-[20px] font-bold text-ink">
                {formatPricePerUnit(order.price_amount, order.currency, unitLabel, locale)}
              </p>
              <p className="mt-1 text-[13px] text-muted">
                {t('quantityLine', { quantity: order.quantity, unit: unitLabel })}
              </p>
              <p className="mt-4 tabular-nums text-[18px] font-semibold text-ink">
                {t('totalLine', {
                  total: formatCurrency(totalAmount, order.currency, locale),
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('counterpartyTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-[18px] font-semibold text-ink">
              {displayName(counterpart?.company_name ?? null, t('counterpartyUnknown'))}
            </p>
            {counterpart?.kyc_status === 'approved' ? (
              <Badge variant="success">{tMarketplace('kycVerified')}</Badge>
            ) : null}
            {order.conversation_id ? (
              <Button asChild variant="secondary" className="w-full sm:w-auto">
                <Link href={`/marketplace/${order.listing_id}`}>
                  <MessageSquare className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                  {t('viewConversation')}
                </Link>
              </Button>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {canManageProgress && nextStatus ? (
        <OrderProgressActions
          orderId={order.id}
          status={order.status}
          nextStatus={nextStatus}
        />
      ) : null}

      {contract ? (
        <OrderAccordSection
          orderId={order.id}
          contract={contract}
          isBuyer={isBuyer}
          isSeller={isSeller}
          locale={locale}
          downloadFileName={contractDownloadName}
        />
      ) : null}

      <OrderShipmentSection
        orderId={order.id}
        shipment={shipment}
        isSeller={canManageProgress}
        locale={locale}
      />

      {canDispute && isDisputableOrderStatus(order.status) ? (
        <OrderDisputeForm
          orderId={order.id}
          status={order.status}
          hasConversation={Boolean(order.conversation_id)}
        />
      ) : null}

      {order.status === 'disputed' && order.dispute_reason ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('disputeReasonTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-[15px] text-body">
            <p className="whitespace-pre-wrap">{order.dispute_reason}</p>
            {order.disputed_at ? (
              <p className="text-[13px] text-muted">
                {t('disputedOn', { date: formatDateTime(order.disputed_at, locale) })}
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
