/**
 * evidencePack.ts
 * Builds a one-page evidence-pack PDF with no library.
 * Planning notes only. Not an assessment.
 * Export: buildEvidencePackPDF(evidence: EvidencePack): Uint8Array
 */

export interface EvidenceItem {
  need: string;
  observed: string;
  goal: string;
}

export interface EvidencePack {
  summary: string;
  items: EvidenceItem[];
  recommendations: string[];
}

import { writePdf } from "./writePdf.ts";

function linesFor(evidence: EvidencePack): string[] {
  const items = evidence.items.length
    ? evidence.items.flatMap((item) => [`${item.need}: ${item.observed}`, `Goal: ${item.goal}`])
    : ["No evidence item listed"];
  const goals = evidence.items.length
    ? evidence.items.map((item) => item.goal)
    : ["No goal linked"];
  return [
    "Draft evidence pack",
    "",
    "Summary of needs",
    evidence.summary || "No summary supplied",
    "",
    "Evidence items",
    ...items,
    "",
    "Goals supported by evidence",
    ...goals,
    "",
    "Recommendations",
    ...(evidence.recommendations.length ? evidence.recommendations : ["Check this with the person before use."]),
    "",
    "Planning notes only. Not an assessment and not evidence the NDIA must accept.",
  ];
}

/** Return a single-page PDF. Text past 40 lines is left off the page. */
export function buildEvidencePackPDF(evidence: EvidencePack): Uint8Array {
  return writePdf(linesFor(evidence));
}
