import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import { existsSync } from 'fs';
import path from 'path';

const AUTH_IMAGE_PATH = path.join(process.cwd(), 'public/images/auth-mining.jpg');

export interface AuthMiningPanelProps {
  imageAlt: string;
  placeholderLabel: string;
}

export function AuthMiningPanel({ imageAlt, placeholderLabel }: AuthMiningPanelProps) {
  const hasImage = existsSync(AUTH_IMAGE_PATH);

  return (
    <div className="relative hidden h-full min-h-screen w-full lg:block">
      {hasImage ? (
        <Image
          src="/images/auth-mining.jpg"
          alt={imageAlt}
          fill
          className="object-cover object-center"
          sizes="50vw"
          priority
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
