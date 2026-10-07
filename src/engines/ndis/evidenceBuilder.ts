/**
 * evidenceBuilder.ts
 * Structured notes that link a need to a draft goal.
 * Not proof that funding is justified.
 * Export: buildEvidence(needs, goals): EvidencePack
 */

import type { Goal } from "./goalGenerator";

export type EvidenceItem = {
  need: string;
  goal: string;
  observed: string;
  gap: string;
};

export type EvidencePack = {
  items: EvidenceItem[];
  limit: string;
};

/** Pair each need with a matching goal, if one was drafted. */
export function buildEvidence(needs: string[], goals: Goal[]): EvidencePack {
  const items = needs.filter(Boolean).map((need) => {
    const goal = goals.find((item) => item.need === need);
    return {
      need,
      goal: goal?.statement ?? "No draft goal yet.",
      observed: `Notes mention a support need around ${need}.`,
      gap: "What is in place now, and what the person wants changed, still needs to be checked with them.",
    };
  });
  return {
    items,
    limit: "Planning notes only. Not an assessment and not evidence the NDIA must accept.",
  };
}
