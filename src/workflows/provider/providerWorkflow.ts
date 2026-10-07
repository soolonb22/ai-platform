/**
 * providerWorkflow.ts
 * input → localRedactor → previewPayload → workerRedactor
 * → rewriteProgressNotes → generateGoals → buildEvidence
 *
 * Goals are drafted from behaviour cues in the worker text.
 * Engines see worker text only. Approval is simulated so this path can finish.
 * Export: runProviderWorkflow(input: string): ProviderWorkflowResult
 */

import { redactLocal } from "../../privacy/localRedactor";
import { buildPreview, simulateUserApproval, type PreviewPayload } from "../../privacy/previewPayload";
import { redactWorker } from "../../privacy/workerRedactor";
import { mapBehaviourToNeed, type NeedId } from "../../engines/trauma/behaviourToNeed";
import { generateGoals, type Goal } from "../../engines/ndis/goalGenerator";
import { buildEvidence, type EvidenceItem, type EvidencePack } from "../../engines/ndis/evidenceBuilder";
import { rewriteProgressNotes } from "../../engines/ndis/progressNoteRewriter";
import { PlatformError } from "../../utils/errors";
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

/** Run the provider path. Pass approved false to stop before the engine. */
export function runProviderWorkflow(input: string, approved?: boolean): ProviderWorkflowResult {
  const source = (input ?? "").trim();
  if (!source) throw new PlatformError("EMPTY_INPUT");

  const redacted = redactLocal(source);
  const preview = buildPreview(source, redacted);
  const gate = approved === undefined ? simulateUserApproval(preview) : { ...preview, approved };
  if (!gate.approved) throw new PlatformError("NOT_APPROVED");

  const workerText = redactWorker(gate.redacted);
  const note: RewrittenNote = { source: workerText, text: rewriteProgressNotes(workerText) };
  const mapped = mapBehaviourToNeed(workerText);
  const needs: NeedId[] = mapped.needs.length ? mapped.needs : ["predictability"];
  const goals = generateGoals(needs);
  const evidence = buildEvidence(needs, goals);
  logEvent("workflow-run", { workflow: "provider", ok: true });

  return { preview: gate, workerText, note, needs, goals, evidence };
}
