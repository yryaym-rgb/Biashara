import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileWarning,
  UserX,
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import type { AdminAlertItem, AdminAlertType } from '@/lib/admin/alerts.logic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';

const ITEM_ICONS: Record<AdminAlertType, typeof AlertTriangle> = {
  aging_listing: Clock,
  aging_kyc: FileWarning,
  unresolved_dispute: AlertTriangle,
  high_dispute_rate_user: UserX,
};

export interface AdminAlertsCardProps {
  items: AdminAlertItem[];
  locale: string;
}

export async function AdminAlertsCard({ items, locale }: AdminAlertsCardProps) {
  const t = await getTranslations({ locale, namespace: 'admin.reports.alerts' });
  const tKyc = await getTranslations({ locale, namespace: 'kyc' });

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-[18px]">{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {items.length === 0 ? (
          <div className="flex items-center gap-4 rounded-button border border-border bg-bg-tint px-4 py-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-button bg-bg">
              <CheckCircle2
                className="h-5 w-5 text-success"
                strokeWidth={1.75}
                aria-hidden="true"
              />
            </div>
            <p className="text-[15px] text-body">{t('allClear')}</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => {
              const Icon = ITEM_ICONS[item.type];
              const label =
                item.type === 'aging_kyc'
                  ? t('items.agingKyc', {
                      company: item.title,
                      type: tKyc(item.subtitle as 'id_card'),
                    })
                  : item.type === 'high_dispute_rate_user'
                    ? t('items.high_dispute_rate_user', {
                        company: item.title,
                        rate: item.subtitle,
                      })
                    : t(`items.${item.type}`, {
                        title: item.title,
                        detail: item.subtitle,
                      });

              return (
                <li key={item.id}>
                  <Link
                    href={item.href as '/dashboard'}
                    className={cn(
                      'flex items-center gap-4 rounded-button border border-border px-4 py-3',
                      'transition-colors hover:bg-bg-tint',
                    )}
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-button bg-bg-tint">
                      <Icon
                        className="h-5 w-5 text-brand-blue"
                        strokeWidth={1.75}
                        aria-hidden="true"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-medium text-ink">{label}</p>
                    </div>
                    <span className="shrink-0 text-[13px] font-semibold text-brand-blue">
                      {t('action')}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
