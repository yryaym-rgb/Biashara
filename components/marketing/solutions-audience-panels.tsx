import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

const AUDIENCE_KEYS = ['cooperatives', 'traders', 'exporters', 'buyers'] as const;
type AudienceKey = (typeof AUDIENCE_KEYS)[number];

const CAPABILITY_KEYS = ['capability1', 'capability2', 'capability3'] as const;
type CapabilityKey = (typeof CAPABILITY_KEYS)[number];

const COMING_SOON: Record<AudienceKey, Record<CapabilityKey, boolean>> = {
  cooperatives: { capability1: false, capability2: false, capability3: false },
  traders: { capability1: false, capability2: false, capability3: false },
  exporters: { capability1: false, capability2: false, capability3: true },
  buyers: { capability1: false, capability2: false, capability3: false },
};

const PANEL_IMAGES: Record<AudienceKey, { src: string; altKey: AudienceKey }> = {
  cooperatives: { src: '/images/gallery/collection-point.jpg', altKey: 'cooperatives' },
  traders: { src: '/images/gallery/transport.jpg', altKey: 'traders' },
  exporters: { src: '/images/gallery/quality-check.jpg', altKey: 'exporters' },
  buyers: { src: '/images/gallery/copper-closeup.jpg', altKey: 'buyers' },
};

const PANEL_CTAS: Record<AudienceKey, '/register' | '/marketplace'> = {
  cooperatives: '/register',
  traders: '/marketplace',
  exporters: '/marketplace',
  buyers: '/marketplace',
};

export async function SolutionsAudiencePanels() {
  const t = await getTranslations('marketing.solutions');

  return (
    <div className="flex flex-col gap-8">
      {AUDIENCE_KEYS.map((audienceKey, index) => {
        const image = PANEL_IMAGES[audienceKey];
        const imageFirst = index % 2 === 0;

        return (
          <article
            key={audienceKey}
            className={cn(
              'overflow-hidden rounded-card border border-border bg-bg card-shadow',
              'motion-safe:transition-[box-shadow,transform] motion-safe:duration-150',
              'hover:card-shadow-hover hover:-translate-y-0.5',
            )}
          >
            <div
              className={cn(
                'grid gap-0 md:grid-cols-2',
                !imageFirst && 'md:[&>div:first-child]:order-2',
              )}
            >
              <div className="relative min-h-[220px] md:min-h-[320px]">
                <Image
                  src={image.src}
                  alt={t(`panels.${image.altKey}.imageAlt`)}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              <div className="flex flex-col justify-center gap-4 p-6 md:p-8">
                <div>
                  <h3 className="text-[18px] font-semibold text-ink">
                    {t(`audiences.${audienceKey}.title`)}
                  </h3>
                  <p className="mt-2 text-[15px] text-body">
                    {t(`audiences.${audienceKey}.forWhom`)}
                  </p>
                </div>

                <ul className="flex flex-col gap-3">
                  {CAPABILITY_KEYS.map((capKey) => (
                    <li
                      key={capKey}
                      className="flex items-start justify-between gap-3 text-[15px] text-body"
                    >
                      <span>{t(`audiences.${audienceKey}.${capKey}.label`)}</span>
                      {COMING_SOON[audienceKey][capKey] ? (
                        <Badge variant="warning" className="shrink-0">
                          {t('comingSoon')}
                        </Badge>
                      ) : null}
                    </li>
                  ))}
                </ul>

                <div className="pt-2">
                  <Button asChild variant="primary" size="sm">
                    <Link href={PANEL_CTAS[audienceKey]}>
                      {t(`panels.${audienceKey}.cta`)}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
