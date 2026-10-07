/**
 * offlineWorkflowRunner.ts
 * Runs a local workflow. No Worker and no fetch.
 */

import { runNDISWorkflow } from "../../src/workflows/ndis/ndisWorkflow";
import { runProviderWorkflow } from "../../src/workflows/provider/providerWorkflow";
import { runSchoolWorkflow } from "../../src/workflows/school/schoolWorkflow";
import { runTraumaWorkflow } from "../../src/workflows/trauma/traumaWorkflow";
import { saveToCache } from "./offlineCache";

export type OfflineWorkflow = "trauma" | "ndis" | "school" | "provider";

/** Run one local workflow after approval and cache the worker text. */
export function runOfflineWorkflow(input: string, workflowName: OfflineWorkflow, approved: boolean) {
  const result =
    workflowName === "trauma"
      ? runTraumaWorkflow(input, approved)
      : workflowName === "ndis"
        ? runNDISWorkflow(input, approved)
        : workflowName === "school"
          ? runSchoolWorkflow(input, approved)
          : runProviderWorkflow(input, approved);
  saveToCache(`${workflowName}:worker`, result.workerText);
  return result;
}
