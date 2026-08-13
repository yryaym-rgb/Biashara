import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import {
  hasActionCenterAlerts,
  summarizeActionCenterItems,
  type ActionCenterItem,
} from '@/lib/platform/action-center.logic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';

export interface DashboardActionCenterProps {
  items: ActionCenterItem[];
  kycApproved: boolean;
  locale: string;
}

type SummaryAlertKey =
  | 'pendingOffers'
  | 'disputedOrders'
  | 'rejectedKyc'
  | 'rejectedListings';

const ALERT_LINKS: Record<SummaryAlertKey, '/offers' | '/orders' | '/settings'> = {
  pendingOffers: '/offers',
  disputedOrders: '/orders',
  rejectedKyc: '/settings',
  rejectedListings: '/settings',
};

export async function DashboardActionCenter({
  items,
  kycApproved,
  locale,
}: DashboardActionCenterProps) {
  const t = await getTranslations({ locale, namespace: 'platform.dashboard.actionCenter' });
  const summary = summarizeActionCenterItems(items);
  const hasAlerts = hasActionCenterAlerts(summary);

  const alerts: Array<{ key: SummaryAlertKey; count: number; href: string }> = [];

  if (summary.pendingOffersCount > 0) {
    alerts.push({
      key: 'pendingOffers',
      count: summary.pendingOffersCount,
      href: '/offers?tab=received',
    });
  }
  if (summary.disputedOrdersCount > 0) {
    const disputedItem = items.find((item) => item.type === 'disputed_order');
    alerts.push({
      key: 'disputedOrders',
      count: summary.disputedOrdersCount,
      href:
        summary.disputedOrdersCount === 1 && disputedItem
          ? disputedItem.href
          : ALERT_LINKS.disputedOrders,
    });
  }
  if (summary.rejectedKycCount > 0) {
    alerts.push({
      key: 'rejectedKyc',
      count: summary.rejectedKycCount,
      href: '/settings?tab=kyc',
    });
  }
  if (summary.rejectedListingsCount > 0) {
    alerts.push({
      key: 'rejectedListings',
      count: summary.rejectedListingsCount,
      href: ALERT_LINKS.rejectedListings,
    });
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-[18px]">{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-2">
          {alerts.map((alert) => (
            <li key={alert.key}>
              <Link
                href={alert.href as '/dashboard'}
                className={cn(
                  'flex items-center gap-3 rounded-button border border-border px-4 py-3',
                  'transition-colors hover:bg-bg-tint',
                )}
              >
                <AlertTriangle
                  className="h-5 w-5 shrink-0 text-brand-gold-dark"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <span className="text-[15px] font-medium text-ink">
                  {t(`summary.${alert.key}`, { count: alert.count })}
                </span>
              </Link>
            </li>
          ))}

          {kycApproved ? (
            <li>
              <div className="flex items-center gap-3 rounded-button border border-border bg-bg-tint px-4 py-3">
                <CheckCircle2
                  className="h-5 w-5 shrink-0 text-success"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <span className="text-[15px] font-medium text-ink">{t('summary.kycVerified')}</span>
              </div>
            </li>
          ) : null}

          {!hasAlerts ? (
            <li>
              <div className="flex items-center gap-3 rounded-button border border-border bg-bg-tint px-4 py-3">
                <CheckCircle2
                  className="h-5 w-5 shrink-0 text-success"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <span className="text-[15px] text-body">{t('allClear')}</span>
              </div>
            </li>
          ) : null}
        </ul>
      </CardContent>
    </Card>
  );
}
