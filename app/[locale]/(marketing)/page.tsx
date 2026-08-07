import { existsSync } from 'fs';
import { join } from 'path';
import Image from 'next/image';
import {
  BrainCircuit,
  ImageIcon,
  LineChart,
  Lock,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { cn } from '@/lib/utils/cn';

const HERO_IMAGE_FILE = join(process.cwd(), 'public/images/hero-minerals.jpg');

const FEATURE_KEYS = [
  'priceTransparency',
  'blockchainTraceability',
  'securePayments',
  'smartLogistics',
  'aiMarketIntelligence',
] as const;

type FeatureKey = (typeof FEATURE_KEYS)[number];

const FEATURE_ICONS: Record<FeatureKey, typeof LineChart> = {
  priceTransparency: LineChart,
  blockchainTraceability: ShieldCheck,
  securePayments: Lock,
  smartLogistics: Truck,
  aiMarketIntelligence: BrainCircuit,
};

const FEATURE_ICON_TINT: Record<FeatureKey, 'gold' | 'blue'> = {
  priceTransparency: 'gold',
  blockchainTraceability: 'blue',
  securePayments: 'gold',
  smartLogistics: 'blue',
  aiMarketIntelligence: 'gold',
};

function HeroGlobeAccent() {
  return (
    <svg
      className="pointer-events-none absolute left-1/2 top-1/2 h-[min(100%,420px)] w-[min(100%,420px)] -translate-x-1/2 -translate-y-1/2 opacity-[0.18]"
      viewBox="0 0 400 400"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="200" cy="200" r="148" stroke="var(--border)" strokeWidth="1" />
      <circle cx="200" cy="200" r="108" stroke="var(--border)" strokeWidth="1" />
      <ellipse cx="200" cy="200" rx="148" ry="52" stroke="var(--border)" strokeWidth="1" />
      <ellipse cx="200" cy="200" rx="52" ry="148" stroke="var(--border)" strokeWidth="1" />
      <line x1="52" y1="200" x2="348" y2="200" stroke="var(--border)" strokeWidth="1" />
      <line x1="200" y1="52" x2="200" y2="348" stroke="var(--border)" strokeWidth="1" />
      <circle cx="120" cy="148" r="4" fill="var(--brand-blue)" opacity="0.55" />
      <circle cx="268" cy="124" r="4" fill="var(--brand-gold)" opacity="0.55" />
      <circle cx="312" cy="228" r="4" fill="var(--brand-blue)" opacity="0.55" />
      <circle cx="176" cy="292" r="4" fill="var(--brand-gold)" opacity="0.55" />
      <circle cx="88" cy="236" r="4" fill="var(--brand-blue)" opacity="0.55" />
      <line
        x1="120"
        y1="148"
        x2="268"
        y2="124"
        stroke="var(--brand-blue)"
        strokeWidth="1"
        opacity="0.35"
      />
      <line
        x1="268"
        y1="124"
        x2="312"
        y2="228"
        stroke="var(--brand-gold)"
        strokeWidth="1"
        opacity="0.35"
      />
      <line
        x1="312"
        y1="228"
        x2="176"
        y2="292"
        stroke="var(--brand-blue)"
        strokeWidth="1"
        opacity="0.35"
      />
      <line
        x1="176"
        y1="292"
        x2="88"
        y2="236"
        stroke="var(--brand-gold)"
        strokeWidth="1"
        opacity="0.35"
      />
      <line
        x1="88"
        y1="236"
        x2="120"
        y2="148"
        stroke="var(--brand-blue)"
        strokeWidth="1"
        opacity="0.35"
      />
    </svg>
  );
}

function FeatureIcon({ featureKey }: { featureKey: FeatureKey }) {
  const Icon = FEATURE_ICONS[featureKey];
  const tint = FEATURE_ICON_TINT[featureKey];

  return (
    <div
      className={cn(
        'flex h-11 w-11 shrink-0 items-center justify-center rounded-button',
        tint === 'gold'
          ? 'bg-[color-mix(in_srgb,var(--brand-gold)_12%,transparent)]'
          : 'bg-[color-mix(in_srgb,var(--brand-blue)_12%,transparent)]',
      )}
    >
      <Icon className="h-6 w-6 text-brand-blue" strokeWidth={1.75} aria-hidden="true" />
    </div>
  );
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('marketing.landing');
  const hasHeroImage = existsSync(HERO_IMAGE_FILE);

  return (
    <section className="relative bg-bg pb-12 lg:pb-16">
      <Container className="pt-14 lg:pt-24">
        <div className="grid items-center gap-8 lg:grid-cols-[55fr_45fr] lg:gap-12">
          <div className="flex flex-col gap-6 lg:gap-8">
            <p className="eyebrow">{t('eyebrow')}</p>

            <h1 className="text-[36px] font-bold leading-[1.1] text-ink min-[481px]:text-[56px]">
              <span className="block">{t('heroLine1')}</span>
              <span className="block">{t('heroLine2')}</span>
              <span className="block text-brand-gold">{t('heroLine3')}</span>
            </h1>

            <p className="max-w-[34rem] text-base text-body">{t('subtitle')}</p>

            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
              <Button asChild variant="primary" className="w-full sm:w-auto">
                <Link href="/marketplace">{t('ctaMarketplace')}</Link>
              </Button>
              <Button asChild variant="ghost" className="w-full sm:w-auto">
                <Link href="#">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-bg-tint"
                    aria-hidden="true"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3.5 w-3.5 fill-brand-blue"
                      aria-hidden="true"
                    >
                      <path d="M9 7.5v9l7.5-4.5L9 7.5z" />
                    </svg>
                  </span>
                  {t('ctaVideo')}
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative min-h-[280px] sm:min-h-[320px] lg:min-h-[380px]">
            <HeroGlobeAccent />
            <div className="relative z-[1] flex h-full min-h-[280px] items-end justify-center sm:min-h-[320px] lg:min-h-[380px]">
              {hasHeroImage ? (
                <Image
                  src="/images/hero-minerals.jpg"
                  alt={t('heroImageAlt')}
                  width={560}
                  height={420}
                  className="h-auto w-full max-w-[560px] object-contain object-bottom"
                  priority
                />
              ) : (
                <div
                  className="flex h-[min(100%,320px)] w-full max-w-[560px] flex-col items-center justify-center gap-3 rounded-card border border-border bg-bg-tint"
                  role="img"
                  aria-label={t('heroImagePlaceholder')}
                >
                  <ImageIcon
                    className="h-10 w-10 text-muted"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                  <p className="text-[13px] text-muted">{t('heroImagePlaceholder')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>

      <Container className="relative z-10 -mt-12">
        <Card className="overflow-hidden">
          <div
            className={cn(
              'grid grid-cols-1 gap-0',
              'min-[481px]:grid-cols-2',
              'md:grid-cols-5 md:divide-x md:divide-border',
            )}
          >
            {FEATURE_KEYS.map((featureKey) => (
              <div
                key={featureKey}
                className={cn(
                  'flex flex-col items-center gap-3 px-4 py-8 text-center sm:px-6',
                  'max-[480px]:border-b border-border last:max-[480px]:border-b-0',
                  'min-[481px]:max-md:[&:nth-child(odd)]:border-r min-[481px]:max-md:border-b border-border',
                  'min-[481px]:max-md:[&:nth-last-child(-n+2)]:border-b-0',
                  'min-[481px]:max-md:[&:nth-child(even)]:border-r-0',
                  'min-[481px]:max-md:[&:last-child]:border-r-0',
                )}
              >
                <FeatureIcon featureKey={featureKey} />
                <h3 className="text-[15px] font-semibold leading-snug text-ink">
                  {t(`features.${featureKey}.title`)}
                </h3>
                <p className="text-[13px] leading-snug text-muted">
                  {t(`features.${featureKey}.description`)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </Container>
    </section>
  );
}
