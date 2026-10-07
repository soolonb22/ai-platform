/**
 * systemMap.ts
 * Module index. Paths are local. No secrets.
 */

export interface SystemMap {
  privacy: string[];
  workflows: string[];
  engines: string[];
  pdf: string[];
  monetization: string[];
  scale: string[];
}

export const systemMap: SystemMap = {
  privacy: ["localRedactor", "previewPayload", "workerRedactor"],
  workflows: ["trauma", "ndis", "school", "provider"],
  engines: ["trauma", "ndis", "school", "narrative"],
  pdf: ["agreement", "evidence", "trauma", "school"],
  monetization: ["subscriptions", "licensing", "marketplace", "billing"],
  scale: ["multiseat", "enterprise", "audit", "offline", "performance"],
};
