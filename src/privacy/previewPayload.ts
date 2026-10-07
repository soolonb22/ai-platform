/**
 * previewPayload.ts
 * Builds the object a user reviews before anything leaves the client.
 * No UI. Approval is a flag on the object. Only runFence sets it, from an explicit caller value.
 */

export type PreviewPayload = {
  original: string;
  redacted: string;
  approved: boolean;
};

/**
 * Pair raw input with its redacted form.
 * approved starts false. The worker must not run until this is true.
 */
export function buildPreview(raw: string, redacted: string): PreviewPayload {
  return {
    original: raw ?? "",
    redacted: redacted ?? "",
    approved: false,
  };
}

