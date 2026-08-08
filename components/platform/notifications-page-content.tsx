'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileText,
  Handshake,
  Package,
  ShieldCheck,
} from 'lucide-react';
import { markAllNotificationsRead, markNotificationRead } from '@/actions/notifications';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { useRouter } from '@/lib/i18n/navigation';
import { getNotificationContent } from '@/lib/notifications/messages';
import { parseNotificationPayload } from '@/lib/notifications/payload';
import type { NotificationRow } from '@/lib/notifications/types';
import { formatRelativeTime } from '@/lib/utils/dates';
import { cn } from '@/lib/utils/cn';

export interface NotificationsPageContentProps {
  notifications: NotificationRow[];
  total: number;
  page: number;
  totalPages: number;
  locale: string;
}

function NotificationTypeIcon({ type }: { type: NotificationRow['type'] }) {
  const className = 'h-5 w-5 text-brand-blue';

  switch (type) {
    case 'kyc':
      return <ShieldCheck className={className} strokeWidth={1.75} aria-hidden="true" />;
    case 'listing':
      return <FileText className={className} strokeWidth={1.75} aria-hidden="true" />;
    case 'offer':
      return <Handshake className={className} strokeWidth={1.75} aria-hidden="true" />;
    case 'order':
      return <Package className={className} strokeWidth={1.75} aria-hidden="true" />;
    default:
      return <ClipboardCheck className={className} strokeWidth={1.75} aria-hidden="true" />;
  }
}

function useNotificationMessage() {
  const t = useTranslations('notifications');
  const tDocs = useTranslations('notifications.documentTypes');
  const tStatus = useTranslations('notifications.orderStatus');

  return React.useCallback(
    (notification: NotificationRow) => {
      const payload = parseNotificationPayload(notification.payload);
      const { messageKey, values } = getNotificationContent(notification.type, payload);
      const resolvedValues = { ...values };

      if (notification.type === 'kyc' && values.documentType) {
        resolvedValues.documentType = tDocs(values.documentType);
      }

      if (notification.type === 'order' && values.status) {
        resolvedValues.status = tStatus(values.status);
      }

      return t(messageKey, resolvedValues);
    },
    [t, tDocs, tStatus],
  );
}

export function NotificationsPageContent({
  notifications,
  total,
  page,
  totalPages,
  locale,
}: NotificationsPageContentProps) {
  const t = useTranslations('notifications');
  const router = useRouter();
  const getMessage = useNotificationMessage();
  const [markingAll, setMarkingAll] = React.useState(false);

  const hasUnread = notifications.some((notification) => notification.read_at === null);

  async function handleNotificationClick(notification: NotificationRow) {
    const payload = parseNotificationPayload(notification.payload);
    const { href } = getNotificationContent(notification.type, payload);

    if (!notification.read_at) {
      await markNotificationRead(notification.id);
    }

    router.push(href);
  }

  async function handleMarkAllRead() {
    setMarkingAll(true);
    try {
      const result = await markAllNotificationsRead();
      if (!result.error) {
        router.refresh();
      }
    } finally {
      setMarkingAll(false);
    }
  }

  function goToPage(nextPage: number) {
    const params = new URLSearchParams();
    if (nextPage > 1) {
      params.set('page', String(nextPage));
    }
    const query = params.toString();
    router.push(query ? `/notifications?${query}` : '/notifications');
  }

  if (total === 0) {
    return (
      <EmptyState
        icon={<Bell className="h-5 w-5" strokeWidth={1.75} />}
        title={t('panel.empty')}
        description={t('panel.empty')}
      />
    );
  }

  return (
    <div className="space-y-6">
      {hasUnread ? (
        <div className="flex justify-end">
          <Button
            variant="secondary"
            size="sm"
            loading={markingAll}
            onClick={() => void handleMarkAllRead()}
          >
            {t('panel.markAllRead')}
          </Button>
        </div>
      ) : null}

      <ul className="overflow-hidden rounded-card border border-border bg-bg shadow-[0_1px_3px_rgba(14,42,71,0.06)]">
        {notifications.map((notification, index) => {
          const isUnread = notification.read_at === null;
          return (
            <li
              key={notification.id}
              className={cn(index > 0 && 'border-t border-border')}
            >
              <button
                type="button"
                className={cn(
                  'flex w-full gap-4 px-4 py-4 text-left hover:bg-bg-tint motion-safe:transition-colors motion-safe:duration-150',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]',
                  isUnread && 'bg-bg-tint/60',
                )}
                onClick={() => void handleNotificationClick(notification)}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-button bg-bg-tint">
                  <NotificationTypeIcon type={notification.type} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] leading-relaxed text-ink">{getMessage(notification)}</p>
                  <p className="mt-1 text-[13px] text-muted">
                    {formatRelativeTime(notification.created_at, locale)}
                  </p>
                </div>
                {isUnread ? (
                  <span
                    className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-gold"
                    aria-hidden="true"
                  />
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          </Button>
          <p className="text-[13px] text-muted">
            {page} / {totalPages}
          </p>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => goToPage(page + 1)}
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
