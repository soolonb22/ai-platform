/**
 * toolRegistry.ts
 * Per-workflow details the shared actions need: a label, the PDF builder,
 * the PDF file name, and the short findings sent along with an AI draft request.
 *
 * Exports: TOOLS, WorkflowResult, downloadPdf
 */

import { agreementFrom, evidenceFrom, schoolFrom, traumaPlanFrom } from "../pdf/mapResults";
import { buildEvidencePackPDF } from "../pdf/evidencePack";
import { buildSchoolCommunicationPDF } from "../pdf/schoolCommunication";
import { buildServiceAgreementPDF } from "../pdf/serviceAgreement";
import { buildTraumaPlanPDF } from "../pdf/traumaPlan";
import type { WorkflowKind } from "../workflows/kinds";
import type { NDISWorkflowResult } from "../workflows/ndis/ndisWorkflow";
import type { ProviderWorkflowResult } from "../workflows/provider/providerWorkflow";
import type { SchoolWorkflowResult } from "../workflows/school/schoolWorkflow";
import type { TraumaWorkflowResult } from "../workflows/trauma/traumaWorkflow";

export type WorkflowResult = TraumaWorkflowResult | NDISWorkflowResult | SchoolWorkflowResult | ProviderWorkflowResult;

interface ToolDetails {
  label: string;
  filename: string;
  pdf: (result: WorkflowResult) => Uint8Array<ArrayBuffer>;
  findings: (result: WorkflowResult) => string[];
}

export const TOOLS: Record<WorkflowKind, ToolDetails> = {
  trauma: {
    label: "Trauma Tool",
    filename: "trauma-plan.pdf",
    pdf: (result) => buildTraumaPlanPDF(traumaPlanFrom(result as TraumaWorkflowResult)),
    findings: (result) => {
      const trauma = result as TraumaWorkflowResult;
      return [
        `Patterns: ${trauma.patterns.hits.map((hit) => hit.label).join(", ") || "none listed"}`,
        `Possible needs: ${trauma.needs.needs.join(", ")}`,
      ];
    },
  },
  ndis: {
    label: "NDIS Decoder",
    filename: "service-agreement.pdf",
    pdf: (result) => buildServiceAgreementPDF(agreementFrom(result as NDISWorkflowResult)),
    findings: (result) => [
      `Funding areas found: ${(result as NDISWorkflowResult).funding.hits.map((hit) => hit.label).join(", ") || "none listed"}`,
    ],
  },
  school: {
    label: "School Tools",
    filename: "school-note.pdf",
    pdf: (result) => buildSchoolCommunicationPDF(schoolFrom(result as SchoolWorkflowResult)),
    findings: (result) => {
      const school = result as SchoolWorkflowResult;
      return [`Behaviour: ${school.needs.behaviour}`, `Main need: ${school.focus}`];
    },
  },
  provider: {
    label: "Evidence Tools",
    filename: "evidence-pack.pdf",
    pdf: (result) => buildEvidencePackPDF(evidenceFrom(result as ProviderWorkflowResult)),
    findings: (result) => [`Possible needs: ${(result as ProviderWorkflowResult).needs.join(", ")}`],
  },
};

/** Save bytes as a file in the browser. Nothing is uploaded. */
export function downloadPdf(bytes: Uint8Array<ArrayBuffer>, filename: string): void {
  const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
