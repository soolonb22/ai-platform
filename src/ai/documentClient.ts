/**
 * documentClient.ts
 * Builds the document request in the browser and sends it once the person approves it.
 * Every profile field and note is redacted here, and the person's known names become [name].
 * The name itself is never part of the request.
 *
 * Exports: buildDocumentRequest, describeRequest, requestDocument
 */

import type { Observation, PatternSummary } from "../data/observations";
import { summaryLines } from "../data/observations";
import { namesOf, PROFILE_FIELDS, type PersonProfile } from "../data/people";
import { redactKnownNames } from "../privacy/knownNames";
import { redactLocal } from "../privacy/localRedactor";
import { normalise } from "../utils/normalise";
import { DOCUMENT_LIMITS, isGeneratedDocument, type DocumentKind, type DocumentRequest, type GeneratedDocument } from "./documents";

export function buildDocumentRequest(
  kind: DocumentKind,
  person: PersonProfile,
  observations: Observation[],
  summary: PatternSummary,
): DocumentRequest {
  const names = namesOf(person);
  const clean = (value: string, max: number) => redactKnownNames(redactLocal(normalise(value ?? "")), names).slice(0, max);
  const profile: Record<string, string> = {};
  for (const field of PROFILE_FIELDS) {
    const value = clean(person[field.key], DOCUMENT_LIMITS.maxFieldChars);
    if (value) profile[field.label] = value;
  }
  return {
    kind,
    profile,
    patterns: summaryLines(summary),
    observations: observations
      .slice(0, DOCUMENT_LIMITS.maxObservations)
      .map((item) => clean(item.redacted, DOCUMENT_LIMITS.maxObservationChars))
      .filter(Boolean),
  };
}

/** The request as plain text, for the "this is what will leave this device" preview. */
export function describeRequest(request: DocumentRequest): string {
  const profile = Object.entries(request.profile).map(([label, value]) => `${label}: ${value}`);
  return [
    "PROFILE",
    ...(profile.length ? profile : ["(none)"]),
    "",
    "PATTERNS",
    ...request.patterns,
    "",
    "RECENT NOTES",
    ...(request.observations.length ? request.observations.map((note, index) => `${index + 1}. ${note}`) : ["(none)"]),
  ].join("\n");
}

export type DocumentResult = { ok: true; document: GeneratedDocument } | { ok: false; message: string };

export async function requestDocument(
  request: DocumentRequest,
  endpoint = "/api/document",
  timeoutMs = 180_000,
): Promise<DocumentResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(request),
      signal: controller.signal,
    });
    const data = (await response.json().catch(() => null)) as { document?: unknown; error?: unknown } | null;
    if (response.ok && data && isGeneratedDocument(data.document)) return { ok: true, document: data.document };
    if (data && typeof data.error === "string") return { ok: false, message: data.error };
    return { ok: false, message: response.status === 404 ? "AI documents are not available on this server." : "The document did not come back. Try again." };
  } catch {
    return { ok: false, message: "Could not reach the AI service, or it took too long. Try again." };
  } finally {
    clearTimeout(timer);
  }
}
