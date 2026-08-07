import Image from 'next/image';
import { ImageIcon } from 'lucide-react';

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

export interface HeroImageProps {
  hasHeroImage: boolean;
  imageAlt: string;
  placeholderLabel: string;
}

export function HeroImage({ hasHeroImage, imageAlt, placeholderLabel }: HeroImageProps) {
  return (
    <div className="relative w-full overflow-hidden lg:min-h-[480px]">
      <HeroGlobeAccent />
      <div className="relative z-[1] h-[280px] w-full overflow-hidden rounded-card card-shadow lg:h-[480px]">
        {hasHeroImage ? (
          <Image
            src="/images/hero-minerals.jpg"
            alt={imageAlt}
            fill
            className="hero-ken-burns object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 600px"
            priority
          />
        ) : (
          <div
            className="flex h-full w-full flex-col items-center justify-center gap-3 bg-bg-tint"
            role="img"
            aria-label={placeholderLabel}
          >
            <ImageIcon className="h-10 w-10 text-muted" strokeWidth={1.75} aria-hidden="true" />
            <p className="text-[13px] text-muted">{placeholderLabel}</p>
          </div>
        )}
      </div>
    </div>
  );
}
