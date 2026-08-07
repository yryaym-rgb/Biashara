import { cn } from '@/lib/utils/cn';

export interface KitengeStripProps {
  className?: string;
}

export function KitengeStrip({ className }: KitengeStripProps) {
  return (
    <div
      className={cn('h-[90px] w-full overflow-hidden', className)}
      aria-hidden="true"
    >
      <svg
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern
            id="kitenge-pattern"
            x="0"
            y="0"
            width="48"
            height="48"
            patternUnits="userSpaceOnUse"
          >
            <rect width="48" height="48" fill="var(--bg-tint)" />
            <path
              d="M24 4 L44 24 L24 44 L4 24 Z"
              fill="none"
              stroke="var(--brand-blue)"
              strokeWidth="1"
              opacity="0.25"
            />
            <path
              d="M24 12 L36 24 L24 36 L12 24 Z"
              fill="var(--brand-gold)"
              opacity="0.2"
            />
            <path d="M0 0 L12 12 L0 24 Z" fill="var(--brand-blue-dark)" opacity="0.08" />
            <path d="M48 24 L36 36 L48 48 Z" fill="var(--brand-gold)" opacity="0.15" />
            <path d="M24 0 L36 12 L24 24 L12 12 Z" fill="var(--bg)" opacity="0.6" />
            <circle cx="24" cy="24" r="2" fill="var(--brand-gold)" opacity="0.35" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#kitenge-pattern)" />
      </svg>
    </div>
  );
}
