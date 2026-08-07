import type { PricesResponse } from '@/lib/prices/types';

/** Client-side fetch for /api/prices — shared by ticker and live price cards. */
export async function fetchPricesClient(): Promise<PricesResponse> {
  const response = await fetch('/api/prices');
  if (!response.ok) {
    throw new Error('prices_fetch_failed');
  }
  return response.json() as Promise<PricesResponse>;
}
