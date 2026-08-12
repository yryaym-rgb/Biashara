'use client';

import * as React from 'react';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { Button } from '@/components/ui/button';
import { HeroLivePricesPanel } from '@/components/marketing/hero-live-prices-panel';
import { HeroQuickSearch } from '@/components/marketing/hero-quick-search';
import { cn } from '@/lib/utils/cn';

const NAVBAR_HEIGHT_PX = 72;
const PARALLAX_FACTOR = 0.28;

export function LandingHero() {
  const t = useTranslations('marketing.landing');
  const [imageFailed, setImageFailed] = React.useState(false);
  const [scrollY, setScrollY] = React.useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(media.matches);

    const onMediaChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    media.addEventListener('change', onMediaChange);
    return () => media.removeEventListener('change', onMediaChange);
  }, []);

  React.useEffect(() => {
    if (prefersReducedMotion) {
      setScrollY(0);
      return;
    }

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        frame = 0;
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [prefersReducedMotion]);

  const imageOffset = prefersReducedMotion ? 0 : scrollY * PARALLAX_FACTOR;

  return (
    <section
      className="relative isolate overflow-hidden"
      style={{ minHeight: `calc(100dvh - ${NAVBAR_HEIGHT_PX}px)` }}
    >
      <div className="absolute inset-0" aria-hidden="true">
        {!imageFailed ? (
          <Image
            src="/images/hero-minerals.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className={cn('landing-hero-image object-cover object-center', !prefersReducedMotion && 'scale-105')}
            style={{
              transform: prefersReducedMotion ? undefined : `translate3d(0, ${imageOffset}px, 0)`,
            }}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="h-full w-full bg-brand-blue-dark" />
        )}

        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, color-mix(in srgb, var(--brand-blue-dark) 18%, transparent) 0%, color-mix(in srgb, var(--brand-blue-dark) 52%, transparent) 42%, color-mix(in srgb, var(--brand-blue-dark) 92%, transparent) 100%)',
          }}
        />
      </div>

      <div className="relative z-[1] flex min-h-[calc(100dvh-72px)] flex-col justify-between px-4 pb-8 pt-10 min-[768px]:px-8 min-[768px]:pb-12 min-[768px]:pt-14 lg:px-12 lg:pb-16">
        <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col justify-center gap-6 min-[768px]:gap-8">
          <div className="max-w-[920px]">
            <p className="mb-4 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-[color-mix(in_srgb,var(--white)_78%,transparent)] min-[768px]:text-[13px]">
              <span className="hero-live-dot" aria-hidden="true" />
              {t('eyebrow')}
            </p>

            <h1 className="text-[40px] font-bold leading-[1.05] tracking-[-0.02em] text-white min-[481px]:text-[56px] min-[768px]:text-[72px] min-[1024px]:text-[88px] xl:text-[96px]">
              <span className="hero-line hero-line-1 block">{t('heroLine1')}</span>
              <span className="hero-line hero-line-2 block">{t('heroLine2')}</span>
              <span className="hero-line hero-line-3 block text-brand-gold">{t('heroLine3')}</span>
            </h1>

            <p className="mt-6 max-w-[38rem] text-[16px] leading-[1.65] text-[color-mix(in_srgb,var(--white)_86%,transparent)] min-[768px]:text-[18px]">
              {t('subtitle')}
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
            <Button asChild variant="primary" className="hero-cta-shimmer w-full sm:w-auto">
              <Link href="/marketplace">{t('ctaMarketplace')}</Link>
            </Button>
            <Button
              asChild
              variant="secondary"
              className="w-full border-[color-mix(in_srgb,var(--white)_24%,transparent)] bg-[color-mix(in_srgb,var(--white)_10%,transparent)] text-white hover:bg-[color-mix(in_srgb,var(--white)_16%,transparent)] sm:w-auto"
            >
              <Link href="/prices">{t('ctaPrices')}</Link>
            </Button>
          </div>

          <div className="max-w-md [&_input]:border-[color-mix(in_srgb,var(--white)_24%,transparent)] [&_input]:bg-[color-mix(in_srgb,var(--brand-blue-dark)_55%,transparent)] [&_input]:text-white [&_input]:placeholder:text-[color-mix(in_srgb,var(--white)_58%,transparent)]">
            <HeroQuickSearch />
          </div>
        </div>

        <div className="mx-auto mt-10 w-full max-w-[1200px]">
          <HeroLivePricesPanel />
        </div>
      </div>

      {imageFailed ? (
        <div className="sr-only" role="img" aria-label={t('heroImageAlt')}>
          {t('heroImagePlaceholder')}
          <ImageIcon aria-hidden="true" />
        </div>
      ) : null}
    </section>
  );
}
