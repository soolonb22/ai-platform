/**
 * ndisWorkflow.ts
 * input → localRedactor → previewPayload → workerRedactor
 * → extractFunding → interpretRules → generateGoals
 * → buildEvidence → buildServiceAgreement
 *
 * Engines see worker text only. Needs for goals come from category cues.
 * Approval is simulated so this path can finish.
 * Export: runNDISWorkflow(input: string): NDISWorkflowResult
 */

import { redactLocal } from "../../privacy/localRedactor";
import { buildPreview, simulateUserApproval, type PreviewPayload } from "../../privacy/previewPayload";
import { redactWorker } from "../../privacy/workerRedactor";
import { extractFunding, type FundingCategory, type FundingResult } from "../../engines/ndis/fundingExtractor";
import { interpretRules, type RuleExplanation } from "../../engines/ndis/ruleInterpreter";
import { generateGoals, type Goal } from "../../engines/ndis/goalGenerator";
import { buildEvidence, type EvidencePack } from "../../engines/ndis/evidenceBuilder";
import { buildServiceAgreement, type Agreement } from "../../engines/ndis/serviceAgreementBuilder";
import { PlatformError } from "../../utils/errors";
import { logEvent } from "../../../scale/audit/auditLogger";

export type { FundingResult, RuleExplanation, Goal, EvidencePack, Agreement };

const NEEDS_FOR: Record<FundingCategory, string[]> = {
  core: ["daily", "community"],
  capacity: ["control", "predictability"],
  capital: ["daily"],
};

export interface NDISWorkflowResult {
  preview: PreviewPayload;
  workerText: string;
  funding: FundingResult;
  rules: RuleExplanation[];
  needs: string[];
  goals: Goal[];
  evidence: EvidencePack;
  agreement: Agreement;
}

function needsFromFunding(funding: FundingResult): string[] {
  const needs = funding.hits.flatMap((hit) => NEEDS_FOR[hit.category]);
  return [...new Set(needs)];
}

/** Run the NDIS path. Pass approved false to stop before the engine. */
export function runNDISWorkflow(input: string, approved?: boolean): NDISWorkflowResult {
  const source = (input ?? "").trim();
  if (!source) throw new PlatformError("EMPTY_INPUT");

  const redacted = redactLocal(source);
  const preview = buildPreview(source, redacted);
  const gate = approved === undefined ? simulateUserApproval(preview) : { ...preview, approved };
  if (!gate.approved) throw new PlatformError("NOT_APPROVED");

  const workerText = redactWorker(gate.redacted);
  const funding = extractFunding(workerText);
  const rules = interpretRules(funding);
  const needs = needsFromFunding(funding);
  const goals = generateGoals(needs.length ? needs : ["predictability"]);
  const evidence = buildEvidence(needs.length ? needs : ["predictability"], goals);
  const agreement = buildServiceAgreement(funding, goals);
  logEvent("workflow-run", { workflow: "ndis", ok: true });

  return { preview: gate, workerText, funding, rules, needs, goals, evidence, agreement };
}
