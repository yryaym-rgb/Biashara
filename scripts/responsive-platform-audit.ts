/**
 * Platform-wide responsive + interaction audit runner.
 *
 * Usage: npx tsx scripts/responsive-platform-audit.ts
 * Output: reports/responsive-platform-audit.md + reports/responsive-platform-audit.json
 */
import { chromium, type BrowserContext, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import {
  ADMIN_STATIC_ROUTES,
  AUTH_ROUTES,
  MARKETING_ROUTES,
  PLATFORM_DYNAMIC_ROUTES,
  PLATFORM_ROLES,
  PLATFORM_STATIC_ROUTES,
  routeAppliesToRole,
  type PlatformAuditRole,
} from '../tests/e2e/helpers/audit-routes';
import { RESPONSIVE_AUDIT_INIT_SCRIPT } from '../tests/e2e/helpers/responsive-audit.browser';
import {
  AUDIT_VIEWPORTS,
  auditPageLayout,
  discoverFirstLink,
  formatAuditReportMarkdown,
  tryGotoPage,
  type PageAuditResult,
} from '../tests/e2e/helpers/responsive-audit';
import { E2E_ACCOUNT_FIXTURES, E2E_ADMIN_FIXTURE } from '../tests/e2e/fixtures/accounts';
import { loginAdminThroughUi, loginThroughUi } from '../tests/e2e/helpers/auth';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';
const REPORT_DIR = path.join(process.cwd(), 'reports');
const AUTH_DIR = path.join(process.cwd(), 'tests/e2e/.auth');

function envPresent(name: string): boolean {
  return Boolean(process.env[name]);
}

function checkAuthAvailability(): {
  platform: boolean;
  admin: boolean;
  missing: string[];
} {
  const missing: string[] = [];
  for (const fixture of E2E_ACCOUNT_FIXTURES) {
    if (!envPresent(fixture.emailEnv)) missing.push(fixture.emailEnv);
    if (!envPresent(fixture.passwordEnv)) missing.push(fixture.passwordEnv);
  }
  if (!envPresent(E2E_ADMIN_FIXTURE.emailEnv)) missing.push(E2E_ADMIN_FIXTURE.emailEnv);
  if (!envPresent(E2E_ADMIN_FIXTURE.passwordEnv)) missing.push(E2E_ADMIN_FIXTURE.passwordEnv);
  if (!envPresent('ADMIN_GATE_SECRET')) missing.push('ADMIN_GATE_SECRET');
  if (!envPresent('ADMIN_PASSPHRASE')) missing.push('ADMIN_PASSPHRASE');

  const platformVars = E2E_ACCOUNT_FIXTURES.flatMap((f) => [f.emailEnv, f.passwordEnv]);
  const platform = platformVars.every(envPresent);
  const admin =
    envPresent(E2E_ADMIN_FIXTURE.emailEnv) &&
    envPresent(E2E_ADMIN_FIXTURE.passwordEnv) &&
    envPresent('ADMIN_GATE_SECRET') &&
    envPresent('ADMIN_PASSPHRASE');

  return { platform, admin, missing };
}

async function auditRouteAtViewport(
  page: Page,
  path: string,
  viewportLabel: string,
  role: PlatformAuditRole,
  results: PageAuditResult[],
): Promise<void> {
  const nav = await tryGotoPage(page, path);
  if (!nav.ok) {
    results.push({
      path,
      viewport: viewportLabel,
      role: role === 'guest' ? undefined : role,
      reached: false,
      skipReason: nav.reason,
      issues: [],
    });
    return;
  }

  const issues = await auditPageLayout(page, {
    path,
    viewport: viewportLabel,
    role: role === 'guest' ? undefined : role,
  });

  results.push({
    path,
    viewport: viewportLabel,
    role: role === 'guest' ? undefined : role,
    reached: true,
    issues,
  });
}

async function auditGuestRoutes(page: Page, results: PageAuditResult[]): Promise<void> {
  const guestStaticRoutes = [
    ...MARKETING_ROUTES,
    ...AUTH_ROUTES,
    ...PLATFORM_STATIC_ROUTES.filter((r) => r.guest),
  ];

  for (const viewport of AUDIT_VIEWPORTS) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });

    for (const route of guestStaticRoutes) {
      await auditRouteAtViewport(page, route.path, viewport.label, 'guest', results);
    }

    for (const route of PLATFORM_DYNAMIC_ROUTES.filter((r) => r.guest)) {
      const listNav = await tryGotoPage(page, route.listPath);
      if (!listNav.ok) {
        results.push({
          path: `${route.listPath} → ${route.label}`,
          viewport: viewport.label,
          reached: false,
          skipReason: `list page: ${listNav.reason}`,
          issues: [],
        });
        continue;
      }
      const detailPath = await discoverFirstLink(page, route.linkPattern);
      if (!detailPath) {
        results.push({
          path: `${route.listPath} → ${route.label}`,
          viewport: viewport.label,
          reached: false,
          skipReason: 'no matching link on list page (empty state)',
          issues: [],
        });
        continue;
      }
      await auditRouteAtViewport(page, detailPath, viewport.label, 'guest', results);
    }
  }
}

