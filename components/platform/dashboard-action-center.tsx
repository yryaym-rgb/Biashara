import {
  AlertTriangle,
  CheckCircle2,
  FileWarning,
  Inbox,
  Package,
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import type { ActionCenterItem, ActionCenterItemType } from '@/lib/platform/action-center.logic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';

const ITEM_ICONS: Record<ActionCenterItemType, typeof Inbox> = {
  pending_offer: Inbox,
  disputed_order: AlertTriangle,
  rejected_kyc: FileWarning,
  rejected_listing: Package,
};

export interface DashboardActionCenterProps {
  items: ActionCenterItem[];
  locale: string;
}

export async function DashboardActionCenter({ items, locale }: DashboardActionCenterProps) {
  const t = await getTranslations({ locale, namespace: 'platform.dashboard.actionCenter' });
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
                item.type === 'rejected_kyc'
                  ? t('items.rejectedKyc', { type: tKyc(item.title) })
                  : t(`items.${item.type}`, {
                      title: item.title,
                      counterpart: item.subtitle,
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
                      {item.subtitle && item.type !== 'rejected_kyc' ? (
                        <p className="truncate text-[13px] text-muted">{item.subtitle}</p>
                      ) : null}
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
