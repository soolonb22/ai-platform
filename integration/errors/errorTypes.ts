/**
 * errorTypes.ts
 * Typed errors. The message is a code, not user text.
 */

export type ErrorKind = "workflow" | "validation" | "system";

export class WorkflowError extends Error {
  readonly kind = "workflow" as const;
  constructor(code = "WORKFLOW_FAILED") {
    super(code);
    this.name = "WorkflowError";
  }
}

export class ValidationError extends Error {
  readonly kind = "validation" as const;
  constructor(code = "VALIDATION_FAILED") {
    super(code);
    this.name = "ValidationError";
  }
}

export class SystemError extends Error {
  readonly kind = "system" as const;
  constructor(code = "SYSTEM_FAILED") {
    super(code);
    this.name = "SystemError";
  }
}
