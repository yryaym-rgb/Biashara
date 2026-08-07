import * as React from 'react';
import Image from 'next/image';
import { Gem } from 'lucide-react';
import type { MineralId } from '@/lib/constants/minerals';
import { MINERAL_DOT_CLASS } from '@/lib/prices/mineral-dots';
import { getListingPhotoPublicUrl } from '@/lib/marketplace/photos';
import { cn } from '@/lib/utils/cn';

export interface ListingThumbProps {
  mineral: MineralId;
  storagePath: string | null;
  alt: string;
  size?: 'sm' | 'md';
  className?: string;
}

const sizeClasses = {
  sm: 'h-[72px] w-[72px]',
  md: 'h-40 w-full max-w-md',
};

export function ListingThumb({
  mineral,
  storagePath,
  alt,
  size = 'sm',
  className,
}: ListingThumbProps) {
  const dimension = size === 'sm' ? 72 : 320;

  if (storagePath) {
    return (
      <div
        className={cn(
          'relative shrink-0 overflow-hidden rounded-button bg-bg-tint',
          sizeClasses[size],
          className,
        )}
      >
        <Image
          src={getListingPhotoPublicUrl(storagePath)}
          alt={alt}
          width={dimension}
          height={dimension}
          className={cn('object-cover', size === 'sm' ? 'h-[72px] w-[72px]' : 'h-full w-full')}
          sizes={size === 'sm' ? '72px' : '100vw'}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-button bg-bg-tint',
        sizeClasses[size],
        className,
      )}
      aria-hidden={alt ? undefined : true}
    >
      <span
        className={cn(
          'flex h-11 w-11 items-center justify-center rounded-button',
          MINERAL_DOT_CLASS[mineral],
        )}
      >
        <Gem className="h-5 w-5 text-brand-blue" strokeWidth={1.75} aria-hidden="true" />
      </span>
    </div>
  );
}
