/**
 * schoolWorkflow.ts
 * input → localRedactor → previewPayload → workerRedactor
 * → mapBehaviourToNeed → buildSupportPlan → generateRegulationMenu
 * → generateEFStrategies → buildSchoolCommunication
 *
 * School steps use the first need from the behaviour map.
 * Engines see worker text only. Nothing runs unless approved is true.
 * Export: runSchoolWorkflow(input: string, approved: boolean): SchoolWorkflowResult
 */

import { runFence } from "../../privacy/fence";
import type { PreviewPayload } from "../../privacy/previewPayload";
import { mapBehaviourToNeed, type NeedId, type NeedResult } from "../../engines/trauma/behaviourToNeed";
import { buildSupportPlan, type Plan } from "../../engines/school/supportPlan";
import { generateRegulationMenu } from "../../engines/school/regulationMenu";
import { generateEFStrategies } from "../../engines/school/executiveFunctioning";
import { buildSchoolCommunication } from "../../engines/school/communication";

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

/** Run the school path. Throws NOT_APPROVED unless approved is true. */
export function runSchoolWorkflow(input: string, approved: boolean): SchoolWorkflowResult {
  const { preview, workerText } = runFence(input, approved);
  const needs = mapBehaviourToNeed(workerText);
  const focus = needs.needs[0] ?? "predictability";
  const plan = buildSupportPlan(focus);
  const menu = generateRegulationMenu(focus);
  const strategies = generateEFStrategies(focus);
  const communication = buildSchoolCommunication(focus);
  logEvent("workflow-run", { workflow: "school", ok: true });

  return { preview, workerText, needs, focus, plan, menu, strategies, communication };
}
