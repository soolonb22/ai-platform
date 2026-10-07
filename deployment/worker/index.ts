/**
 * index.ts
 * Cloudflare Worker entry. Routes /redact, /ai, and /pdf.
 * Errors return a fixed message. Request text is not logged.
 */

import { matchRoute } from "./router";
import type { Env } from "./env";
import { PlatformError, toSafeLog } from "../../src/utils/errors";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") {
      return Response.json({ error: "POST only." }, { status: 405 });
    }
    const handler = matchRoute(new URL(request.url).pathname);
    if (!handler) return Response.json({ error: "Not found." }, { status: 404 });
    try {
      if (env.ENVIRONMENT === "off") return Response.json({ error: "Worker is off." }, { status: 503 });
      return await handler(request);
    } catch (error) {
      console.log(toSafeLog(error));
      const message = error instanceof PlatformError ? error.message : "Something went wrong.";
      return Response.json({ error: message }, { status: 400 });
    }
  },
};
