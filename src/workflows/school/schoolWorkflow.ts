/**
 * schoolWorkflow.ts
 * input → localRedactor → previewPayload → workerRedactor
 * → mapBehaviourToNeed → buildSupportPlan → generateRegulationMenu
 * → generateEFStrategies → buildSchoolCommunication
 *
 * School steps use the first need from the behaviour map.
 * Engines see worker text only. Approval is simulated so this path can finish.
 * Export: runSchoolWorkflow(input: string): SchoolWorkflowResult
 */

import { redactLocal } from "../../privacy/localRedactor";
import { buildPreview, simulateUserApproval, type PreviewPayload } from "../../privacy/previewPayload";
import { redactWorker } from "../../privacy/workerRedactor";
import { mapBehaviourToNeed, type NeedId, type NeedResult } from "../../engines/trauma/behaviourToNeed";
import { buildSupportPlan, type Plan } from "../../engines/school/supportPlan";
import { generateRegulationMenu } from "../../engines/school/regulationMenu";
import { generateEFStrategies } from "../../engines/school/executiveFunctioning";
import { buildSchoolCommunication } from "../../engines/school/communication";
import { PlatformError } from "../../utils/errors";
import { logEvent } from "../../../scale/audit/auditLogger";

export type { PreviewPayload, NeedId, NeedResult, Plan };

export interface SchoolWorkflowResult {
  preview: PreviewPayload;
  workerText: string;
  needs: NeedResult;
  focus: string;
  plan: Plan;
  menu: string[];
  strategies: string[];
  communication: string;
}

/** Run the school path. Pass approved false to stop before the engine. */
export function runSchoolWorkflow(input: string, approved?: boolean): SchoolWorkflowResult {
  const source = (input ?? "").trim();
  if (!source) throw new PlatformError("EMPTY_INPUT");

  const redacted = redactLocal(source);
  const preview = buildPreview(source, redacted);
  const gate = approved === undefined ? simulateUserApproval(preview) : { ...preview, approved };
  if (!gate.approved) throw new PlatformError("NOT_APPROVED");

  const workerText = redactWorker(gate.redacted);
  const needs = mapBehaviourToNeed(workerText);
  const focus = needs.needs[0] ?? "predictability";
  const plan = buildSupportPlan(focus);
  const menu = generateRegulationMenu(focus);
  const strategies = generateEFStrategies(focus);
  const communication = buildSchoolCommunication(focus);
  logEvent("workflow-run", { workflow: "school", ok: true });

  return { preview: gate, workerText, needs, focus, plan, menu, strategies, communication };
}