async function withAuditContext(
  browser: Awaited<ReturnType<typeof chromium.launch>>,
  options?: { storageState?: string },
): Promise<BrowserContext> {
  const context = await browser.newContext(
    options?.storageState ? { storageState: options.storageState } : undefined,
  );
  await context.addInitScript(RESPONSIVE_AUDIT_INIT_SCRIPT);
  return context;
}

async function createAuthenticatedContext(
  browser: Awaited<ReturnType<typeof chromium.launch>>,
  role: PlatformAuditRole,
): Promise<BrowserContext | null> {
  const storagePath =
    role === 'admin'
      ? path.join(AUTH_DIR, E2E_ADMIN_FIXTURE.storageFile)
      : path.join(AUTH_DIR, `${role}.json`);

  if (fs.existsSync(storagePath)) {
    return withAuditContext(browser, { storageState: storagePath });
  }

  const context = await withAuditContext(browser);
  const page = await context.newPage();

  try {
    if (role === 'admin') {
      await loginAdminThroughUi(page, {
        gateSecret: process.env.ADMIN_GATE_SECRET!,
        passphrase: process.env.ADMIN_PASSPHRASE!,
        email: process.env[E2E_ADMIN_FIXTURE.emailEnv]!,
        password: process.env[E2E_ADMIN_FIXTURE.passwordEnv]!,
      });
    } else {
      const fixture = E2E_ACCOUNT_FIXTURES.find((f) => f.role === role);
      if (!fixture) return null;
      await loginThroughUi(page, {
        email: process.env[fixture.emailEnv]!,
        password: process.env[fixture.passwordEnv]!,
      });
    }
    fs.mkdirSync(AUTH_DIR, { recursive: true });
    await context.storageState({ path: storagePath });
    return context;
  } catch {
    await context.close();
    return null;
  }
}

async function auditAuthenticatedRoutes(
  browser: Awaited<ReturnType<typeof chromium.launch>>,
  role: PlatformAuditRole,
  results: PageAuditResult[],
): Promise<boolean> {
  const context = await createAuthenticatedContext(browser, role);
  if (!context) return false;

  const page = await context.newPage();
  const staticRoutes = PLATFORM_STATIC_ROUTES.filter((r) => routeAppliesToRole(r, role));
  const dynamicRoutes = PLATFORM_DYNAMIC_ROUTES.filter((r) => routeAppliesToRole(r, role));

  for (const viewport of AUDIT_VIEWPORTS) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });

    for (const route of staticRoutes) {
      await auditRouteAtViewport(page, route.path, viewport.label, role, results);
    }

    for (const route of dynamicRoutes) {
      const listNav = await tryGotoPage(page, route.listPath);
      if (!listNav.ok) {
        results.push({
          path: `${route.listPath} → ${route.label}`,
          viewport: viewport.label,
          role,
          reached: false,
          skipReason: `list page: ${listNav.reason}`,
          issues: [],
        });
        continue;
      }
      const detailPath = await discoverFirstLink(page, route.linkPattern);
      if (!detailPath) {
        results.push({
          path: `${route.listPath} → ${route.label}`,
          viewport: viewport.label,
          role,
          reached: false,
          skipReason: 'no matching link on list page (empty state)',
          issues: [],
        });
        continue;
      }
      await auditRouteAtViewport(page, detailPath, viewport.label, role, results);
    }
  }

  await context.close();
  return true;
}

