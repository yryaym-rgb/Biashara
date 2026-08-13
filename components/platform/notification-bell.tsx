'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import {
  Bell,
  ClipboardCheck,
  ClipboardList,
  FileText,
  Handshake,
  Package,
  ShieldCheck,
  BellRing,
} from 'lucide-react';
import { markNotificationRead } from '@/actions/notifications';
import { Link, useRouter } from '@/lib/i18n/navigation';
import { getNotificationContent } from '@/lib/notifications/messages';
import { parseNotificationPayload } from '@/lib/notifications/payload';
import type { NotificationRow } from '@/lib/notifications/types';
import { RelativeTime } from '@/components/ui/relative-time';
import { cn } from '@/lib/utils/cn';

export interface NotificationBellProps {
  notifications: NotificationRow[];
  unreadCount: number;
  locale: string;
}

function NotificationTypeIcon({ type }: { type: NotificationRow['type'] }) {
  const className = 'h-4 w-4 text-brand-blue';

  switch (type) {
    case 'kyc':
      return <ShieldCheck className={className} strokeWidth={1.75} aria-hidden="true" />;
    case 'listing':
      return <FileText className={className} strokeWidth={1.75} aria-hidden="true" />;
    case 'offer':
      return <Handshake className={className} strokeWidth={1.75} aria-hidden="true" />;
    case 'order':
      return <Package className={className} strokeWidth={1.75} aria-hidden="true" />;
    case 'rfp':
      return <ClipboardList className={className} strokeWidth={1.75} aria-hidden="true" />;
    case 'system':
      return <BellRing className={className} strokeWidth={1.75} aria-hidden="true" />;
    default:
      return <ClipboardCheck className={className} strokeWidth={1.75} aria-hidden="true" />;
  }
}

function useNotificationMessage() {
  const t = useTranslations('notifications');
  const tDocs = useTranslations('notifications.documentTypes');
  const tStatus = useTranslations('notifications.orderStatus');
  const tMinerals = useTranslations('minerals');

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

      if (notification.type === 'rfp' && values.mineral) {
        resolvedValues.mineral = tMinerals(values.mineral);
      }

      if (notification.type === 'system' && values.documentType) {
        resolvedValues.documentType = tDocs(values.documentType);
      }

      return t(messageKey, resolvedValues);
    },
    [t, tDocs, tStatus, tMinerals],
  );
}

export function NotificationBell({
  notifications,
  unreadCount: initialUnreadCount,
  locale,
}: NotificationBellProps) {
  const t = useTranslations('notifications');
  const tShell = useTranslations('platform.shell');
  const router = useRouter();
  const getMessage = useNotificationMessage();

  const [open, setOpen] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(initialUnreadCount);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    setUnreadCount((current) =>
      current === initialUnreadCount ? current : initialUnreadCount,
    );
  }, [initialUnreadCount]);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  async function handleNotificationClick(notification: NotificationRow) {
    const payload = parseNotificationPayload(notification.payload);
    const { href } = getNotificationContent(notification.type, payload);

    if (!notification.read_at) {
      const result = await markNotificationRead(notification.id);
      if (!result.error) {
        setUnreadCount((count) => Math.max(0, count - 1));
      }
    }

    setOpen(false);
    router.push(href);
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        className="relative flex h-11 w-11 items-center justify-center rounded-button border border-border bg-bg text-brand-blue hover:bg-bg-tint motion-safe:transition-colors motion-safe:duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        aria-label={tShell('notifications')}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((current) => !current)}
      >
        <Bell className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-[6px] bg-brand-gold px-1 text-[11px] font-semibold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          ref={panelRef}
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-[min(360px,calc(100vw-32px))] overflow-hidden rounded-card border border-border bg-bg shadow-[0_8px_24px_rgba(14,42,71,0.10)]"
          role="menu"
          aria-label={tShell('notifications')}
        >
          <div className="border-b border-border px-4 py-3">
            <p className="text-[15px] font-semibold text-ink">{t('title')}</p>
          </div>

          {notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-[14px] text-muted">{t('panel.empty')}</p>
          ) : (
            <ul className="max-h-[400px] overflow-y-auto">
              {notifications.map((notification) => {
                const isUnread = notification.read_at === null;
                return (
                  <li key={notification.id}>
                    <button
                      type="button"
                      role="menuitem"
                      className={cn(
                        'flex w-full gap-3 px-4 py-3 text-left hover:bg-bg-tint motion-safe:transition-colors motion-safe:duration-150',
                        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]',
                        isUnread && 'bg-bg-tint/60',
                      )}
                      onClick={() => void handleNotificationClick(notification)}
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-button bg-bg-tint">
                        <NotificationTypeIcon type={notification.type} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] leading-snug text-ink">{getMessage(notification)}</p>
                        <RelativeTime
                          className="mt-1 text-[12px] text-muted"
                          date={notification.created_at}
                          locale={locale}
                        />
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
          )}

          <div className="border-t border-border px-4 py-3">
            <Link
              href="/notifications"
              className="text-[14px] font-semibold text-brand-blue hover:text-brand-blue-dark"
              onClick={() => setOpen(false)}
            >
              {t('panel.viewAll')}
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
