/**
 * claudeDrafter.ts
 * The real model calls, through the official Anthropic SDK.
 * Claude Opus 5.5 at medium effort, with the server-side refusal fallback switched on,
 * so a declined request is retried on a fallback model inside the same call.
 * claudeWriter can also ask for JSON that follows a schema (structured outputs).
 * Errors map to fixed, plain messages. Only the status code and error type are logged.
 *
 * Exports: claudeWriter, claudeDrafter, Writer
 */

import Anthropic from "@anthropic-ai/sdk";
import type { Drafter, DraftOutcome } from "./aiHandler";

export type Writer = (input: {
  apiKey: string;
  model: string;
  system: string;
  prompt: string;
  maxTokens: number;
  schema?: Record<string, unknown>;
}) => Promise<DraftOutcome>;

export const claudeWriter: Writer = async ({ apiKey, model, system, prompt, maxTokens, schema }) => {
  const client = new Anthropic({ apiKey, maxRetries: 1, timeout: 170_000 });
  try {
    const response = await client.beta.messages.create({
      model,
      max_tokens: maxTokens,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: schema ? { effort: "medium", format: { type: "json_schema", schema } } : { effort: "medium" },
      system,
      messages: [{ role: "user", content: prompt }],
    });

    if (response.stop_reason === "refusal") {
      return { ok: false, status: 422, error: "The AI declined to write this one. Try rewording the notes." };
    }
    const text = response.content
      .flatMap((block) => (block.type === "text" ? [block.text] : []))
      .join("\n")
      .trim();
    if (!text) return { ok: false, status: 502, error: "The AI returned nothing. Try again." };
    if (response.stop_reason === "max_tokens") {
      if (schema) return { ok: false, status: 502, error: "The document ran too long to finish. Try again." };
      return { ok: true, text: `${text}\n\n(The draft was cut short. Try a shorter note.)` };
    }
    return { ok: true, text };
  } catch (error) {
    // Status code and error type only. Never the request text or the key.
    if (error instanceof Anthropic.APIError) console.log(`claude-api ${error.status} ${error.name}`);
    if (error instanceof Anthropic.AuthenticationError) {
      return { ok: false, status: 503, error: "The AI key for this site was rejected. The site owner needs to replace it." };
    }
    if (error instanceof Anthropic.PermissionDeniedError) {
      return { ok: false, status: 503, error: "The AI key for this site does not have access to this model. The site owner needs to check it." };
    }
    if (error instanceof Anthropic.NotFoundError) {
      return { ok: false, status: 503, error: "The AI model set for this site was not found. The site owner needs to check AI_MODEL." };
    }
    if (error instanceof Anthropic.RateLimitError) {
      return { ok: false, status: 429, error: "The AI service is busy. Try again in a minute." };
    }
    if (error instanceof Anthropic.BadRequestError) {
      return { ok: false, status: 502, error: "The AI service could not read this request. Try shorter notes." };
    }
    if (error instanceof Anthropic.APIError) {
      return { ok: false, status: 502, error: "The AI service did not answer. Try again." };
    }
    return { ok: false, status: 502, error: "Could not reach the AI service. Try again." };
  }
};

/** Short plain-text drafts: room for adaptive thinking plus under 250 words. */
export const claudeDrafter: Drafter = (input) => claudeWriter({ ...input, maxTokens: 4096 });
