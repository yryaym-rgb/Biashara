'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * Returns stable primitive search-param values for effect dependencies.
 * Avoids infinite re-render loops from unstable `useSearchParams()` identity.
 */
export function useSearchParamValues(keys: string[]): Record<string, string | null> {
  const searchParams = useSearchParams();

  return useMemo(() => {
    const values: Record<string, string | null> = {};
    for (const key of keys) {
      values[key] = searchParams.get(key);
    }
    return values;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by serialized query string
  }, [searchParams.toString(), keys.join('|')]);
}
