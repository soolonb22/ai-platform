/**
 * env.d.ts
 * Worker bindings. Names only. No secrets in this file.
 * AI_API_KEY is a secret set with wrangler, never committed.
 */

export interface Env {
  AI_MODE: string;
  MAX_TOKENS: string;
  ENVIRONMENT: string;
  AI_API_KEY?: string;
  AI_MODEL?: string;
  ALLOWED_ORIGINS?: string;
}
