/**
 * fundingExtractor.ts
 * Finds funding-category cues in already-redacted text.
 * Knows the official NDIS budget names as well as everyday wording.
 * Cues match whole words, so "sda" does not fire on "Tuesday".
 * Not a plan reading and not a funding decision.
 * Export: extractFunding(text): FundingResult
 */

import { matchCues } from "../cues";

export type FundingCategory = "core" | "capacity" | "capital";

export type FundingHit = {
  category: FundingCategory;
  label: string;
  cues: string[];
};

export type FundingResult = {
  hits: FundingHit[];
  note: string;
};

const CATEGORIES: Array<{ category: FundingCategory; label: string; cues: string[] }> = [
  {
    category: "core",
    label: "Core supports",
    cues: [
      "core supports",
      "assistance with daily life",
      "assistance with self-care activities",
      "daily life",
      "economic and community participation",
      "community access",
      "transport",
      "consumables",
      "support worker",
      "personal care",
      "supported independent living",
      "short term accommodation",
    ],
  },
  {
    category: "capacity",
    label: "Capacity building",
    cues: [
      "capacity building",
      "support coordination",
      "support coordinator",
      "improved daily living",
      "improved life choices",
      "plan management",
      "improved relationships",
      "improved health and wellbeing",
      "improved learning",
      "improved living arrangements",
      "increased social and community participation",
      "finding and keeping a job",
      "therapy",
      "therapies",
      "physiotherapy",
      "speech pathology",
      "psychology",
      "behaviour support",
      "skill building",
      "employment",
      "training",
    ],
  },
  {
    category: "capital",
    label: "Capital",
    cues: [
      "capital",
      "assistive technology",
      "home modification",
      "equipment",
      "specialist disability accommodation",
      "sda",
    ],
  },
];

/** Match category cue words. Empty text returns no hits. */
export function extractFunding(text: string): FundingResult {
  const hits = CATEGORIES.map((item) => {
    const cues = matchCues(text, item.cues);
    return cues.length ? { category: item.category, label: item.label, cues } : null;
  }).filter((hit): hit is FundingHit => hit !== null);

  return {
    hits,
    note: hits.length
      ? "Category cues only. Not confirmation that a plan includes this funding."
      : "No listed funding cues found.",
  };
}
