'use client';
import { useState } from 'react';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';

export interface AuthMiningPanelProps {
  imageAlt: string;
  placeholderLabel: string;
}

export function AuthMiningPanel({ imageAlt, placeholderLabel }: AuthMiningPanelProps) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="relative hidden h-full min-h-screen w-full lg:block">
      {!imageFailed ? (
        <Image
          src="/images/auth-mining.jpg"
          alt={imageAlt}
          fill
          className="object-cover object-center"
          sizes="50vw"
          priority
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div
          className="flex h-full w-full flex-col items-center justify-center gap-3 bg-bg-tint"
          role="img"
          aria-label={placeholderLabel}
        >
          <ImageIcon className="h-12 w-12 text-muted" strokeWidth={1.75} aria-hidden="true" />
          <p className="text-[13px] text-muted">{placeholderLabel}</p>
        </div>
      )}
    </div>
  );
}
