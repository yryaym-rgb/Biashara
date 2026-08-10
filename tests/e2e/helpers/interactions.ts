import { expect, type Page } from '@playwright/test';
import { attachPageMonitor } from './console-monitor';

export async function withPageMonitor<T>(
  page: Page,
  action: () => Promise<T>,
  options?: { waitMs?: number },
): Promise<T> {
  const monitor = attachPageMonitor(page);

  try {
    const result = await action();
    await page.waitForTimeout(options?.waitMs ?? 500);
    monitor.assertClean();
    return result;
  } finally {
    monitor.dispose();
  }
}

export async function clickTab(page: Page, name: string) {
  await page.getByRole('tab', { name }).click();
}

export async function openMobileNav(page: Page) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Ouvrir le menu' }).click();
  await expect(page.locator('#mobile-nav')).toBeVisible();
}

export async function closeMobileNav(page: Page) {
  await page.getByRole('button', { name: 'Fermer le menu' }).click();
  await expect(page.locator('#mobile-nav')).not.toBeVisible();
}

export async function switchLanguage(page: Page, locale: 'FR' | 'EN') {
  await page.getByRole('button', { name: /^(FR|EN)$/ }).first().click();
  await page.getByRole('link', { name: locale }).click();
}

export async function openCommandPalette(page: Page) {
  await page.getByRole('button', { name: 'Ouvrir la recherche' }).click();
  await expect(page.getByRole('dialog', { name: 'Recherche' })).toBeVisible();
}

export async function openAvatarMenu(page: Page) {
  await page.getByLabel('Menu utilisateur').click();
  await expect(page.getByRole('menuitem', { name: 'Profil' })).toBeVisible();
}

export async function openNotificationBell(page: Page) {
  await page.getByRole('button', { name: 'Notifications' }).click();
  await expect(page.getByRole('menu', { name: 'Notifications' })).toBeVisible();
}

export async function openMarketplaceFilters(page: Page) {
  await page.getByRole('button', { name: 'Filtres' }).click();
  await expect(page.getByRole('dialog', { name: 'Filtres' })).toBeVisible();
}

export async function visitSettingsTab(page: Page, tab: 'profile' | 'security' | 'kyc' | 'listings') {
  const path = tab === 'profile' ? '/settings' : `/settings?tab=${tab}`;
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Paramètres' }).waitFor({ state: 'visible' });

  const tabLabels: Record<typeof tab, string> = {
    profile: 'Profil',
    security: 'Sécurité',
    kyc: 'Vérification KYC',
    listings: 'Mes annonces',
  };

  await expect(page.getByRole('tab', { name: tabLabels[tab] })).toHaveAttribute('aria-selected', 'true');
}
