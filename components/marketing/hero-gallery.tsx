'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ResolvedHeroGallerySlide } from '@/lib/constants/hero-gallery';
import { cn } from '@/lib/utils/cn';

const CROSSFADE_MS = 700;
const AUTO_ADVANCE_MS = 5000;

function HeroGlobeAccent() {
  return (
    <svg
      className="pointer-events-none absolute left-1/2 top-1/2 h-[min(110%,520px)] w-[min(110%,520px)] -translate-x-1/2 -translate-y-1/2 opacity-[0.18]"
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

export interface HeroGalleryProps {
  slides: ResolvedHeroGallerySlide[];
  placeholderLabel: string;
}

export function HeroGallery({ slides, placeholderLabel }: HeroGalleryProps) {
  const t = useTranslations('marketing.landing');
  const [activeIndex, setActiveIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const slideCount = slides.length;
  const activeSlide = slides[activeIndex] ?? slides[0];

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(media.matches);
    const handler = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (activeIndex >= slideCount) {
      setActiveIndex(0);
    }
  }, [activeIndex, slideCount]);

  const goToSlide = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || isPaused || slideCount <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slideCount);
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(timer);
  }, [prefersReducedMotion, isPaused, slideCount, activeIndex]);

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsPaused(false);
    }
  };

  if (slideCount === 0 || !activeSlide) {
    return (
      <div className="relative w-full overflow-hidden lg:min-h-[480px]">
        <HeroGlobeAccent />
        <div className="relative z-[1] h-[280px] w-full overflow-hidden rounded-card card-shadow lg:h-[480px]">
          <div
            className="flex h-full w-full flex-col items-center justify-center gap-3 bg-bg-tint"
            role="img"
            aria-label={placeholderLabel}
          >
            <ImageIcon className="h-10 w-10 text-muted" strokeWidth={1.75} aria-hidden="true" />
            <p className="text-[13px] text-muted">{placeholderLabel}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full overflow-hidden lg:min-h-[480px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={handleBlur}
    >
      <HeroGlobeAccent />
      <div
        className="relative z-[1] h-[280px] w-full overflow-hidden rounded-card card-shadow lg:h-[480px]"
        aria-roledescription="carousel"
        aria-label={activeSlide.caption}
      >
        {slides.map((slide, index) => {
          const isActive = index === activeIndex;

          return (
            <div
              key={slide.imagePath}
              className={cn(
                'absolute inset-0',
                prefersReducedMotion
                  ? isActive
                    ? 'z-[1] opacity-100'
                    : 'z-0 opacity-0'
                  : cn(
                      'transition-opacity ease-in-out',
                      isActive ? 'z-[1] opacity-100' : 'z-0 opacity-0',
                    ),
              )}
              style={prefersReducedMotion ? undefined : { transitionDuration: `${CROSSFADE_MS}ms` }}
              aria-hidden={!isActive}
            >
              <Image
                src={slide.imagePath}
                alt={slide.caption}
                fill
                className={cn(
                  'object-cover object-center',
                  !prefersReducedMotion && isActive && 'hero-ken-burns',
                )}
                sizes="(max-width: 1024px) 100vw, 600px"
                priority={index === 0}
              />
            </div>
          );
        })}

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-24 bg-gradient-to-t from-brand-blue-dark to-transparent"
          aria-hidden="true"
        />

        {slideCount > 1 ? (
          <div className="absolute bottom-4 left-0 right-0 z-[3] flex flex-col items-center gap-2 px-4">
            <p
              className="text-center text-[13px] font-semibold tabular-nums text-white"
              aria-live="polite"
            >
              {String(activeIndex + 1).padStart(2, '0')} / {String(slideCount).padStart(2, '0')} ·{' '}
              {activeSlide.caption}
            </p>
            <div className="flex justify-center gap-2">
              {slides.map((slide, index) => (
                <button
                  key={slide.imagePath}
                  type="button"
                  onClick={() => goToSlide(index)}
                  aria-label={t('heroGalleryDotLabel', {
                    index: index + 1,
                    total: slideCount,
                  })}
                  aria-current={index === activeIndex ? 'true' : undefined}
                  className={cn(
                    'h-2 w-2 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)]',
                    index === activeIndex ? 'bg-brand-gold' : 'bg-white/50',
                  )}
                />
              ))}
            </div>
          </div>
        ) : (
          <p className="absolute bottom-4 left-0 right-0 z-[3] px-4 text-center text-[13px] text-white">
            {activeSlide.caption}
          </p>
        )}
      </div>
    </div>
  );
}
