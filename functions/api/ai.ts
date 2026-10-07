/**
 * functions/api/ai.ts
 * Cloudflare Pages Function for POST /api/ai, served from the same site as the app.
 * Set the key once with: npx wrangler pages secret put AI_API_KEY --project-name ai-platform
 */

import { handleAiRequest, type AiEnv } from "../../deployment/worker/aiHandler";
import { claudeDrafter } from "../../deployment/worker/claudeDrafter";

export async function onRequestPost(context: { request: Request; env: AiEnv }): Promise<Response> {
  return handleAiRequest(context.request, context.env, claudeDrafter);
}
