import { getTranslations } from 'next-intl/server';
import { cn } from '@/lib/utils/cn';
import {
  NORMAL_ORDER_STATUSES,
  getNormalStatusIndex,
  type NormalOrderStatus,
} from '@/lib/platform/order-status';
import type { Database } from '@/types/database.types';

export interface OrderStatusTimelineProps {
  status: Database['public']['Enums']['order_status'];
  locale: string;
}

export async function OrderStatusTimeline({ status, locale }: OrderStatusTimelineProps) {
  const t = await getTranslations({ locale, namespace: 'platform.orders' });

  const isTerminalBranch = status === 'cancelled' || status === 'disputed';
  const activeIndex = isTerminalBranch ? -1 : getNormalStatusIndex(status);

  function stepLabel(step: NormalOrderStatus): string {
    return step === 'in_transit' ? t('inTransit') : t(step);
  }

  return (
    <div className="flex flex-col gap-6">
      <ol
        className={cn('grid gap-8', 'md:grid-cols-4 md:gap-4')}
        aria-label={t('timelineLabel')}
      >
        {NORMAL_ORDER_STATUSES.map((step, index) => {
          const isLast = index === NORMAL_ORDER_STATUSES.length - 1;
          const isCompleted = activeIndex > index;
          const isCurrent = activeIndex === index;

          return (
            <li
              key={step}
              className={cn(
                'relative flex flex-col gap-4',
                !isLast &&
                  'md:after:absolute md:after:left-[calc(50%+28px)] md:after:right-0 md:after:top-[22px] md:after:h-px md:after:bg-border',
              )}
            >
              <div className="flex items-center gap-4 md:flex-col md:items-center md:text-center">
                <div
                  className={cn(
                    'relative z-[1] flex h-11 w-11 shrink-0 items-center justify-center rounded-button',
                    isCompleted || isCurrent
                      ? 'bg-[color-mix(in_srgb,var(--brand-gold)_12%,transparent)]'
                      : 'bg-bg-tint',
                    (isCompleted || isCurrent) &&
                      'md:after:absolute md:after:left-1/2 md:after:top-full md:after:z-[2]',
                    (isCompleted || isCurrent) &&
                      'md:after:h-2 md:after:w-2 md:after:-translate-x-1/2 md:after:translate-y-[calc(50%+6px)]',
                    (isCompleted || isCurrent) &&
                      'md:after:rounded-full md:after:bg-brand-gold md:after:content-[""]',
                  )}
                >
                  <span
                    className={cn(
                      'text-[15px] font-semibold tabular-nums',
                      isCompleted || isCurrent ? 'text-brand-blue' : 'text-muted',
                    )}
                  >
                    {index + 1}
                  </span>
                </div>

                <div className="flex min-w-0 flex-col gap-1 md:items-center">
                  <h3
                    className={cn(
                      'text-[16px] font-semibold',
                      isCompleted || isCurrent ? 'text-ink' : 'text-muted',
                    )}
                  >
                    {stepLabel(step)}
                  </h3>
                  {isCurrent ? (
                    <p className="text-[13px] font-semibold text-brand-blue">{t('timelineCurrent')}</p>
                  ) : isCompleted ? (
                    <p className="text-[13px] text-success">{t('timelineCompleted')}</p>
                  ) : (
                    <p className="text-[13px] text-muted">{t('timelineUpcoming')}</p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {isTerminalBranch ? (
        <div
          className={cn(
            'flex items-start gap-4 rounded-card border border-border p-6',
            status === 'disputed'
              ? 'border-[color-mix(in_srgb,var(--danger)_35%,var(--border))] bg-[color-mix(in_srgb,var(--danger)_6%,transparent)]'
              : 'bg-bg-tint',
          )}
          role="status"
        >
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-button',
              status === 'disputed'
                ? 'bg-[color-mix(in_srgb,var(--danger)_12%,transparent)]'
                : 'bg-[color-mix(in_srgb,var(--muted)_12%,transparent)]',
            )}
            aria-hidden="true"
          >
            <span
              className={cn(
                'h-2 w-2 rounded-full',
                status === 'disputed' ? 'bg-danger' : 'bg-muted',
              )}
            />
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-[16px] font-semibold text-ink">
              {status === 'disputed' ? t('disputed') : t('cancelled')}
            </p>
            <p className="text-[13px] text-body">{t('terminalBranchHint')}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
