/**
 * orgManager.ts
 * In-memory organisations. Teams are linked by id.
 */

export interface Org {
  id: string;
  name: string;
  teams: string[];
}

const orgs = new Map<string, Org>();

/** Create an organisation. Reject a duplicate id. */
export function createOrg(id: string, name: string): Org {
  if (orgs.has(id)) throw new Error("Organisation already exists.");
  const org = { id, name, teams: [] };
  orgs.set(id, org);
  return org;
}

/** Return the organisation, or null. */
export function getOrg(id: string): Org | null {
  return orgs.get(id) ?? null;
}

/** Link a team id. Ignore a duplicate link. */
export function assignTeam(orgId: string, teamId: string): Org {
  const org = orgs.get(orgId);
  if (!org) throw new Error("Organisation not found.");
  if (!org.teams.includes(teamId)) org.teams.push(teamId);
  return org;
}
