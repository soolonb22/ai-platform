/**
 * apiRouter.ts
 * Local routes to the four workflows. No network.
 */

import { runNDISWorkflow } from "../../src/workflows/ndis/ndisWorkflow";
import { runProviderWorkflow } from "../../src/workflows/provider/providerWorkflow";
import { runSchoolWorkflow } from "../../src/workflows/school/schoolWorkflow";
import { runTraumaWorkflow } from "../../src/workflows/trauma/traumaWorkflow";
import { PlatformError } from "../../src/utils/errors";
import type { ApiRequest, ApiResponse } from "./apiTypes";

const routes = {
  "/trauma": runTraumaWorkflow,
  "/ndis": runNDISWorkflow,
  "/school": runSchoolWorkflow,
  "/provider": runProviderWorkflow,
} as const;

export type ApiPath = keyof typeof routes;

/** Run the workflow for the path. Errors stay on the safe message. */
export function handleRequest(path: string, payload: ApiRequest): ApiResponse<unknown> {
  const run = routes[path as ApiPath];
  if (!run) return { ok: false, path, error: "Not found." };
  try {
    return { ok: true, path, result: run(payload.input) };
  } catch (error) {
    const message = error instanceof PlatformError ? error.message : "Something went wrong.";
    return { ok: false, path, error: message };
  }
}
