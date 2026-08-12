import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
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
      drcMarketActive: 'MARCHÉ ACTIF',
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

describe('Navbar polish', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
  });

  afterEach(() => {
    cleanup();
  });

  it('keeps active nav text ink-colored, not gold', () => {
    render(<Navbar isAuthenticated={false} />);

    const homeLink = screen.getByRole('link', { name: 'Accueil' });
    expect(homeLink).toHaveClass('text-ink');
    expect(homeLink).not.toHaveClass('text-brand-gold');
    expect(homeLink).not.toHaveClass('text-brand-blue');
  });

  it('renders RDC market badge with market-live tint', () => {
    render(<Navbar isAuthenticated={false} />);

    const badge = screen.getByText('MARCHÉ ACTIF');
    expect(badge).toHaveClass('text-ink');
    expect(badge.parentElement?.className).toMatch(/market-live/);
    expect(badge.parentElement?.className).toMatch(/cursor-default/);
  });

  it('applies scrolled styling when page is not at top', () => {
    const { container } = render(<Navbar isAuthenticated={false} />);
    const header = container.querySelector('header');

    expect(header?.className).not.toMatch(/shadow-\[0_2px_12px/);

    Object.defineProperty(window, 'scrollY', { value: 120, writable: true });
    fireEvent.scroll(window);

    expect(header?.className).toMatch(/shadow-\[0_2px_12px/);
  });

  it('wraps authenticated account control in a bordered container', () => {
    render(
      <Navbar
        isAuthenticated
        companyName="ABC Mining"
        email="user@example.com"
      />,
    );

    const avatarButton = screen.getByLabelText('Menu utilisateur');
    const accountContainer = avatarButton.parentElement?.parentElement;
    expect(accountContainer?.className).toMatch(/border/);
  });

  it('opens account dropdown with single-line menu items inside navbar', () => {
    render(
      <Navbar
        isAuthenticated
        companyName="ABC Mining"
        email="user@example.com"
      />,
    );

    fireEvent.click(screen.getByLabelText('Menu utilisateur'));

    const menu = screen.getByRole('menu');
    expect(menu).toHaveClass('min-w-[200px]');
    expect(menu.className).toMatch(/absolute/);

    const dashboardItem = screen.getByRole('menuitem', { name: 'Tableau de bord' });
    expect(dashboardItem).toHaveClass('whitespace-nowrap');
    expect(dashboardItem.className).not.toMatch(/\bw-8\b/);
  });
});
