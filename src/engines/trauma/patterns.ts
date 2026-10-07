/**
 * patterns.ts
 * Keyword categories for support planning. Not a diagnosis.
 * Export: detectPatterns(text: string): PatternResult
 */

export type PatternId =
  | "hyperarousal"
  | "shutdown"
  | "flight"
  | "fight"
  | "fawn"
  | "sensory"
  | "safety";

export type PatternHit = {
  id: PatternId;
  label: string;
  cues: string[];
};

export type PatternResult = {
  hits: PatternHit[];
  note: string;
};

const CATEGORIES: Array<{ id: PatternId; label: string; cues: string[] }> = [
  {
    id: "hyperarousal",
    label: "High alert",
    cues: ["panic", "startled", "can't settle", "racing", "on edge", "hypervigilant"],
  },
  {
    id: "shutdown",
    label: "Shutdown",
    cues: ["shutdown", "numb", "blank", "won't talk", "frozen", "dissociat"],
  },
  {
    id: "flight",
    label: "Leave the demand",
    cues: ["ran off", "left the room", "hid", "avoid", "bolted", "refused to enter"],
  },
  {
    id: "fight",
    label: "Push back",
    cues: ["hit", "threw", "yelled", "swore", "lashed out", "argued"],
  },
  {
    id: "fawn",
    label: "Appease",
    cues: ["people pleasing", "said sorry", "agreed to everything", "couldn't say no", "fawn"],
  },
  {
    id: "sensory",
    label: "Sensory load",
    cues: ["too loud", "bright", "itchy", "crowded", "covering ears", "sensory"],
  },
  {
    id: "safety",
    label: "Safety check",
    cues: ["unsafe", "scared", "don't trust", "watched the door", "asked who was there"],
  },
];

/** Match cue words. Empty text returns no hits. */
export function detectPatterns(text: string): PatternResult {
  const source = (text ?? "").toLowerCase();
  const hits = CATEGORIES.map((category) => {
    const cues = category.cues.filter((cue) => source.includes(cue));
    return cues.length ? { id: category.id, label: category.label, cues } : null;
  }).filter((hit): hit is PatternHit => hit !== null);

  return {
    hits,
    note: hits.length
      ? "Cues only. Not a diagnosis."
      : "No listed cues found.",
  };
}
