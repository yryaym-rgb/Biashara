import type { Page } from '@playwright/test';
import { RESPONSIVE_AUDIT_INIT_SCRIPT } from './responsive-audit.browser';

declare global {
  interface Window {
    __biasharaResponsiveAudit: {
      runChecks: (params: {
        interactiveSelector: string;
        textSelector: string;
        minArea: number;
        minSize: number;
        minGap: number;
        isMobile: boolean;
        rootSelector?: string;
        skipCtaChecks?: boolean;
      }) => {
        overlapIssues: Array<{ a: string; b: string; area: number }>;
        tapIssues: string[];
        truncationIssues: string[];
        ctaIssues: string[];
      };
    };
  }
}

export const AUDIT_VIEWPORTS = [
  { width: 1440, height: 900, label: '1440px' },
  { width: 1024, height: 900, label: '1024px' },
  { width: 768, height: 900, label: '768px' },
  { width: 390, height: 844, label: '390px' },
  { width: 360, height: 800, label: '360px' },
] as const;

export const MOBILE_DRAWER_VIEWPORTS = AUDIT_VIEWPORTS.filter(
  (viewport) => viewport.width <= 390,
);

export type MobileDrawerProfile = 'marketing' | 'platform';

export interface MobileDrawerOpenResult {
  opened: boolean;
  profile?: MobileDrawerProfile;
  drawerSelector?: string;
  reason?: string;
}

export type AuditSeverity = 'critical' | 'high' | 'medium' | 'low';

export type AuditCategory =
  | 'overlap'
  | 'overflow'
  | 'tap-target'
  | 'text-truncation'
  | 'cta-blocked'
  | 'navigation';

export interface AuditIssue {
  severity: AuditSeverity;
  category: AuditCategory;
  page: string;
  viewport: string;
  role?: string;
  description: string;
  elements?: string;
}

export interface PageAuditResult {
  path: string;
  viewport: string;
  role?: string;
  reached: boolean;
  skipReason?: string;
  issues: AuditIssue[];
}

const INTERACTIVE_SELECTOR =
  'a, button, input, select, textarea, summary, [role="button"], [role="link"], [role="tab"], [role="menuitem"], [role="checkbox"], [role="radio"]';

const TEXT_SELECTOR =
  'h1, h2, h3, h4, h5, h6, label, p, span, td, th, li';

const MIN_TAP_SIZE = 40;
const MIN_TAP_GAP = 8;
const OVERLAP_MIN_AREA = 16;

/** Browser-side audit bundle — injected via addInitScript to avoid tsx evaluate transforms. */
async function runBrowserLayoutChecks(
  page: Page,
  isMobileViewport: boolean,
  options?: { rootSelector?: string; skipCtaChecks?: boolean },
): Promise<{
  overlapIssues: Array<{ a: string; b: string; area: number }>;
  tapIssues: string[];
  truncationIssues: string[];
  ctaIssues: string[];
}> {
  return page.evaluate((params) => {
    return window.__biasharaResponsiveAudit.runChecks(params);
  }, {
    interactiveSelector: INTERACTIVE_SELECTOR,
    textSelector: TEXT_SELECTOR,
    minArea: OVERLAP_MIN_AREA,
    minSize: MIN_TAP_SIZE,
    minGap: MIN_TAP_GAP,
    isMobile: isMobileViewport,
    rootSelector: options?.rootSelector,
    skipCtaChecks: options?.skipCtaChecks,
  });
}

export async function ensureAuditInitScript(page: Page): Promise<void> {
  await page.addInitScript(RESPONSIVE_AUDIT_INIT_SCRIPT);
}

