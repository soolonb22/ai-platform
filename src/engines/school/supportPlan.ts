/**
 * supportPlan.ts
 * A short classroom plan. Not an individual education plan and not a sanction list.
 * Export: buildSupportPlan(need): Plan
 */

export type Plan = {
  need: string;
  entry: string[];
  during: string[];
  exit: string;
};

/** Build entry, during, and exit steps for one need. */
export function buildSupportPlan(need: string): Plan {
  const focus = (need ?? "").trim() || "unspecified";
  return {
    need: focus,
    entry: [
      "Show the first step and the finish time.",
      "Ask where they want to sit.",
    ],
    during: [
      `Keep the task linked to ${focus}, and split it into one visible step.`,
      "Check in once. Do not stack questions.",
    ],
    exit: "They can pause or leave the task. Re-entry is offered, not required.",
  };
}
