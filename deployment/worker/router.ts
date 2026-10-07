/**
 * router.ts
 * Maps /redact, /ai, and /pdf for the standalone Worker.
 * /ai uses the same handler and guards as the Pages Function at /api/ai.
 */

import { redactWorker } from "../../src/privacy/workerRedactor";
import { buildServiceAgreementPDF, type Agreement } from "../../src/pdf/serviceAgreement";
import { buildEvidencePackPDF, type EvidencePack } from "../../src/pdf/evidencePack";
import { buildTraumaPlanPDF, type TraumaPlan } from "../../src/pdf/traumaPlan";
import { buildSchoolCommunicationPDF, type SchoolCommunication } from "../../src/pdf/schoolCommunication";
import { handleAiRequest } from "./aiHandler";
import { claudeDrafter } from "./claudeDrafter";
import type { Env } from "./env";

export type RouteHandler = (request: Request, env: Env) => Promise<Response> | Response;

async function readJson(request: Request): Promise<Record<string, unknown>> {
  const body = await request.json();
  return body && typeof body === "object" ? (body as Record<string, unknown>) : {};
}

function textField(body: Record<string, unknown>): string {
  return typeof body.text === "string" ? body.text : "";
}

export const routes: Record<string, RouteHandler> = {
  "/redact": async (request) => {
    const text = textField(await readJson(request));
    return Response.json({ redacted: redactWorker(text) });
  },
  "/ai": (request, env) => handleAiRequest(request, env, claudeDrafter),
  "/pdf": async (request) => {
    const body = await readJson(request);
    const kind = typeof body.kind === "string" ? body.kind : "";
    const bytes = pdfBytes(kind, body.payload);
    if (!bytes) return Response.json({ error: "Unknown PDF kind." }, { status: 400 });
    return new Response(bytes, { headers: { "content-type": "application/pdf" } });
  },
};

function pdfBytes(kind: string, payload: unknown): Uint8Array<ArrayBuffer> | null {
  if (!payload || typeof payload !== "object") return null;
  if (kind === "agreement") return buildServiceAgreementPDF(payload as Agreement);
  if (kind === "evidence") return buildEvidencePackPDF(payload as EvidencePack);
  if (kind === "trauma") return buildTraumaPlanPDF(payload as TraumaPlan);
  if (kind === "school") return buildSchoolCommunicationPDF(payload as SchoolCommunication);
  return null;
}

export function matchRoute(pathname: string): RouteHandler | null {
  return routes[pathname] ?? null;
}
