/**
 * functions/api/document.ts
 * Cloudflare Pages Function for POST /api/document. Uses the same AI_API_KEY secret as /api/ai.
 */

import type { AiEnv } from "../../deployment/worker/aiHandler";
import { claudeWriter } from "../../deployment/worker/claudeDrafter";
import { handleDocumentRequest } from "../../deployment/worker/documentHandler";

export async function onRequestPost(context: { request: Request; env: AiEnv }): Promise<Response> {
  return handleDocumentRequest(context.request, context.env, claudeWriter);
}
