/**
 * fundingExtractor.ts
 * Finds funding-category cues in already-redacted text.
 * Not a plan reading and not a funding decision.
 * Export: extractFunding(text): FundingResult
 */

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
    cues: ["daily life", "community access", "transport", "consumables", "core supports", "support worker"],
  },
  {
    category: "capacity",
    label: "Capacity building",
    cues: ["support coordination", "therapy", "skill building", "employment", "capacity building", "training"],
  },
  {
    category: "capital",
    label: "Capital",
    cues: ["assistive technology", "home modification", "equipment", "capital", "sda"],
  },
];

/** Match category cue words. Empty text returns no hits. */
export function extractFunding(text: string): FundingResult {
  const source = (text ?? "").toLowerCase();
  const hits = CATEGORIES.map((item) => {
    const cues = item.cues.filter((cue) => source.includes(cue));
    return cues.length ? { category: item.category, label: item.label, cues } : null;
  }).filter((hit): hit is FundingHit => hit !== null);

  return {
    hits,
    note: hits.length
      ? "Category cues only. Not confirmation that a plan includes this funding."
      : "No listed funding cues found.",
  };
}
