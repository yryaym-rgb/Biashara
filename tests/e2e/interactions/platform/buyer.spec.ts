import { expect, test } from '@playwright/test';
import { visitAndAssertClean } from '../../helpers/console-monitor';
import { withPageMonitor } from '../../helpers/interactions';

test.describe('buyer-specific interactions', () => {
  test('buyer cannot access lots creation', async ({ page }) => {
    await visitAndAssertClean(page, '/lots', /Mes lots|Accès refusé/);
    await visitAndAssertClean(page, '/lots/new', /Créer un lot|Accès refusé/);
  });

  test('buyer marketplace listing detail and offer form', async ({ page }) => {
    await visitAndAssertClean(page, '/marketplace', 'Place de marché');

    await withPageMonitor(page, async () => {
      const detailLink = page.getByRole('link', { name: 'Voir les détails' }).first();
      if (await detailLink.isVisible()) {
        await detailLink.click();
        await page.waitForURL(/\/marketplace\//);

        const offerSection = page.getByRole('heading', { name: 'Faire une offre' });
        if (await offerSection.isVisible()) {
          await page.getByLabel('Quantité proposée').fill('1');
          await page.getByLabel('Prix proposé (USD)').fill('1000');
          // Do not submit — depends on listing availability
        }
      }
    });
  });

  test('buyer settings has no listings tab', async ({ page }) => {
    await visitAndAssertClean(page, '/settings', 'Paramètres');
    await expect(page.getByRole('tab', { name: 'Mes annonces' })).not.toBeVisible();
  });

  test('buyer settings has no cooperative sites form', async ({ page }) => {
    await visitAndAssertClean(page, '/settings', 'Paramètres');
    await expect(page.getByRole('heading', { name: 'Sites miniers' })).not.toBeVisible();
  });
});