export async function auditPageLayout(
  page: Page,
  context: {
    path: string;
    viewport: string;
    role?: string;
    rootSelector?: string;
    skipCtaChecks?: boolean;
    drawerOpen?: boolean;
  },
): Promise<AuditIssue[]> {
  const issues: AuditIssue[] = [];
  const { path, viewport, role, rootSelector, skipCtaChecks, drawerOpen } = context;

  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const scrollWidth = Math.max(doc.scrollWidth, body.scrollWidth);
    const clientWidth = doc.clientWidth;
    return {
      hasOverflow: scrollWidth > clientWidth + 1,
      scrollWidth,
      clientWidth,
    };
  });

  if (overflow.hasOverflow && !drawerOpen) {
    issues.push({
      severity: 'high',
      category: 'overflow',
      page: path,
      viewport,
      role,
      description: `Horizontal overflow: scrollWidth ${overflow.scrollWidth}px exceeds viewport ${overflow.clientWidth}px`,
    });
  }

  const isMobileViewport = viewport === '390px' || viewport === '360px';
  const browserChecks = await runBrowserLayoutChecks(page, isMobileViewport, {
    rootSelector,
    skipCtaChecks: skipCtaChecks ?? Boolean(drawerOpen),
  });

  for (const overlap of browserChecks.overlapIssues) {
    issues.push({
      severity: 'medium',
      category: 'overlap',
      page: path,
      viewport,
      role,
      description: `Elements overlap (${Math.round(overlap.area)}px² intersection)`,
      elements: `${overlap.a} ↔ ${overlap.b}`,
    });
  }

  for (const desc of browserChecks.tapIssues) {
    issues.push({
      severity: desc.includes('undersized') ? 'high' : 'medium',
      category: 'tap-target',
      page: path,
      viewport,
      role,
      description: desc,
    });
  }

  for (const desc of browserChecks.truncationIssues) {
    issues.push({
      severity: 'low',
      category: 'text-truncation',
      page: path,
      viewport,
      role,
      description: 'Text may be truncated, clipped, or awkwardly wrapped',
      elements: desc,
    });
  }

  for (const desc of browserChecks.ctaIssues) {
    issues.push({
      severity: 'critical',
      category: 'cta-blocked',
      page: path,
      viewport,
      role,
      description: desc,
    });
  }

  return issues;
}

/** Detect and open the mobile nav drawer (marketing navbar or platform sidebar). */
export async function tryOpenMobileDrawer(page: Page): Promise<MobileDrawerOpenResult> {
  const marketingButton = page.locator('button[aria-controls="mobile-nav"]');
  if (await marketingButton.isVisible().catch(() => false)) {
    await marketingButton.click();
    const drawer = page.locator('#mobile-nav');
    try {
      await drawer.waitFor({ state: 'visible', timeout: 3000 });
      return { opened: true, profile: 'marketing', drawerSelector: '#mobile-nav' };
    } catch {
      return { opened: false, reason: 'marketing drawer did not appear' };
    }
  }

  const platformButton = page
    .locator('header button')
    .filter({ has: page.locator('svg') })
    .filter({ hasNot: page.locator('[aria-controls]') })
    .first();
  if (await platformButton.isVisible().catch(() => false)) {
    await platformButton.click();
    const drawer = page.locator('aside').first();
    try {
      await drawer.waitFor({ state: 'visible', timeout: 3000 });
      const box = await drawer.boundingBox();
      if (box && box.width > 100) {
        return { opened: true, profile: 'platform', drawerSelector: 'aside' };
      }
      return { opened: false, reason: 'platform drawer did not slide in' };
    } catch {
      return { opened: false, reason: 'platform drawer did not appear' };
    }
  }

  return { opened: false, reason: 'no mobile drawer trigger visible' };
}

/** Close whichever mobile drawer profile is open. */
export async function tryCloseMobileDrawer(
  page: Page,
  profile: MobileDrawerProfile,
): Promise<boolean> {
  if (profile === 'marketing') {
    const toggle = page.locator('button[aria-controls="mobile-nav"]');
    if (await toggle.isVisible().catch(() => false)) {
      await toggle.click();
      return !(await page.locator('#mobile-nav').isVisible().catch(() => false));
    }
    return false;
  }

  const closeButton = page.getByRole('button', { name: 'Fermer le menu' }).first();
  if (await closeButton.isVisible().catch(() => false)) {
    await closeButton.click();
    await page.waitForTimeout(200);
    const asideBox = await page.locator('aside').first().boundingBox();
    return !asideBox || asideBox.x < -50;
  }

  const backdrop = page.locator('button[aria-label="Fermer le menu"]').first();
  if (await backdrop.isVisible().catch(() => false)) {
    await backdrop.click();
    return true;
  }

  return false;
}

