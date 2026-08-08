import { getTranslations } from 'next-intl/server';
import { Package } from 'lucide-react';
import { Link } from '@/lib/i18n/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from '@/components/admin/data-table';
import { MarketplacePagination } from '@/components/marketplace/marketplace-pagination';
import { displayName, orderStatusVariant } from '@/lib/admin/display';
import type { PlatformOrderListRow } from '@/lib/platform/orders';
import { formatPricePerUnit } from '@/lib/utils/format';
import { formatDate } from '@/lib/utils/dates';
import type { Database } from '@/types/database.types';
import type { MineralId } from '@/lib/constants/minerals';

export interface OrdersPageContentProps {
  orders: PlatformOrderListRow[];
  total: number;
  page: number;
  pageSize: number;
  userId: string;
  locale: string;
}

export async function OrdersPageContent({
  orders,
  total,
  page,
  pageSize,
  userId,
  locale,
}: OrdersPageContentProps) {
  const t = await getTranslations({ locale, namespace: 'platform.orders' });
  const tMinerals = await getTranslations({ locale, namespace: 'minerals' });
  const tUnits = await getTranslations({ locale, namespace: 'units' });

  function formatStatus(status: Database['public']['Enums']['order_status']): string {
    return status === 'in_transit' ? t('inTransit') : t(status as 'confirmed');
  }

  function formatRole(order: PlatformOrderListRow): string {
    return order.buyer_id === userId ? t('roleBuyer') : t('roleSeller');
  }

  function formatCounterparty(order: PlatformOrderListRow): string {
    const counterpart =
      order.buyer_id === userId ? order.seller?.company_name : order.buyer?.company_name;
    return displayName(counterpart ?? null, t('counterpartyUnknown'));
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<Package className="h-6 w-6" strokeWidth={1.75} />}
        title={t('empty')}
        description={t('emptyDescription')}
        action={
          <Button variant="primary" asChild>
            <Link href="/marketplace">{t('emptyCta')}</Link>
          </Button>
        }
      />
    );
  }

  return (
    <>
      <DataTable>
        <DataTableHead>
          <DataTableHeaderCell>{t('table.mineral')}</DataTableHeaderCell>
          <DataTableHeaderCell>{t('table.price')}</DataTableHeaderCell>
          <DataTableHeaderCell>{t('table.counterparty')}</DataTableHeaderCell>
          <DataTableHeaderCell>{t('table.role')}</DataTableHeaderCell>
          <DataTableHeaderCell>{t('table.status')}</DataTableHeaderCell>
          <DataTableHeaderCell className="text-right">{t('table.date')}</DataTableHeaderCell>
        </DataTableHead>
        <DataTableBody>
          {orders.map((order) => {
            const mineral = order.listing?.mineral as MineralId | undefined;
            const unitLabel = tUnits(order.unit);

            return (
              <DataTableRow key={order.id}>
                <DataTableCell>
                  <Link href={`/orders/${order.id}`} className="group block">
                    <p className="font-semibold text-ink group-hover:text-brand-blue">
                      {mineral ? tMinerals(mineral) : order.listing?.title ?? t('untitled')}
                    </p>
                    {order.listing?.title && mineral ? (
                      <p className="mt-1 text-[13px] text-muted">{order.listing.title}</p>
                    ) : null}
                  </Link>
                </DataTableCell>
                <DataTableCell className="tabular-nums text-[15px] font-semibold text-ink">
                  <Link href={`/orders/${order.id}`} className="block">
                    {formatPricePerUnit(
                      order.price_amount,
                      order.currency,
                      unitLabel,
                      locale,
                    )}
                    <span className="mt-1 block text-[13px] font-normal text-muted">
                      {order.quantity} {unitLabel}
                    </span>
                  </Link>
                </DataTableCell>
                <DataTableCell>
                  <Link href={`/orders/${order.id}`} className="block text-body">
                    {formatCounterparty(order)}
                  </Link>
                </DataTableCell>
                <DataTableCell>
                  <Badge variant="neutral">{formatRole(order)}</Badge>
                </DataTableCell>
                <DataTableCell>
                  <Badge variant={orderStatusVariant(order.status)}>
                    {formatStatus(order.status)}
                  </Badge>
                </DataTableCell>
                <DataTableCell className="text-right text-[13px] text-muted">
                  <Link href={`/orders/${order.id}`} className="block">
                    {formatDate(order.created_at, locale)}
                  </Link>
                </DataTableCell>
              </DataTableRow>
            );
          })}
        </DataTableBody>
      </DataTable>

      <MarketplacePagination
        page={page}
        total={total}
        pageSize={pageSize}
        buildHref={(nextPage) => (nextPage > 1 ? `/orders?page=${nextPage}` : '/orders')}
        className="pt-6"
      />
    </>
  );
}
