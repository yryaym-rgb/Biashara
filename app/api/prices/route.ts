import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { MINERALS, type MineralId } from '@/lib/constants/minerals';
import { rateLimit, PRICES_RATE_LIMIT } from '@/lib/rate-limit';
import type { Database } from '@/types/database.types';

const CACHE_TTL_MS = 15 * 60 * 1000;

type MineralType = Database['public']['Enums']['mineral_type'];
type PriceType = Database['public']['Enums']['price_type'];
type QuantityUnit = Database['public']['Enums']['quantity_unit'];

interface PriceEntry {
  mineral: MineralId;
  price: number | null;
  currency: string;
  unit: QuantityUnit;
  priceType: PriceType;
  source: string;
  fetchedAt: string;
  isIndicative: boolean;
}

interface MetalsDevResponse {
  metals?: Record<string, { price?: number; currency?: string }>;
}

const METALS_DEV_SYMBOL_MAP: Record<string, MineralId> = {
  cobalt: 'cobalt',
  copper: 'copper',
  gold: 'gold',
  lithium: 'lithium',
};

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}

async function fetchFromMetalsDev(): Promise<Partial<Record<MineralId, number>>> {
  const apiUrl = process.env.METALS_API_URL;
  const apiKey = process.env.METALS_API_KEY;

  if (!apiUrl || !apiKey) {
    return {};
  }

  const url = new URL(apiUrl);
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('currency', 'USD');
  url.searchParams.set('unit', 'toz');

  const response = await fetch(url.toString(), {
    next: { revalidate: 900 },
  });

  if (!response.ok) {
    throw new Error(`Metals API error: ${response.status}`);
  }

  const data = (await response.json()) as MetalsDevResponse;
  const prices: Partial<Record<MineralId, number>> = {};

  if (data.metals) {
    for (const [symbol, mapped] of Object.entries(METALS_DEV_SYMBOL_MAP)) {
      const entry = data.metals[symbol];
      if (entry?.price !== undefined) {
        prices[mapped] = entry.price;
      }
    }
  }

  return prices;
}

function buildPriceEntries(
  spotPrices: Partial<Record<MineralId, number>>,
  fetchedAt: string,
): PriceEntry[] {
  return MINERALS.map((mineral) => {
    if (!mineral.hasSpotPrice) {
      return {
        mineral: mineral.id,
        price: null,
        currency: 'USD',
        unit: mineral.defaultUnit,
        priceType: 'indicative' as PriceType,
        source: 'none',
        fetchedAt,
        isIndicative: true,
      };
    }

    const price = spotPrices[mineral.id] ?? null;
    return {
      mineral: mineral.id,
      price,
      currency: 'USD',
      unit: mineral.defaultUnit,
      priceType: (price !== null ? 'fixed' : 'indicative') as PriceType,
      source: 'metals.dev',
      fetchedAt,
      isIndicative: price === null,
    };
  });
}

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = rateLimit(`prices:${ip}`, PRICES_RATE_LIMIT.limit, PRICES_RATE_LIMIT.windowMs);

  if (!limit.success) {
    return NextResponse.json(
      { error: 'rate_limit_exceeded' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((limit.resetAt - Date.now()) / 1000)) },
      },
    );
  }

  const admin = createAdminClient();
  const now = Date.now();

  const { data: cached } = await admin
    .from('price_cache')
    .select('*')
    .order('fetched_at', { ascending: false });

  const newestFetch = cached?.[0]?.fetched_at;
  const cacheValid =
    newestFetch && now - new Date(newestFetch).getTime() < CACHE_TTL_MS;

  if (cacheValid && cached && cached.length > 0) {
    const minerals: PriceEntry[] = cached.map((row) => ({
      mineral: row.mineral as MineralId,
      price: row.price,
      currency: row.currency,
      unit: row.unit as QuantityUnit,
      priceType: row.price_type as PriceType,
      source: row.source,
      fetchedAt: row.fetched_at,
      isIndicative: row.price_type === 'indicative' || row.price === null,
    }));

    return NextResponse.json({
      minerals,
      cachedAt: newestFetch,
      fromCache: true,
    });
  }

  let spotPrices: Partial<Record<MineralId, number>> = {};
  try {
    spotPrices = await fetchFromMetalsDev();
  } catch {
    if (cached && cached.length > 0) {
      const minerals: PriceEntry[] = cached.map((row) => ({
        mineral: row.mineral as MineralId,
        price: row.price,
        currency: row.currency,
        unit: row.unit as QuantityUnit,
        priceType: row.price_type as PriceType,
        source: row.source,
        fetchedAt: row.fetched_at,
        isIndicative: row.price_type === 'indicative' || row.price === null,
      }));

      return NextResponse.json({
        minerals,
        cachedAt: newestFetch,
        fromCache: true,
        stale: true,
      });
    }
  }

  const fetchedAt = new Date().toISOString();
  const entries = buildPriceEntries(spotPrices, fetchedAt);

  for (const entry of entries) {
    await admin.from('price_cache').upsert({
      mineral: entry.mineral as MineralType,
      price: entry.price,
      currency: entry.currency,
      unit: entry.unit,
      price_type: entry.priceType,
      source: entry.source,
      fetched_at: fetchedAt,
    });
  }

  return NextResponse.json({
    minerals: entries,
    cachedAt: fetchedAt,
    fromCache: false,
  });
}
