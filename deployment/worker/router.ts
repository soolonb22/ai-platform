/**
 * router.ts
 * Maps /redact, /ai, and /pdf to local modules. No outbound call.
 */

import { redactWorker } from "../../src/privacy/workerRedactor";
import { mockAI } from "../../src/pipeline/pipeline";
import { detectPatterns } from "../../src/engines/trauma/patterns";
import { extractFunding } from "../../src/engines/ndis/fundingExtractor";
import { buildServiceAgreementPDF, type Agreement } from "../../src/pdf/serviceAgreement";
import { buildEvidencePackPDF, type EvidencePack } from "../../src/pdf/evidencePack";
import { buildTraumaPlanPDF, type TraumaPlan } from "../../src/pdf/traumaPlan";
import { buildSchoolCommunicationPDF, type SchoolCommunication } from "../../src/pdf/schoolCommunication";

export type RouteHandler = (request: Request) => Promise<Response> | Response;

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
  "/ai": async (request) => {
    const body = await readJson(request);
    const text = textField(body);
    const engine = typeof body.engine === "string" ? body.engine : "mock";
    if (engine === "trauma") return Response.json({ engine, result: detectPatterns(text) });
    if (engine === "ndis") return Response.json({ engine, result: extractFunding(text) });
    return Response.json({ engine: "mock", result: mockAI(text) });
  },
  "/pdf": async (request) => {
    const body = await readJson(request);
    const kind = typeof body.kind === "string" ? body.kind : "";
    const payload = body.payload;
    const bytes = pdfBytes(kind, payload);
    if (!bytes) return Response.json({ error: "Unknown PDF kind." }, { status: 400 });
    return new Response(bytes, { headers: { "content-type": "application/pdf" } });
  },
};

function pdfBytes(kind: string, payload: unknown): Uint8Array | null {
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
