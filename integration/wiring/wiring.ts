/**
 * wiring.ts
 * Looks up a workflow, engine, or PDF builder by name.
 */

import { extractFunding } from "../../src/engines/ndis/fundingExtractor";
import { toPlainLanguage } from "../../src/engines/narrative/clinicalToPlain";
import { buildSchoolCommunication } from "../../src/engines/school/communication";
import { detectPatterns } from "../../src/engines/trauma/patterns";
import { buildEvidencePackPDF } from "../../src/pdf/evidencePack";
import { buildSchoolCommunicationPDF } from "../../src/pdf/schoolCommunication";
import { buildServiceAgreementPDF } from "../../src/pdf/serviceAgreement";
import { buildTraumaPlanPDF } from "../../src/pdf/traumaPlan";
import { runNDISWorkflow } from "../../src/workflows/ndis/ndisWorkflow";
import { runProviderWorkflow } from "../../src/workflows/provider/providerWorkflow";
import { runSchoolWorkflow } from "../../src/workflows/school/schoolWorkflow";
import { runTraumaWorkflow } from "../../src/workflows/trauma/traumaWorkflow";
import { systemMap } from "./systemMap";

const workflows = {
  trauma: runTraumaWorkflow,
  ndis: runNDISWorkflow,
  school: runSchoolWorkflow,
  provider: runProviderWorkflow,
};

const engines = {
  trauma: detectPatterns,
  ndis: extractFunding,
  school: buildSchoolCommunication,
  narrative: toPlainLanguage,
};

const pdf = {
  agreement: buildServiceAgreementPDF,
  evidence: buildEvidencePackPDF,
  trauma: buildTraumaPlanPDF,
  school: buildSchoolCommunicationPDF,
};

export function getWorkflow(name: string) {
  return workflows[name as keyof typeof workflows] ?? null;
}

export function getEngine(name: string) {
  return engines[name as keyof typeof engines] ?? null;
}

export function getPDFGenerator(name: string) {
  return pdf[name as keyof typeof pdf] ?? null;
}

export function listModules(): string[] {
  return Object.keys(systemMap);
}
