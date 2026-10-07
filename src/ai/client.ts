/**
 * client.ts
 * Browser call to the AI drafting endpoint. Sends only what the person approved:
 * worker-redacted text and short engine findings.
 *
 * Export: requestAiDraft(request, endpoint?, timeoutMs?)
 */

import type { AiDraftRequest } from "./types";

export type AiDraftResult = { ok: true; draft: string } | { ok: false; message: string };

export async function requestAiDraft(
  request: AiDraftRequest,
  endpoint = "/api/ai",
  timeoutMs = 90_000,
): Promise<AiDraftResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(request),
      signal: controller.signal,
    });
    const data = (await response.json().catch(() => null)) as { draft?: unknown; error?: unknown } | null;
    if (response.ok && data && typeof data.draft === "string") return { ok: true, draft: data.draft };
    if (data && typeof data.error === "string") return { ok: false, message: data.error };
    return {
      ok: false,
      message: response.status === 404 ? "AI drafting is not available on this server." : "The AI draft did not come back. Try again.",
    };
  } catch {
    return { ok: false, message: "Could not reach the AI service. Check the connection and try again." };
  } finally {
    clearTimeout(timer);
  }
}
