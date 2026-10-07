/**
 * traumaWorkflow.ts
 * input → localRedactor → previewPayload → workerRedactor
 * → detectPatterns → mapBehaviourToNeed → generateInterventions
 * → buildRegulationPlan → explainTrauma
 *
 * Engines see worker text only. Approval is simulated so this path can finish.
 * Export: runTraumaWorkflow(input: string): TraumaWorkflowResult
 */

import { redactLocal } from "../../privacy/localRedactor";
import { buildPreview, simulateUserApproval, type PreviewPayload } from "../../privacy/previewPayload";
import { redactWorker } from "../../privacy/workerRedactor";
import { detectPatterns, type PatternHit, type PatternResult } from "../../engines/trauma/patterns";
import { mapBehaviourToNeed, type NeedId, type NeedResult } from "../../engines/trauma/behaviourToNeed";
import { generateInterventions } from "../../engines/trauma/microInterventions";
import { buildRegulationPlan, type Plan } from "../../engines/trauma/regulationPlans";
import { explainTrauma } from "../../engines/trauma/narrative";
import { PlatformError } from "../../utils/errors";
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

/** Run the trauma path. Pass approved false to stop before the engine. */
export function runTraumaWorkflow(input: string, approved?: boolean): TraumaWorkflowResult {
  const source = (input ?? "").trim();
  if (!source) throw new PlatformError("EMPTY_INPUT");

  const redacted = redactLocal(source);
  const preview = buildPreview(source, redacted);
  const gate = approved === undefined ? simulateUserApproval(preview) : { ...preview, approved };
  if (!gate.approved) throw new PlatformError("NOT_APPROVED");

  const workerText = redactWorker(gate.redacted);
  const patterns = detectPatterns(workerText);
  const needs = mapBehaviourToNeed(workerText);
  const interventions = generateInterventions(needs);
  const plan = buildRegulationPlan(needs);
  const narrative = explainTrauma(patterns, needs);
  logEvent("workflow-run", { workflow: "trauma", ok: true });

  return { preview: gate, workerText, patterns, needs, interventions, plan, narrative };
}
