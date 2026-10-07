/**
 * pipeline.ts
 * Phase 1 path:
 * input → normalise → localRedactor → previewPayload → workerRedactor → mockAI → output
 *
 * Approval must be passed in as true. Nothing runs without it.
 * mockAI does not see the original text.
 *
 * Export: runPipeline(input: string, approved: boolean)
 */

import { redactLocal } from "../privacy/localRedactor";
import { buildPreview, type PreviewPayload } from "../privacy/previewPayload";
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
export function runPipeline(input: string, approved: boolean): PipelineOutput {
  const cleaned = normalise(input);
  if (!cleaned) throw new PlatformError("EMPTY_INPUT");

  const redacted = redactLocal(cleaned);
  const preview = { ...buildPreview(cleaned, redacted), approved: approved === true };
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
