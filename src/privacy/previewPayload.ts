/**
 * previewPayload.ts
 * Builds the object a user reviews before anything leaves the client.
 * No UI. Approval is a flag on the object, set by the caller or by the test helper.
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

/**
 * Test helper. Returns a new payload with approved set.
 * Default is approve. Pass false to simulate a rejection.
 * Does not mutate the input.
 */
export function simulateUserApproval(
  preview: PreviewPayload,
  approved = true,
): PreviewPayload {
  return {
    original: preview.original,
    redacted: preview.redacted,
    approved,
  };
}
