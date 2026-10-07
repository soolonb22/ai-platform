/**
 * ndisWorkflow.ts
 * input → localRedactor → previewPayload → workerRedactor
 * → extractFunding → interpretRules → generateGoals
 * → buildEvidence → buildServiceAgreement
 *
 * Engines see worker text only. Needs for goals come from category cues.
 * Nothing runs unless approved is true.
 * Export: runNDISWorkflow(input: string, approved: boolean): NDISWorkflowResult
 */

import { runFence } from "../../privacy/fence";
import type { PreviewPayload } from "../../privacy/previewPayload";
import { extractFunding, type FundingCategory, type FundingResult } from "../../engines/ndis/fundingExtractor";
import { interpretRules, type RuleExplanation } from "../../engines/ndis/ruleInterpreter";
import { generateGoals, type Goal } from "../../engines/ndis/goalGenerator";
import { buildEvidence, type EvidencePack } from "../../engines/ndis/evidenceBuilder";
import { buildServiceAgreement, type Agreement } from "../../engines/ndis/serviceAgreementBuilder";

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

/** Run the NDIS path. Throws NOT_APPROVED unless approved is true. */
export function runNDISWorkflow(input: string, approved: boolean): NDISWorkflowResult {
  const { preview, workerText } = runFence(input, approved);
  const funding = extractFunding(workerText);
  const rules = interpretRules(funding);
  const needs = needsFromFunding(funding);
  const goals = generateGoals(needs.length ? needs : ["predictability"]);
  const evidence = buildEvidence(needs.length ? needs : ["predictability"], goals);
  const agreement = buildServiceAgreement(funding, goals);
  logEvent("workflow-run", { workflow: "ndis", ok: true });

  return { preview, workerText, funding, rules, needs, goals, evidence, agreement };
}
