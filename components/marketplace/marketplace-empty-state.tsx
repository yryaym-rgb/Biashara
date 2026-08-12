import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { Button } from '@/components/ui/button';
import { MINERAL_IDS, type MineralId } from '@/lib/constants/minerals';
import { isSellerRole } from '@/lib/rbac';
import type { Profile } from '@/lib/auth/session';
import { cn } from '@/lib/utils/cn';

const MINERAL_TILE_IMAGES: Record<MineralId, string> = {
  cobalt: '/images/gallery/cobalt-closeup.jpg',
  copper: '/images/gallery/copper-closeup.jpg',
  gold: '/images/hero-minerals.jpg',
  coltan: '/images/gallery/quality-check.jpg',
  lithium: '/images/auth-mining.jpg',
  diamond: '/images/gallery/collection-point.jpg',
};

export interface MarketplaceEmptyStateProps {
  profile: Profile | null;
  locale: string;
  filtered?: boolean;
}

export async function MarketplaceEmptyState({
  profile,
  locale,
  filtered = false,
}: MarketplaceEmptyStateProps) {
  const t = await getTranslations({ locale, namespace: 'platform.marketplace' });
  const tMinerals = await getTranslations({ locale, namespace: 'minerals' });

  const canPostOffer =
    profile && isSellerRole(profile.role) && profile.kyc_status === 'approved';

  const primaryHref = canPostOffer ? '/marketplace/new' : profile ? '/settings' : '/register';
  const primaryLabel = canPostOffer
    ? t('emptyCtaPost')
    : profile
      ? t('emptyCtaKyc')
      : t('emptyCtaRegister');

  if (filtered) {
    return (
      <div className="rounded-card border border-border bg-bg-tint px-6 py-16 text-center">
        <h2 className="text-[18px] font-semibold text-ink">{t('emptyFiltered')}</h2>
        <p className="mx-auto mt-3 max-w-lg text-[15px] text-body">{t('emptyFilteredDescription')}</p>
        <div className="mt-6">
          <Button asChild variant="secondary">
            <Link href="/marketplace">{t('emptyBrowseAll')}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12">
      <div className="overflow-hidden rounded-card border border-border bg-bg">
        <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="relative min-h-[220px] md:min-h-[360px]">
            <Image
              src="/images/gallery/cobalt-closeup.jpg"
              alt={t('emptyImageAlt')}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 45vw"
              priority
            />
          </div>

          <div className="flex flex-col justify-center gap-6 p-6 md:p-10">
            <div className="space-y-4">
              <p className="eyebrow">{t('emptyEyebrow')}</p>
              <h2 className="text-[34px] font-bold leading-[1.2] text-ink">{t('empty')}</h2>
              <p className="text-[16px] text-body">{t('emptyDescription')}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild variant="primary">
                <Link href={primaryHref}>{primaryLabel}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-6 text-[18px] font-semibold text-ink">{t('emptyCategoriesTitle')}</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {MINERAL_IDS.map((mineral) => (
            <Link
              key={mineral}
              href={`/marketplace?mineral=${mineral}`}
              className={cn(
                'group overflow-hidden rounded-card border border-border bg-bg',
                'motion-safe:transition-[box-shadow,transform] motion-safe:duration-150',
                'hover:card-shadow-hover hover:-translate-y-0.5',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
              )}
            >
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={MINERAL_TILE_IMAGES[mineral]}
                  alt={t('emptyCategoryImageAlt', { mineral: tMinerals(mineral) })}
                  fill
                  className="object-cover motion-safe:transition-transform motion-safe:duration-150 group-hover:scale-[1.02]"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                />
              </div>
              <div className="border-t border-border px-3 py-3">
                <p className="text-[15px] font-semibold text-ink">{tMinerals(mineral)}</p>
                <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-brand-blue">
                  {t('emptyCategoryTag')}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
