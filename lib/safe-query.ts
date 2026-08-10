type QuerySource<T> = Promise<T> | (() => Promise<T>);

function resolveQuery<T>(source: QuerySource<T>): Promise<T> {
  return typeof source === 'function' ? source() : source;
}

/**
 * Runs a server data query and returns a safe fallback when it throws, instead of
 * crashing the surrounding page or layout. Matches the lots/settings .catch() pattern.
 */
export function safeQuery<T>(label: string, source: QuerySource<T>, fallback: T): Promise<T> {
  return resolveQuery(source).catch((error: unknown) => {
    console.error(`[${label}] Failed to load:`, error);
    return fallback;
  });
}