async function auditDrawerStructure(
  page: Page,
  drawerSelector: string,
  context: { path: string; viewport: string; role?: string },
): Promise<AuditIssue[]> {
  const issues: AuditIssue[] = [];
  const { path, viewport, role } = context;

  const metrics = await page.evaluate((selector) => {
    const drawer = document.querySelector(selector);
    if (!drawer) return { found: false as const };

    const rect = drawer.getBoundingClientRect();
    const style = window.getComputedStyle(drawer);
    const doc = document.documentElement;
    const body = document.body;

    return {
      found: true as const,
      height: rect.height,
      width: rect.width,
      top: rect.top,
      bottom: rect.bottom,
      left: rect.left,
      right: rect.right,
      position: style.position,
      zIndex: style.zIndex,
      viewportHeight: window.innerHeight,
      viewportWidth: window.innerWidth,
      pageScrollWidth: Math.max(doc.scrollWidth, body.scrollWidth),
      pageClientWidth: doc.clientWidth,
    };
  }, drawerSelector);

  if (!metrics.found) {
    issues.push({
      severity: 'critical',
      category: 'navigation',
      page: path,
      viewport,
      role,
      description: 'Mobile drawer element missing after open',
    });
    return issues;
  }

  if (metrics.height < 100) {
    issues.push({
      severity: 'critical',
      category: 'navigation',
      page: path,
      viewport,
      role,
      description: `Mobile drawer collapsed to ${Math.round(metrics.height)}px height (expected full viewport panel below header)`,
      elements: `${drawerSelector} @ top ${Math.round(metrics.top)}px`,
    });
  }

  const expectedMinHeight = metrics.viewportHeight - metrics.top - 8;
  if (metrics.height < expectedMinHeight * 0.85) {
    issues.push({
      severity: 'high',
      category: 'navigation',
      page: path,
      viewport,
      role,
      description: `Mobile drawer only ${Math.round(metrics.height)}px tall; expected ~${Math.round(expectedMinHeight)}px below offset`,
      elements: drawerSelector,
    });
  }

  if (metrics.pageScrollWidth > metrics.pageClientWidth + 1) {
    issues.push({
      severity: 'high',
      category: 'overflow',
      page: path,
      viewport,
      role,
      description: `Horizontal overflow with drawer open: scrollWidth ${metrics.pageScrollWidth}px exceeds viewport ${metrics.pageClientWidth}px`,
    });
  }

  if (metrics.width > metrics.viewportWidth + 1 || metrics.left < -1) {
    issues.push({
      severity: 'high',
      category: 'overflow',
      page: path,
      viewport,
      role,
      description: `Drawer extends beyond viewport (${Math.round(metrics.width)}×${Math.round(metrics.height)}px at left ${Math.round(metrics.left)}px)`,
      elements: drawerSelector,
    });
  }

  if (metrics.position !== 'fixed') {
    issues.push({
      severity: 'medium',
      category: 'navigation',
      page: path,
      viewport,
      role,
      description: `Mobile drawer uses position:${metrics.position} instead of fixed`,
      elements: drawerSelector,
    });
  }

  return issues;
}

/**
 * Open the mobile drawer, run layout/tap-target checks scoped to the drawer,
 * verify structural health, then close the drawer.
 */
export async function auditOpenMobileDrawer(
  page: Page,
  context: { path: string; viewport: string; role?: string },
): Promise<{ issues: AuditIssue[]; drawerResult: MobileDrawerOpenResult }> {
  const drawerResult = await tryOpenMobileDrawer(page);
  if (!drawerResult.opened || !drawerResult.drawerSelector) {
    return {
      drawerResult,
      issues: [
        {
          severity: 'medium',
          category: 'navigation',
          page: context.path,
          viewport: context.viewport,
          role: context.role,
          description: drawerResult.reason ?? 'Could not open mobile drawer for audit',
        },
      ],
    };
  }

  await page.waitForTimeout(300);

  const issues: AuditIssue[] = [
    ...(await auditDrawerStructure(page, drawerResult.drawerSelector, context)),
    ...(await auditPageLayout(page, {
      ...context,
      rootSelector: drawerResult.drawerSelector,
      skipCtaChecks: true,
      drawerOpen: true,
    })),
  ];

  const closed = await tryCloseMobileDrawer(page, drawerResult.profile!);
  if (!closed) {
    issues.push({
      severity: 'high',
      category: 'navigation',
      page: context.path,
      viewport: context.viewport,
      role: context.role,
      description: 'Mobile drawer failed to close after audit',
    });
  }

  return { issues, drawerResult };
}

