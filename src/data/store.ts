/**
 * store.ts
 * Small JSON store for this browser. Uses localStorage when it is there,
 * and falls back to memory in private windows, tests, and Node.
 * Nothing here leaves the device.
 *
 * Exports: readJson, writeJson, removeKey, subscribe, snapshot
 */

const memory = new Map<string, string>();
const listeners = new Set<() => void>();
let version = 0;

function storage(): Storage | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}

function bump(): void {
  version += 1;
  for (const listener of listeners) listener();
}

/** Read a JSON value. Missing or unreadable data returns the fallback. */
export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = memory.get(key) ?? storage()?.getItem(key) ?? null;
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

/** Write a JSON value. If the browser refuses, the value still lives in memory for this session. */
export function writeJson(key: string, value: unknown): void {
  const raw = JSON.stringify(value);
  memory.set(key, raw);
  try {
    storage()?.setItem(key, raw);
  } catch {
    // Storage full or blocked. The memory copy keeps this session working.
  }
  bump();
}

export function removeKey(key: string): void {
  memory.delete(key);
  try {
    storage()?.removeItem(key);
  } catch {
    // Nothing else to do.
  }
  bump();
}

/** Listen for changes. Returns an unsubscribe function. Shaped for React useSyncExternalStore. */
export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Changes on every write, so React knows to render again. */
export function snapshot(): number {
  return version;
}

// Another tab changed the data: drop the memory copy and tell listeners.
if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
  window.addEventListener("storage", (event) => {
    if (event.key) memory.delete(event.key);
    else memory.clear();
    bump();
  });
}
