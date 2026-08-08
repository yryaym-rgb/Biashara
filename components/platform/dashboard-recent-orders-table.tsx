import { getTranslations } from 'next-intl/server';
import type { DashboardRecentRow } from '@/lib/platform/queries';
import {
  offerStatusVariant,
  orderStatusVariant,
} from '@/lib/admin/display';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from '@/components/admin/data-table';
import { formatCurrency } from '@/lib/utils/format';
import { formatRelativeTime } from '@/lib/utils/dates';
import type { Database } from '@/types/database.types';

export interface DashboardRecentOrdersTableProps {
  rows: DashboardRecentRow[];
  locale: string;
  hasOrders: boolean;
  hideHeader?: boolean;
}

export async function DashboardRecentOrdersTable({
  rows,
  locale,
  hasOrders,
  hideHeader = false,
}: DashboardRecentOrdersTableProps) {
  const t = await getTranslations({ locale, namespace: 'platform.dashboard' });
  const tOffers = await getTranslations({ locale, namespace: 'platform.offers' });
  const tOrders = await getTranslations({ locale, namespace: 'platform.orders' });
  const tMinerals = await getTranslations({ locale, namespace: 'minerals' });
  const tCommon = await getTranslations({ locale, namespace: 'platform.offers' });

  function formatStatus(row: DashboardRecentRow): string {
    if (row.kind === 'order') {
      if (row.status === 'in_transit') {
        return tOrders('inTransit');
      }
      return tOrders(row.status as 'confirmed');
    }
    return tOffers(row.status as 'pending');
  }

  function statusVariant(row: DashboardRecentRow) {
    if (row.kind === 'order') {
      return orderStatusVariant(row.status as Database['public']['Enums']['order_status']);
    }
    return offerStatusVariant(row.status as Database['public']['Enums']['offer_status']);
  }

  const title = hasOrders ? t('recentOrders') : t('recentOffersFallback');

  return (
    <Card>
      {!hideHeader ? (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      ) : null}
      <CardContent className={hideHeader ? 'pt-0' : undefined}>
        {rows.length === 0 ? (
          <p className="text-[15px] text-body">{t('recentOrdersEmpty')}</p>
        ) : (
          <DataTable>
            <DataTableHead>
              <DataTableHeaderCell>{t('table.mineral')}</DataTableHeaderCell>
              <DataTableHeaderCell>{t('table.counterpart')}</DataTableHeaderCell>
              <DataTableHeaderCell>{t('table.amount')}</DataTableHeaderCell>
              <DataTableHeaderCell>{t('table.status')}</DataTableHeaderCell>
              <DataTableHeaderCell className="text-right">{t('table.date')}</DataTableHeaderCell>
            </DataTableHead>
            <DataTableBody>
              {rows.map((row) => (
                <DataTableRow key={`${row.kind}-${row.id}`}>
                  <DataTableCell>
                    <p className="font-semibold text-ink">
                      {row.mineral ? tMinerals(row.mineral as 'cobalt') : row.listingTitle}
                    </p>
                    {row.mineral ? (
                      <p className="mt-1 text-[13px] text-muted">{row.listingTitle}</p>
                    ) : null}
                  </DataTableCell>
                  <DataTableCell>
                    {row.counterpartName || tCommon('counterpartyUnknown')}
                  </DataTableCell>
                  <DataTableCell className="tabular-nums font-semibold text-ink">
                    {formatCurrency(row.amount, row.currency, locale)}
                  </DataTableCell>
                  <DataTableCell>
                    <Badge variant={statusVariant(row)}>{formatStatus(row)}</Badge>
                  </DataTableCell>
                  <DataTableCell className="text-right text-[13px] text-muted">
                    {formatRelativeTime(row.timestamp, locale)}
                  </DataTableCell>
                </DataTableRow>
              ))}
            </DataTableBody>
          </DataTable>
        )}
      </CardContent>
    </Card>
  );
}
