/**
 * traumaPlan.ts
 * Builds a one-page trauma-plan PDF with no library.
 * Planning hint only. Not a diagnosis.
 * Export: buildTraumaPlanPDF(plan: TraumaPlan): Uint8Array
 */

export interface TraumaPlan {
  patterns: string[];
  needs: string[];
  interventions: string[];
  regulation: string[];
  narrative: string;
}

import { writePdf } from "./writePdf";

function linesFor(plan: TraumaPlan): string[] {
  return [
    "Draft trauma plan",
    "",
    "Trauma patterns detected",
    ...(plan.patterns.length ? plan.patterns : ["No listed cue"]),
    "",
    "Underlying needs",
    ...(plan.needs.length ? plan.needs : ["No need listed"]),
    "",
    "Micro-interventions",
    ...(plan.interventions.length ? plan.interventions : ["Offer a break and a choice."]),
    "",
    "Regulation plan",
    ...(plan.regulation.length ? plan.regulation : ["Keep the exit clear."]),
    "",
    "Narrative explanation",
    plan.narrative || "No narrative supplied.",
    "",
    "Cues only. Not a diagnosis.",
  ];
}

/** Return a single-page PDF. Text past 40 lines is left off the page. */
export function buildTraumaPlanPDF(plan: TraumaPlan): Uint8Array<ArrayBuffer> {
  return writePdf(linesFor(plan));
}
