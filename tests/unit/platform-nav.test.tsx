import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { PlatformNav } from '@/components/platform/platform-nav';
import type { PlatformNavSection } from '@/lib/platform/nav';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const labels: Record<string, string> = {
      'sections.supplyChain': 'Chaîne d\'approvisionnement',
      listings: 'Mes annonces',
      listingsSubtitle: 'Vos publications sur le marché',
      lots: 'Mes lots',
      lotsSubtitle: 'Votre inventaire traçable',
    };
    return labels[key] ?? key;
  },
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/lots',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/lib/i18n/navigation', () => ({
  Link: ({
    children,
    className,
    href,
    title,
  }: {
    children: React.ReactNode;
    className?: string;
    href: string;
    title?: string;
  }) => (
    <a href={href} className={className} title={title}>
      {children}
    </a>
  ),
}));

const sections: PlatformNavSection[] = [
  {
    key: 'supplyChain',
    items: [
      { key: 'listings', href: '/settings' },
      { key: 'lots', href: '/lots' },
    ],
  },
];

describe('PlatformNav', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows clarifying subtitles for listings and lots', () => {
    render(<PlatformNav sections={sections} />);

    expect(screen.getByText('Vos publications sur le marché')).toBeInTheDocument();
    expect(screen.getByText('Votre inventaire traçable')).toBeInTheDocument();
  });

  it('applies pale navy active background and gold border for current route', () => {
    render(<PlatformNav sections={sections} />);

    const lotsLink = screen.getByRole('link', { name: 'Mes lots Votre inventaire traçable' });
    expect(lotsLink.className).toContain('border-brand-gold');
    expect(lotsLink.className).toContain('bg-[color-mix(in_srgb,var(--brand-blue)_10%,transparent)]');
  });
});
