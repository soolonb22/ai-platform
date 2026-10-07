/**
 * permissions.ts
 * Role matrix. Admin manages the team. Viewer can only view.
 */

import type { Role } from "./teamManager";

export type Action = "view" | "edit" | "invite" | "manage-billing" | "revoke";

const MATRIX: Record<Role, Action[]> = {
  admin: ["view", "edit", "invite", "manage-billing", "revoke"],
  editor: ["view", "edit"],
  viewer: ["view"],
};

/** True when the role includes the action. */
export function canPerformAction(role: Role, action: Action): boolean {
  return MATRIX[role].includes(action);
}
