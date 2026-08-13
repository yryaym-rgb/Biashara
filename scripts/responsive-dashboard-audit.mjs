/**
 * One-off responsive layout audit for dashboard components (Parts 8–10).
 * Uses representative markup with the same Tailwind classes as production components.
 */
import { chromium } from '@playwright/test';

const WIDTHS = [1024, 768, 390];

const DASHBOARD_HTML = `
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    :root {
      --brand-blue: #1D5FA8;
      --brand-gold: #E9A319;
      --ink: #0E2A47;
      --body: #5B6B7C;
      --muted: #8A97A6;
      --bg: #FFFFFF;
      --bg-tint: #F7F9FC;
      --border: #E7ECF2;
      --success: #1E9E5A;
      --market-live: #22C55E;
    }
  </style>
</head>
<body class="bg-bg p-4">
  <div id="kpi" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <div class="kpi-card border p-4">KPI 1</div>
    <div class="kpi-card border p-4">KPI 2</div>
    <div class="kpi-card border p-4">KPI 3</div>
    <div class="kpi-card border p-4">KPI 4</div>
  </div>
  <div id="market-trust" class="mt-4 grid gap-4 lg:grid-cols-2">
    <div class="market-pulse border p-4">Market Pulse</div>
    <div class="trust border p-4">Trust Score</div>
  </div>
  <div id="activity-actions" class="mt-4 grid gap-6 xl:grid-cols-3">
    <div class="activity xl:col-span-2 border p-4">Recent Activity</div>
    <div class="actions border p-4">Quick Actions</div>
  </div>
</body>
</html>
`;

async function audit() {
  const browser = await chromium.launch();
  const results = [];

  for (const width of WIDTHS) {
    const page = await browser.newPage();
    await page.setViewportSize({ width, height: 900 });
    await page.setContent(DASHBOARD_HTML, { waitUntil: 'networkidle' });

    const kpiCols = await page.locator('#kpi').evaluate((el) => {
      const cols = getComputedStyle(el).gridTemplateColumns;
      if (!cols || cols === 'none') return 1;
      return cols.split(' ').filter((part) => part && part !== '0px').length;
    });
    const marketTrustCols = await page.locator('#market-trust').evaluate((el) => {
      const cols = getComputedStyle(el).gridTemplateColumns;
      if (!cols || cols === 'none') return 1;
      return cols.split(' ').filter((part) => part && part !== '0px').length;
    });
    const activityActionsCols = await page.locator('#activity-actions').evaluate((el) => {
      const cols = getComputedStyle(el).gridTemplateColumns;
      if (!cols || cols === 'none') return 1;
      return cols.split(' ').filter((part) => part && part !== '0px').length;
    });

    results.push({ width, kpiCols, marketTrustCols, activityActionsCols });
    await page.close();
  }

  await browser.close();

  const expectations = {
    1024: { kpiCols: 4, marketTrustCols: 2, activityActionsCols: 1 },
    768: { kpiCols: 2, marketTrustCols: 1, activityActionsCols: 1 },
    390: { kpiCols: 1, marketTrustCols: 1, activityActionsCols: 1 },
  };

  let passed = true;
  for (const row of results) {
    const expected = expectations[row.width];
    const ok =
      row.kpiCols === expected.kpiCols &&
      row.marketTrustCols === expected.marketTrustCols &&
      row.activityActionsCols === expected.activityActionsCols;
    if (!ok) passed = false;
    console.log(
      JSON.stringify({
        width: row.width,
        actual: row,
        expected,
        pass: ok,
      }),
    );
  }

  if (!passed) {
    process.exit(1);
  }

  console.log('Responsive dashboard grid audit: ALL PASS');
}

audit().catch((error) => {
  console.error(error);
  process.exit(1);
});
