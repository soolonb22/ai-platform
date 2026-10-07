/**
 * useStore.ts
 * Re-render a component when anything in the device store changes.
 * Export: useStoreVersion
 */

import { useSyncExternalStore } from "react";
import { snapshot, subscribe } from "../../data/store";

export function useStoreVersion(): number {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}
