/**
 * providerWorkflow.ts
 * input → localRedactor → previewPayload → workerRedactor
 * → rewriteProgressNotes → generateGoals → buildEvidence
 *
 * Goals are drafted from behaviour cues in the worker text.
 * Engines see worker text only. Nothing runs unless approved is true.
 * Export: runProviderWorkflow(input: string, approved: boolean): ProviderWorkflowResult
 */

import { runFence } from "../../privacy/fence";
import type { PreviewPayload } from "../../privacy/previewPayload";
import { mapBehaviourToNeed, type NeedId } from "../../engines/trauma/behaviourToNeed";
import { generateGoals, type Goal } from "../../engines/ndis/goalGenerator";
import { buildEvidence, type EvidenceItem, type EvidencePack } from "../../engines/ndis/evidenceBuilder";
import { rewriteProgressNotes } from "../../engines/ndis/progressNoteRewriter";

import { logEvent } from "../../../scale/audit/auditLogger";

export type { Goal, EvidenceItem, EvidencePack };

export interface RewrittenNote {
  source: string;
  text: string;
}

export interface ProviderWorkflowResult {
  preview: PreviewPayload;
  workerText: string;
  note: RewrittenNote;
  needs: NeedId[];
  goals: Goal[];
  evidence: EvidencePack;
}

/** Run the provider path. Throws NOT_APPROVED unless approved is true. */
export function runProviderWorkflow(input: string, approved: boolean): ProviderWorkflowResult {
  const { preview, workerText } = runFence(input, approved);
  const note: RewrittenNote = { source: workerText, text: rewriteProgressNotes(workerText) };
  const mapped = mapBehaviourToNeed(workerText);
  const needs: NeedId[] = mapped.needs.length ? mapped.needs : ["predictability"];
  const goals = generateGoals(needs);
  const evidence = buildEvidence(needs, goals);
  logEvent("workflow-run", { workflow: "provider", ok: true });

  return { preview, workerText, note, needs, goals, evidence };
}
