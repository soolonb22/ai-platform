/**
 * claudeDrafter.ts
 * The real model call behind AI drafting, through the official Anthropic SDK.
 * Defaults to Claude Opus 5.5 at medium effort, with the server-side refusal fallback switched on,
 * so a declined request is retried on a fallback model inside the same call.
 * Errors map to fixed, plain messages. Nothing from the request is logged.
 *
 * Export: claudeDrafter
 */

import Anthropic from "@anthropic-ai/sdk";
import type { Drafter } from "./aiHandler";

/** Room for adaptive thinking plus a draft of under 250 words. */
const MAX_TOKENS = 4096;

export const claudeDrafter: Drafter = async ({ apiKey, model, system, prompt }) => {
  const client = new Anthropic({ apiKey, maxRetries: 1, timeout: 60_000 });
  try {
    const response = await client.beta.messages.create({
      model,
      max_tokens: MAX_TOKENS,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium" },
      system,
      messages: [{ role: "user", content: prompt }],
    });

    if (response.stop_reason === "refusal") {
      return { ok: false, status: 422, error: "The AI declined to draft this one. Try rewording the note." };
    }
    const text = response.content
      .flatMap((block) => (block.type === "text" ? [block.text] : []))
      .join("\n")
      .trim();
    if (!text) return { ok: false, status: 502, error: "The AI returned an empty draft. Try again." };
    if (response.stop_reason === "max_tokens") {
      return { ok: true, text: `${text}\n\n(The draft was cut short. Try a shorter note.)` };
    }
    return { ok: true, text };
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) {
      return { ok: false, status: 503, error: "The AI key for this site is not working. The site owner needs to check it." };
    }
    if (error instanceof Anthropic.RateLimitError) {
      return { ok: false, status: 429, error: "The AI service is busy. Try again in a minute." };
    }
    if (error instanceof Anthropic.BadRequestError) {
      return { ok: false, status: 502, error: "The AI service could not read this request. Try a shorter note." };
    }
    if (error instanceof Anthropic.APIError) {
      return { ok: false, status: 502, error: "The AI service did not answer. Try again." };
    }
    return { ok: false, status: 502, error: "Could not reach the AI service. Try again." };
  }
};
