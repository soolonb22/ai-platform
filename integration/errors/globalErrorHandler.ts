/**
 * globalErrorHandler.ts
 * Maps any thrown value to a fixed message. Does not copy the original text.
 */

import { PlatformError } from "../../src/utils/errors";
import { SystemError, ValidationError, WorkflowError, type ErrorKind } from "./errorTypes";

export interface SafeErrorResponse {
  ok: false;
  kind: ErrorKind;
  message: string;
}

const MESSAGES: Record<ErrorKind, string> = {
  workflow: "The workflow did not complete.",
  validation: "The input could not be used.",
  system: "Something went wrong.",
};

/** Return a safe error. Unknown errors become system errors. */
export function handleError(error: unknown): SafeErrorResponse {
  if (error instanceof WorkflowError || error instanceof PlatformError) {
    return { ok: false, kind: "workflow", message: MESSAGES.workflow };
  }
  if (error instanceof ValidationError) {
    return { ok: false, kind: "validation", message: MESSAGES.validation };
  }
  if (error instanceof SystemError) {
    return { ok: false, kind: "system", message: MESSAGES.system };
  }
  return { ok: false, kind: "system", message: MESSAGES.system };
}
