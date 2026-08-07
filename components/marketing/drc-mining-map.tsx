'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';
import {
  DRC_MAP_REGIONS,
  DRC_MAP_VIEWBOX,
  MINING_PROVINCE_MINERALS,
  isMiningProvince,
} from '@/lib/constants/drc-map';
import type { DrcProvince } from '@/lib/constants/provinces';
import { cn } from '@/lib/utils/cn';

export interface DrcMiningMapProps {
  listingCounts: Record<string, number>;
}

export function DrcMiningMap({ listingCounts }: DrcMiningMapProps) {
  const t = useTranslations('marketing.landing.map');
  const tMinerals = useTranslations('minerals');
  const router = useRouter();
  const [activeProvince, setActiveProvince] = React.useState<DrcProvince | null>(null);
  const [tooltipPos, setTooltipPos] = React.useState<{ x: number; y: number } | null>(null);

  function handleProvinceEnter(
    province: DrcProvince,
    event: React.MouseEvent<SVGPathElement> | React.FocusEvent<SVGPathElement>,
  ) {
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const pathRect = event.currentTarget.getBoundingClientRect();
    setActiveProvince(province);
    setTooltipPos({
      x: pathRect.left + pathRect.width / 2 - rect.left,
      y: pathRect.top + pathRect.height / 2 - rect.top,
    });
  }

  function handleProvinceLeave() {
    setActiveProvince(null);
    setTooltipPos(null);
  }

  function handleProvinceClick(province: DrcProvince) {
    router.push(`/marketplace?province=${encodeURIComponent(province)}`);
  }

  function handleProvinceKeyDown(
    event: React.KeyboardEvent<SVGPathElement>,
    province: DrcProvince,
  ) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleProvinceClick(province);
    }
  }

  const activeMinerals = activeProvince
    ? MINING_PROVINCE_MINERALS[activeProvince]
    : undefined;
  const activeCount = activeProvince ? listingCounts[activeProvince] ?? 0 : 0;

  return (
    <div className="relative mx-auto w-full max-w-[480px]">
      <svg
        viewBox={DRC_MAP_VIEWBOX}
        className="w-full h-auto"
        role="img"
        aria-label={t('mapAria')}
      >
        <rect
          x="0"
          y="0"
          width="400"
          height="600"
          className="fill-bg-tint"
          aria-hidden="true"
        />

        {DRC_MAP_REGIONS.map(({ province, path }) => {
          const mining = isMiningProvince(province);
          const isActive = activeProvince === province;

          return (
            <path
              key={province}
              d={path}
              role="link"
              tabIndex={0}
              aria-label={t('provinceLinkAria', { province })}
              className={cn(
                'cursor-pointer stroke-border stroke-[1]',
                mining
                  ? 'fill-[color-mix(in_srgb,var(--brand-gold)_25%,var(--bg-tint))]'
                  : 'fill-bg',
                isActive && 'fill-[color-mix(in_srgb,var(--brand-blue)_20%,var(--bg-tint))]',
                'motion-safe:transition-[fill] motion-safe:duration-150',
                'hover:fill-[color-mix(in_srgb,var(--brand-blue)_15%,var(--bg-tint))]',
                'focus-visible:fill-[color-mix(in_srgb,var(--brand-blue)_20%,var(--bg-tint))]',
              )}
              onClick={() => handleProvinceClick(province)}
              onKeyDown={(event) => handleProvinceKeyDown(event, province)}
              onMouseEnter={(event) => handleProvinceEnter(province, event)}
              onMouseLeave={handleProvinceLeave}
              onFocus={(event) => handleProvinceEnter(province, event)}
              onBlur={handleProvinceLeave}
            />
          );
        })}
      </svg>

      {activeProvince && tooltipPos ? (
        <div
          className={cn(
            'pointer-events-none absolute z-10 max-w-[220px] rounded-card border border-border',
            'bg-bg p-3 card-shadow',
            'motion-safe:transition-opacity motion-safe:duration-150',
          )}
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y,
            transform: 'translate(-50%, -110%)',
          }}
          role="tooltip"
        >
          <p className="text-[14px] font-semibold text-ink">{activeProvince}</p>
          {activeMinerals ? (
            <p className="mt-1 text-[13px] text-body">
              {activeMinerals.map((id) => tMinerals(id)).join(', ')}
            </p>
          ) : null}
          {activeCount > 0 ? (
            <p className="mt-2 text-[12px] text-muted">
              {t('activeListings', { count: activeCount })}
            </p>
          ) : (
            <p className="mt-2 text-[12px] text-muted">{t('noListings')}</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
