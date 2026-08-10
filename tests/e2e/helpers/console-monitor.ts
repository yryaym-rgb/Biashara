import type { Page, ConsoleMessage, Response } from '@playwright/test';

const IGNORED_CONSOLE_PATTERNS = [
  /Download the React DevTools/i,
  /Failed to load resource: the server responded with a status of 404/i,
];

const IGNORED_NETWORK_URL_PATTERNS = [
  /\/favicon\.ico$/,
  /\/_next\/image/,
  /supabase\.co\/storage/,
];

export interface PageMonitor {
  assertClean: () => void;
  dispose: () => void;
}

export function attachPageMonitor(page: Page): PageMonitor {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const networkErrors: string[] = [];

  const onConsole = (message: ConsoleMessage) => {
    if (message.type() !== 'error') {
      return;
    }

    const text = message.text();
    if (IGNORED_CONSOLE_PATTERNS.some((pattern) => pattern.test(text))) {
      return;
    }

    consoleErrors.push(text);
  };

  const onPageError = (error: Error) => {
    pageErrors.push(error.message);
  };

  const onResponse = (response: Response) => {
    const status = response.status();
    if (status < 400) {
      return;
    }

    const url = response.url();
    if (IGNORED_NETWORK_URL_PATTERNS.some((pattern) => pattern.test(url))) {
      return;
    }

    const request = response.request();
    const resourceType = request.resourceType();
    if (resourceType !== 'fetch' && resourceType !== 'xhr' && resourceType !== 'document') {
      return;
    }

    const pageOrigin = new URL(page.url()).origin;
    let responseOrigin: string;
    try {
      responseOrigin = new URL(url).origin;
    } catch {
      return;
    }

    if (responseOrigin !== pageOrigin) {
      return;
    }

    networkErrors.push(`${status} ${request.method()} ${url}`);
  };

  page.on('console', onConsole);
  page.on('pageerror', onPageError);
  page.on('response', onResponse);

  return {
    assertClean() {
      if (consoleErrors.length > 0 || pageErrors.length > 0 || networkErrors.length > 0) {
        const details = [
          ...consoleErrors.map((entry) => `console.error: ${entry}`),
          ...pageErrors.map((entry) => `pageerror: ${entry}`),
          ...networkErrors.map((entry) => `network: ${entry}`),
        ].join('\n');
        throw new Error(`Unexpected browser errors on ${page.url()}:\n${details}`);
      }
    },
    dispose() {
      page.off('console', onConsole);
      page.off('pageerror', onPageError);
      page.off('response', onResponse);
    },
  };
}

/** @deprecated Use attachPageMonitor */
export type ConsoleMonitor = PageMonitor;

/** @deprecated Use attachPageMonitor */
export function attachConsoleMonitor(page: Page): PageMonitor {
  return attachPageMonitor(page);
}

export async function visitAndAssertClean(
  page: Page,
  path: string,
  heading: string | RegExp,
  options?: { waitMs?: number },
) {
  const monitor = attachPageMonitor(page);

  try {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: heading }).first().waitFor({ state: 'visible' });
    await page.waitForTimeout(options?.waitMs ?? 750);
    monitor.assertClean();
  } finally {
    monitor.dispose();
  }
}

export async function interactAndAssertClean(
  page: Page,
  action: () => Promise<void>,
  options?: { waitMs?: number },
) {
  const monitor = attachPageMonitor(page);

  try {
    await action();
    await page.waitForTimeout(options?.waitMs ?? 500);
    monitor.assertClean();
  } finally {
    monitor.dispose();
  }
}
