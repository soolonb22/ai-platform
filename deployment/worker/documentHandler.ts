/**
 * documentHandler.ts
 * POST /api/document. Turns a redacted profile, a pattern summary, and recent notes into a
 * full document with Claude, returned as JSON sections.
 *
 * Same guards as /api/ai: this site only, AI on only with a key, size limits that refuse
 * rather than cut, and the worker redaction pass run again on every field. Nothing is logged.
 *
 * Export: handleDocumentRequest(request, env, writer)
 */

import { DEFAULT_MODEL } from "../../src/ai/types";
import { DOCUMENT_LIMITS, DOCUMENT_SCHEMA, isDocumentKind, isGeneratedDocument } from "../../src/ai/documents";
import { redactWorker } from "../../src/privacy/workerRedactor";
import { originAllowed, reply, type AiEnv } from "./aiHandler";
import type { Writer } from "./claudeDrafter";
import { documentPromptFor } from "./documentPrompts";

function strings(value: unknown, maxItems: number, maxChars: number): string[] {
  return (Array.isArray(value) ? value : [])
    .filter((item): item is string => typeof item === "string")
    .slice(0, maxItems)
    .map((item) => redactWorker(item).slice(0, maxChars))
    .filter(Boolean);
}

export async function handleDocumentRequest(request: Request, env: AiEnv, writer: Writer): Promise<Response> {
  if (request.method !== "POST") return reply(405, { error: "POST only." });
  if (!originAllowed(request, env)) return reply(403, { error: "This site cannot use the AI service." });
  if (!env.AI_API_KEY || env.AI_MODE === "off") {
    return reply(503, { error: "AI drafting is not switched on for this site yet." });
  }
  if (Number(request.headers.get("content-length") ?? 0) > DOCUMENT_LIMITS.maxBodyBytes) {
    return reply(413, { error: "There is too much material for one document. Trim the profile or the notes." });
  }

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    body = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return reply(400, { error: "The request was not readable." });
  }

  if (!isDocumentKind(body.kind)) return reply(400, { error: "Unknown document type." });

  const profile: Record<string, string> = {};
  const rawProfile = body.profile && typeof body.profile === "object" ? (body.profile as Record<string, unknown>) : {};
  for (const [label, value] of Object.entries(rawProfile).slice(0, DOCUMENT_LIMITS.maxFields)) {
    if (typeof value !== "string") continue;
    const clean = redactWorker(value).slice(0, DOCUMENT_LIMITS.maxFieldChars);
    if (clean) profile[redactWorker(label).slice(0, 60)] = clean;
  }
  const patterns = strings(body.patterns, DOCUMENT_LIMITS.maxPatternLines, 300);
  const notes = strings(body.observations, DOCUMENT_LIMITS.maxObservations, DOCUMENT_LIMITS.maxObservationChars);
  if (!Object.keys(profile).length && !notes.length) {
    return reply(400, { error: "Add some profile details or link some notes to this person first." });
  }

  const { system, prompt } = documentPromptFor(body.kind, profile, patterns, notes);
  const outcome = await writer({
    apiKey: env.AI_API_KEY,
    model: env.AI_MODEL || DEFAULT_MODEL,
    system,
    prompt,
    maxTokens: 16000,
    schema: DOCUMENT_SCHEMA,
  });
  if ("error" in outcome) {
    console.log(`ai-document ${body.kind} failed with ${outcome.status}`);
    return reply(outcome.status, { error: outcome.error });
  }

  let document: unknown;
  try {
    document = JSON.parse(outcome.text);
  } catch {
    document = null;
  }
  if (!isGeneratedDocument(document)) {
    console.log(`ai-document ${body.kind} came back in the wrong shape`);
    return reply(502, { error: "The document came back in the wrong shape. Try again." });
  }
  return reply(200, { document });
}
