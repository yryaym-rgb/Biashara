'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import {
  BadgeCheck,
  Check,
  Package,
  Search,
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
  rfp_posted: Search,
  order_completed: Check,
  account_verified: BadgeCheck,
};

const EVENT_DOT_CLASS: Record<PublicActivityKind, string> = {
  listing_published: 'bg-brand-gold',
  rfp_posted: 'bg-brand-blue',
  order_completed: 'bg-market-live',
  account_verified: 'bg-brand-blue-dark',
};

function ActivityFeedLiveHeading({
  prefersReducedMotion,
}: {
  prefersReducedMotion: boolean;
}) {
  const t = useTranslations('activityFeed');

  return (
    <div className="mb-4 flex items-center gap-2.5">
      <span
        className={cn(
          'h-2 w-2 shrink-0 rounded-full bg-market-live',
          !prefersReducedMotion && 'ticker-live-dot',
        )}
        aria-hidden="true"
      />
      <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink">
        {t('liveHeading')}
      </p>
    </div>
  );
}

function ActivityFeedIcon({ kind, compact = false }: { kind: PublicActivityKind; compact?: boolean }) {
  const Icon = EVENT_ICONS[kind];

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-button bg-bg-tint',
        compact ? 'h-9 w-9' : 'h-11 w-11',
      )}
    >
      <Icon
        className={cn('text-brand-blue', compact ? 'h-4 w-4' : 'h-5 w-5')}
        strokeWidth={1.75}
        aria-hidden="true"
      />
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
        'flex items-center gap-3 rounded-card border border-border bg-bg card-shadow',
        'motion-safe:transition-[box-shadow,transform] motion-safe:duration-150 motion-safe:ease-out',
        'hover:card-shadow-hover hover:-translate-y-0.5',
        compact ? 'px-3 py-2.5' : 'px-4 py-3',
      )}
    >
      <span
        className={cn('h-2 w-2 shrink-0 rounded-full', EVENT_DOT_CLASS[event.kind])}
        aria-hidden="true"
      />
      <ActivityFeedIcon kind={event.kind} compact={compact} />
      <p
        className={cn(
          'min-w-0 flex-1 text-ink',
          compact ? 'text-[13px] leading-snug' : 'text-[15px] leading-snug',
        )}
      >
        {message}
      </p>
      <time
        dateTime={event.timestamp}
        className={cn(
          'shrink-0 whitespace-nowrap text-muted',
          compact ? 'text-[11px]' : 'text-[13px]',
        )}
      >
        {formatRelativeTime(event.timestamp, locale)}
      </time>
    </li>
  );
}

function ActivityFeedMarquee({ events }: { events: PublicActivityFeedEntry[] }) {
  return (
    <div className="activity-feed-marquee group flex overflow-hidden">
      <ul className="activity-feed-track flex w-full shrink-0 flex-col gap-2">
        {events.map((event) => (
          <ActivityFeedItem key={event.id} event={event} compact />
        ))}
      </ul>
      <ul className="activity-feed-track flex w-full shrink-0 flex-col gap-2" aria-hidden="true">
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
    <ul className="space-y-2">
      <ActivityFeedItem event={event} compact />
    </ul>
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
  const showLiveHeading = variant === 'section' && !isLoading && !isError;

  return (
    <div className={className}>
      {showLiveHeading ? (
        <ActivityFeedLiveHeading prefersReducedMotion={prefersReducedMotion} />
      ) : null}

      {isLoading ? (
        <div className="space-y-2" aria-hidden="true">
          <div className="skeleton-shimmer h-[52px] rounded-card" />
          <div className="skeleton-shimmer h-[52px] rounded-card" />
          <div className="skeleton-shimmer h-[52px] rounded-card" />
        </div>
      ) : isError ? (
        <p className="text-[15px] text-body">{t('error')}</p>
      ) : showEmpty ? (
        <p className="text-[15px] text-body">{t('empty')}</p>
      ) : useTicker ? (
        <div
          className="max-h-[320px] overflow-hidden"
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
            'space-y-2',
            variant === 'sidebar' && 'max-h-[280px] overflow-y-auto',
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
