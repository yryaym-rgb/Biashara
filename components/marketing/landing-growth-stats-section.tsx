import { getLocale, getTranslations } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { ScrollReveal } from '@/lib/motion/scroll-reveal';
import { getLandingPlatformStats } from '@/lib/marketing/landing-stats.queries';
import { safeQuery } from '@/lib/safe-query';
import { cn } from '@/lib/utils/cn';

const STAT_KEYS = [
  'verifiedUsers',
  'activeListings',
  'provincesRepresented',
  'mineralsTraded',
] as const;

type StatKey = (typeof STAT_KEYS)[number];

function statValue(stats: Awaited<ReturnType<typeof getLandingPlatformStats>>, key: StatKey): number {
  return stats[key];
}

export async function LandingGrowthStatsSection() {
  const t = await getTranslations('marketing.landing.growth');
  const locale = await getLocale();
  const stats = await safeQuery('marketing/landing-stats', getLandingPlatformStats, {
    verifiedUsers: 0,
    activeListings: 0,
    provincesRepresented: 0,
    mineralsTraded: 0,
  });

  return (
    <section className="bg-bg py-14 lg:py-24" aria-labelledby="landing-growth-title">
      <Container>
        <div className="mb-10 max-w-2xl">
          <p className="eyebrow mb-3">{t('eyebrow')}</p>
          <h2 id="landing-growth-title" className="text-[34px] font-bold leading-tight text-ink">
            {t('title')}
          </h2>
          <p className="mt-4 text-base text-body">{t('subtitle')}</p>
        </div>

        <ScrollReveal>
          <dl className="grid gap-6 min-[768px]:grid-cols-2 min-[1024px]:grid-cols-4">
            {STAT_KEYS.map((key) => (
              <div
                key={key}
                className={cn(
                  'rounded-card border border-border bg-bg p-6 card-shadow',
                  'motion-lift motion-safe:transition-[box-shadow,transform] motion-safe:duration-150',
                )}
              >
                <dt className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">
                  {t(`stats.${key}.label`)}
                </dt>
                <dd className="mt-3 tabular-nums text-[40px] font-bold leading-none text-ink min-[768px]:text-[48px]">
                  {statValue(stats, key).toLocaleString(locale)}
                </dd>
              </div>
            ))}
          </dl>
        </ScrollReveal>
      </Container>
    </section>
  );
}
