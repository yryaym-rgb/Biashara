'use client';

import * as React from 'react';

/**
 * Defer Recharts ResponsiveContainer until after mount to avoid SSR hydration
 * and resize-observer update loops (React error #185 / DOM thrashing).
 */
export function useChartReady(): boolean {
  const [chartReady, setChartReady] = React.useState(false);

  React.useEffect(() => {
    setChartReady(true);
  }, []);

  return chartReady;
}
