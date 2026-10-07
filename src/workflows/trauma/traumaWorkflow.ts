/**
 * traumaWorkflow.ts
 * input → localRedactor → previewPayload → workerRedactor
 * → detectPatterns → mapBehaviourToNeed → generateInterventions
 * → buildRegulationPlan → explainTrauma
 *
 * Engines see worker text only. Nothing runs unless approved is true.
 * Export: runTraumaWorkflow(input: string, approved: boolean): TraumaWorkflowResult
 */

import { runFence } from "../../privacy/fence";
import type { PreviewPayload } from "../../privacy/previewPayload";
import { detectPatterns, type PatternHit, type PatternResult } from "../../engines/trauma/patterns";
import { mapBehaviourToNeed, type NeedId, type NeedResult } from "../../engines/trauma/behaviourToNeed";
import { generateInterventions } from "../../engines/trauma/microInterventions";
import { buildRegulationPlan, type Plan } from "../../engines/trauma/regulationPlans";
import { explainTrauma } from "../../engines/trauma/narrative";

import { logEvent } from "../../../scale/audit/auditLogger";

export type { PreviewPayload, PatternHit, PatternResult, NeedId, NeedResult, Plan };

export interface TraumaWorkflowResult {
  preview: PreviewPayload;
  workerText: string;
  patterns: PatternResult;
  needs: NeedResult;
  interventions: string[];
  plan: Plan;
  narrative: string;
}

/** Run the trauma path. Throws NOT_APPROVED unless approved is true. */
export function runTraumaWorkflow(input: string, approved: boolean): TraumaWorkflowResult {
  const { preview, workerText } = runFence(input, approved);
  const patterns = detectPatterns(workerText);
  const needs = mapBehaviourToNeed(workerText);
  const interventions = generateInterventions(needs);
  const plan = buildRegulationPlan(needs);
  const narrative = explainTrauma(patterns, needs);
  logEvent("workflow-run", { workflow: "trauma", ok: true });

  return { preview, workerText, patterns, needs, interventions, plan, narrative };
}
