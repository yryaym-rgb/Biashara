import { expect, test } from '@playwright/test';
import { visitAndAssertClean } from '../../helpers/console-monitor';
import { visitSettingsTab, withPageMonitor } from '../../helpers/interactions';

test.describe('cooperative-approved interactions', () => {
  test('cooperative can access lots pages', async ({ page }) => {
    await visitAndAssertClean(page, '/lots', 'Mes lots');
    await visitAndAssertClean(page, '/lots/new', 'Créer un lot');
  });

  test('cooperative sites form is visible and interactive', async ({ page }) => {
    await visitSettingsTab(page, 'profile');

    await withPageMonitor(page, async () => {
      await expect(page.getByRole('heading', { name: 'Sites miniers' })).toBeVisible();

      const siteName = page.getByLabel('Nom du site').first();
      await siteName.fill('Site Test Kolwezi E2E');
      await page.getByLabel('Référence ZEA').first().fill('ZEA-E2E-001');
      await page.getByLabel('Province').first().selectOption('Lualaba');
      await page.getByRole('button', { name: 'Enregistrer les sites' }).click();
      await page.getByRole('status').waitFor({ state: 'visible' });
    });
  });

  test('cooperative lot creation form is interactive', async ({ page }) => {
    await visitAndAssertClean(page, '/lots/new', 'Créer un lot');

    await withPageMonitor(page, async () => {
      await page.getByLabel('Minerai').selectOption('cobalt');
      await page.getByLabel('Poids initial (kg)').fill('500');
      const siteSelect = page.getByLabel('Site / ZEA');
      const optionCount = await siteSelect.locator('option').count();
      if (optionCount > 1) {
        await siteSelect.selectOption({ index: 1 });
        await page.getByLabel('Date d\'extraction').fill('2026-01-15');
        await page.getByLabel('Notes').fill('Lot de test e2e');
        await page.getByRole('button', { name: 'Créer le lot' }).click();
        await page.waitForURL(/\/lots\//);
      }
    });
  });

  test('cooperative settings listings tab is visible', async ({ page }) => {
    await visitSettingsTab(page, 'listings');
    await expect(page.getByRole('tab', { name: 'Mes annonces' })).toHaveAttribute('aria-selected', 'true');
  });
});
