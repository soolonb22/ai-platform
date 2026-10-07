/**
 * ruleInterpreter.ts
 * Plain-language notes for matched funding categories.
 * Not advice on what the NDIA will approve.
 * Export: interpretRules(funding): RuleExplanation[]
 */

import type { FundingCategory, FundingResult } from "./fundingExtractor";

export type RuleExplanation = {
  category: FundingCategory;
  plain: string;
};

const RULES: Record<FundingCategory, string> = {
  core: "Core is usually day-to-day help: personal support, community access, transport, or consumables. Use depends on the plan and the support being reasonable and necessary.",
  capacity: "Capacity building is usually skill-building support, such as coordination, therapy, learning, or work skills. It is not a promise of hours.",
  capital: "Capital is usually an item or modification, such as equipment or a home change. It often needs a quote or an assessment. This note does not approve a purchase.",
};

/** Explain each category that the extractor found. */
export function interpretRules(funding: FundingResult): RuleExplanation[] {
  return funding.hits.map((hit) => ({
    category: hit.category,
    plain: RULES[hit.category],
  }));
}
