/**
 * pipeline.ts
 * Phase 1 path:
 * input → normalise → localRedactor → previewPayload → workerRedactor → mockAI → output
 *
 * Approval uses simulateUserApproval. The shell will replace that later.
 * mockAI does not see the original text.
 *
 * Export: runPipeline(input: string)
 */

import { redactLocal } from "../privacy/localRedactor";
import { buildPreview, simulateUserApproval, type PreviewPayload } from "../privacy/previewPayload";
import { redactWorker } from "../privacy/workerRedactor";
import { PlatformError } from "../utils/errors";
import { normalise } from "../utils/normalise";
import { trimToBudget } from "../utils/tokenBudget";

const MAX_TOKENS = 400;

export type PipelineOutput = {
  preview: PreviewPayload;
  workerText: string;
  aiOutput: string;
  trimmed: boolean;
};

/** Stand-in model call. Returns a fixed summary of the already redacted text. */
export function mockAI(redacted: string): string {
  const body = redacted.trim();
  if (!body) return "No redacted text to process.";
  return `Mock summary: ${body}`;
}

/** Run the Phase 1 fence and the mock model call. */
export function runPipeline(input: string): PipelineOutput {
  const cleaned = normalise(input);
  if (!cleaned) throw new PlatformError("EMPTY_INPUT");

  const redacted = redactLocal(cleaned);
  const preview = simulateUserApproval(buildPreview(cleaned, redacted));
  if (!preview.approved) throw new PlatformError("NOT_APPROVED");

  const budget = trimToBudget(preview.redacted, MAX_TOKENS);
  const workerText = redactWorker(budget.text);
  const aiOutput = mockAI(workerText);

  return {
    preview,
    workerText,
    aiOutput,
    trimmed: budget.trimmed,
  };
}
