import { expect, test } from '@playwright/test';
import { attachConsoleMonitor } from './helpers/console-monitor';

test('console monitor fails on synthetic console.error', async ({ page }) => {
  const monitor = attachConsoleMonitor(page);

  try {
    await page.goto('/login');
    await page.evaluate(() => {
      console.error('E2E synthetic console error');
    });

    let failed = false;
    try {
      monitor.assertClean();
    } catch {
      failed = true;
    }

    expect(failed).toBe(true);
  } finally {
    monitor.dispose();
  }
});

test('console monitor passes on a clean page visit', async ({ page }) => {
  const monitor = attachConsoleMonitor(page);

  try {
    await page.goto('/login');
    await page.getByRole('heading', { name: 'Content de vous revoir !' }).waitFor();
    monitor.assertClean();
  } finally {
    monitor.dispose();
  }
});
