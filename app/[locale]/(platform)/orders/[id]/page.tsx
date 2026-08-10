import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { requireAuth } from '@/lib/rbac';
import { getProfile } from '@/lib/auth/session';
import { Container } from '@/components/ui/container';
import { OrderDetailContent } from '@/components/platform/order-detail-content';
import {
  ensureOrderContract,
  formatContractDownloadName,
} from '@/lib/contracts/ensure-order-contract';
import { getOrderDetailForUser } from '@/lib/platform/orders';
import { getShipmentForOrder } from '@/lib/platform/order-shipment';
import { safeQuery } from '@/lib/safe-query';

export const dynamic = 'force-dynamic';

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const profile = requireAuth(await getProfile());
  const isAdmin = profile.role === 'admin';
  const order = await safeQuery(
    'orders/detail',
    () => getOrderDetailForUser(id, profile.id, isAdmin),
    null,
  );

  if (!order) {
    notFound();
  }

  const [contract, shipment] = await Promise.all([
    safeQuery('orders/contract', () => ensureOrderContract(order, locale), null),
    safeQuery('orders/shipment', () => getShipmentForOrder(order.id), null),
  ]);

  return (
    <Container>
      <OrderDetailContent
        order={order}
        contract={contract}
        shipment={shipment}
        userId={profile.id}
        isAdmin={isAdmin}
        locale={locale}
        contractDownloadName={formatContractDownloadName(order.id)}
      />
    </Container>
  );
}
