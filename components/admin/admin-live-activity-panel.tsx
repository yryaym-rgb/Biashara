import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import type { AdminLiveActivityEvent } from '@/lib/admin/dashboard-activity.logic';
import {
  adminAuditLogPath,
  adminKycReviewPath,
  adminListingsModerationPath,
  adminUsersPath,
} from '@/lib/admin/path';
import { displayName } from '@/lib/admin/display';
import { formatRelativeTime } from '@/lib/utils/dates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';

const DOT_CLASS: Record<AdminLiveActivityEvent['dotColor'], string> = {
  green: 'bg-market-live',
  blue: 'bg-brand-blue',
  gold: 'bg-brand-gold',
  red: 'bg-danger',
};

function eventHref(event: AdminLiveActivityEvent): string | null {
  switch (event.kind) {
    case 'account_verified':
      return adminUsersPath(event.entityId);
    case 'kyc_submitted':
      return adminKycReviewPath();
    case 'listing_submitted':
    case 'listing_published':
      return adminListingsModerationPath(event.entityId);
    case 'rfp_created':
      return adminUsersPath();
    case 'offer_accepted':
      return adminUsersPath();
    case 'order_disputed':
      return adminUsersPath();
    default:
      return null;
  }
}

export interface AdminLiveActivityPanelProps {
  events: AdminLiveActivityEvent[];
  locale: string;
}

export async function AdminLiveActivityPanel({ events, locale }: AdminLiveActivityPanelProps) {
  const t = await getTranslations({ locale, namespace: 'admin.dashboard.liveActivity' });
  const tCommon = await getTranslations({ locale, namespace: 'admin.common' });
  const tRoles = await getTranslations({ locale, namespace: 'admin.roles' });
  const tMinerals = await getTranslations({ locale, namespace: 'minerals' });

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 pb-4">
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full bg-market-live ticker-live-dot"
            aria-hidden="true"
          />
          <CardTitle>{t('title')}</CardTitle>
        </div>
        <Link
          href={adminAuditLogPath()}
          className="text-[13px] font-semibold text-brand-blue no-underline hover:text-brand-blue-dark"
        >
          {t('viewFullLog')}
        </Link>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-[15px] text-body">{t('empty')}</p>
        ) : (
          <ul className="space-y-4">
            {events.map((event) => {
              const href = eventHref(event);
              const label = t(`events.${event.kind}`, {
                actor: displayName(event.actorName, tCommon('unknownActor')),
                role: event.role ? tRoles(event.role) : '',
                mineral: event.mineral ? tMinerals(event.mineral) : '',
                province: event.province ?? '',
              });

              const content = (
                <>
                  <span
                    className={cn('mt-2 h-2 w-2 shrink-0 rounded-full', DOT_CLASS[event.dotColor])}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] text-ink">{label}</p>
                    <p className="mt-1 text-[13px] text-muted">
                      {formatRelativeTime(event.timestamp, locale)}
                    </p>
                  </div>
                </>
              );

              return (
                <li key={event.id} className="border-b border-border pb-4 last:border-b-0 last:pb-0">
                  {href ? (
                    <Link
                      href={href as '/dashboard'}
                      className="flex gap-3 rounded-button no-underline transition-colors hover:bg-bg-tint"
                    >
                      {content}
                    </Link>
                  ) : (
                    <div className="flex gap-3">{content}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
