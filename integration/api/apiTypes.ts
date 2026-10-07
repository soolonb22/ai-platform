/**
 * apiTypes.ts
 * Shared request and response shapes. No note text in the error.
 */

export interface ApiRequest {
  input: string;
  /** Must be true. The caller shows the redacted preview and gets approval first. */
  approved?: boolean;
}

export interface ApiSuccess<T> {
  ok: true;
  path: string;
  result: T;
}

export interface ApiFailure {
  ok: false;
  path: string;
  error: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
