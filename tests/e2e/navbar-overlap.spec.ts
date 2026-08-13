import { expect, test, type Locator, type Page } from '@playwright/test';

const FIXTURE_PATH = '/navbar-fixture';

const VIEWPORTS = [
  { width: 1440, height: 900, label: '1440px' },
  { width: 1366, height: 900, label: '1366px' },
  { width: 1024, height: 900, label: '1024px' },
] as const;

async function assertNoHorizontalOverlap(left: Locator, right: Locator, label: string) {
  const leftBox = await left.boundingBox();
  const rightBox = await right.boundingBox();

  expect(leftBox, `${label}: left element missing layout box`).not.toBeNull();
  expect(rightBox, `${label}: right element missing layout box`).not.toBeNull();

  if (!leftBox || !rightBox) {
    return;
  }

  expect(
    leftBox.x + leftBox.width,
    `${label}: expected no overlap between nav and actions`,
  ).toBeLessThanOrEqual(rightBox.x + 0.5);
}

async function assertMinimumGap(
  left: Locator,
  right: Locator,
  minGapPx: number,
  label: string,
) {
  const leftBox = await left.boundingBox();
  const rightBox = await right.boundingBox();

  expect(leftBox, `${label}: left element missing layout box`).not.toBeNull();
  expect(rightBox, `${label}: right element missing layout box`).not.toBeNull();

  if (!leftBox || !rightBox) {
    return;
  }

  const gap = rightBox.x - (leftBox.x + leftBox.width);
  expect(gap, `${label}: expected at least ${minGapPx}px between logo and Accueil`).toBeGreaterThanOrEqual(
    minGapPx - 0.5,
  );
}

async function assertNavbarLayout(
  page: Page,
  viewport: { width: number; label: string },
  auth: 'guest' | 'member',
) {
  await page.goto(`${FIXTURE_PATH}?auth=${auth}`);
  await page.locator(`header[data-nav-auth="${auth}"]`).waitFor();

  const resources = page.getByRole('link', { name: 'Ressources' }).first();
  if (auth === 'guest' && viewport.width < 1536) {
    await expect(resources).toBeHidden();
  } else {
    await expect(resources).toBeVisible();
  }

  const lastNavLink = page.locator('header nav a').and(page.locator(':visible')).last();
  await expect(lastNavLink).toBeVisible();

  const actions = page.locator('[data-navbar-actions]');
  await expect(actions).toBeVisible();

  const homeLink = page.locator('header nav').getByRole('link', { name: 'Accueil' });
  const logoLink = page.locator('header [data-navbar-logo]');
  await expect(homeLink).toBeVisible();
  await expect(logoLink).toBeVisible();

  if (auth === 'guest') {
    await assertMinimumGap(
      logoLink,
      homeLink,
      12,
      `${viewport.label} logged-out logo→Accueil`,
    );
  }

  await assertNoHorizontalOverlap(
    lastNavLink,
    actions,
    `${viewport.label} logged-${auth === 'guest' ? 'out' : 'in'}`,
  );

  if (auth === 'guest') {
    await expect(page.getByRole('link', { name: 'Se connecter' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Accéder au marché →' })).toBeVisible();
  } else {
    await expect(page.getByLabel('Menu utilisateur')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Accéder au marché →' })).toHaveCount(0);
  }
}

test.describe('navbar overlap guard — logged out', () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(testInfo.project.name !== 'guest', 'guest project only');
  });

  for (const viewport of VIEWPORTS) {
    test(`no overlap at ${viewport.label}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await assertNavbarLayout(page, viewport, 'guest');
    });
  }
});

test.describe('navbar overlap guard — logged in', () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(testInfo.project.name !== 'guest', 'guest project only');
  });

  for (const viewport of VIEWPORTS) {
    test(`no overlap at ${viewport.label}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await assertNavbarLayout(page, viewport, 'member');
    });
  }
});
