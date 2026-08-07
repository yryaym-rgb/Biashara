import Image from 'next/image';
import { Link } from '@/lib/i18n/navigation';
import logo from '@/design/reference-logo.jpeg';

export function AuthLogo({ homeLabel }: { homeLabel: string }) {
  return (
    <Link
      href="/"
      className="mb-8 inline-flex items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      aria-label={homeLabel}
    >
      <Image
        src={logo}
        alt=""
        width={40}
        height={40}
        className="h-10 w-10 rounded-[10px] object-cover"
        priority
      />
      <span className="text-[14px] font-bold tracking-[0.08em] text-ink">BIASHARA</span>
    </Link>
  );
}
