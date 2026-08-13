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
  });
}

export async function ensureAuditInitScript(page: Page): Promise<void> {
  await page.addInitScript(RESPONSIVE_AUDIT_INIT_SCRIPT);
}

export async function auditPageLayout(
  page: Page,
  context: { path: string; viewport: string; role?: string },
): Promise<AuditIssue[]> {
  const issues: AuditIssue[] = [];
  const { path, viewport, role } = context;

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

  if (overflow.hasOverflow) {
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
  const browserChecks = await runBrowserLayoutChecks(page, isMobileViewport);

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
