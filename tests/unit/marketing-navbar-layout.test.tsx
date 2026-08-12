import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { Navbar } from '@/components/layout/navbar';

vi.mock('next/image', () => ({
  default: (props: { alt: string }) => <img alt={props.alt} />,
}));

vi.mock('@/components/marketing/landing-price-ticker', () => ({
  useTickerScrollVisibility: () => ({
    tickerVisible: true,
    prefersReducedMotion: false,
  }),
}));

vi.mock('next-intl', () => ({
  useTranslations: (namespace: string) => (key: string) => {
    const navLabels: Record<string, string> = {
      appName: 'BIASHARA',
      home: 'Accueil',
      marketplaceNav: 'Marché',
      prices: 'Prix',
      calendar: 'Calendrier',
      solutions: 'Solutions',
      resources: 'Ressources',
      about: 'À propos',
      accessMarket: 'Accéder au marché →',
      login: 'Se connecter',
      mainNavigation: 'Navigation principale',
      language: 'Langue',
      openMenu: 'Ouvrir le menu',
      closeMenu: 'Fermer le menu',
      drcMarketActive: 'RDC · Marché actif',
    };
    const shellLabels: Record<string, string> = {
      userMenu: 'Menu utilisateur',
      profile: 'Profil',
      dashboard: 'Tableau de bord',
      logout: 'Déconnexion',
    };
    const labels = namespace === 'platform.shell' ? shellLabels : navLabels;
    return labels[key] ?? key;
  },
  useLocale: () => 'fr',
}));

vi.mock('@/lib/i18n/navigation', () => ({
  Link: ({
    children,
    href,
    className,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
    [key: string]: unknown;
  }) => (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  ),
  usePathname: () => '/',
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/actions/auth', () => ({
  logoutAction: vi.fn(),
}));

describe('Navbar desktop layout by auth state', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('uses a bounded three-column grid so nav cannot bleed into the actions cluster', () => {
    const { container } = render(<Navbar isAuthenticated={false} />);
    const grid = container.querySelector('header > div');

    expect(grid?.className).toMatch(/grid-cols-\[auto_minmax\(0,1fr\)_auto\]/);
    expect(container.querySelector('header nav')?.className).toMatch(/min-w-0/);
    expect(container.querySelector('header nav')?.className).toMatch(/overflow-hidden/);
    expect(container.querySelector('[data-navbar-actions]')).toBeTruthy();
  });

  it('condenses logged-out desktop nav and defers the DRC badge until xl', () => {
    render(<Navbar isAuthenticated={false} />);

    expect(screen.getByRole('link', { name: 'Calendrier' }).className).toMatch(/\bhidden\b/);
    expect(screen.getByRole('link', { name: 'À propos' }).className).toMatch(/\bhidden\b/);
    expect(screen.getByRole('link', { name: 'Ressources' }).className).not.toMatch(/\bhidden\b/);

    const badge = screen.getByLabelText('RDC · Marché actif');
    expect(badge.className).toMatch(/xl:inline-flex/);
    expect(badge.className).not.toMatch(/\blg:inline-flex\b/);

    const cta = screen.getByRole('link', { name: 'Accéder au marché →' });
    expect(cta.className).toMatch(/lg:h-9/);
    expect(cta.className).toMatch(/xl:h-11/);
  });

  it('keeps full desktop nav and earlier DRC badge visibility when logged in', () => {
    render(
      <Navbar
        isAuthenticated
        companyName="ABC Mining"
        email="user@example.com"
      />,
    );

    expect(screen.getByRole('link', { name: 'Calendrier' }).className).toMatch(/hidden xl:inline-flex/);
    expect(screen.getByRole('link', { name: 'À propos' }).className).not.toMatch(/\bhidden\b/);

    const badge = screen.getByLabelText('RDC · Marché actif');
    expect(badge.className).toMatch(/lg:inline-flex/);

    expect(screen.queryByRole('link', { name: 'Accéder au marché →' })).not.toBeInTheDocument();
  });

  it('tags the header with the active auth state for layout tests', () => {
    const loggedOut = render(<Navbar isAuthenticated={false} />);
    expect(loggedOut.container.querySelector('header')?.getAttribute('data-nav-auth')).toBe('guest');

    cleanup();

    const loggedIn = render(
      <Navbar
        isAuthenticated
        companyName="ABC Mining"
        email="user@example.com"
      />,
    );
    expect(loggedIn.container.querySelector('header')?.getAttribute('data-nav-auth')).toBe('member');
  });
});
