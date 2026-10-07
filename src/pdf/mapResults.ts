/**
 * mapResults.ts
 * Workflow results to the PDF shapes. Draft text only.
 */

import type { EvidencePack } from "./evidencePack";
import type { SchoolCommunication } from "./schoolCommunication";
import type { Agreement } from "./serviceAgreement";
import type { TraumaPlan } from "./traumaPlan";
import type { NDISWorkflowResult } from "../workflows/ndis/ndisWorkflow";
import type { ProviderWorkflowResult } from "../workflows/provider/providerWorkflow";
import type { SchoolWorkflowResult } from "../workflows/school/schoolWorkflow";
import type { TraumaWorkflowResult } from "../workflows/trauma/traumaWorkflow";

export function traumaPlanFrom(result: TraumaWorkflowResult): TraumaPlan {
  return {
    patterns: result.patterns.hits.map((hit) => hit.label),
    needs: result.needs.needs,
    interventions: result.interventions,
    regulation: result.plan.now,
    narrative: result.narrative,
  };
}

export function agreementFrom(result: NDISWorkflowResult): Agreement {
  return {
    participant: "Redacted participant. Plan cue only.",
    funding: result.agreement.categories,
    goals: result.agreement.goals,
    supports: result.funding.hits.map((hit) => hit.label),
    terms: result.agreement.terms,
  };
}

export function evidenceFrom(result: ProviderWorkflowResult): EvidencePack {
  return {
    summary: result.needs.join(", ") || "No need listed",
    items: result.evidence.items.map((item) => ({
      need: item.need,
      observed: item.observed,
      goal: item.goal,
    })),
    recommendations: ["Check this with the person before use."],
  };
}

export function schoolFrom(result: SchoolWorkflowResult): SchoolCommunication {
  return {
    behaviour: result.needs.behaviour,
    needs: result.needs.needs,
    strategies: result.strategies,
    menu: result.menu,
    staffNote: result.communication,
  };
}
