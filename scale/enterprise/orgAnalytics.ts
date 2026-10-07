/**
 * orgAnalytics.ts
 * Usage counts. No note text is stored.
 */

export interface OrgAnalytics {
  orgId: string;
  workflows: Record<string, number>;
  pdfs: number;
  teamActivity: Record<string, number>;
}

const usage = new Map<string, OrgAnalytics>();

function empty(orgId: string): OrgAnalytics {
  return { orgId, workflows: {}, pdfs: 0, teamActivity: {} };
}

function record(orgId: string): OrgAnalytics {
  const current = usage.get(orgId) ?? empty(orgId);
  usage.set(orgId, current);
  return current;
}

/** Count one workflow run. */
export function recordWorkflow(orgId: string, workflow: string): void {
  const current = record(orgId);
  current.workflows[workflow] = (current.workflows[workflow] ?? 0) + 1;
}

/** Count one PDF build. */
export function recordPdf(orgId: string): void {
  record(orgId).pdfs += 1;
}

/** Count one team action. */
export function recordTeamActivity(orgId: string, teamId: string): void {
  const current = record(orgId);
  current.teamActivity[teamId] = (current.teamActivity[teamId] ?? 0) + 1;
}

/** Return counts for the organisation. */
export function generateOrgAnalytics(orgId: string): OrgAnalytics {
  return usage.get(orgId) ?? empty(orgId);
}
