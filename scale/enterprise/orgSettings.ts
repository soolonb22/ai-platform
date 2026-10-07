/**
 * orgSettings.ts
 * Organisation settings. Privacy mode defaults to local only.
 */

export interface OrgSettings {
  privacyMode: "local" | "worker";
  workflows: string[];
  templates: string[];
}

const defaults: OrgSettings = {
  privacyMode: "local",
  workflows: ["trauma", "ndis", "school", "provider"],
  templates: [],
};

const settings = new Map<string, OrgSettings>();

/** Replace the stored settings for an organisation. */
export function updateOrgSettings(orgId: string, next: Partial<OrgSettings>): OrgSettings {
  const current = settings.get(orgId) ?? { ...defaults, workflows: [...defaults.workflows] };
  const saved = {
    privacyMode: next.privacyMode ?? current.privacyMode,
    workflows: next.workflows ?? current.workflows,
    templates: next.templates ?? current.templates,
  };
  settings.set(orgId, saved);
  return saved;
}

/** Return settings, or the local-only default. */
export function getOrgSettings(orgId: string): OrgSettings {
  return settings.get(orgId) ?? { ...defaults, workflows: [...defaults.workflows] };
}
