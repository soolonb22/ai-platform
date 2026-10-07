/**
 * auditLogger.ts
 * Counts and ids only. Text, email, and name fields are dropped.
 */

import { addLog } from "./auditStore";

const ALLOWED = new Set(["orgId", "teamId", "workflow", "pdf", "action", "count", "ok"]);

/** Store an event. Metadata keeps listed keys only. */
export function logEvent(eventType: string, metadata: Record<string, unknown> = {}): void {
  const safe: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (!ALLOWED.has(key)) continue;
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      safe[key] = value;
    }
  }
  addLog({ type: eventType, metadata: safe, at: new Date().toISOString() });
}
