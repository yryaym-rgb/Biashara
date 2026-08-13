import { expect, test } from '@playwright/test';
import { ensureAuditInitScript, auditOpenMobileDrawer, MOBILE_DRAWER_VIEWPORTS } from './helpers/responsive-audit';

const MARKETING_DRAWER_ROUTES = ['/', '/marketplace', '/navbar-fixture?auth=guest'] as const;

test.describe('mobile drawer open-state audit', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuditInitScript(page);
  });

  for (const viewport of MOBILE_DRAWER_VIEWPORTS) {
    for (const route of MARKETING_DRAWER_ROUTES) {
      test(`marketing drawer @ ${viewport.label} on ${route}`, async ({ page }) => {
        test.skip(route.includes('navbar-fixture') && !process.env.ALLOW_NAVBAR_FIXTURE, 'fixture disabled');

        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(route, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(800);

        const { issues, drawerResult } = await auditOpenMobileDrawer(page, {
          path: route,
          viewport: viewport.label,
        });

        expect(drawerResult.opened, drawerResult.reason).toBe(true);

        const critical = issues.filter((issue) => issue.severity === 'critical');
        const high = issues.filter((issue) => issue.severity === 'high');
        expect(
          critical,
          `Critical drawer issues: ${critical.map((i) => i.description).join('; ')}`,
        ).toHaveLength(0);
        expect(
          high,
          `High drawer issues: ${high.map((i) => i.description).join('; ')}`,
        ).toHaveLength(0);
      });
    }
  }
});
