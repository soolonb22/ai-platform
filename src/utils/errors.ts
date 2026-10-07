/**
 * errors.ts
 * Safe errors for the pipeline.
 * Public message and log line never include input text, payloads, or identifiers.
 *
 * Exports: PlatformError, toSafeLog
 */

export type ErrorCode =
  | "EMPTY_INPUT"
  | "NOT_APPROVED"
  | "BUDGET_EXCEEDED"
  | "REDACTION_FAILED"
  | "WORKER_FAILED"
  | "UNKNOWN";

const SAFE_MESSAGES: Record<ErrorCode, string> = {
  EMPTY_INPUT: "No input to process.",
  NOT_APPROVED: "Preview was not approved.",
  BUDGET_EXCEEDED: "Input is over the token budget.",
  REDACTION_FAILED: "Redaction did not complete.",
  WORKER_FAILED: "Worker step did not complete.",
  UNKNOWN: "Something went wrong.",
};

export class PlatformError extends Error {
  readonly code: ErrorCode;

  constructor(code: ErrorCode) {
    super(SAFE_MESSAGES[code] ?? SAFE_MESSAGES.UNKNOWN);
    this.name = "PlatformError";
    this.code = code;
  }
}

/** Log line is code plus the fixed message. No user text. */
export function toSafeLog(error: unknown): string {
  if (error instanceof PlatformError) {
    return `${error.code}: ${error.message}`;
  }
  return "UNKNOWN: Something went wrong.";
}
