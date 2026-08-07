'use client';

import * as React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Gem } from 'lucide-react';
import type { MineralId } from '@/lib/constants/minerals';
import { MINERAL_DOT_CLASS } from '@/lib/prices/mineral-dots';
import { getListingPhotoPublicUrl } from '@/lib/marketplace/photos';
import type { ListingPhotoRow } from '@/lib/marketplace/queries';
import { cn } from '@/lib/utils/cn';

export interface ListingGalleryProps {
  photos: ListingPhotoRow[];
  mineral: MineralId;
  title: string;
}

export function ListingGallery({ photos, mineral, title }: ListingGalleryProps) {
  const t = useTranslations('platform.marketplace.detail');
  const sorted = [...photos].sort((a, b) => a.sort_order - b.sort_order);
  const [activeIndex, setActiveIndex] = React.useState(0);

  if (sorted.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-card border border-border bg-bg-tint py-12 text-center"
        role="img"
        aria-label={t('noPhotos')}
      >
        <span
          className={cn(
            'mb-4 flex h-11 w-11 items-center justify-center rounded-button',
            MINERAL_DOT_CLASS[mineral],
          )}
        >
          <Gem className="h-5 w-5 text-brand-blue" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <p className="text-[15px] font-semibold text-ink">{t('noPhotos')}</p>
      </div>
    );
  }

  const activePhoto = sorted[activeIndex] ?? sorted[0];
  if (!activePhoto) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-card border border-border bg-bg-tint">
        <Image
          src={getListingPhotoPublicUrl(activePhoto.storage_path)}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

      {sorted.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {sorted.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                'relative h-16 w-16 overflow-hidden rounded-button border',
                index === activeIndex ? 'border-brand-blue' : 'border-border',
              )}
              aria-label={`${title} — photo ${index + 1}`}
              aria-current={index === activeIndex ? 'true' : undefined}
            >
              <Image
                src={getListingPhotoPublicUrl(photo.storage_path)}
                alt=""
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
