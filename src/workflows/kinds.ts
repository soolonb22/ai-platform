/**
 * kinds.ts
 * The four workflows by name. Shared by drafts, AI drafting, and the server.
 * Exports: WORKFLOW_KINDS, WorkflowKind, isWorkflowKind
 */

export const WORKFLOW_KINDS = ["trauma", "ndis", "school", "provider"] as const;

export type WorkflowKind = (typeof WORKFLOW_KINDS)[number];

export function isWorkflowKind(value: unknown): value is WorkflowKind {
  return typeof value === "string" && (WORKFLOW_KINDS as readonly string[]).includes(value);
}
