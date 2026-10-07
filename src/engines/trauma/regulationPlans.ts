/**
 * regulationPlans.ts
 * A short plan for the support person. Not a treatment plan.
 * Export: buildRegulationPlan(need: NeedResult): Plan
 */

import type { NeedResult } from "./behaviourToNeed";
import { generateInterventions } from "./microInterventions";

export type Plan = {
  aim: string;
  now: string[];
  environment: string[];
  review: string;
};

/** Build a now / environment / review plan from the need result. */
export function buildRegulationPlan(need: NeedResult): Plan {
  const now = generateInterventions(need);
  return {
    aim: need.summary,
    now: now.length ? now : ["Offer a break and a choice."],
    environment: [
      "Reduce extra talk, noise, and audience.",
      "Keep the exit clear.",
    ],
    review: "After they are steady, ask what helped. Do not replay the incident.",
  };
}
