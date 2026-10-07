/**
 * aiHandler.ts
 * POST /api/ai. Turns redacted text into a plain-language draft with Claude.
 *
 * Guards, in order:
 *   1. POST only, from this site (Origin must match, or be in ALLOWED_ORIGINS).
 *   2. AI is on only when AI_API_KEY is set and AI_MODE is not "off".
 *   3. Size limits. Oversized input is refused, not silently cut.
 *   4. The worker redaction pass runs again here, so the server never relies on the browser.
 * Request text is never logged. Errors return fixed messages.
 *
 * Exports: AiEnv, Drafter, DraftOutcome, handleAiRequest
 */

import { AI_LIMITS, DEFAULT_MODEL } from "../../src/ai/types";
import { redactWorker } from "../../src/privacy/workerRedactor";
import { isWorkflowKind } from "../../src/workflows/kinds";
import { promptFor } from "./aiPrompts";

export interface AiEnv {
  AI_API_KEY?: string;
  AI_MODE?: string;
  AI_MODEL?: string;
  ALLOWED_ORIGINS?: string;
}

export type DraftOutcome = { ok: true; text: string } | { ok: false; status: number; error: string };

/** Calls the model. Swapped for a fake in tests. */
export type Drafter = (input: { apiKey: string; model: string; system: string; prompt: string }) => Promise<DraftOutcome>;

export function reply(status: number, body: Record<string, unknown>): Response {
  return Response.json(body, { status, headers: { "cache-control": "no-store" } });
}

export function originAllowed(request: Request, env: AiEnv): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  if (origin === new URL(request.url).origin) return true;
  return (env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .includes(origin);
}

export async function handleAiRequest(request: Request, env: AiEnv, drafter: Drafter): Promise<Response> {
  if (request.method !== "POST") return reply(405, { error: "POST only." });
  if (!originAllowed(request, env)) return reply(403, { error: "This site cannot use the AI service." });
  if (!env.AI_API_KEY || env.AI_MODE === "off") {
    return reply(503, { error: "AI drafting is not switched on for this site yet." });
  }
  if (Number(request.headers.get("content-length") ?? 0) > AI_LIMITS.maxBodyBytes) {
    return reply(413, { error: "That note is too long for one AI draft. Shorten it and try again." });
  }

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    body = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return reply(400, { error: "The request was not readable." });
  }

  const kind = body.kind;
  if (!isWorkflowKind(kind)) return reply(400, { error: "Unknown draft type." });

  const text = redactWorker(typeof body.text === "string" ? body.text : "");
  if (!text) return reply(400, { error: "There is no redacted text to draft from." });
  if (text.length > AI_LIMITS.maxTextChars) {
    return reply(413, { error: "That note is too long for one AI draft. Shorten it and try again." });
  }

  const findings = (Array.isArray(body.context) ? body.context : [])
    .filter((item): item is string => typeof item === "string")
    .slice(0, AI_LIMITS.maxContextItems)
    .map((item) => redactWorker(item).slice(0, AI_LIMITS.maxContextChars))
    .filter(Boolean);

  const { system, prompt } = promptFor(kind, text, findings);
  const outcome = await drafter({ apiKey: env.AI_API_KEY, model: env.AI_MODEL || DEFAULT_MODEL, system, prompt });
  if ("error" in outcome) {
    console.log(`ai-draft ${kind} failed with ${outcome.status}`);
    return reply(outcome.status, { error: outcome.error });
  }
  return reply(200, { draft: outcome.text });
}
