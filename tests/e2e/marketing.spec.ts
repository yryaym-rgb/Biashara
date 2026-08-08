import { test } from '@playwright/test';
import { visitAndAssertClean } from './helpers/console-monitor';

test.describe('marketing smoke', () => {
  test('home', async ({ page }) => {
    await visitAndAssertClean(page, '/', 'Commercez avec audace.');
  });

  test('marketplace', async ({ page }) => {
    await visitAndAssertClean(page, '/marketplace', 'Place de marché');
  });

  test('prices', async ({ page }) => {
    await visitAndAssertClean(page, '/prices', 'Cotations des matières premières');
  });

  test('solutions', async ({ page }) => {
    await visitAndAssertClean(page, '/solutions', 'Une plateforme pensée pour chaque acteur du commerce minier');
  });

  test('resources', async ({ page }) => {
    await visitAndAssertClean(page, '/resources', 'Comprendre le commerce minier en RDC');
  });

  test('about', async ({ page }) => {
    await visitAndAssertClean(page, '/about', 'À propos de BIASHARA');
  });
});
