/**
 * serviceAgreementBuilder.ts
 * A simple agreement object. Not a legal document and not a quote.
 * Export: buildServiceAgreement(funding, goals): Agreement
 */

import type { FundingResult } from "./fundingExtractor";
import type { Goal } from "./goalGenerator";

export type Agreement = {
  title: string;
  categories: string[];
  goals: string[];
  terms: string[];
  limit: string;
};

/** Build a draft agreement from category cues and draft goals. */
export function buildServiceAgreement(funding: FundingResult, goals: Goal[]): Agreement {
  const categories = funding.hits.map((hit) => hit.label);
  return {
    title: "Draft service agreement",
    categories: categories.length ? categories : ["Category not identified"],
    goals: goals.map((goal) => goal.statement),
    terms: [
      "The person can change or stop a support.",
      "Supports stay inside the stated category cues until a plan check says otherwise.",
      "No hours, price, or funding result is set here.",
    ],
    limit: "Draft only. A real agreement needs the person, the provider, and the plan.",
  };
}
