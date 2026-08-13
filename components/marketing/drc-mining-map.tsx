'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';
import {
  DRC_MAP_REGIONS,
  DRC_MAP_VIEWBOX,
  DRC_MINING_HUBS,
  MINING_PROVINCE_MINERALS,
  SHOWCASE_MINERAL_PROVINCES,
  isMiningProvince,
} from '@/lib/constants/drc-map';
import type { DrcProvince } from '@/lib/constants/provinces';
import { cn } from '@/lib/utils/cn';

const VIEWBOX_PARTS = DRC_MAP_VIEWBOX.split(/\s+/).map(Number);
const VIEWBOX_X = VIEWBOX_PARTS[0] ?? 0;
const VIEWBOX_Y = VIEWBOX_PARTS[1] ?? 0;
const VIEWBOX_WIDTH = VIEWBOX_PARTS[2] ?? 400;
const VIEWBOX_HEIGHT = VIEWBOX_PARTS[3] ?? 600;

export interface DrcMiningMapProps {
  listingCounts: Record<string, number>;
  cooperativeCounts?: Record<string, number>;
  variant?: 'light' | 'dark';
  mode?: 'marketplace' | 'admin';
}

export function DrcMiningMap({
  listingCounts,
  cooperativeCounts,
  variant = 'light',
  mode = 'marketplace',
}: DrcMiningMapProps) {
  const t = useTranslations(
    mode === 'admin' ? 'admin.dashboard.drcMap' : 'marketing.landing.map',
  );
  const tMinerals = useTranslations('minerals');
  const router = useRouter();
  const [activeProvince, setActiveProvince] = React.useState<DrcProvince | null>(null);
  const [tooltipPos, setTooltipPos] = React.useState<{ x: number; y: number } | null>(null);
  const svgRef = React.useRef<SVGSVGElement>(null);
  const isDark = variant === 'dark';

  function setTooltipFromCentroid(province: DrcProvince) {
    const svg = svgRef.current;
    const region = DRC_MAP_REGIONS.find((entry) => entry.province === province);
    if (!svg || !region) return;

    const rect = svg.getBoundingClientRect();
    setTooltipPos({
      x: ((region.labelX - VIEWBOX_X) / VIEWBOX_WIDTH) * rect.width,
      y: ((region.labelY - VIEWBOX_Y) / VIEWBOX_HEIGHT) * rect.height,
    });
  }

  function handleProvinceEnter(
    province: DrcProvince,
    _event: React.MouseEvent<SVGPathElement> | React.FocusEvent<SVGPathElement>,
  ) {
    setActiveProvince(province);
    setTooltipFromCentroid(province);
  }

  function handleProvinceLeave() {
    setActiveProvince(null);
    setTooltipPos(null);
  }

  function handleProvinceClick(province: DrcProvince) {
    if (mode === 'admin') {
      setActiveProvince(province);
      setTooltipFromCentroid(province);
      return;
    }

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
  const activeListingCount = activeProvince ? listingCounts[activeProvince] ?? 0 : 0;
  const activeCooperativeCount = activeProvince
    ? cooperativeCounts?.[activeProvince] ?? 0
    : 0;
  const isAdminMode = mode === 'admin';

  const showcaseRegions = DRC_MAP_REGIONS.filter((region) =>
    (SHOWCASE_MINERAL_PROVINCES as readonly string[]).includes(region.province),
  );

  return (
    <div className="relative mx-auto w-full max-w-[520px]">
      <svg
        ref={svgRef}
        viewBox={DRC_MAP_VIEWBOX}
        className="w-full h-auto"
        role="img"
        aria-label={t('mapAria')}
      >
        <rect
          x={VIEWBOX_X}
          y={VIEWBOX_Y}
          width={VIEWBOX_WIDTH}
          height={VIEWBOX_HEIGHT}
          className={cn(isDark ? 'fill-brand-blue-dark' : 'fill-bg-tint')}
          aria-hidden="true"
        />

        {isDark ? (
          <g aria-hidden="true">
            <path
              d="M 300 420 Q 360 360 400 300 T 470 180"
              fill="none"
              stroke="var(--brand-gold)"
              strokeWidth="1.5"
              strokeDasharray="6 6"
              opacity="0.55"
            />
            <circle cx="300" cy="420" r="4" fill="var(--brand-gold)" />
            <circle cx="400" cy="300" r="4" fill="var(--brand-gold)" opacity="0.8" />
            <circle cx="470" cy="180" r="5" fill="var(--brand-gold)" />
          </g>
        ) : null}

        {DRC_MAP_REGIONS.map(({ province, path }) => {
          const mining = isMiningProvince(province);
          const isActive = activeProvince === province;

          return (
            <path
              key={province}
              d={path}
              role={isAdminMode ? 'button' : 'link'}
              tabIndex={0}
              aria-label={
                isAdminMode
                  ? t('provinceStatsAria', { province })
                  : t('provinceLinkAria', { province })
              }
              className={cn(
                'cursor-pointer stroke-[1] motion-safe:transition-[fill] motion-safe:duration-150',
                isDark
                  ? cn(
                      'stroke-[color:color-mix(in_srgb,var(--white)_18%,transparent)]',
                      mining
                        ? 'fill-[color-mix(in_srgb,var(--brand-gold)_32%,var(--brand-blue-dark))]'
                        : 'fill-[color-mix(in_srgb,var(--white)_8%,var(--brand-blue-dark))]',
                      isActive &&
                        'fill-[color-mix(in_srgb,var(--brand-gold)_45%,var(--brand-blue-dark))]',
                      'hover:fill-[color-mix(in_srgb,var(--brand-gold)_38%,var(--brand-blue-dark))]',
                      'focus-visible:fill-[color-mix(in_srgb,var(--brand-gold)_42%,var(--brand-blue-dark))]',
                    )
                  : cn(
                      'stroke-border',
                      mining
                        ? 'fill-[color-mix(in_srgb,var(--brand-gold)_25%,var(--bg-tint))]'
                        : 'fill-bg',
                      isActive && 'fill-[color-mix(in_srgb,var(--brand-blue)_20%,var(--bg-tint))]',
                      'hover:fill-[color-mix(in_srgb,var(--brand-blue)_15%,var(--bg-tint))]',
                      'focus-visible:fill-[color-mix(in_srgb,var(--brand-blue)_20%,var(--bg-tint))]',
                    ),
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

        {DRC_MINING_HUBS.map((hub) => (
          <g key={hub.id} aria-hidden="true">
            <circle
              cx={hub.x}
              cy={hub.y}
              r={isDark ? 10 : 8}
              className={cn(
                'fill-[color-mix(in_srgb,var(--brand-gold)_20%,transparent)]',
                isDark && 'motion-safe:animate-pulse',
              )}
            />
            <circle
              cx={hub.x}
              cy={hub.y}
              r={isDark ? 4.5 : 3.5}
              className="fill-brand-gold"
            />
            <text
              x={hub.x}
              y={hub.y - 14}
              textAnchor="middle"
              className={cn(
                'select-none text-[9px] font-semibold',
                isDark ? 'fill-[color:var(--white)]' : 'fill-ink',
              )}
            >
              {t(`hubs.${hub.id}`)}
            </text>
          </g>
        ))}

        {isDark
          ? showcaseRegions.map((region) => {
              const minerals = MINING_PROVINCE_MINERALS[region.province];
              if (!minerals?.length) return null;

              const tagY = region.labelY + 18;
              const tagText = minerals.map((id) => tMinerals(id)).join(' · ');

              return (
                <g key={`tag-${region.province}`} aria-hidden="true">
                  <rect
                    x={region.labelX - 42}
                    y={tagY - 9}
                    width={84}
                    height={16}
                    rx={6}
                    className="fill-[color-mix(in_srgb,var(--brand-gold)_18%,var(--brand-blue-dark))]"
                    stroke="var(--brand-gold)"
                    strokeWidth="0.5"
                    opacity="0.95"
                  />
                  <text
                    x={region.labelX}
                    y={tagY + 3}
                    textAnchor="middle"
                    className="fill-[color:var(--white)] text-[7px] font-semibold uppercase tracking-wide"
                  >
                    {tagText}
                  </text>
                </g>
              );
            })
          : null}
      </svg>

      {isDark ? (
        <div
          className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:color-mix(in_srgb,var(--white)_70%,transparent)]"
          aria-hidden="true"
        >
          <span>{t('corridorStep1')}</span>
          <span className="text-brand-gold">→</span>
          <span>{t('corridorStep2')}</span>
          <span className="text-brand-gold">→</span>
          <span>{t('corridorStep3')}</span>
        </div>
      ) : null}

      {activeProvince && tooltipPos ? (
        <div
          className={cn(
            'pointer-events-none absolute z-10 max-w-[220px] rounded-card border p-3',
            'motion-safe:transition-opacity motion-safe:duration-150',
            isDark
              ? 'border-[color:color-mix(in_srgb,var(--white)_20%,transparent)] bg-brand-blue-dark card-shadow'
              : 'border-border bg-bg card-shadow',
          )}
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y,
            transform: 'translate(-50%, -110%)',
          }}
          role="tooltip"
        >
          <p
            className={cn(
              'text-[14px] font-semibold',
              isDark ? 'text-[color:var(--white)]' : 'text-ink',
            )}
          >
            {activeProvince}
          </p>
          {activeMinerals ? (
            <p
              className={cn(
                'mt-1 text-[13px]',
                isDark
                  ? 'text-[color:color-mix(in_srgb,var(--white)_75%,transparent)]'
                  : 'text-body',
              )}
            >
              {activeMinerals.map((id) => tMinerals(id)).join(', ')}
            </p>
          ) : null}
          {isAdminMode ? (
            <div className="mt-2 space-y-1">
              <p
                className={cn(
                  'text-[12px]',
                  isDark
                    ? 'text-[color:color-mix(in_srgb,var(--white)_60%,transparent)]'
                    : 'text-muted',
                )}
              >
                {t('activeListings', { count: activeListingCount })}
              </p>
              <p
                className={cn(
                  'text-[12px]',
                  isDark
                    ? 'text-[color:color-mix(in_srgb,var(--white)_60%,transparent)]'
                    : 'text-muted',
                )}
              >
                {t('cooperatives', { count: activeCooperativeCount })}
              </p>
            </div>
          ) : activeListingCount > 0 ? (
            <p
              className={cn(
                'mt-2 text-[12px]',
                isDark
                  ? 'text-[color:color-mix(in_srgb,var(--white)_60%,transparent)]'
                  : 'text-muted',
              )}
            >
              {t('activeListings', { count: activeListingCount })}
            </p>
          ) : (
            <p
              className={cn(
                'mt-2 text-[12px]',
                isDark
                  ? 'text-[color:color-mix(in_srgb,var(--white)_60%,transparent)]'
                  : 'text-muted',
              )}
            >
              {t('noListings')}
            </p>
          )}
        </div>
      ) : null}

      <p
        className={cn(
          'mt-3 text-center text-[11px]',
          isDark
            ? 'text-[color:color-mix(in_srgb,var(--white)_55%,transparent)]'
            : 'text-muted',
        )}
      >
        {t('attribution')}
      </p>
    </div>
  );
}
