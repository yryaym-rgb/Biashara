import { expect, test } from '@playwright/test';
import { visitAndAssertClean } from '../../helpers/console-monitor';
import {
  openAvatarMenu,
  openCommandPalette,
  openNotificationBell,
  visitSettingsTab,
  withPageMonitor,
} from '../../helpers/interactions';

test.describe('platform shared interactions', () => {
  test('dashboard command palette and menus', async ({ page }) => {
    await visitAndAssertClean(page, '/dashboard', 'Tableau de bord');

    await withPageMonitor(page, async () => {
      await openCommandPalette(page);
      await page.getByPlaceholder('Rechercher annonces, offres, commandes, conversations…').fill('cobalt');
      await page.waitForTimeout(400);
      await page.getByRole('button', { name: 'Fermer la recherche' }).click();

      await openNotificationBell(page);
      await page.keyboard.press('Escape');

      await openAvatarMenu(page);
      await page.getByRole('menuitem', { name: 'Profil' }).click();
      await page.getByRole('heading', { name: 'Paramètres' }).waitFor({ state: 'visible' });
    });
  });

  test('dashboard export button triggers download', async ({ page }) => {
    await visitAndAssertClean(page, '/dashboard', 'Tableau de bord');

    await withPageMonitor(page, async () => {
      const downloadPromise = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Exporter mes transactions' }).click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('biashara-transactions');
    });
  });

  test('marketplace search and filters', async ({ page }) => {
    await visitAndAssertClean(page, '/marketplace', 'Place de marché');

    await withPageMonitor(page, async () => {
      await page.getByLabel('Rechercher un minerai ou une annonce…').fill('cuivre');
      await page.keyboard.press('Enter');
      await page.waitForURL(/q=cuivre/);

      await page.getByRole('tab', { name: 'Cobalt' }).click();
      await page.waitForURL(/mineral=cobalt/);

      await page.getByRole('button', { name: 'Filtres' }).click();
      await page.getByRole('dialog', { name: 'Filtres' }).waitFor();
      await page.getByLabel('Province d\'origine').selectOption({ index: 1 });
      await page.getByRole('button', { name: 'Appliquer les filtres' }).click();
      await page.waitForURL(/province=/);

      await page.getByRole('button', { name: 'Filtres' }).click();
      await page.getByRole('button', { name: 'Effacer les filtres' }).click();
    });
  });

  test('offers tabs switch', async ({ page }) => {
    await visitAndAssertClean(page, '/offers', 'Mes offres');

    await withPageMonitor(page, async () => {
      await page.getByRole('tab', { name: 'Reçues' }).click();
      await expect(page.getByRole('tab', { name: 'Reçues' })).toHaveAttribute('aria-selected', 'true');
      await page.getByRole('tab', { name: 'Envoyées' }).click();
      await expect(page.getByRole('tab', { name: 'Envoyées' })).toHaveAttribute('aria-selected', 'true');
    });
  });

  test('orders page loads and shows list or empty state', async ({ page }) => {
    await visitAndAssertClean(page, '/orders', 'Mes commandes');
  });

  test('messages inbox loads', async ({ page }) => {
    await visitAndAssertClean(page, '/messages', 'Messagerie');
  });

  test('notifications page mark-all-read button', async ({ page }) => {
    await visitAndAssertClean(page, '/notifications', 'Notifications');

    await withPageMonitor(page, async () => {
      const markAll = page.getByRole('button', { name: 'Tout marquer comme lu' });
      if (await markAll.isVisible()) {
        await markAll.click();
      }
    });
  });

  test('documents page loads', async ({ page }) => {
    await visitAndAssertClean(page, '/documents', 'Documents');
  });

  test('settings all tabs switch without console errors', async ({ page }) => {
    await visitAndAssertClean(page, '/settings', 'Paramètres');

    const tabs = ['Profil', 'Sécurité', 'Vérification KYC'] as const;
    for (const tab of tabs) {
      await withPageMonitor(page, async () => {
        await page.getByRole('tab', { name: tab }).click();
        await expect(page.getByRole('tab', { name: tab })).toHaveAttribute('aria-selected', 'true');
      });
    }

    const listingsTab = page.getByRole('tab', { name: 'Mes annonces' });
    if (await listingsTab.isVisible()) {
      await withPageMonitor(page, async () => {
        await listingsTab.click();
        await expect(listingsTab).toHaveAttribute('aria-selected', 'true');
      });
    }
  });

  test('settings profile form saves', async ({ page }) => {
    await visitSettingsTab(page, 'profile');

    await withPageMonitor(page, async () => {
      const companyField = page.getByLabel('Nom de l\'entreprise');
      const current = await companyField.inputValue();
      await companyField.fill(current || 'E2E Test Company');
      await page.getByRole('button', { name: 'Enregistrer les modifications' }).click();
      await page.getByRole('status').waitFor({ state: 'visible' });
    });
  });

  test('settings security tab password form is interactive', async ({ page }) => {
    await visitSettingsTab(page, 'security');

    await withPageMonitor(page, async () => {
      await page.getByLabel('Nouveau mot de passe').fill('NewPassword123!');
      await page.getByLabel('Confirmer le mot de passe').fill('NewPassword123!');
      // Do not submit — would change password for the fixture account
      await page.getByLabel('Nouveau mot de passe').clear();
      await page.getByLabel('Confirmer le mot de passe').clear();
    });
  });

  test('settings kyc tab displays status', async ({ page }) => {
    await visitSettingsTab(page, 'kyc');

    await withPageMonitor(page, async () => {
      await expect(page.getByText(/KYC|vérification/i).first()).toBeVisible();
    });
  });
});
