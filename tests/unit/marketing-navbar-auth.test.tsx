import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { Navbar } from '@/components/layout/navbar';

vi.mock('next/image', () => ({
  default: (props: { alt: string }) => <img alt={props.alt} />,
}));

vi.mock('next-intl', () => ({
  useTranslations: (namespace: string) => (key: string) => {
    const navLabels: Record<string, string> = {
      appName: 'BIASHARA',
      home: 'Accueil',
      marketplace: 'Marketplace',
      prices: 'Prix',
      solutions: 'Solutions',
      resources: 'Ressources',
      about: 'À propos',
      getStarted: 'Commencer',
      mainNavigation: 'Navigation principale',
      language: 'Langue',
      openMenu: 'Ouvrir le menu',
      closeMenu: 'Fermer le menu',
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
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  usePathname: () => '/',
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/actions/auth', () => ({
  logoutAction: vi.fn(),
}));

describe('Navbar auth state', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('shows Commencer when logged out', () => {
    render(<Navbar isAuthenticated={false} />);

    expect(screen.getByRole('link', { name: 'Commencer' })).toHaveAttribute('href', '/register');
    expect(screen.queryByLabelText('Menu utilisateur')).not.toBeInTheDocument();
  });

  it('shows avatar menu with company initials when logged in', () => {
    render(
      <Navbar
        isAuthenticated
        companyName="ABC Mining"
        email="user@example.com"
      />,
    );

    expect(screen.queryByRole('link', { name: 'Commencer' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Menu utilisateur')).toHaveTextContent('AM');
  });

  it('falls back to email initial when company name is missing', () => {
    render(
      <Navbar
        isAuthenticated
        companyName={null}
        email="user@example.com"
      />,
    );

    expect(screen.getByLabelText('Menu utilisateur')).toHaveTextContent('U');
  });
});
