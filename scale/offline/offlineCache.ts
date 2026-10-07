/**
 * offlineCache.ts
 * Local cache. Memory plus a file in this folder. No network.
 */

import { readFileSync, writeFileSync } from "node:fs";

type CacheValue = string | number | boolean | Record<string, unknown> | unknown[];

const file = new URL("./cache.json", import.meta.url);
const cache = new Map<string, CacheValue>();

function persist(): void {
  writeFileSync(file, JSON.stringify(Object.fromEntries(cache), null, 2));
}

/** Save a JSON value. A PDF buffer is stored as base64. */
export function saveToCache(key: string, value: unknown): void {
  if (value instanceof Uint8Array) {
    cache.set(key, { pdf: Buffer.from(value).toString("base64") });
  } else {
    cache.set(key, value as CacheValue);
  }
  persist();
}

/** Load a value, or null. */
export function loadFromCache(key: string): CacheValue | null {
  if (cache.has(key)) return cache.get(key) ?? null;
  try {
    const saved = JSON.parse(readFileSync(file, "utf8")) as Record<string, CacheValue>;
    for (const [savedKey, savedValue] of Object.entries(saved)) cache.set(savedKey, savedValue);
  } catch {
    return null;
  }
  return cache.get(key) ?? null;
}
