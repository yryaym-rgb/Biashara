import { getTranslations } from 'next-intl/server';
import { PublicActivityFeed } from '@/components/activity/public-activity-feed';
import { cn } from '@/lib/utils/cn';

export async function LandingActivityBand() {
  const t = await getTranslations('activityFeed.landing');

  return (
    <section
      className={cn(
        'border-y border-[color-mix(in_srgb,var(--brand-blue)_18%,transparent)]',
        'bg-brand-blue-dark py-8 min-[768px]:py-10',
      )}
      aria-labelledby="landing-activity-band-title"
    >
      <div className="mx-auto max-w-[1200px] px-4 min-[768px]:px-8 lg:px-12">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-brand-gold">
              <span className="hero-live-dot" aria-hidden="true" />
              {t('eyebrow')}
            </p>
            <h2
              id="landing-activity-band-title"
              className="text-[24px] font-bold leading-tight text-white min-[768px]:text-[30px]"
            >
              {t('title')}
            </h2>
          </div>
          <p className="max-w-md text-[14px] leading-relaxed text-[color-mix(in_srgb,var(--white)_78%,transparent)] min-[768px]:text-[15px]">
            {t('subtitle')}
          </p>
        </div>

        <div
          className={cn(
            'rounded-card border border-[color-mix(in_srgb,var(--white)_12%,transparent)]',
            'bg-[color-mix(in_srgb,var(--brand-blue-dark)_70%,var(--brand-blue)_30%)] p-5 min-[768px]:p-6',
            '[&_.text-ink]:text-white [&_.text-muted]:text-[color-mix(in_srgb,var(--white)_68%,transparent)]',
            '[&_.text-\\[13px\\]]:text-[15px] [&_.text-\\[11px\\]]:text-[13px]',
            '[&_.bg-bg-tint]:bg-[color-mix(in_srgb,var(--white)_10%,transparent)]',
          )}
        >
          <PublicActivityFeed variant="section" />
        </div>
      </div>
    </section>
  );
}
