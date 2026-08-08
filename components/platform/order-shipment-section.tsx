'use client';

import * as React from 'react';
import { useRouter } from '@/lib/i18n/navigation';
import { useTranslations } from 'next-intl';
import {
  addShipmentCheckpoint,
  createShipment,
  progressShipmentStatus,
  updateShipmentDetails,
} from '@/actions/shipments';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';
import { getShipmentProgressOptions } from '@/lib/platform/shipment-status';
import type { PlatformOrderShipment } from '@/lib/platform/order-shipment';
import type { Database } from '@/types/database.types';
import { formatDateTime } from '@/lib/utils/dates';

type ShipmentStatus = Database['public']['Enums']['shipment_status'];

export interface OrderShipmentSectionProps {
  orderId: string;
  shipment: PlatformOrderShipment | null;
  isSeller: boolean;
  locale: string;
}

function formatShipmentStatus(
  status: ShipmentStatus,
  t: ReturnType<typeof useTranslations<'platform.orders.shipment'>>,
): string {
  if (status === 'in_transit') {
    return t('inTransit');
  }
  if (status === 'picked_up') {
    return t('pickedUp');
  }
  return t(status as 'pending');
}

export function OrderShipmentSection({
  orderId,
  shipment,
  isSeller,
  locale,
}: OrderShipmentSectionProps) {
  const t = useTranslations('platform.orders.shipment');
  const router = useRouter();

  const [carrier, setCarrier] = React.useState(shipment?.carrier ?? '');
  const [trackingRef, setTrackingRef] = React.useState(shipment?.tracking_ref ?? '');
  const [checkpointNote, setCheckpointNote] = React.useState('');
  const [checkpointLocation, setCheckpointLocation] = React.useState('');
  const [detailsLoading, setDetailsLoading] = React.useState(false);
  const [statusLoading, setStatusLoading] = React.useState(false);
  const [checkpointLoading, setCheckpointLoading] = React.useState(false);
  const [createLoading, setCreateLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setCarrier(shipment?.carrier ?? '');
    setTrackingRef(shipment?.tracking_ref ?? '');
  }, [shipment?.carrier, shipment?.tracking_ref]);

  const progressOptions = shipment
    ? getShipmentProgressOptions(shipment.status)
    : [];

  async function handleCreateShipment(event: React.FormEvent) {
    event.preventDefault();
    setCreateLoading(true);
    setError(null);

    try {
      const result = await createShipment({
        orderId,
        carrier,
        trackingRef: trackingRef || undefined,
      });

      if (result.error) {
        setError(result.error === 'forbidden' ? t('sellerOnly') : t('saveError'));
        return;
      }

      router.refresh();
    } catch {
      setError(t('saveError'));
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleSaveDetails(event: React.FormEvent) {
    event.preventDefault();
    if (!shipment) {
      return;
    }

    setDetailsLoading(true);
    setError(null);

    try {
      const result = await updateShipmentDetails({
        shipmentId: shipment.id,
        carrier,
        trackingRef: trackingRef || undefined,
      });

      if (result.error) {
        setError(result.error === 'forbidden' ? t('sellerOnly') : t('saveError'));
        return;
      }

      router.refresh();
    } catch {
      setError(t('saveError'));
    } finally {
      setDetailsLoading(false);
    }
  }

  async function handleProgressStatus(nextStatus: ShipmentStatus) {
    if (!shipment) {
      return;
    }

    setStatusLoading(true);
    setError(null);

    try {
      const result = await progressShipmentStatus({
        shipmentId: shipment.id,
        status: nextStatus,
      });

      if (result.error) {
        if (result.error === 'invalidTransition') {
          setError(t('statusInvalid'));
        } else if (result.error === 'forbidden') {
          setError(t('sellerOnly'));
        } else {
          setError(t('saveError'));
        }
        return;
      }

      router.refresh();
    } catch {
      setError(t('saveError'));
    } finally {
      setStatusLoading(false);
    }
  }

  async function handleAddCheckpoint(event: React.FormEvent) {
    event.preventDefault();
    if (!shipment) {
      return;
    }

    setCheckpointLoading(true);
    setError(null);

    try {
      const result = await addShipmentCheckpoint({
        shipmentId: shipment.id,
        note: checkpointNote,
        location: checkpointLocation || undefined,
      });

      if (result.error) {
        setError(result.error === 'forbidden' ? t('sellerOnly') : t('saveError'));
        return;
      }

      setCheckpointNote('');
      setCheckpointLocation('');
      router.refresh();
    } catch {
      setError(t('saveError'));
    } finally {
      setCheckpointLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
        <CardTitle>{t('title')}</CardTitle>
        {shipment ? (
          <Badge variant="info">{formatShipmentStatus(shipment.status, t)}</Badge>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <p className="text-[13px] text-muted">{t('trackingComingSoon')}</p>

        {error ? (
          <p className="text-[13px] text-danger" role="alert">
            {error}
          </p>
        ) : null}

        {!shipment && isSeller ? (
          <form onSubmit={handleCreateShipment} className="flex flex-col gap-4">
            <p className="text-[15px] text-body">{t('createDescription')}</p>
            <Input
              label={t('carrierLabel')}
              value={carrier}
              onChange={(event) => setCarrier(event.target.value)}
              required
            />
            <Input
              label={t('trackingLabel')}
              value={trackingRef}
              onChange={(event) => setTrackingRef(event.target.value)}
              hint={t('trackingHint')}
            />
            <Button type="submit" variant="primary" loading={createLoading} className="w-full sm:w-auto">
              {t('createCta')}
            </Button>
          </form>
        ) : null}

        {!shipment && !isSeller ? (
          <p className="text-[15px] text-body">{t('emptyBuyer')}</p>
        ) : null}

        {shipment ? (
          <>
            {isSeller ? (
              <form onSubmit={handleSaveDetails} className="flex flex-col gap-4">
                <Input
                  label={t('carrierLabel')}
                  value={carrier}
                  onChange={(event) => setCarrier(event.target.value)}
                  required
                />
                <Input
                  label={t('trackingLabel')}
                  value={trackingRef}
                  onChange={(event) => setTrackingRef(event.target.value)}
                  hint={t('trackingHint')}
                />
                <Button
                  type="submit"
                  variant="secondary"
                  loading={detailsLoading}
                  className="w-full sm:w-auto"
                >
                  {t('saveDetails')}
                </Button>
              </form>
            ) : (
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted">
                    {t('carrierLabel')}
                  </dt>
                  <dd className="mt-1 text-[15px] text-body">
                    {shipment.carrier ?? t('notProvided')}
                  </dd>
                </div>
                <div>
                  <dt className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted">
                    {t('trackingLabel')}
                  </dt>
                  <dd className="mt-1 text-[15px] text-body">
                    {shipment.tracking_ref ?? t('notProvided')}
                  </dd>
                </div>
              </dl>
            )}

            <div className="flex flex-col gap-3 border-t border-border pt-6">
              <h3 className="text-[18px] font-semibold text-ink">{t('statusTitle')}</h3>
              {isSeller && progressOptions.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {progressOptions.map((status) => (
                    <Button
                      key={status}
                      type="button"
                      variant={status === 'exception' ? 'secondary' : 'primary'}
                      loading={statusLoading}
                      onClick={() => void handleProgressStatus(status)}
                      className="w-full sm:w-auto"
                    >
                      {t('progressCta', {
                        status: formatShipmentStatus(status, t),
                      })}
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-[15px] text-body">
                  {formatShipmentStatus(shipment.status, t)}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-4 border-t border-border pt-6">
              <h3 className="text-[18px] font-semibold text-ink">{t('checkpointsTitle')}</h3>
              {shipment.checkpoints.length === 0 ? (
                <p className="text-[15px] text-body">{t('checkpointsEmpty')}</p>
              ) : (
                <ol className="flex flex-col gap-4">
                  {shipment.checkpoints.map((checkpoint, index) => (
                    <li
                      key={`${checkpoint.occurred_at}-${index}`}
                      className="rounded-card border border-border p-4"
                    >
                      <p className="text-[13px] text-muted">
                        {formatDateTime(checkpoint.occurred_at, locale)}
                      </p>
                      <p className="mt-2 text-[15px] text-body">{checkpoint.note}</p>
                      {checkpoint.location ? (
                        <p className="mt-2 text-[13px] text-muted">
                          {t('checkpointLocation', { location: checkpoint.location })}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ol>
              )}

              {isSeller ? (
                <form onSubmit={handleAddCheckpoint} className="flex flex-col gap-4">
                  <Textarea
                    label={t('checkpointNoteLabel')}
                    value={checkpointNote}
                    onChange={(event) => setCheckpointNote(event.target.value)}
                    rows={3}
                    required
                  />
                  <Input
                    label={t('checkpointLocationLabel')}
                    value={checkpointLocation}
                    onChange={(event) => setCheckpointLocation(event.target.value)}
                    hint={t('checkpointLocationHint')}
                  />
                  <Button
                    type="submit"
                    variant="secondary"
                    loading={checkpointLoading}
                    className="w-full sm:w-auto"
                  >
                    {t('addCheckpoint')}
                  </Button>
                </form>
              ) : null}
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
