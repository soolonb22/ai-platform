/**
 * teamManager.ts
 * In-memory teams. Roles are admin, editor, or viewer.
 */

export type Role = "admin" | "editor" | "viewer";

export interface Member {
  user: string;
  role: Role;
}

export interface Team {
  id: string;
  name: string;
  members: Member[];
}

const teams = new Map<string, Team>();

/** Create a team with the caller as admin. */
export function createTeam(id: string, name: string, owner: string): Team {
  if (teams.has(id)) throw new Error("Team already exists.");
  const team = { id, name, members: [{ user: owner, role: "admin" as const }] };
  teams.set(id, team);
  return team;
}

/** Add a member. Reject a duplicate user. */
export function addMember(teamId: string, user: string, role: Role): Team {
  const team = teams.get(teamId);
  if (!team) throw new Error("Team not found.");
  if (team.members.some((member) => member.user === user)) throw new Error("Member already on team.");
  team.members.push({ user, role });
  return team;
}

/** Remove a member. The last admin cannot be removed. */
export function removeMember(teamId: string, user: string): Team {
  const team = teams.get(teamId);
  if (!team) throw new Error("Team not found.");
  const admins = team.members.filter((member) => member.role === "admin");
  const target = team.members.find((member) => member.user === user);
  if (!target) throw new Error("Member not found.");
  if (target.role === "admin" && admins.length === 1) throw new Error("Team needs an admin.");
  team.members = team.members.filter((member) => member.user !== user);
  return team;
}

/** Return the team, or null. */
export function getTeam(teamId: string): Team | null {
  return teams.get(teamId) ?? null;
}