export async function tryGotoPage(
  page: Page,
  path: string,
  options?: { timeout?: number; baseURL?: string },
): Promise<{ ok: boolean; reason?: string }> {
  const baseURL = options?.baseURL ?? process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';
  const url = path.startsWith('http') ? path : new URL(path, baseURL).toString();
  try {
    const response = await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: options?.timeout ?? 30_000,
    });
    if (response && response.status() >= 400) {
      return { ok: false, reason: `HTTP ${response.status()}` };
    }
    await page.waitForTimeout(800);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : 'navigation failed',
    };
  }
}

export async function discoverFirstLink(
  page: Page,
  pattern: RegExp,
): Promise<string | null> {
  const href = await page.evaluate((regexSource) => {
    const re = new RegExp(regexSource);
    for (const anchor of document.querySelectorAll('a[href]')) {
      const href = anchor.getAttribute('href') ?? '';
      if (!re.test(href)) continue;
      const style = window.getComputedStyle(anchor);
      if (style.display === 'none' || style.visibility === 'hidden') continue;
      return href;
    }
    return null;
  }, pattern.source);

  if (!href) return null;
  try {
    const url = new URL(href, page.url());
    return url.pathname + url.search;
  } catch {
    return href.startsWith('/') ? href : null;
  }
}

export function prioritizeIssues(issues: AuditIssue[]): AuditIssue[] {
  const order: Record<AuditSeverity, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };
  return [...issues].sort((a, b) => order[a.severity] - order[b.severity]);
}

export function formatAuditReportMarkdown(
  results: PageAuditResult[],
  coverageNotes: string[],
): string {
  const allIssues = prioritizeIssues(results.flatMap((r) => r.issues));
  const bySeverity = {
    critical: allIssues.filter((i) => i.severity === 'critical'),
    high: allIssues.filter((i) => i.severity === 'high'),
    medium: allIssues.filter((i) => i.severity === 'medium'),
    low: allIssues.filter((i) => i.severity === 'low'),
  };

  const tested = results.filter((r) => r.reached);
  const skipped = results.filter((r) => !r.reached);

  let md = '# Platform Responsive + Interaction Audit Report\n\n';
  md += `Generated: ${new Date().toISOString()}\n\n`;

  md += '## Coverage Summary\n\n';
  md += `- Pages tested: ${tested.length}\n`;
  md += `- Pages skipped/unreachable: ${skipped.length}\n`;
  md += `- Total issues: ${allIssues.length}\n\n`;

  if (coverageNotes.length > 0) {
    md += '### Coverage gaps\n\n';
    for (const note of coverageNotes) {
      md += `- ${note}\n`;
    }
    md += '\n';
  }

  if (skipped.length > 0) {
    md += '### Skipped routes\n\n';
    md += '| Page | Viewport | Role | Reason |\n';
    md += '|------|----------|------|--------|\n';
    for (const row of skipped) {
      md += `| ${row.path} | ${row.viewport} | ${row.role ?? 'guest'} | ${row.skipReason ?? 'unknown'} |\n`;
    }
    md += '\n';
  }

  const section = (title: string, items: AuditIssue[]) => {
    if (items.length === 0) return '';
    let s = `## ${title} (${items.length})\n\n`;
    for (const issue of items) {
      s += `### ${issue.page} @ ${issue.viewport}${issue.role ? ` (${issue.role})` : ''}\n`;
      s += `- **Category:** ${issue.category}\n`;
      s += `- **Issue:** ${issue.description}\n`;
      if (issue.elements) s += `- **Elements:** ${issue.elements}\n`;
      s += '\n';
    }
    return s;
  };

  md += section('Critical', bySeverity.critical);
  md += section('High', bySeverity.high);
  md += section('Medium', bySeverity.medium);
  md += section('Low', bySeverity.low);

  return md;
}
