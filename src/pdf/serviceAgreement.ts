/**
 * serviceAgreement.ts
 * Builds a one-page service-agreement PDF with no library.
 * Draft only. Not a legal document.
 * Export: buildServiceAgreementPDF(agreement: Agreement): Uint8Array
 */

export interface Agreement {
  participant: string;
  funding: string[];
  goals: string[];
  supports: string[];
  terms: string[];
}

import { writePdf } from "./writePdf";

function linesFor(agreement: Agreement): string[] {
  return [
    "Draft service agreement",
    "",
    "Participant summary",
    agreement.participant || "Not supplied",
    "",
    "Funding breakdown",
    ...(agreement.funding.length ? agreement.funding : ["No category listed"]),
    "",
    "Goals",
    ...(agreement.goals.length ? agreement.goals : ["No goal listed"]),
    "",
    "Supports provided",
    ...(agreement.supports.length ? agreement.supports : ["No support listed"]),
    "",
    "Terms and conditions",
    ...(agreement.terms.length ? agreement.terms : ["Placeholder terms. Not a binding agreement."]),
    "",
    "Draft only. A real agreement needs the person, the provider, and the plan.",
  ];
}

/** Return a single-page PDF. Text past 40 lines is left off the page. */
export function buildServiceAgreementPDF(agreement: Agreement): Uint8Array<ArrayBuffer> {
  return writePdf(linesFor(agreement));
}
