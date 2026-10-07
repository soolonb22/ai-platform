/**
 * fence.ts
 * The privacy gate every workflow passes through:
 * normalise -> redactLocal -> preview -> explicit approval -> redactWorker.
 *
 * Approval must be true. There is no default and no simulated approval.
 * The preview the person sees is built by the same steps the workflow uses.
 *
 * Exports: previewFor, runFence
 */

import { PlatformError } from "../utils/errors";
import { normalise } from "../utils/normalise";
import { redactLocal } from "./localRedactor";
import { buildPreview, type PreviewPayload } from "./previewPayload";
import { redactWorker } from "./workerRedactor";

export interface FenceResult {
  preview: PreviewPayload;
  workerText: string;
}

/** The redacted text a person reviews before approving. */
export function previewFor(input: string): string {
  return redactLocal(normalise(input ?? ""));
}

/** Gate the input. Throws EMPTY_INPUT or NOT_APPROVED. Engines get workerText only. */
export function runFence(input: string, approved: boolean): FenceResult {
  const source = normalise(input ?? "");
  if (!source) throw new PlatformError("EMPTY_INPUT");
  const preview: PreviewPayload = { ...buildPreview(source, redactLocal(source)), approved: approved === true };
  if (!preview.approved) throw new PlatformError("NOT_APPROVED");
  return { preview, workerText: redactWorker(preview.redacted) };
}
