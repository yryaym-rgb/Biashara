import { test } from '@playwright/test';
import { visitAndAssertClean } from './helpers/console-monitor';

test.describe('auth smoke', () => {
  test('login', async ({ page }) => {
    await visitAndAssertClean(page, '/login', 'Content de vous revoir !');
  });

  test('register', async ({ page }) => {
    await visitAndAssertClean(page, '/register', 'Créer un compte');
  });

  test('forgot password', async ({ page }) => {
    await visitAndAssertClean(page, '/forgot-password', 'Mot de passe oublié');
  });
});
