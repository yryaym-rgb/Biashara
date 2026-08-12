import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { UserAvatarMenu } from '@/components/platform/user-avatar-menu';

const pushMock = vi.fn();
const onLogoutRequestMock = vi.fn();

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const labels: Record<string, string> = {
      profile: 'Profil',
      dashboard: 'Tableau de bord',
      logout: 'Déconnexion',
      userMenu: 'Menu utilisateur',
    };
    return labels[key] ?? key;
  },
}));

vi.mock('@/lib/i18n/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

describe('UserAvatarMenu', () => {
  beforeEach(() => {
    pushMock.mockReset();
    onLogoutRequestMock.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it('shows initials from company name on the trigger', () => {
    render(
      <UserAvatarMenu
        companyName="ABC Mining"
        email="user@example.com"
        onLogoutRequest={onLogoutRequestMock}
      />,
    );

    expect(screen.getByLabelText('Menu utilisateur')).toHaveTextContent('AM');
  });

  it('opens menu with three French items and routes profile and dashboard', () => {
    render(
      <UserAvatarMenu
        companyName="ABC Mining"
        email="user@example.com"
        onLogoutRequest={onLogoutRequestMock}
      />,
    );

    fireEvent.click(screen.getByLabelText('Menu utilisateur'));

    const menu = screen.getByRole('menu');
    expect(menu).toHaveClass('min-w-[200px]');

    expect(screen.getByRole('menuitem', { name: 'Profil' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Tableau de bord' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Déconnexion' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('menuitem', { name: 'Profil' }));
    expect(pushMock).toHaveBeenCalledWith('/settings');

    fireEvent.click(screen.getByLabelText('Menu utilisateur'));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Tableau de bord' }));
    expect(pushMock).toHaveBeenCalledWith('/dashboard');
  });

  it('opens logout confirmation via menu item', () => {
    render(
      <UserAvatarMenu
        companyName="ABC Mining"
        email="user@example.com"
        onLogoutRequest={onLogoutRequestMock}
      />,
    );

    fireEvent.click(screen.getByLabelText('Menu utilisateur'));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Déconnexion' }));
    expect(onLogoutRequestMock).toHaveBeenCalledTimes(1);
  });

  it('closes menu on Escape key', () => {
    render(
      <UserAvatarMenu
        companyName="ABC Mining"
        email="user@example.com"
        onLogoutRequest={onLogoutRequestMock}
      />,
    );

    fireEvent.click(screen.getByLabelText('Menu utilisateur'));
    expect(screen.getByRole('menuitem', { name: 'Profil' })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menuitem', { name: 'Profil' })).not.toBeInTheDocument();
  });
});
