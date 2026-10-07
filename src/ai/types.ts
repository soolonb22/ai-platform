/**
 * types.ts
 * The AI drafting request shared by the browser and the server.
 * The browser only ever sends worker-redacted text and short engine findings.
 * Exports: AiDraftRequest, AI_LIMITS, DEFAULT_MODEL
 */

import type { WorkflowKind } from "../workflows/kinds";

export interface AiDraftRequest {
  kind: WorkflowKind;
  /** Worker-redacted text. Never the original note. */
  text: string;
  /** Short engine findings, such as "Possible needs: space, control". */
  context: string[];
}

export const AI_LIMITS = {
  maxTextChars: 6000,
  maxContextItems: 12,
  maxContextChars: 300,
  maxBodyBytes: 16000,
} as const;

/** Model used when the AI_MODEL setting is empty. */
export const DEFAULT_MODEL = "claude-opus-5-5";