async function auditAdminRoutes(
  browser: Awaited<ReturnType<typeof chromium.launch>>,
  results: PageAuditResult[],
): Promise<boolean> {
  const gateSecret = process.env.ADMIN_GATE_SECRET;
  if (!gateSecret) return false;

  const context = await createAuthenticatedContext(browser, 'admin');
  if (!context) return false;

  const page = await context.newPage();
  const adminBase = `/${gateSecret}`;

  for (const viewport of AUDIT_VIEWPORTS) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });

    for (const route of ADMIN_STATIC_ROUTES) {
      const fullPath = route.path ? `${adminBase}${route.path}` : adminBase;
      await auditRouteAtViewport(page, fullPath, viewport.label, 'admin', results);
    }
  }

  await context.close();
  return true;
}

async function main() {
  const auth = checkAuthAvailability();
  const coverageNotes: string[] = [];

  if (!auth.platform) {
    coverageNotes.push(
      'Platform authenticated routes skipped: E2E credentials not configured (missing env vars). Guest-accessible routes still audited.',
    );
    if (auth.missing.length > 0) {
      coverageNotes.push(`Missing vars sample: ${auth.missing.slice(0, 6).join(', ')}…`);
    }
  }
  if (!auth.admin) {
    coverageNotes.push(
      'Admin routes skipped: ADMIN_GATE_SECRET, ADMIN_PASSPHRASE, or E2E admin credentials not configured.',
    );
  }
  coverageNotes.push(
    'Institution role not audited: no E2E fixture account exists (institution treated like buyer in code; add fixture to extend coverage).',
  );

  const browser = await chromium.launch();
  const results: PageAuditResult[] = [];

  const guestContext = await withAuditContext(browser);
  const guestPage = await guestContext.newPage();
  console.info('Auditing guest routes…');
  await auditGuestRoutes(guestPage, results);
  await guestContext.close();

  if (auth.platform) {
    for (const role of PLATFORM_ROLES) {
      console.info(`Auditing platform routes as ${role}…`);
      const ok = await auditAuthenticatedRoutes(browser, role, results);
      if (!ok) {
        coverageNotes.push(`Failed to authenticate as ${role}.`);
      }
    }
  }

  if (auth.admin) {
    console.info('Auditing admin routes…');
    const ok = await auditAdminRoutes(browser, results);
    if (!ok) {
      coverageNotes.push('Failed to authenticate as admin.');
    }
  }

  await browser.close();

  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const jsonPath = path.join(REPORT_DIR, 'responsive-platform-audit.json');
  const mdPath = path.join(REPORT_DIR, 'responsive-platform-audit.md');

  fs.writeFileSync(jsonPath, JSON.stringify({ results, coverageNotes }, null, 2));
  fs.writeFileSync(mdPath, formatAuditReportMarkdown(results, coverageNotes));

  const issueCount = results.reduce((sum, r) => sum + r.issues.length, 0);
  const tested = results.filter((r) => r.reached).length;
  const skipped = results.filter((r) => !r.reached).length;

  console.info('\n=== Audit complete ===');
  console.info(`Tested: ${tested} page×viewport combinations`);
  console.info(`Skipped: ${skipped}`);
  console.info(`Issues found: ${issueCount}`);
  console.info(`Report: ${mdPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
