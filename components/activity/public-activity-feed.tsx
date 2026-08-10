'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import {
  BadgeCheck,
  ClipboardList,
  Package,
  ShoppingBag,
  type LucideIcon,
} from 'lucide-react';
import { fetchPublicActivityFeedClient } from '@/lib/activity/fetch-client';
import type {
  PublicActivityFeedEntry,
  PublicActivityKind,
} from '@/lib/activity/public-feed.types';
import { formatRelativeTime } from '@/lib/utils/dates';
import { cn } from '@/lib/utils/cn';

const REFETCH_INTERVAL_MS = 60_000;
const STALE_TIME_MS = 30_000;
const REDUCED_CYCLE_MS = 4000;

const EVENT_ICONS: Record<PublicActivityKind, LucideIcon> = {
  listing_published: Package,
  rfp_posted: ClipboardList,
  order_completed: ShoppingBag,
  account_verified: BadgeCheck,
};

function ActivityFeedIcon({ kind }: { kind: PublicActivityKind }) {
  const Icon = EVENT_ICONS[kind];

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-button bg-bg-tint">
      <Icon className="h-5 w-5 text-brand-blue" strokeWidth={1.75} aria-hidden="true" />
    </div>
  );
}

function ActivityFeedItem({
  event,
  compact = false,
}: {
  event: PublicActivityFeedEntry;
  compact?: boolean;
}) {
  const t = useTranslations('activityFeed');
  const tMinerals = useTranslations('minerals');
  const tRoles = useTranslations('admin.roles');
  const locale = useLocale();

  const mineralLabel = event.mineral ? tMinerals(event.mineral) : '';
  const roleLabel = event.role ? tRoles(event.role) : '';
  const provinceLabel = event.province ?? '';

  const message = t(event.kind, {
    mineral: mineralLabel,
    province: provinceLabel,
    role: roleLabel,
  });

  return (
    <li
      className={cn(
        'flex items-start gap-3',
        compact ? 'py-2' : 'border-b border-border py-4 last:border-b-0',
      )}
    >
      <ActivityFeedIcon kind={event.kind} />
      <div className="min-w-0 flex-1">
        <p className={cn('text-ink', compact ? 'text-[13px] leading-snug' : 'text-[15px]')}>
          {message}
        </p>
        <p className={cn('text-muted', compact ? 'mt-0.5 text-[11px]' : 'mt-1 text-[13px]')}>
          <time dateTime={event.timestamp}>{formatRelativeTime(event.timestamp, locale)}</time>
        </p>
      </div>
    </li>
  );
}

function ActivityFeedMarquee({ events }: { events: PublicActivityFeedEntry[] }) {
  return (
    <div className="activity-feed-marquee group flex overflow-hidden">
      <ul className="activity-feed-track flex shrink-0 flex-col">
        {events.map((event) => (
          <ActivityFeedItem key={event.id} event={event} compact />
        ))}
      </ul>
      <ul className="activity-feed-track flex shrink-0 flex-col" aria-hidden="true">
        {events.map((event) => (
          <ActivityFeedItem key={`dup-${event.id}`} event={event} compact />
        ))}
      </ul>
    </div>
  );
}

function ActivityFeedReducedCycle({ events }: { events: PublicActivityFeedEntry[] }) {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    if (events.length <= 1) return;

    const interval = window.setInterval(() => {
      setIndex((current) => (current + 1) % events.length);
    }, REDUCED_CYCLE_MS);

    return () => window.clearInterval(interval);
  }, [events.length]);

  const event = events[index];
  if (!event) return null;

  return (
    <div className="px-1">
      <ActivityFeedItem event={event} compact />
    </div>
  );
}

export interface PublicActivityFeedProps {
  variant?: 'section' | 'sidebar';
  className?: string;
}

export function PublicActivityFeed({ variant = 'section', className }: PublicActivityFeedProps) {
  const t = useTranslations('activityFeed');
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(media.matches);
    const handler = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['public-activity-feed'],
    queryFn: fetchPublicActivityFeedClient,
    staleTime: STALE_TIME_MS,
    refetchInterval: REFETCH_INTERVAL_MS,
    refetchOnWindowFocus: true,
  });

  const showEmpty = !isLoading && !isError && (data?.isEmpty || (data?.events.length ?? 0) === 0);
  const events = data?.events ?? [];
  const useTicker = variant === 'section' && events.length >= 3 && !showEmpty;

  return (
    <div className={className}>
      {isLoading ? (
        <div className="space-y-3" aria-hidden="true">
          <div className="skeleton-shimmer h-12 rounded-card" />
          <div className="skeleton-shimmer h-12 rounded-card" />
          <div className="skeleton-shimmer h-12 rounded-card" />
        </div>
      ) : isError ? (
        <p className="text-[15px] text-body">{t('error')}</p>
      ) : showEmpty ? (
        <p className="text-[15px] text-body">{t('empty')}</p>
      ) : useTicker ? (
        <div
          className="max-h-[280px] overflow-hidden"
          role="feed"
          aria-label={t('ariaLabel')}
          aria-live="polite"
        >
          {prefersReducedMotion ? (
            <ActivityFeedReducedCycle events={events} />
          ) : (
            <ActivityFeedMarquee events={events} />
          )}
        </div>
      ) : (
        <ul
          className={cn(
            'space-y-0',
            variant === 'sidebar' && 'max-h-[220px] overflow-y-auto',
          )}
          role="feed"
          aria-label={t('ariaLabel')}
          aria-live="polite"
        >
          {events.map((event) => (
            <ActivityFeedItem
              key={event.id}
              event={event}
              compact={variant === 'sidebar'}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
