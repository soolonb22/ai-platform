/**
 * cacheLayer.ts
 * In-memory workflow results. Key should be a workflow name plus a hash, not raw notes.
 */

const cache = new Map<string, unknown>();

/** Return a cached result, or null. */
export function getCachedResult<T>(key: string): T | null {
  return cache.has(key) ? (cache.get(key) as T) : null;
}

/** Store a result. */
export function setCachedResult<T>(key: string, value: T): void {
  cache.set(key, value);
}
